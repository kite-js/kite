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
import { WatcherService } from './watcher.service';
/**
 * Controller factory
 * This controller factory does the following things:
 * - Creates controllers
 * - Builds inputs filters
 * - Creates injections
 */
export declare class ControllerFactory {
    private controllers;
    private injections;
    logService: LogService;
    watcherService: WatcherService;
    workdir: string;
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
    get(id: string, filename: string): Promise<any>;
    /**
     * Dependency injection
     *
     * @private
     */
    private injectDependency(target);
}
