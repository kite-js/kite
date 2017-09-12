/// <reference types="node" />
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
import { IncomingMessage, ServerResponse } from 'http';
/**
 * Kite middleware declaration
 *
 * ## Description
 * Kite middleware functions are functions that able to access raw request object and reponse objects.
 * A middleware must be an `async` function, or return a promise for Kite.
 *
 * Kite middlewares are not watched by Kite in watching mode, you need restart Kite application if
 * middlewares are changed.
 *
 * Middlewares are invoked in queue, if any of them throws an error, Kite will stop invoking the rest,
 * errors were handled by a Kite responder.
 *
 * ## How to use
 * Kite middlewares return 'Promise<boolean | void>' to tell Kite what will do next:
 * + __`true` or nothing__ - Kite will continue call next middleware if exsits, then continue to process the request
 * + __false__ - explicitly returns false will force Kite stop calling other middlewares and ends the session
 *
 * A Kite module generally returns nothing (does not need a return statment) or `Promise.resolve(true)`
 * to tell Kite to continue, for example, a middleware for setting response headers like:
 * ```typescript
 * function setHeaderMiddleware(res: ServerResponse, req: IncomingMessage): Promise<boolean> {
 *     res.setHeader('Access-Control-Allow-Origin', '*');
 *     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
 *     res.setHeader('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Accept,Access-Token');
 * }
 * ```
 *
 * If you want to end a session before Kite invokes a controller, you should throw an error, then Kite will ends
 * the respond an error message to client:
 * ```typescript
 * function someCheckingMiddleware(res: ServerResponse, req: IncomingMessage): Promise<boolean> {
 *     if(!req.headers['access-token']) {   // if there is not an 'access-token' in request header
 *          throw new KiteError(1000);  // throw a Kite error
 *     }
 * }
 * ```
 *
 * Kite allows middlewares return `Promise.resolve(false)` to end the session though,
 * but this is not recommended, it breaks the logic of Kite. If you really want to do in this way,
 * your middleware must handle client request and server response.
 */
export declare type Middleware = (response: ServerResponse, request: IncomingMessage, api: any, inputs: any) => Promise<any>;
