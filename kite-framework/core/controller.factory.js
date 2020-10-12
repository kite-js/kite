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
exports.ControllerFactory = void 0;
const error_1 = require("./error");
const inject_1 = require("./metadata/inject");
const injectable_1 = require("./metadata/injectable");
const controller_1 = require("./metadata/controller");
const path = require("path");
const postconstructor_1 = require("./metadata/postconstructor");
const predestructor_1 = require("./metadata/predestructor");
/**
 * Controller factory
 * This controller factory does the following things:
 * - Creates controllers
 * - Creates dependencies
 */
class ControllerFactory {
    constructor() {
        // private _images = new Map<any, KiteImage>();
        this._images = new Map();
        this._controllers = {};
    }
    // private _injectionPromises = new WeakMap<Object, Promise<any>>();
    // private _postConstPromises = new WeakMap<Object, Promise<any>>();
    /**
     * Get a controller class by given filename,
     * the filename can be an absolute path or a relative path,
     * if a relative path is given, Kite will search the working
     * directory for modules
     * @param filename controller filename
     */
    getController(filename) {
        let controller = this._controllers[filename];
        if (!controller) {
            const fullname = path.isAbsolute(filename) ? filename : path.join(this.workdir, filename);
            let mod;
            try {
                mod = require(fullname);
            }
            catch (error) {
                if (error.code === 'MODULE_NOT_FOUND') {
                    throw new error_1.KiteError(1002);
                }
                throw error;
            }
            // find the first "@Controller" decorated module, treat it as a "Controller"
            const keys = Object.keys(mod);
            for (let i = 0; i < keys.length; i++) {
                if (controller_1.isKiteController(mod[keys[i]])) {
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
    async getInstance(controller, scope = undefined) {
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
            await this._injectDependencies(instance, image, scope);
        }
        return instance;
    }
    /**
     * Start a service and put it into dependencies pool
     * @param service Service class
     */
    async startService(...services) {
        const scope = undefined;
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
    async _injectDependencies(target, pool, scope) {
        // Get inject types
        let dependencies = inject_1.getDependencies(target);
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
    async _startService(service, pool, scope) {
        let instance = pool.get(service);
        if (!instance) {
            // Is target type injectable ?
            if (!injectable_1.isInjectable(service)) {
                // tslint:disable-next-line:max-line-length
                throw new Error(`"${service.name}" is not injectable`);
            }
            instance = new service();
            // Cache it, so chained injection could find this instance if they are depended on each other
            pool.set(service, instance);
            // inject dependency recursively
            await this._injectDependencies(instance, pool, scope);
            // Call post constructor
            let postConstructor = postconstructor_1.getPostConstructor(instance);
            if (postConstructor) {
                await postConstructor.call(instance);
            }
            // if there is a destructor, set watch
            let destructor = predestructor_1.getDestructor(instance);
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
    getSourceFilename(cls) {
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
exports.ControllerFactory = ControllerFactory;
