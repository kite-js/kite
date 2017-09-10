/**
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

import 'reflect-metadata';
import * as http from 'http';

/**
 * Kite controller metadata
 */
export interface ControllerMetadata {
    /**
     * which method to receive data
     * 
     * @type { string }
     */
    method?: string;

    /**
     * privilege of accessing this controller
     * @type { string | number }
     */
    privilege?: string | number;
}

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
 * 
 * ### Metadata properties
 * + __method__ - which HTTP method ("GET", "POST" ...) to receive client data. If this value is set
 *  client request is restricted to this method, any other methods will cause an error. For example, 
 *  `@Controller({method: "GET"})` tells Kite this controller only accepts "GET" method on request, 
 *  request with "POST" will get an error.
 * + __privilege__ - access privilege of this controller. #see Kite privilege mechanism#
 * 
 * If none of these properties is provided, the controller will:
 * + accept any valid HTTP method from client request
 * + any one can invoke, no access check
 */
export function Controller(metadata?: ControllerMetadata) {
    return function (constructor: Function) {
        if (!Reflect.hasMetadata('kite:entrypoint', constructor.prototype)) {
            throw new Error(`Missing entry point for controller ${constructor.name}`);
        }

        metadata = metadata || {};
        if (metadata.method) {
            let accept = metadata.method.toUpperCase();
            if (!http.METHODS.includes(accept)) {
                throw new Error(`Invalid method "${accept}", support methods: ${http.METHODS.toLocaleString()}`);
            }
        }

        Reflect.defineMetadata('kite:controller', metadata, constructor);
    }
}

export function getControllerMetadata(target: Object): ControllerMetadata {
    return Reflect.getMetadata('kite:controller', target);
}
