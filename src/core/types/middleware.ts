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
 * Kite middleware functions are functions that have access to request object and reponse object,
 * it's an async function, must return a promise for Kite.
 * 
 * Kite middlewares are not watched by Kite in watching mode, you need restart Kite application to
 * load new middlewares.
 * 
 * Middlewares are invoked in queue, if any middleware throws an error, Kite will stop invoking the rest,
 * and handle the error to Kite responder.
 * 
 * ## How to use
 * Kite middlewares must explicitly return a boolean value in promise to tell Kite what will do next:
 * + __true__ - Kite will continue call next middleware if exsits, then continue to process the request
 * + __false__ - Kite will stop processing, session with client will be ended
 * 
 * A Kite module generally returns `Promise.resolve(true)` to tell Kite to continue, for example, 
 * a middleware for setting response headers like this:
 * ```typescript
 * function setHeaderMiddleware(res: ServerResponse, req: IncomingMessage): Promise<boolean> {
 *     res.setHeader('Access-Control-Allow-Origin', '*');
 *     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
 *     res.setHeader('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Accept,Access-Token');
 *     return Promise.resolve(true);
 * }
 * ```
 * 
 * If you want to end a session before Kite invokes a controller, you should throw an error:
 * ```typescript
 * function someCheckingMiddleware(res: ServerResponse, req: IncomingMessage): Promise<boolean> {
 *     if(!req.headers['access-token']) {   // if there is not an 'access-token' in request header
 *          throw new KiteError(1000);  // throw a Kite error
 *     }
 * }
 * ```
 * 
 * Though Kite allows middlewares to return `Promise.resolve(false)` to end the session, it's not a recommended way.
 * If you prefer to do this, your middleware shall handle client request and server response.
 */
export type Middleware = (response: ServerResponse, request: IncomingMessage) => Promise<boolean>;
