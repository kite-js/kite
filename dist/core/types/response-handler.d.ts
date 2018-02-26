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
import { ServerResponse } from 'http';
export interface ResponseHandler {
    /**
     * http response handle method
     *
     * If this method exists in a Kite controller, Kite will invoke
     * this method for client response after entry point function returns.
     *
     * __NOTE__
     *
     * This function must handle `ServerResponse` in your own way, Kite
     * will never ends the response for you, so you should end the response
     * in a proper way.
     *
     * @param { http.ServerResponse } response server response object
     * @param { any } data data object from entry point function
     */
    onResponse(response: ServerResponse, data: any): void;
}
