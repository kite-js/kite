"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const version_1 = require("./core/version");
const error_1 = require("./core/error");
const log_service_1 = require("./core/log.service");
const error_service_1 = require("./core/error.service");
const controller_factory_1 = require("./core/controller.factory");
const callsite_1 = require("./core/callsite");
const parsesize_1 = require("./utils/parsesize");
const http_router_1 = require("./utils/http.router");
const watch_service_1 = require("./core/watch.service");
const URL = require("url");
const path = require("path");
const default_config_1 = require("./default.config");
const error_codes_1 = require("./core/error.codes");
const http_1 = require("http");
/**
 * Kite
 *
 * TODO: improve cluster processes
 */
class Kite {
    constructor(config = {}) {
        this.errorService = new error_service_1.ErrorService();
        this.middlewares = new Set();
        this.workdir = callsite_1.getCallerPath();
        this.log('Kite framework ver ' + version_1.VERSION);
        this.log(`Working at directory ${this.workdir}`);
        if (typeof config === 'string') {
            config = path.isAbsolute(config) ? config : path.join(this.workdir, config);
            config = require.resolve(config);
            this.log(`Loading configuration from file "${config}"`);
        }
        else {
            this.log('Loading configuration from object');
        }
        this._init(config);
        this.log('Creating server');
        // Create server
        let server = this.server = http_1.createServer((request, response) => {
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
            if (err.code === 'EADDRINUSE') {
                this.log('*** ERROR *** address in use, please change "hostname / port" for Kite, or close the conflicting process');
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
    _init(config) {
        let cfg = config;
        if (typeof config === 'string') {
            try {
                cfg = require(config).kiteConfig;
            }
            catch (e) {
                throw new Error(`Failed to load config file "${config}": ${e.message}`);
            }
        }
        // Combine default configuration with user configuration
        cfg = Object.assign({}, default_config_1.DefaultConfig, cfg);
        this.maxContentLength = parsesize_1.parseSize(cfg.maxContentLength);
        // concact log filenames with working root directory if they are not a absolute path
        if (typeof cfg.log.out === 'string' && !path.isAbsolute(cfg.log.out)) {
            cfg.log.out = path.join(this.workdir, cfg.log.out);
        }
        if (typeof cfg.log.err === 'string' && !path.isAbsolute(cfg.log.err)) {
            cfg.log.err = path.join(this.workdir, cfg.log.err);
        }
        // start log service
        this.logService = new log_service_1.LogService(cfg.log.level, cfg.log.out, cfg.log.err);
        // set default router
        if (typeof cfg.router === 'object' && cfg.router.map) {
            this.router = cfg.router;
        }
        else if (typeof cfg.router === 'function') {
            this.router = cfg.router.call(null);
        }
        else {
            let rootdir = path.join(this.workdir, 'controllers');
            this.router = new http_router_1.HttpRouter(rootdir);
        }
        // built-in errors
        this.errorService.errors = Object.assign({}, error_codes_1.ERROR_CODES);
        // combine with user errors
        if (cfg.errors) {
            Object.assign(this.errorService.errors, cfg.errors);
        }
        // build data hub from factory
        this.receivers = {};
        if (cfg.receiverProvider) {
            let receivers = [];
            if (typeof cfg.receiverProvider === 'function') {
                receivers.push(cfg.receiverProvider);
            }
            else if (Array.isArray(cfg.receiverProvider)) {
                receivers = cfg.receiverProvider;
            }
            receivers.forEach(provider => {
                let { contentType, receiver } = provider.call(null);
                this.receivers[contentType] = receiver;
            });
        }
        if (!this.controllerFactory) {
            this.controllerFactory = new controller_factory_1.ControllerFactory();
            this.controllerFactory.workdir = this.workdir;
        }
        this.controllerFactory.logService = this.logService;
        if (!this.watchService) {
            this.watchService = new watch_service_1.WatchService(__dirname);
            this.watchService.logService = this.logService;
            this.controllerFactory.watchService = this.watchService;
        }
        let oldConfig = this.config;
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
    watch(flag = true) {
        this.watchService.setEnabled(flag);
        return this;
    }
    /**
     * Watch configuration file
     * @param filename
     */
    watchConfigFile(filename) {
        // watch for config file changing
        this.watchService.watch(filename, (configFilename) => {
            this.log('Reload configuration');
            this._init(configFilename);
        });
    }
    /**
     * Relase your kite, let it fly
     */
    fly(port = 4000, hostname = 'localhost') {
        if (this.server && this.server.listening) {
            this.server.close();
        }
        this.server.listen(port, hostname, () => {
            let { address, port } = this.server.address();
            this.log(`Flying! server listening at ${address}:${port}`, '\x1b[33m');
        });
        return this;
    }
    /**
     * Request listener, process all requests here
     * @param { IncomingMessage } request
     * @param { ServerResponse } response
     */
    async onRequest(request, response) {
        try {
            let url = URL.parse(request.url, true), inputs = url.query, // URL query string
            filename = this.router.map(url, request.method), // map to actual filename
            trainData;
            // api = await this.controllerFactory.get(filename);       // get controller instance
            // metadata: ControllerMetadata = getControllerMetadata(api.constructor),
            let controller = this.controllerFactory.getController(filename);
            if (this._provider) {
                trainData = this._provider.exec(request, controller, inputs);
            }
            let api = await this.controllerFactory.getInstance(controller, trainData);
            // if api handle http request it self, skip "input" parsing
            if (api.onRequest) {
                inputs = await api.onRequest(request, url.query);
            }
            else if ((request.headers['content-length'] || request.headers['transfer-encoding']) &&
                request.method !== 'GET' &&
                request.method !== 'TRACE') {
                // if there is any message-body sent from client, try to parse it
                // an entity-body is explicitly forbidden in TRACE, and ingored in GET
                let [contentType, charset] = (request.headers['content-type'] || 'text/plain').split(';'), entityBody = await this.getEntityBody(request);
                if (charset) {
                    charset = charset.split('=')[1];
                }
                if (this.receivers[contentType]) {
                    try {
                        let data = this.receivers[contentType](entityBody, charset);
                        inputs = Object.assign({}, url.query, data);
                    }
                    catch (e) {
                        this.logService.error(e);
                        throw new error_1.KiteError(1010);
                    }
                }
                else {
                    this.logService.warn(`Unsupported content type "${contentType}"`);
                    // inputs = entityBody;
                    inputs.$data = entityBody;
                }
            }
            // Call middlewares
            let middleResult;
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
            if (api.onResponse) {
                api.onResponse(response, result);
            }
            else {
                this.config.responder.write(result, response);
            }
        }
        catch (err) {
            if (err instanceof Error) {
                this.logService.error(err);
            }
            if (!response.headersSent) {
                // catch error if responder error happens
                try {
                    this.config.responder.writeError(err, response, this.errorService);
                }
                catch (err) {
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
    getEntityBody(request) {
        let contentLenth = parseInt(request.headers['content-length'], 0);
        if (Number.isInteger(contentLenth) &&
            this.maxContentLength > 0 &&
            contentLenth > this.maxContentLength) {
            return Promise.reject(new error_1.KiteError(1009, this.config.maxContentLength));
        }
        return new Promise((resolve, reject) => {
            let buffer = [];
            // register 'data' event, and push chunks to the buffer
            request.on('data', (chunk) => {
                // check if post data size exceeds config.maxPostSize
                if (this.maxContentLength > 0 && buffer.length > this.maxContentLength) {
                    return reject(new error_1.KiteError(1009, this.config.maxContentLength));
                }
                buffer.push(chunk);
            });
            request.on('end', () => {
                resolve(Buffer.concat(buffer).toString());
            });
        });
    }
    log(msg, color = '\x1b[35m') {
        let time = new Date().toLocaleString();
        console.log(color + time, '[ KITE  ]', msg, '\x1b[0m');
    }
    /**
     * Add a middleware to Kite
     * @param middleware middleware function
     */
    use(middleware) {
        this.middlewares.add(middleware);
        // return `this` for chain
        return this;
    }
    /**
     * Set train kite data provider.
     *
     * If a provider is given, Kite will invoke the `exec()` method when request comes,
     * the return value must be a "injectable" object
     * @param provider Provider instance
     */
    provider(provider) {
        this._provider = provider;
        return this;
    }
}
exports.Kite = Kite;
