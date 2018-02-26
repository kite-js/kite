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
require("reflect-metadata");
const entry_1 = require("./entry");
const MK_CONTROLLER = 'kite:controller';
/**
 * Kite controller decorator
 *
 * ## Description
 * Controller decorator `@Controller` allows you to mark a class as a Kite controller and
 * provide additional metadata that determines how the controller should be used at runtime.
 *
 * Controllers are the most basic building block of a Kite application, remote procedure calls (RPC)
 * from clients are mapped to controllers, and return values of controllers are responded to clients.
 *
 * ## How to use
 * ```typescript
 * @Controller()
 * export class GetController {
 *     @Entry()
 *     async exec(id: number, ctx: Context) {
 *         return { id };
 *     }
 *
 * }
 * ```
 *
 * A Kite controller class must have one (only one) entry point, which must be annotated with an
 * `@Entry` decorator, Kite will locate this entry point function and invoke it when request comes.
 */
function Controller(metadata) {
    return function (constructor) {
        if (!entry_1.hasEntryPoint(constructor.prototype)) {
            throw new Error(`Missing entry point for controller ${constructor.name}`);
        }
        Reflect.defineMetadata(MK_CONTROLLER, metadata || {}, constructor);
    };
}
exports.Controller = Controller;
function getControllerMetadata(target) {
    return Reflect.getMetadata(MK_CONTROLLER, target);
}
exports.getControllerMetadata = getControllerMetadata;
function isKiteController(target) {
    return Reflect.hasMetadata(MK_CONTROLLER, target);
}
exports.isKiteController = isKiteController;
//# sourceMappingURL=controller.js.map