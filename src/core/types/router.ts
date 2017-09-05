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

import * as URL from 'url';
/**
 * Kite router
 * 
 * A Kite router is an object that provides a `map` function for Kite to route URLs,
 * if `Config.router` is configured with a router object, Kite will call its `map()`
 * function to get actual request API filename, and load it as a Kite controller
 * module.
 * 
 * Two values must be returned by `map()` function:
 *  + __id__ - the identifier of request API, can be equal to controller filename or 
 *    short/relative path of controller filename, this value is used as a key to cache
 *    a controller instance - each controller is cached by the controller factory 
 *    in single instance for reuse.
 *  + __filename__ - the filename of request API, where can be found a Kite controller
 */
export interface Router {
    /**
     * Route the request url string to a controller
     * @return controller relative path to application entry file
     */
    map(url: URL.Url, method: string): { id: string, filename: string };
}

/**
 * A Kite Router Provider is a function that provides a Kite "Router" object.
 * If `Config.router` is configured with a router provider, it will be executed at Kite 
 * initialization, which means coders can do custom initialization to the router, 
 * for example: scan API folders and call `require()` to preload necessary modules instead of
 * loading them by Kite controller factory at runtime.
 */
export type RouterProvider = (...args: any[]) => Router;
