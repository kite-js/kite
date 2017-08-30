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

import * as fs from 'fs';
import * as http from 'http';

export const LogFlags = {
    none: 0,
    info: 1,
    warn: 2,
    error: 4
}

/**
 * Kite log service 
 */
export class LogService {
    private logger: Console;
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
    // access: (request: http.IncomingMessage) => void;

    constructor(level: number, stdout?: string | NodeJS.WritableStream, stderr?: string | NodeJS.WritableStream) {
        this.info = LogFlags.info & level ? this._info : this._dummy;
        // this.access = LogFlags.info & level ? this._access : this._dummy;
        this.warn = LogFlags.warn & level ? this._warn : this._dummy;
        this.error = LogFlags.error & level ? this._error : this._dummy;

        let out: NodeJS.WritableStream = process.stdout;
        let err: NodeJS.WritableStream = process.stderr;

        if (stdout) {
            if (typeof stdout === 'string') {
                out = fs.createWriteStream(stdout);
            } else if ((stdout as NodeJS.WritableStream).writable) {
                out = stdout;
            }
        }

        if (stderr) {
            if (typeof stderr === 'string') {
                out = fs.createWriteStream(stderr);
            } else if ((stderr as NodeJS.WritableStream).writable) {
                out = stderr;
            }
        }

        // let out = stdout ? fs.createWriteStream(stdout) : process.stdout;
        // let err = stderr ? fs.createWriteStream(stderr) : process.stderr;

        this.logger = new console.Console(out, err);
    }

    private _dummy(...optionalMsgs: any[]) {
        // do nothing
    }

    _info(output: any, ...optionalMsgs: any[]) {
        let time = new Date().toLocaleString();
        let tag = '[ INFO  ]'
        this.logger.log.apply(null, [time, tag, output].concat(optionalMsgs));
    }

    _warn(output: any, ...optionalMsgs: any[]) {
        let time = new Date().toLocaleString();
        let tag = '[ WARN  ]'
        this.logger.warn.apply(null, [time, tag, output].concat(optionalMsgs));
    }

    _error(output: any, ...optionalMsgs: any[]) {
        let time = new Date().toLocaleString();
        let tag = '[ ERROR ]'
        this.logger.error.apply(null, [time, tag, output].concat(optionalMsgs));
    }

    // _access(request: http.IncomingMessage) {
    //     if (this.info) {
    //         let referer = request.headers['referer'] || '-';
    //         let ua = request.headers['user-agent'] || '-';
    //         this.info(`${request.connection.remoteAddress} - "${request.method} ${request.url}" "${referer}" "${ua}"`);
    //     }
    // }
}
