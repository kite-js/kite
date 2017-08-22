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
    private apiNameRegx;
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
    constructor(rootdir: string, extension?: string);
    /**
     * Routes http request urls
     *
     * @param url an url.Url object
     * @param method http request method
     */
    map(url: URL.Url, method: string): {
        apiname: string;
        filename: string;
    };
}
export declare function HttpRouterProvider<RouterProvider>(rootdir: string, extension?: string): HttpRouter;
