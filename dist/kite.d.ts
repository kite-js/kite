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
import { Config } from './core/types/config';
import { Middleware } from './core/types/middleware';
import { Provider } from './core/types/provider';
import { Class } from './core/types/class';
/**
 * Kite
 */
export declare class Kite {
    private server;
    private config;
    private workdir;
    private controllerFactory;
    private maxContentLength;
    private errorService;
    private logService;
    private watchService;
    private receivers;
    private middlewares;
    private router;
    private _provider;
    constructor(config?: string | Config);
    /**
     * Load the configuration from file or an KiteConfig object
     *
     * @param { string | Config } config if string is given, it's treated as a filename, configuration will from this file,
     *  if a KiteConfig object is given, configuration will load from this object
     *
     * @private
     */
    private _init;
    /**
     * Set watch mode
     * Watch mode allows you code & test APIs smoothly without restarting Kite server.
     *
     * @param flag - true (default), Kite work in watch mode, suggested in dev mode
     *             - false, turn off watch suggested set to `false` in production
     */
    watch(flag?: boolean): Kite;
    /**
     * Watch configuration file
     * @param filename
     */
    private watchConfigFile;
    /**
     * Relase your kite, let it fly
     * @param port server listen port
     * @param host server listen host
     * @param callback optional, if callback is provided, it wil be called after server
     */
    fly(port?: number, host?: string, callback?: Function): Kite;
    /**
     * Request listener, process all requests here
     * @param { IncomingMessage } request
     * @param { ServerResponse } response
     */
    private onRequest;
    /**
     * get request data
     */
    private getEntityBody;
    private log;
    /**
     * Add a middleware to Kite
     * @param middleware middleware function
     */
    use(middleware: Middleware): Kite;
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
    start(...services: Class[]): Kite;
    /**
     * Set train kite data provider.
     *
     * If a provider is given, Kite will invoke the `exec()` method when request comes,
     * the return value must be a "injectable" object
     * @param provider Provider instance
     */
    provider(provider: Provider): Kite;
}
