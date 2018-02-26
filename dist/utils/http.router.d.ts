/// <reference types="node" />
import { Router } from './../';
import * as URL from 'url';
/**
 * A router for routing http request to a controller.
 *
 * This router routes http requests in common way, for example:
 * `http://api.example.com/test_api?message=Hello%20World`
 */
export declare class HttpRouter implements Router {
    /**
     * the root dir where controllers stored
     */
    private rootdir;
    /**
     * controller filename extension
     */
    private extension;
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
    constructor(rootdir: string, extension?: string);
    /**
     * Routes http request urls
     *
     * @param url an url.Url object
     * @param method http request method
     */
    map(url: URL.Url, method: string): string;
}
export declare function HttpRouterProvider<RouterProvider>(rootdir: string, extension?: string): HttpRouter;
