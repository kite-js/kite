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
/**
 * Kite error classs
 */
export declare class KiteError {
    code: number | string;
    extra: string | string[];
    /**
     * Kite error class
     *
     * A Kite error will be catched by Kite error handler, and shows an error message by
     * Kite error handler. An error code is used as a key to locate the error message,
     * an error message can be a normal string or template string, if a template string
     * is provided, Kite error handler will try to replace the placeholders like `printf`
     *
     * @param code error code
     * @param extra extra string / strings
     */
    constructor(code: number | string, extra?: string | string[]);
}
/**
 * [DEPRECATE] A shortcut to `throw new KiteError(code, extra)` when you need to exit a controller.
 *
 * THIS FUNCTION WILL BE DEPRECATED IN FUTURE VERSION
 *
 * Old way:
 * ```ts
 * if (error) throw new KiteError('some error');
 * ```
 *
 * New way, simpler, readable:
 * ```ts
 * if (error) cut('some error')
 * ```
 *
 * @param code
 * @param extra
 */
export declare function end(code: number | string, ...extra: any[]): void;
/**
 * A replacement of end() function, end() function will be deprecated
 * @param condition
 * @param code
 * @param extra
 */
export declare function assert(condition: any, code: number | string, ...extra: any[]): asserts condition;
