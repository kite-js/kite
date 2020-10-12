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

import { VERSION } from './core/version';
import { Config } from './core/types/config';
import { KiteError } from './core/error';
import { LogService } from './core/log.service';
import { ErrorService } from './core/error.service';
import { ControllerFactory } from './core/controller.factory';
import { getCallerPath } from './core/callsite';
import { parseSize } from './utils/parsesize';
import { HttpRouter } from './utils/http.router';
import { WatchService } from './core/watch.service';
import { Router } from './core/types/router';

import * as URL from 'url';
import * as path from 'path';

import { DefaultConfig } from './default.config';
import { Receiver, ReceiverProvider } from './core/types/receiver';
import { ERROR_CODES } from './core/error.codes';
import { Middleware } from './core/types/middleware';
import { Server, createServer, IncomingMessage, ServerResponse } from 'http';
import { RequestHandler } from './core/types/request-handler';
import { ResponseHandler } from './core/types/response-handler';
import { Provider } from './core/types/provider';
import { Class } from './core/types/class';
import { AddressInfo } from 'net';

/**
 * Kite 
 */
export class Kite {
    private server: Server;

    private config: Config;

    private workdir: string;

    private controllerFactory: ControllerFactory;

    private maxContentLength: number;

    private errorService = new ErrorService();

    private logService: LogService;

    private watchService: WatchService;

    private receivers: { [name: string]: Receiver };

    private middlewares: Set<Middleware> = new Set();

    private router: Router;

    private _provider: Provider;

