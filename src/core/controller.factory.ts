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

import { KiteError } from './error';
import { WatchService } from './watch.service';
import { getDependencies } from './metadata/inject';
import { isInjectable } from './metadata/injectable';
import { isKiteController } from './metadata/controller';
import { Class } from './types/class';
import * as path from 'path';
import { getPostConstructor } from './metadata/postconstructor';
import { getDestructor } from './metadata/predestructor';

/**
 * Controller factory
 * This controller factory does the following things:
 * - Creates controllers 
 * - Creates dependencies
 */
export class ControllerFactory {
    watchService: WatchService;

    workdir: string;

    // private _images = new Map<any, KiteImage>();
    private _images = new Map<any, WeakMap<Class, Object>>();

    private _controllers = { } as any;

    // private _injectionPromises = new WeakMap<Object, Promise<any>>();

    // private _postConstPromises = new WeakMap<Object, Promise<any>>();

    /**
     * Get a controller class by given filename,
     * the filename can be an absolute path or a relative path,
     * if a relative path is given, Kite will search the working
     * directory for modules
     * @param filename controller filename
     */
    getController(filename: string): Class {
        let controller = this._controllers[filename];
        if (!controller) {
            const fullname = path.isAbsolute(filename) ? filename : path.join(this.workdir, filename);

            let mod;
            try {
                mod = require(fullname);
            } catch (error) {
                if (error.code === 'MODULE_NOT_FOUND') {
                    throw new KiteError(1002);
                }

                throw error;
            }

            // find the first "@Controller" decorated module, treat it as a "Controller"
            const keys = Object.keys(mod);
            for (let i = 0; i < keys.length; i++) {
                if (isKiteController(mod[keys[i]])) {
                    controller = mod[keys[i]];
                    break;
                }
            }

            if (!controller) {
                throw new Error(`No @Controller annotation was found at "${fullname}"`);
            }

            this._controllers[filename] = controller;
            // watch this file
            this.watchService.watch(fullname, () => {
                delete this._controllers[filename];
            });
        }

        return controller;
    }

    /**
     * Get controller instance by given controller class and data
     * @param controller 
     * @param scope 
     */
    async getInstance(controller: Class, scope: any = undefined): Promise<any> {
        // get image by data (for kite train)
        let image = this._images.get(scope);
        if (!image) {
            // image = {
            //     controllers: new WeakMap(),
            //     dependencies: new WeakMap()
            // };
            image = new WeakMap();
            this._images.set(scope, image);
        }

        let instance = image.get(controller);

        if (!instance) {
            instance = new controller();
            await this._injectDependencies(instance, image, scope)
        }

        return instance;
    }

    /**
     * Start a service and put it into dependencies pool
     * @param service Service class
     */
    async startService(...services: Class[]): Promise<any> {
        const scope: any = undefined;
        let image = this._images.get(scope);
        if (!image) {
            // image = {
            //     controllers: new WeakMap(),
            //     dependencies: new WeakMap()
            // };
            image = new WeakMap();
            this._images.set(scope, image);
        }

        for (let i = 0; i < services.length; i++) {
            const service = services[i];
            await this._startService(service, image, scope);

            // if a auto start service is changed in watching mode, restart the service automatically
            // let filename = this.getSourceFilename(service);
            // this.watchService.watch(filename, () => {
            //     process.on('exit', function () {
            //         require('child_process').spawn(process.argv.shift(), process.argv, {
            //             cwd: process.cwd(),
            //             detached : true,
            //             stdio: 'inherit'
            //         });
            //     });
            //     process.exit();
            // });
        }
    }


    /**
     * Inject dependencies for an object
     * @param target 
     * @param pool 
     */
    private async _injectDependencies(target: Object, pool: WeakMap<Class, Object>, scope: any): Promise<any> {

        // Get inject types
        let dependencies = getDependencies(target);
        if (!dependencies) {
            return;
        }

        // walk each injection target, create injection instance
        for (let [prop, service] of dependencies) {
            // Get injection target from cache, if not exist, create one
            let dependency = await this._startService(service, pool, scope);

            // pass the depedency to current object
            Object.defineProperty(target, prop, {
                value: dependency
            });
        }
    }


    /**
     * Start a service
     * @param service service class
     * @param pool 
     * @param scope 
     */
    private async _startService(service: Class, pool: WeakMap<Class, Object>, scope: any) {
        let instance: any = pool.get(service);
        if (!instance) {
            // Is target type injectable ?
            if (!isInjectable(service)) {
                // tslint:disable-next-line:max-line-length
                throw new Error(`"${service.name}" is not injectable`);
            }

            instance = new service();

            // Cache it, so chained injection could find this instance if they are depended on each other
            pool.set(service, instance);
            // inject dependency recursively
            await this._injectDependencies(instance, pool, scope);

            // Call post constructor
            let postConstructor = getPostConstructor(instance);
            if (postConstructor) {
                await postConstructor.call(instance);
            }

            // if there is a destructor, set watch
            let destructor = getDestructor(instance);
            if (destructor) {
                let serviceFilename = this.getSourceFilename(service);
                if (serviceFilename) {
                    this.watchService.watch(serviceFilename, () => {
                        destructor.call(instance);
                    });
                }
            }
        }

        return instance;
    }

    /**
     * Get source file name by given Class
     * @param cls 
     */
    private getSourceFilename(cls: Class) {
        let cache = require.cache;
        for (let key of Object.keys(cache)) {
            let mod = cache[key];
            let exports = mod.exports;
            for (let exp of Object.keys(exports)) {
                if (exports[exp] === cls) {
                    return key;
                }
            }
        }
    }
}
