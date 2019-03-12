import { WatchService } from './watch.service';
import { Class } from './types/class';
/**
 * Controller factory
 * This controller factory does the following things:
 * - Creates controllers
 * - Creates dependencies
 */
export declare class ControllerFactory {
    watchService: WatchService;
    workdir: string;
    private _images;
    private _controllers;
    private _injectionPromises;
    private _postConstPromises;
    /**
     * Get a controller class by given filename,
     * the filename can be an absolute path or a relative path,
     * if a relative path is given, Kite will search the working
     * directory for modules
     * @param filename controller filename
     */
    getController(filename: string): Class;
    /**
     * Get controller instance by given controller class and data
     * @param controller
     * @param data
     */
    getInstance(controller: Class, data?: any): Promise<any>;
    /**
     * Start a service and put it into dependencies pool
     * @param service Service class
     */
    startService(service: Class): Promise<any>;
    /**
     * Inject dependencies for an object
     * @param target
     * @param pool
     */
    private _injectDependency(target, pool, data);
}