    public constructor(config: string | Config = {}) {
        this.workdir = getCallerPath();

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
            this.onRequest(request, response);
        });

        server.on('clientError', (err, socket) => {
            console.error(err);
            socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
        });

        server.on('error', (err) => {
            this.log(`*** ERROR *** ${err.message}`);
            if ((err as any).code === 'EADDRINUSE') {
                this.log('*** ERROR *** address:port in use, please change "hostname / port" for Kite, or close the conflicting process');
            }
            this.log('EXIT');
            process.exit();
        });

        this.log('Ready to fly');
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
        if (cfg.router) {
            this.log('** warning ** config.router will be deprecated, use kite.route() instead');
            this.route(cfg.router);
        } else {
            this.route();
        }

        // built-in errors
        this.errorService.errors = Object.assign({}, ERROR_CODES);
        // combine with user errors
        if (cfg.errors) {
            Object.assign(this.errorService.errors, cfg.errors);
        }

        // build data hub from factory
        this.receivers = {};
        if (cfg.receiverProvider) {
            let receivers: ReceiverProvider[] = [];

            if (typeof cfg.receiverProvider === 'function') {
                receivers.push(cfg.receiverProvider);
            } else if (Array.isArray(cfg.receiverProvider)) {
                receivers = cfg.receiverProvider;
            }

            receivers.forEach(provider => {
                let { contentType, receiver } = provider.call(null);
                this.receivers[contentType] = receiver;
            });
        }

        if (!this.controllerFactory) {
            this.controllerFactory = new ControllerFactory();
            this.controllerFactory.workdir = this.workdir;
        }

        // this.controllerFactory.logService = this.logService;

        if (!this.watchService) {
            this.watchService = new WatchService(__dirname);
            this.watchService.logService = this.logService;
            this.watchService.setWorkDir(this.workdir);
            this.controllerFactory.watchService = this.watchService;
        }

        this.config = cfg;
        Object.seal(this.config);
        Object.freeze(this.config);

        if (typeof config === 'string') {
            this.watchConfigFile(config);
        }
    }

    /**
     * Set watch mode
     * Watch mode allows you code & test APIs smoothly without restarting Kite server.
     * 
     * @param flag - true (default), Kite work in watch mode, suggested in dev mode
     *             - false, turn off watch suggested set to `false` in production
     */
    watch(flag: boolean = true): Kite {
        this.watchService.setEnabled(flag);
        return this;
    }

    /**
     * Watch configuration file
     * @param filename 
     */
    private watchConfigFile(filename: string) {
        // watch for config file changing
        this.watchService.watch(filename, (configFilename) => {
            this.log('Reload configuration');
            this._init(configFilename);
        });
    }

    /**
     * Relase your kite, let it fly
     * @param port server listen port
     * @param host server listen host 
     * @param callback optional, if callback is provided, it wil be called after kite application server started
     */
    fly(port: number = 4000, host: string = 'localhost', callback?: Function): Kite {
        if (this.server && this.server.listening) {
            this.server.close();
        }

        this.server.listen(port, host, () => {
            let { address, port } = this.server.address() as AddressInfo;
            this.log(`Flying! server listening at ${address}:${port}`, '\x1b[33m');
            if (callback) {
                callback()
            }
        });

        return this;
    }

    /**
     * Request listener, process all requests here
     * @param { IncomingMessage } request 
     * @param { ServerResponse } response 
     */
    private async onRequest(request: IncomingMessage, response: ServerResponse) {
        try {
            let url = URL.parse(request.url, true),
                inputs = url.query, // URL query string
                filename = this.router.map(url, request.method),    // map to actual filename
                scope;
            // api = await this.controllerFactory.get(filename);       // get controller instance
            // metadata: ControllerMetadata = getControllerMetadata(api.constructor),

            let controller = this.controllerFactory.getController(filename);
            if (this._provider) {
                scope = this._provider.exec(request, controller, inputs);
            }
            let api: any = await this.controllerFactory.getInstance(controller, scope);

            // if api handle http request it self, skip "input" parsing
            if ('onRequest' in api) {
                inputs = await (api as RequestHandler).onRequest(request, url.query);
            } else if ((request.headers['content-length'] || request.headers['transfer-encoding']) &&
                request.method !== 'GET' &&
                request.method !== 'TRACE') {
                // if there is any message-body sent from client, try to parse it
                // an entity-body is explicitly forbidden in TRACE, and ingored in GET

                let [contentType, charset] = (<string>request.headers['content-type'] || 'text/plain').split(';'),
                    entityBody = await this.getEntityBody(request);

                if (charset) {
                    charset = charset.split('=')[1];
                }

                if (this.receivers[contentType]) {
                    try {
                        let data = this.receivers[contentType](entityBody, charset);
                        inputs = Object.assign({}, url.query, data);
                    } catch (e) {
                        this.logService.error(e);
                        throw new KiteError(1010);
                    }
                } else {
                    this.logService.warn(`Unsupported content type "${contentType}"`);
                    inputs.$data = entityBody;
                }
            }

            // Call middlewares
            let middleResult: any;

            for (let middleware of this.middlewares) {
                middleResult = middleware.exec(request, response, api, inputs);
                // if return type is promise then wait promise return
                if (middleResult instanceof Promise) {
                    middleResult = await middleResult;
                }

                // ends the response if middleware explicitly returns false, else continue
                if (middleResult === false) {
                    response.end();
                    return;
                }
            }

            // call API with pre-generated $proxy(inputs)
            let result = await api.$proxy(inputs, request);

            // let this controller handle all response if "handleResponse" function is available
            if ((api as ResponseHandler).onResponse) {
                (api as ResponseHandler).onResponse(response, result);
            } else {
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
                    response.end(JSON.stringify({ error }));
                }
            }
        }
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
    use(middleware: Middleware): Kite {
        this.middlewares.add(middleware);
        // return `this` for chain
        return this;
    }

    /**
     * @since 0.5.7
     * 
     * Start a service in Kite boot / fly stage, call this method to start any number of services 
     * and inject dependencies when Kite starting, the services will be started immediately
     * after calling this method. 
     * 
     * eg:
     * ```ts
     * new Kite().start(Service1, Service2);
     * ```
     * @param services any number of service classes
     */
    start(...services: Class[]): Kite {
        this.controllerFactory.startService(...services);
        return this;
    }

    /**
     * Set train kite data provider (scope).
     * 
     * If a provider is given, Kite will invoke the `exec()` method when request comes, 
     * the return value must be a "injectable" object
     * @param provider Provider instance
     */
    useProvider(provider: Provider): Kite {
        this._provider = provider;
        return this;
    }

    /**
     * @since 0.5.10
     * 
     * Set kite router
     * 
     * if router is not given, a built-in http router will be used
     * @param router A `Router` instance or a function that resolves router
     */
    route(router?: Router | Function): Kite {
        if (typeof router === 'object' && router.map) {
            this.router = router;
        } else if (typeof router === 'function') {
            this.router = router.call(null);
        } else {
            let rootdir = path.join(this.workdir, 'controllers');
            this.router = new HttpRouter(rootdir, '.controller.js');
        }

        return this;
    }
}
