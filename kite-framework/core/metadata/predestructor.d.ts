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
import 'reflect-metadata';
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
export declare function PreDestroy(target: any, propertyKey: string): void;
/**
 * Get destruct method name from service
 * @param target service instance
 */
export declare function getDestructor(target: any): () => void;
