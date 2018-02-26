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

import { LogService } from './log.service';
import { KiteError } from './error';
import { WatchService } from './watch.service';
import { Init } from './types/init';
import { getDependencies } from './metadata/inject';
import { isInjectable } from './metadata/injectable';
import { isKiteController } from './metadata/controller';
import { Class } from './types/class';
import * as path from 'path';
import * as fs from 'fs';

interface KiteImage {
    controllers: WeakMap<Class, Object>
    dependencies: WeakMap<Object, Object>
}

/**
 * Controller factory
 * This controller factory does the following things:
 * - Creates controllers 
 * - Creates dependencies
 */
export class ControllerFactory {

    // Controller cache
    // private controllers = new Map();

    // dependencies cache
    // private dependencies = new WeakMap();

    logService: LogService;

    watchService: WatchService;

    workdir: string;

    private _images = new Map<any, KiteImage>();

    private _controllers = new Map<string, Class>();

    /**
     * Get a controller class by given filename,
     * the filename can be an absolute path or a relative path,
     * if a relative path is given, Kite will search the working
     * directory for modules
     * @param filename controller filename
     */
    getController(filename: string): Class {
        let controller = this._controllers.get(filename);
        if (!controller) {
            const fullname = path.isAbsolute(filename) ? filename : path.join(this.workdir, filename);

            if (!fs.existsSync(fullname)) {
                throw new KiteError(1002);
            }

            const mod = require(fullname);

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

            this._controllers.set(filename, controller);
            // watch this file
            this.watchService.watch(fullname, () => {
                this._controllers.delete(filename);
            });
        }

        return controller;
    }

    /**
     * Get controller instance by given controller class and data
     * @param controller 
     * @param data 
     */
    async getInstance(controller: Class, data: any = undefined): Promise<any> {
        // get image by data
        let image = this._images.get(data);
        if (!image) {
            image = {
                controllers: new WeakMap(),
                dependencies: new WeakMap()
            };
            this._images.set(data, image);
        }

        let instance = image.controllers.get(controller);
        if (!instance) {
            instance = new controller();
            await this._injectDependency(instance, image.dependencies, data);
            image.controllers.set(controller, instance);
        }

        return instance;
    }

    /**
     * Inject dependencies for an object
     * @param target 
     * @param pool 
     */
    private async _injectDependency(target: Object, pool: WeakMap<Object, any>, data: any) {

        // Get inject types
        let dependencies = getDependencies(target);
        if (!dependencies) {
            return;
        }

        // walk each injection target, create injection instance
        let dependency: Init;
        for (let [prop, type] of dependencies) {
            // Get injection target from cache, if not exist, create one
            dependency = pool.get(type);
            if (!dependency) {
                // Is target type injectable ?
                if (!isInjectable(type)) {
                    // tslint:disable-next-line:max-line-length
                    throw new Error(`${target.constructor.name}.${prop} is annonced with "@Inject()" but target "${type.name}" is not injectable`);
                }

                dependency = data && data instanceof type ? data : new type();

                // Cache it, so chained injection could find this instance if there are dependence on each other
                pool.set(type, dependency);
                // inject dependency recursively
                await this._injectDependency(dependency, pool, data);
                // Initialize injection target if contains a "init" method, note: this muse be a "async" function
                if (dependency.onInit) {
                    await dependency.onInit();
                }
            }

            // pass the depedency to current object
            Object.defineProperty(target, prop, {
                value: dependency
            });
        }
    }

}
