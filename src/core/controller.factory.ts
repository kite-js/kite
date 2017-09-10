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
import { WatcherService } from './watcher.service';
import * as path from 'path';
import { Init } from './types/init';
import { getInjections } from './metadata/inject';
import { isInjectable } from './metadata/injectable';
import { getControllerMetadata } from './metadata/controller';

/**
 * Controller factory
 * This controller factory does the following things:
 * - Creates controllers 
 * - Builds inputs filters
 * - Creates injections
 */
export class ControllerFactory {

    // Controller cache
    private controllers = new Map();

    // Injections cache
    private injections = new WeakMap();

    logService: LogService;

    watcherService: WatcherService;

    workRoot: string;

    /**
     * Get a "controller" instance
     * 
     * The first parameter "id" is called "API ID" or "Controller Id", which is provided by router, 
     * "id" is the identifier of a Kite controller, Kite controller factory use this "id" to locate
     * controller instance from cache, in "HttpRouter", this parameter is set to the relative path
     * of a controller, for example `/greeting`, `/user/login`. For performance consideration, this
     * argument should be as short as possible, because shorter string can reduce the searching time
     * of javascript Map object.
     * 
     * @param id module id
     * @param filename Path of controller, node will require this path for controller module(s)
     * @return Controller instance, which is ready to be called
     */
    async get(id: string, filename: string): Promise<any> {
        // Try get controller instance from cache
        let instance = this.controllers.get(id);
        // if instance is not cached, try to create a new one by given filename (module filename)
        if (!instance) {
            if (!path.isAbsolute(filename)) {
                filename = path.join(this.workRoot, filename);
            }

            // no controller instance exists, load the module and create an instance
            let controller: any;
            try {
                // Load the module
                let mod = require(filename);

                // watch for controller & related files changes
                this.watcherService.watch(filename, () => {
                    this.controllers.delete(id);
                });

                // find the first "@Controller" decorated module, treat it as a "Controller"
                Object.keys(mod).every(name => {
                    if (getControllerMetadata(mod[name])) {
                        controller = mod[name];
                        return false;
                    }
                    return true;
                });
            } catch (e) {
                this.logService.error(e);
                let errcode;
                if (e.code === 'MODULE_NOT_FOUND') {
                    errcode = 1002;
                } else {
                    errcode = 1003;
                }
                throw new KiteError(errcode);
            }

            if (!controller) {
                // tslint:disable-next-line:max-line-length
                throw new Error(`Required module is not a Kite controller, please annotate the controller class with "@Controller": "${filename}"`);
            }
            // create new controller instance
            instance = new controller();
            // wait for dependency injection
            await this.injectDependency(instance);
            // cache this instance
            this.controllers.set(id, instance);
        }

        return instance;
    }

    /**
     * Dependency injection
     * 
     * @private
     */
    private async injectDependency(target: Object) {

        // Get inject types
        let injections = getInjections(target);
        if (!injections) {
            return;
        }

        // walk each injection target, create injection instance
        let injectableObject: Init;
        for (let [prop, type] of injections) {
            // Is target type injectable ?
            if (!isInjectable(type)) {
                // tslint:disable-next-line:max-line-length
                throw new Error(`${target.constructor.name}.${prop} is annonced with "@Inject()" but injection target "${type.name}" is not injectable`);
            }

            // Get injection target from cache, if not exist, create one
            injectableObject = this.injections.get(type);
            if (!injectableObject) {
                injectableObject = new type();
                // Cache it, so chained injection could find this instance if there are dependence on each other
                this.injections.set(type, injectableObject);
                // inject dependency recursively
                await this.injectDependency(injectableObject);
                // Initialize injection target if contains a "init" method, note: this muse be a "async" function
                if (injectableObject.onKiteInit) {
                    await injectableObject.onKiteInit();
                }
            }

            // put the injection object to current object
            Object.defineProperty(target, prop, {
                value: injectableObject
            });
        }
    }
}
