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
const error_1 = require("./error");
const path = require("path");
const inject_1 = require("./metadata/inject");
const injectable_1 = require("./metadata/injectable");
const controller_1 = require("./metadata/controller");
/**
 * Controller factory
 * This controller factory does the following things:
 * - Creates controllers
 * - Builds inputs filters
 * - Creates dependencies
 */
class ControllerFactory {
    constructor() {
        // Controller cache
        this.controllers = new Map();
        // dependencies cache
        this.dependencies = new WeakMap();
    }
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
    async get(id, filename) {
        // Try get controller instance from cache
        let instance = this.controllers.get(id);
        // if instance is not cached, try to create a new one by given filename (module filename)
        if (!instance) {
            if (!path.isAbsolute(filename)) {
                filename = path.join(this.workdir, filename);
            }
            // no controller instance exists, load the module and create an instance
            let controller;
            try {
                // Load the module
                let mod = require(filename);
                // watch for controller & related files changes
                this.watcherService.watch(filename, () => {
                    this.controllers.delete(id);
                });
                // find the first "@Controller" decorated module, treat it as a "Controller"
                Object.keys(mod).every(name => {
                    if (controller_1.getControllerMetadata(mod[name])) {
                        controller = mod[name];
                        return false;
                    }
                    return true;
                });
            }
            catch (e) {
                this.logService.error(e);
                let errcode;
                if (e.code === 'MODULE_NOT_FOUND') {
                    errcode = 1002;
                }
                else {
                    errcode = 1003;
                }
                throw new error_1.KiteError(errcode);
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
    async injectDependency(target) {
        // Get inject types
        let dependencies = inject_1.getDependencies(target);
        if (!dependencies) {
            return;
        }
        // walk each injection target, create injection instance
        let injectableObject;
        for (let [prop, type] of dependencies) {
            // Is target type injectable ?
            if (!injectable_1.isInjectable(type)) {
                // tslint:disable-next-line:max-line-length
                throw new Error(`${target.constructor.name}.${prop} is annonced with "@Inject()" but injection target "${type.name}" is not injectable`);
            }
            // Get injection target from cache, if not exist, create one
            injectableObject = this.dependencies.get(type);
            if (!injectableObject) {
                injectableObject = new type();
                // Cache it, so chained injection could find this instance if there are dependence on each other
                this.dependencies.set(type, injectableObject);
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
exports.ControllerFactory = ControllerFactory;
//# sourceMappingURL=controller.factory.js.map