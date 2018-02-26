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
import { WatchService } from './watch.service';
import { Class } from './types/class';
/**
 * Controller factory
 * This controller factory does the following things:
 * - Creates controllers
 * - Creates dependencies
 */
export declare class ControllerFactory {
    logService: LogService;
    watchService: WatchService;
    workdir: string;
    private _images;
    private _controllers;
    /**
     * Get a controller class by given filename,
     * the filename can be an absolute path or a relative path,
     * if a relative path is given, Kite will search the working
     * directory for modules
     * @param filename controller filename
     */
    getController(filename: string): Class;
    /**
     * Get controller instance by given controller class and data
     * @param controller
     * @param data
     */
    getInstance(controller: Class, data?: any): Promise<any>;
    /**
     * Inject dependencies for an object
     * @param target
     * @param pool
     */
    private _injectDependency(target, pool, data);
}
