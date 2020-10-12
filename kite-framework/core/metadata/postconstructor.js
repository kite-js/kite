"use strict";
/***
 * Copyright (c) 2018-2020 [Arthur Xie]
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
exports.getPostConstructor = exports.PostConstruct = void 0;
require("reflect-metadata");
const MK_POST_CONSTRUCTOR = 'kite:post-constructor';
/**
 * Annoate a post-constructor function for a service.
 *
 * This is a replacement of "init" interface, the "init" interface is deprecated.
 *
 * Only one `@PostConstruct` is allowed in a service.
 *
 * A `@PostConstruct` annotated function is called immediately after service instance is created,
 * if the function returns a promise Kite will wait for it resolved, any error thrown will cause
 * Kite stop processing. The return / resolved value is always ignored.
 *
 * A `@PostConstruct` annotated function is generally an async function that initialize database
 * connections, so Kite can `await` for connection finishing. In most cases, database connections
 * are asynchronous operations, so PLEASE DO NOT make asynchronouse connections in a constructor,
 * constructor returns nothing, unexpected results may got.
 *
 * @param target
 * @param propertyKey
 */
function PostConstruct(target, propertyKey) {
    // If more than one post constructor be annotated, throw an error
    if (Reflect.hasMetadata(MK_POST_CONSTRUCTOR, target)) {
        // tslint:disable-next-line:max-line-length
        throw new Error(`Only one post constructor is allowed for "${target.constructor.name}", please remove "@PostConstruct" from method "${propertyKey}"`);
    }
    if (typeof target[propertyKey] !== 'function') {
        throw new Error(`A post constructor must be a function, please check "${target.constructor.name}.${propertyKey}"`);
    }
    Reflect.defineMetadata(MK_POST_CONSTRUCTOR, propertyKey, target);
}
exports.PostConstruct = PostConstruct;
/**
 * Get post construct method name from service
 * @param target service instance
 */
function getPostConstructor(target) {
    const prop = Reflect.getMetadata(MK_POST_CONSTRUCTOR, target);
    return target[prop];
}
exports.getPostConstructor = getPostConstructor;
