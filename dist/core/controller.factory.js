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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const error_1 = require("./error");
const path = require("path");
/**
 * Controller factory
 * This controller factory does the following things:
 * - Creates controllers
 * - Builds inputs filters
 * - Creates injections
 */
class ControllerFactory {
    constructor() {
        // Controller cache
        this.controllers = new Map();
        // Injections cache
        this.injections = new WeakMap();
    }
    /**
     * Get a "controller" instance
     *
     * @param ctrlFilename Path of controller, node will require this path for controller module(s)
     * @return Controller instance, which is ready to be called
     */
    get(ctrlFilename) {
        return __awaiter(this, void 0, void 0, function* () {
            // Try get controller instance from cache
            if (this.controllers.has(ctrlFilename)) {
                return this.controllers.get(ctrlFilename);
            }
            if (!path.isAbsolute(ctrlFilename)) {
                ctrlFilename = path.join(this.workRoot, ctrlFilename);
            }
            // no controller instance exists, load the module and create an instance
            let controller;
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
                throw new Error(`Required module is not a Kite controller, please annotate the controller class with "@Controller": "${ctrlFilename}"`);
            }
            let instance = new controller();
            yield this.injectDependency(instance);
            this.controllers.set(ctrlFilename, instance);
            return instance;
        });
    }
    /**
     * Dependency injection
     *
     * @private
     */
    injectDependency(target) {
        return __awaiter(this, void 0, void 0, function* () {
            // Get inject types
            let injections = Reflect.getMetadata('kite:injections', target);
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
                        yield injectableObject.onKiteInit();
                    }
                    // try inject something for it self
                    yield this.injectDependency(injectableObject);
                }
                // put the injection object to current object
                Object.defineProperty(target, prop, {
                    value: injectableObject
                });
            }
        });
    }
}
exports.ControllerFactory = ControllerFactory;
//# sourceMappingURL=controller.factory.js.map