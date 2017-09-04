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
     * @param ctrlFilename Path of controller, node will require this path for controller module(s)
     * @return Controller instance, which is ready to be called
     */
    async get(ctrlFilename: string): Promise<any> {
        // Try get controller instance from cache
        if (this.controllers.has(ctrlFilename)) {
            return this.controllers.get(ctrlFilename);
        }

        if (!path.isAbsolute(ctrlFilename)) {
            ctrlFilename = path.join(this.workRoot, ctrlFilename);
        }

        // no controller instance exists, load the module and create an instance
        let controller: any;
        try {
            // Load the module
            let mod = require(ctrlFilename);

            // watch for controller & related files changes
            this.watcherService.watch(ctrlFilename, (filename) => {
                this.controllers.delete(filename);
            });

            // find the first "@Controller" decorated module, treat it as a "Controller"
            Object.keys(mod).every(name => {
                if (Reflect.hasMetadata('kite:controller', mod[name])) {
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
            throw new Error(`Required module is not a Kite controller, please annotate the controller class with "@Controller": "${ctrlFilename}"`);
        }

        let instance = new controller();
        await this.injectDependency(instance);
        this.controllers.set(ctrlFilename, instance);

        return instance;
    }

    /**
     * Dependency injection
     * 
     * @private
     */
    private async injectDependency(target: Function) {

        // Get inject types
        let injections: Map<string, any> = Reflect.getMetadata('kite:injections', target);
        if (!injections) {
            return;
        }

        // walk each injection target, create injection instance
        for (let [prop, type] of injections) {
            // Is target type injectable ?
            let injectable = Reflect.getMetadata('kite:injectable', type);
            if (!injectable) {
                // tslint:disable-next-line:max-line-length
                throw new Error(`${target.constructor.name}.${prop} is annonced with "@Inject()" but injection target "${type.name}" is not injectable`);
            }

            // Get injection target from cache, if not, create one
            let injectableObject = this.injections.get(type);
            if (!injectableObject) {
                injectableObject = new type();
                // Cache it, so chained injection could find this instance if there are dependence on each other
                this.injections.set(type, injectableObject);
                // Initialize injection target if contains a "init" method, note: this muse be a "async" function
                if (injectableObject.onKiteInit) {
                    await injectableObject.onKiteInit();
                }
                // try inject something for it self
                await this.injectDependency(injectableObject);
            }

            // put the injection object to current object
            Object.defineProperty(target, prop, {
                value: injectableObject
            });
        }
    }
}
