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

import { KiteError } from './../core/error';
import { Router, RouterProvider } from './../';
import * as URL from 'url';
import * as path from 'path';

/**
 * A router for routing http request to a controller.
 * 
 * This router routes http requests in common way, for example:
 * `http://api.example.com/test_api?message=Hello%20World`
 */
export class HttpRouter implements Router {
    /**
     * the root dir where controllers stored
     */
    private rootdir: string;

    /**
     * controller filename extension
     */
    private extension: string;

    private apiNameRegx = /^([\w\d\-_]+\.)*[\w\d\-_]+$/;

    /**
     * Create a http router
     * 
     * This router maps URL of request to a controller filename, it's called from Kite core when client request comes in.
     * 
     * The `rootdir` must be a absolute path, in most cases, people use `__dirname` to get the module's directory name, 
     * and set the rootdir to somewhere under module's `__dirname`.
     * 
     * For security reasons, `extension` is recommended, it's set to '.js' in default to ensure nodejs always load a file 
     * ends with '.js' extension.
     * 
     * By invoking `route()` method, it:
     * - map URL to `rootdir` child directories
     * - locate a file by adding `.${surfix}.${extension}`
     * 
     * @param rootdir base dir, relative to application root folder
     * @param extension an extension add to controller file name, defaults to `.js`
     */
    constructor(rootdir: string, extension = '.js') {
        if (!rootdir) {
            throw new Error(this.constructor.name + ' requires "rootdir" to work');
        }

        this.rootdir = rootdir;
        this.extension = extension;
    }

    /**
     * Routes http request urls
     * 
     * @param url an url.Url object
     * @param method http request method
     */
    map(url: URL.Url, method: string): { apiname: string, filename: string } {

        let parts: string[] = url.pathname.split('/');

        parts.shift();  // remove the first element: an empty string 

        // check each part of pathname
        parts.forEach(part => {
            if (!part) {
                throw new KiteError(1100, url.pathname);
            }

            // escape "parent directory" symbol
            if (!this.apiNameRegx.test(part)) {
                throw new KiteError(1101);
            }
        });

        parts.unshift(this.rootdir);
        let filename = path.join(...parts) + this.extension;

        return { apiname: url.pathname, filename: filename };
    }
}

// tslint:disable-next-line:no-shadowed-variable
export function HttpRouterProvider<RouterProvider>(rootdir: string, extension = '.js') {
    return new HttpRouter(rootdir, extension);
}
