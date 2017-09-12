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
import { Config } from './core/types/config';
import { Middleware } from './core/types/middleware';
/**
 * Kite
 *
 * TODO: improve cluster processes
 */
export declare class Kite {
    private static instance;
    private server;
    private config;
    private workdir;
    private controllerFactory;
    private maxContentLength;
    private errorService;
    private logService;
    private watcherService;
    private parsers;
    private middlewares;
    private router;
    private constructor();
    /**
     * Initialize a Kite instance with given configuration
     * @param config
     */
    static init(config?: string | Config): Kite;
    /**
     * Get current running Kite instance
     */
    static getInstance(): Kite;
    /**
     * Load the configuration from file or an KiteConfig object
     *
     * @param { string | Config } config if string is given, it's treated as a filename, configuration will from this file,
     *  if a KiteConfig object is given, configuration will load from this object
     *
     * @private
     */
    private _init(config);
    /**
     * Watch configuration file
     * @param filename
     */
    private watchConfigFile(filename);
    /**
     * Relase your kite, let it fly
     */
    fly(): this;
    /**
     * Request listener, process all requests here
     * @param { http.IncomingMessage } request
     * @param { http.ServerResponse } response
     */
    private requestListener(request, response);
    /**
     * get request data
     */
    private getEntityBody(request);
    private log(msg, color?);
    /**
     * Add a middleware to Kite
     * @param middleware middleware function
     */
    use(middleware: Middleware): this;
    /**
     * Get config of current Kite instance
     */
    getConfig(): Config;
}
