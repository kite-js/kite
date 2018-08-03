import { Config } from './core/types/config';
import { Middleware } from './core/types/middleware';
import { Provider } from './core/types/provider';
/**
 * Kite
 */
export declare class Kite {
    private server;
    private config;
    private workdir;
    private controllerFactory;
    private maxContentLength;
    private errorService;
    private logService;
    private watchService;
    private receivers;
    private middlewares;
    private router;
    private _provider;
    constructor(config?: string | Config);
    /**
     * Load the configuration from file or an KiteConfig object
     *
     * @param { string | Config } config if string is given, it's treated as a filename, configuration will from this file,
     *  if a KiteConfig object is given, configuration will load from this object
     *
     * @private
     */
    private _init(config);
    /**
     * Set watch mode
     * Watch mode allows you code & test APIs smoothly without restarting Kite server.
     *
     * @param flag - true (default), Kite work in watch mode, suggested in dev mode
     *             - false, turn off watch suggested set to `false` in production
     */
    watch(flag?: boolean): this;
    /**
     * Watch configuration file
     * @param filename
     */
    private watchConfigFile(filename);
    /**
     * Relase your kite, let it fly
     */
    fly(port?: number, hostname?: string): this;
    /**
     * Request listener, process all requests here
     * @param { IncomingMessage } request
     * @param { ServerResponse } response
     */
    private onRequest(request, response);
    /**
     * get request data
     */
    private getEntityBody(request);
    private log(msg, color?);
    /**
     * Add a middleware to Kite
     * @param middleware middleware function
     */
    use(middleware: Middleware): this;
    /**
     * Set train kite data provider.
     *
     * If a provider is given, Kite will invoke the `exec()` method when request comes,
     * the return value must be a "injectable" object
     * @param provider Provider instance
     */
    provider(provider: Provider): this;
}
