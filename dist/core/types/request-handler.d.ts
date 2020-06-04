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
/// <reference types="node" />
import { IncomingMessage } from 'http';
export interface RequestHandler {
    /**
     * http request handle method
     * if this method exists in a Kite controller, Kite will give the
     * request (http.IncomingMessage) to this controller when clients call it
     *
     * @param { http.IncomingMessage } request - raw IncomingMessage object
     * @param { any } query - any , an object given by Url.parse()
     * @return a promise, resolved object will be passed to controller entry point
     */
    onRequest(request: IncomingMessage, query: any): Promise<any>;
}
