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
const error_1 = require("./../core/error");
const Path = require("path");
const fs = require("fs");
/**
 * A router for routing http request to a controller.
 *
 * This router routes http requests in common way, for example:
 * `http://api.example.com/test_api?message=Hello%20World`
 */
class HttpRouter {
    /**
     * Create a http router
     *
     * This router maps a URL to a controller file, it's called from Kite core when client request comes.
     *
     * Parameter `rootdir` specifies where Kite controllers are placed, it must be an absolute path.
     * In most cases you can use `__dirname + path.sep + 'controllers'`, which meas controllers are
     * placed in directory "controllers" relatived to this caller script.
     *
     * Parameter `extension` is set to '.js' defaultly to make Node.js loads modules faster,
     * you can change it to any other values including empty string, if a non-empty string is given,
     * it should starts with '.', examples: '.api.js', '.controller.js'
     *
     * For uniform-name consideration, if `extension === '.js'` the router will firstly try to locate
     * a file ends with ".controller.js" - for example "get.controller.js", if it's not exists, router
     * will return a filename without ".controller" - "get.js".
     *
     * "uniform-name consideration" is a filename form that has a surfix to indicate the type of this file:
     * + controllers - named as "\*\*\*.controller.js"
     * + services - named as "\*\*\*.service.js"
     * + models - named as "\*\*\*.model.js"
     *
     * By invoking `route()` method, it:
     * - map a URL to `rootdir` or it's sub folder
     * - locate a file by adding `${extension}`
     *
     * @param rootdir base dir, relative to application root folder
     * @param extension an extension add to controller file name, defaults to `.js`
     */
    constructor(rootdir, extension = '.js') {
        this.apiNameRegx = /^([a-z\d\-_]+\.)*[a-z\d\-_]+$/i;
        if (!rootdir) {
            throw new Error(this.constructor.name + ' requires a "rootdir" to work');
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
    map(url, method) {
        let path = Path.join(this.rootdir, Path.normalize(url.pathname));
        // target path must under rootdir
        if (!path.startsWith(this.rootdir)) {
            throw new error_1.KiteError(1100, url.pathname);
        }
        let filename = path + this.extension;
        // if extension is set to ".js", test "***.controller.js" file
        if (this.extension === '.js') {
            let uniformName = path + '.controller.js';
            if (fs.existsSync(uniformName)) {
                filename = uniformName;
            }
        }
        return { apiname: url.pathname, filename: filename };
    }
}
exports.HttpRouter = HttpRouter;
// tslint:disable-next-line:no-shadowed-variable
function HttpRouterProvider(rootdir, extension = '.js') {
    return new HttpRouter(rootdir, extension);
}
exports.HttpRouterProvider = HttpRouterProvider;
//# sourceMappingURL=http.router.js.map