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
/// <reference types="node" />
export declare const LogFlags: {
    none: number;
    info: number;
    warn: number;
    error: number;
};
/**
 * Kite log service
 */
export declare class LogService {
    private logger;
    /**
     * Output some normal information
     */
    info: (output: any, ...optionalMsgs: any[]) => void;
    /**
     * Output warnings
     */
    warn: (output: any, ...optionalMsgs: any[]) => void;
    /**
     * Output errors
     */
    error: (output: any, ...optionalMsgs: any[]) => void;
    /**
     * Log access
     */
    constructor(level: number, stdout?: string | NodeJS.WritableStream, stderr?: string | NodeJS.WritableStream);
    private _dummy;
    _info(output: any, ...optionalMsgs: any[]): void;
    _warn(output: any, ...optionalMsgs: any[]): void;
    _error(output: any, ...optionalMsgs: any[]): void;
}
