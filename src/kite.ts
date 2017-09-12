/***
 * Copyright (c) 2017 [Arthur Xie]
 * <https://github.com/kite-js/kite>
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 */

import 'reflect-metadata';

import { VERSION } from './core/version';
import { Config } from './core/types/config';
import { KiteError } from './core/error';
import { LogService } from './core/log.service';
import { ErrorService } from './core/error.service';
import { ControllerFactory } from './core/controller.factory';
import { ControllerMetadata, getControllerMetadata } from './core/metadata/controller';
import { getCallerPath } from './core/callsite';
import { parseSize } from './utils/parse.size';
import { HttpRouter } from './utils/http.router';
import { WatcherService } from './core/watcher.service';
import { Router } from './core/types/router';

import * as URL from 'url';
import * as path from 'path';
import * as querystring from 'querystring';
import * as cluster from 'cluster';
import * as os from 'os';

import { DefaultConfig } from './default.config';
import { Parser, ParserEntity } from './core/types/parser';
import { ERROR_CODES } from './core/error.codes';
import { Middleware } from './core/types/middleware';
import { Server, createServer, IncomingMessage, ServerResponse } from 'http';
import { ParserProvider } from './index';

/**
 * Kite 
 * 
 * TODO: improve cluster processes
 */
export class Kite {
    private static instance: Kite;

    private server: Server;

    private config: Config;

    private workdir: string;

    private controllerFactory: ControllerFactory;

    private maxContentLength: number;

    private errorService = new ErrorService();

    private logService: LogService;

    private watcherService: WatcherService;

    private parsers: { [name: string]: Parser };

    private middlewares: Set<Middleware> = new Set();

    private router: Router;

    private constructor(workdir: string, config: string | Config = {}) {
        this.workdir = workdir;

        this.log('Kite framework ver ' + VERSION);
        this.log(`Working at directory ${this.workdir}`);

        if (typeof config === 'string') {
            config = path.isAbsolute(config) ? config : path.join(this.workdir, config);
            config = require.resolve(config);
            this.log(`Loading configuration from file "${config}"`);
        } else {
            this.log('Loading configuration from object');
        }

        this._init(config);

        this.log('Creating server');
        // Create server
        let server = this.server = createServer((request, response) => {
            response.on('error', (err) => {
                this.logService.error(err);
            });
            this.requestListener(request, response);
        });

        server.on('clientError', (err, socket) => {
            socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
        });

        server.on('error', (err) => {
            this.log(`*** ERROR *** ${err.message}`);
            if ((err as any).code === 'EADDRINUSE') {
                this.log('*** ERROR *** address in use, please change "hostname / port" for Kite, or close the conflicting process');
            }
            this.log('EXIT');
            process.exit();
        });

        this.log('Ready to fly');
    }

    /**
     * Initialize a Kite instance with given configuration
     * @param config 
     */
    public static init(config: string | Config = {}): Kite {
        return this.instance || (this.instance = new Kite(getCallerPath(), config));
    }

    /**
     * Get current running Kite instance
     */
    public static getInstance(): Kite {
        return this.instance;
    }

    /**
     * Load the configuration from file or an KiteConfig object
     * 
     * @param { string | Config } config if string is given, it's treated as a filename, configuration will from this file,
     *  if a KiteConfig object is given, configuration will load from this object
     * 
     * @private
     */
    private _init(config: string | Config) {
        let cfg: Config = config as Config;

        if (typeof config === 'string') {
            try {
                cfg = require(config).kiteConfig;
            } catch (e) {
                throw new Error(`Failed to load config file "${config}": ${e.message}`);
            }
        }

        // Combine default configuration with user configuration
        cfg = Object.assign({}, DefaultConfig, cfg);

        let numCpus = os.cpus().length;
        if (cfg.workers && cfg.workers > numCpus) {
            cfg.workers = numCpus;
        }

        this.maxContentLength = parseSize(cfg.maxContentLength);

        // concact log filenames with working root directory if they are not a absolute path
        if (typeof cfg.log.out === 'string' && !path.isAbsolute(cfg.log.out)) {
            cfg.log.out = path.join(this.workdir, cfg.log.out);
        }

        if (typeof cfg.log.err === 'string' && !path.isAbsolute(cfg.log.err)) {
            cfg.log.err = path.join(this.workdir, cfg.log.err);
        }

        // start log service
        this.logService = new LogService(cfg.log.level, cfg.log.out, cfg.log.err);

        // set default router
        if (!cfg.router) {
            let rootdir = path.join(this.workdir, 'controllers');
            this.router = new HttpRouter(rootdir);
        } else if (typeof cfg.router === 'object' && cfg.router.map) {
            this.router = cfg.router;
        } else if (typeof cfg.router === 'function') {
            this.router = cfg.router.call(null);
        }

        // built-in errors
        this.errorService.errors = Object.assign({}, ERROR_CODES);
        // combine with user errors
        if (cfg.errors) {
            Object.assign(this.errorService.errors, cfg.errors);
        }

        // build data hub from factory
        this.parsers = {};
        if (cfg.parserProvider) {
            let parsers: ParserProvider[] = [];

            if (typeof cfg.parserProvider === 'function') {
                parsers.push(cfg.parserProvider);
            } else if (Array.isArray(cfg.parserProvider)) {
                parsers = cfg.parserProvider;
            }

            parsers.forEach(provider => {
                let { contentType, parser } = provider.call(null);
                this.parsers[contentType] = parser;
            });
        }

        if (!this.controllerFactory) {
            this.controllerFactory = new ControllerFactory();
            this.controllerFactory.workdir = this.workdir;
        }

        this.controllerFactory.logService = this.logService;

        if (!this.watcherService) {
            this.watcherService = new WatcherService(__dirname);
            this.watcherService.logService = this.logService;
            this.controllerFactory.watcherService = this.watcherService;
        }

        let oldConfig = this.config;
        this.config = cfg;
        Object.seal(this.config);
        Object.freeze(this.config);

        // Enable file watch if config.watch is on
        this.watcherService.setEnabled(Boolean(this.config.watch));

        if (typeof config === 'string') {
            this.watchConfigFile(config);
        }
        // listen again if port / hostname changed
        if (this.server && (oldConfig.port !== cfg.port || oldConfig.hostname !== cfg.hostname)) {
            this.fly();
        }
    }

