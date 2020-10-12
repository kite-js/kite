"use strict";
/***
 * Copyright (c) 2020 [Arthur Xie]
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
exports.getDestructor = exports.PreDestroy = void 0;
require("reflect-metadata");
const MK_DESTRUCT = 'kite:pre-destroy';
/**
 * Annoate a destructor function for a service.
 *
 * This is a replacement of "init" interface, the "init" interface is deprecated.
 *
 * Only one `@Destruct` is allowed in a service.
 *
 * A `@Destruct` annotated function is called only when watching mode is enabled,
 * when a service has a destructor function, if this service is modified in
 * will trigger this service instance reload by Kite, and the destructor function
 * will be called.
 *
 * In "watching" mode, if a file is changed then Kite will reload this file and create a
 * new instance in order to make the modified code work.
 * The typical application is writting a Kite service which starts a WebSocket service,
 * when in development stage ( generally "watching" mode is on ), the "httpServer" &
 * "websocketServer" will keep runing no matter how many times the file is reloaded,
 * therefore a destructor function that close relevant connections is necessary.
 *
 * @param target
 * @param propertyKey
 */
function PreDestroy(target, propertyKey) {
    console.warn('[ KITE ] `PreDestroy` function only called under watching mode');
    // If more than one destructor be annotated, throw an error
    if (Reflect.hasMetadata(MK_DESTRUCT, target)) {
        // tslint:disable-next-line:max-line-length
        throw new Error(`Only one destructor is allowed for "${target.constructor.name}", please remove "@Destruct" from method "${propertyKey}"`);
    }
    if (typeof target[propertyKey] !== 'function') {
        throw new Error(`A destructor must be a function, please check "${target.constructor.name}.${propertyKey}"`);
    }
    Reflect.defineMetadata(MK_DESTRUCT, propertyKey, target);
}
exports.PreDestroy = PreDestroy;
/**
 * Get destruct method name from service
 * @param target service instance
 */
function getDestructor(target) {
    const prop = Reflect.getMetadata(MK_DESTRUCT, target);
    return target[prop];
}
exports.getDestructor = getDestructor;
