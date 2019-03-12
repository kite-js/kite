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
import * as fs from 'fs';
import { getPostConstruct } from './metadata/postconstruct';

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
    watchService: WatchService;

    workdir: string;

    private _images = new Map<any, KiteImage>();

    private _controllers = new Map<string, Class>();

    private _injectionPromises = new WeakMap<Object, Promise<any>>();

    private _postConstPromises = new WeakMap<Object, Promise<any>>();

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
        // get image by data (for kite train)
        let image = this._images.get(data);
        if (!image) {
            image = {
                controllers: new WeakMap(),
                dependencies: new WeakMap()
            };
            this._images.set(data, image);
        }

        let instance = image.controllers.get(controller);
        if (instance) {
            // wait for injection finishing
            if (this._injectionPromises.has(controller)) {
                await this._injectionPromises.get(controller);
            }
        } else {
            instance = new controller();
            let injectionPromise = this._injectDependency(instance, image.dependencies, data);
            this._injectionPromises.set(controller, injectionPromise);
            await injectionPromise;
            image.controllers.set(controller, instance);
        }

        return instance;
    }

    /**
     * Start a service and put it into dependencies pool
     * @param service Service class
     */
    async startService(service: Class): Promise<any> {
        const trainData: any = undefined;
        let image = this._images.get(trainData);
        if (!image) {
            image = {
                controllers: new WeakMap(),
                dependencies: new WeakMap()
            };
            this._images.set(trainData, image);
        }

        let instance: any = image.dependencies.get(service);
        if (!instance) {
            instance = new service;
            image.dependencies.set(service, instance);
            // inject dependencies if this service depend on other services
            await this._injectDependency(instance, image.dependencies, trainData);

            // call post constructor
            let postConsProp = getPostConstruct(instance);
            if (postConsProp) {
                let postconsResult = instance[postConsProp].call(instance);
                if (postconsResult instanceof Promise) {
                    await postconsResult;
                }
            }
        }
    }

    /**
     * Inject dependencies for an object
     * @param target 
     * @param pool 
     */
    private async _injectDependency(target: Object, pool: WeakMap<Object, any>, data: any): Promise<any> {

        // Get inject types
        let dependencies = getDependencies(target);
        if (!dependencies) {
            return;
        }

        // walk each injection target, create injection instance
        let dependency;
        for (let [prop, type] of dependencies) {
            // Get injection target from cache, if not exist, create one
            dependency = pool.get(type);
            if (dependency) {
                if (this._injectionPromises.has(type)) {
                    await this._injectionPromises.get(type);
                } else if (this._postConstPromises.has(type)) {
                    await this._postConstPromises.get(type);
                }
            } else {
                // Is target type injectable ?
                if (!isInjectable(type)) {
                    // tslint:disable-next-line:max-line-length
                    throw new Error(`${target.constructor.name}.${prop} is announced with "@Inject()" but target "${type.name}" is not injectable`);
                }

                // inject train data if necessary
                dependency = data && data instanceof type ? data : new type();

                // Cache it, so chained injection could find this instance if there depend on each other
                pool.set(type, dependency);
                // inject dependency recursively
                let injectionPromise = this._injectDependency(dependency, pool, data);
                this._injectionPromises.set(type, injectionPromise);
                await injectionPromise;
                this._injectionPromises.delete(type);

                // Call post construct
                let postConsProp = getPostConstruct(dependency);
                if (postConsProp) {
                    let postconsResult = dependency[postConsProp].call(dependency);
                    if (postconsResult instanceof Promise) {
                        this._postConstPromises.set(type, postconsResult);
                        await postconsResult;
                        this._postConstPromises.delete(type);
                    }
                }
            }

            // pass the depedency to current object
            Object.defineProperty(target, prop, {
                value: dependency
            });
        }
    }

}