    /**
     * Watch configuration file
     * @param filename 
     */
    private watchConfigFile(filename: string) {
        // watch for config file changing
        this.watcherService.watch(filename, (configFilename) => {
            this.log('Reload configuration');
            this._init(configFilename);
        });
    }

    /**
     * Relase your kite, let it fly
     */
    fly() {
        if (this.config.workers && cluster.isMaster) {
            this.log(`Master process is running #${process.pid}`);

            for (let i = 0; i < this.config.workers; i++) {
                cluster.fork();
            }

            cluster.on('exit', (worker, code, signal) => {
                console.log(`Worker #${worker.process.pid} died`);
            });

            return;
        }

        if (this.server && this.server.listening) {
            this.server.close();
        }

        this.server.listen(this.config.port, this.config.hostname, () => {
            let { address, port } = this.server.address();
            this.log(`Flying! server listening at ${address}:${port}`, '\x1b[33m');
        });

        return this;
    }

    /**
     * Request listener, process all requests here
     * @param { http.IncomingMessage } request 
     * @param { http.ServerResponse } response 
     */
    private async requestListener(request: IncomingMessage, response: ServerResponse) {
        try {
            let url = URL.parse(request.url, true),
                inputs = url.query, // URL query string
                { id, filename } = this.router.map(url, request.method),    // map to actual filename
                api = await this.controllerFactory.get(id, filename),       // get controller instance
                // metadata: ControllerMetadata = getControllerMetadata(api.constructor),
                holder;

            // if there is any message-body sent from client, try to parse it
            // an entity-body is explicitly forbidden in TRACE, and ingored in GET
            if ((request.headers['content-length'] || request.headers['transfer-encoding']) &&
                request.method !== 'GET' &&
                request.method !== 'TRACE') {

                let contentType = <string>request.headers['content-type'] || '',
                    entityBody = await this.getEntityBody(request);

                if (this.parsers[contentType]) {
                    try {
                        let data = this.parsers[contentType](entityBody);
                        inputs = Object.assign({}, url.query, data);
                    } catch (e) {
                        this.logService.error(e);
                        throw new KiteError(1010);
                    }
                } else {
                    this.logService.warn(`Unsupport content type "${contentType}"`);
                    inputs = entityBody;
                }
            }

            // Call middlewares
            let middleResult: any;
            for (let middleware of this.middlewares) {
                middleResult = await middleware.call(null, response, request, api, inputs);
                // is it a HolderClass ?
                if (this.config.holderClass && middleResult instanceof this.config.holderClass) {
                    holder = middleResult;
                } else if (middleResult === false) {
                    response.end();
                    return;
                }
            }

            // call API with pre-generated $proxy(inputs, holder, context)
            let result = await api.$proxy(
                inputs,
                holder,
                request,
                response
            );
            // if api havn't write response, call responder to output contents
            if (!response.headersSent) {
                this.config.responder.write(result, response);
            }
        } catch (err) {
            if (err instanceof Error) {
                this.logService.error(err);
            }

            if (!response.headersSent) {
                // catch error if responder error happens
                try {
                    this.config.responder.writeError(err, response, this.errorService);
                } catch (err) {
                    this.logService.error(err);
                    let error = this.errorService.getError(1001);
                    response.write(JSON.stringify({ error }));
                }
            }
        }

        response.end();
    }

    /**
     * get request data 
     */
    private getEntityBody(request: IncomingMessage): Promise<any> {
        let contentLenth = parseInt(<string>request.headers['content-length'], 0);

        if (Number.isInteger(contentLenth) &&
            this.maxContentLength > 0 &&
            contentLenth > this.maxContentLength) {
            return Promise.reject(new KiteError(1009, this.config.maxContentLength));
        }

        return new Promise((resolve, reject) => {
            let buffer: any[] = [];
            // register 'data' event, and push chunks to the buffer
            request.on('data', (chunk) => {
                // check if post data size exceeds config.maxPostSize
                if (this.maxContentLength > 0 && buffer.length > this.maxContentLength) {
                    return reject(new KiteError(1009, this.config.maxContentLength));
                }
                buffer.push(chunk);
            });

            request.on('end', () => {
                resolve(Buffer.concat(buffer).toString());
            });
        });
    }

    private log(msg: string, color = '\x1b[35m') {
        let time = new Date().toLocaleString();
        console.log(color + time, '[ KITE  ]', msg, '\x1b[0m');
    }

    /**
     * Add a middleware to Kite
     * @param middleware middleware function
     */
    use(middleware: Middleware) {
        this.middlewares.add(middleware);
        // return `this` for chain
        return this;
    }

    /**
     * Get config of current Kite instance
     */
    getConfig() {
        return this.config;
    }
}
