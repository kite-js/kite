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

import { Router, RouterProvider } from './router';
import * as http from 'http';
import { ParserProvider } from './parser';
import { Responder } from './responder';

/**
 * Kite configuration definition
 */
export interface Config {
    /**
     * Kite server listen host, etc: `localhost`, default is set to `127.0.0.1`.  
     * To listen to a unix socket, supply a filename instead of port and hostname.
     * 
     * See [server.listen](https://nodejs.org/docs/latest/api/http.html#http_server_listen_port_hostname_backlog_callback) for details
     */
    hostname?: string;

    /**
     * Port to listen, default set to `4000`.  
     * To listen to a unix socket, supply a filename instead of port and hostname.
     * 
     * See [server.listen](https://nodejs.org/docs/latest/api/http.html#http_server_listen_port_hostname_backlog_callback) for details
     */
    port?: number;

    /**
     * [NOTE] Not fully tested, many things to improve, please keep this field to default value.
     * 
     * Number of workers, default in `undefined`, set a falsy value tell Kite work in single process mode.
     * 
     * If the value is set to 1 ~ number of CPUs, Kite will start a master process and specified child processes to handle client request.
     * If the value is set to a number greater than number of CPU cores, Kite will change it to the number of CPU cores.
     */
    workers?: number;

    /**
     * Watch for file changes, default is `true` watch for file changes. You should set to `false` explicitly in production environment.
     * 
     * If any changes happened on Kite controller, service, model or their required child modules, Kite will reload these files. 
     * 
     * This is extremely useful when developing a project, usually we start a daemon like `tsc -w` to compile source files 
     * automatically on save, Kite watches these compiled files and reload them if changes detected, so we don't need to 
     * restart Kite server.
     * 
     * If Kite configuration is loaded from a file, config file will also be watched, any changes on this file will force Kite to 
     * reload the new configuration, if `hostname` or `port` is updated, Kite will restart the server too.
     * 
     * Please note that if `worker` is set, Kite will set this field to `false`, watch service will not work in multi-process mode.
     */
    watch?: boolean;

    /**
     * Max content length, '1M', '2M' ..., default set to '10M'
     */
    maxContentLength?: string;

    /**
     * User defined error codes
     * 
     * _NOTE:_ if user defined error codes has the same keys as Kite predefined errors, Kite will use the errors from user,
     * with this trick, you can overwrite Kite's errors in your way (for example rewrite them in your language).
     */
    errors?: any;

    /**
     * Log
     */
    log?: {
        /**
         * Log level
         * 
         * + 0 = log none
         * + 1 = log access
         * + 2 = log warnings
         * + 4 = log errors
         */
        level?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

        /**
         * access log, default log to `stdout`.
         * 
         * - if a string is given, Kite will treat this as a filename, and try to log to this file
         * - if a `NodeJS.WritableStream` is given, Kite will try to write logs to this stream
         * 
         * If filename is a relative path, Kite will locate it from working root (directory which application located).
         * If Kite fails to log to "out", log will fallback to `stdout`.
         */
        out?: string | NodeJS.WritableStream;

        /**
         * access log, default log to `stderr`.
         * 
         * - if a string is given, Kite will treat this as a filename, and try to log to this file
         * - if a `NodeJS.WritableStream` is given, Kite will try to write logs to this stream
         * 
         * If filename is a relative path, Kite will locate it from working root (directory which application located).
         * If Kite fails to log to "err", log will fallback to `stderr`.
         */
        err?: string | NodeJS.WritableStream;
    }

    /**
     * Holder class
     */
    holderClass?: { new(...args: any[]): any };

    /**
     * Router provider
     */
    router?: Router | RouterProvider;

    /**
     * Parser providers, Kite use this option to register parsers, each parser is registered with a key - a HTTP 
     * Content-Type value, such as "application/json", "application/x-www-form-urlencoded". 
     * 
     * Depending on client request Content-Types, Kite invokes parsers to parse HTTP entity-body to Javascript 
     * object, this object is called "raw input object", Kite maps it to a Kite model object and parses the model 
     * to target controller.
     * 
     * + if omitted, a default provider for parsing "application/json" is used
     * + if signle `ParserProvider` is given, Kite will use it to parse request entity-body
     * + if an array of `ParserProvider` is given, Kite calls parsers depending on request content types
     * 
     * If Content-Type of client request can not be found in registered parsers, Kite will pass the raw entity-body
     * to controllers (only if entry point of controller is coded to accept inputs).
     */
    parserProvider?: ParserProvider | ParserProvider[];

    /**
     * Kite message responder
     * 
     * A responder is an object provides functions for writing contents to clients.
     * If this option is omitted, Kite provides a default responder that writes JSON string to clients.
     */
    responder?: Responder;
}
