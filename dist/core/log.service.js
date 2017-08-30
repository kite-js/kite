"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
exports.LogFlags = {
    none: 0,
    info: 1,
    warn: 2,
    error: 4
};
/**
 * Kite log service
 */
class LogService {
    /**
     * Log access
     */
    // access: (request: http.IncomingMessage) => void;
    constructor(level, stdout, stderr) {
        this.info = exports.LogFlags.info & level ? this._info : this._dummy;
        // this.access = LogFlags.info & level ? this._access : this._dummy;
        this.warn = exports.LogFlags.warn & level ? this._warn : this._dummy;
        this.error = exports.LogFlags.error & level ? this._error : this._dummy;
        let out = process.stdout;
        let err = process.stderr;
        if (stdout) {
            if (typeof stdout === 'string') {
                out = fs.createWriteStream(stdout);
            }
            else if (stdout.writable) {
                out = stdout;
            }
        }
        if (stderr) {
            if (typeof stderr === 'string') {
                out = fs.createWriteStream(stderr);
            }
            else if (stderr.writable) {
                out = stderr;
            }
        }
        // let out = stdout ? fs.createWriteStream(stdout) : process.stdout;
        // let err = stderr ? fs.createWriteStream(stderr) : process.stderr;
        this.logger = new console.Console(out, err);
    }
    _dummy(...optionalMsgs) {
        // do nothing
    }
    _info(output, ...optionalMsgs) {
        let time = new Date().toLocaleString();
        let tag = '[ INFO  ]';
        this.logger.log.apply(null, [time, tag, output].concat(optionalMsgs));
    }
    _warn(output, ...optionalMsgs) {
        let time = new Date().toLocaleString();
        let tag = '[ WARN  ]';
        this.logger.warn.apply(null, [time, tag, output].concat(optionalMsgs));
    }
    _error(output, ...optionalMsgs) {
        let time = new Date().toLocaleString();
        let tag = '[ ERROR ]';
        this.logger.error.apply(null, [time, tag, output].concat(optionalMsgs));
    }
}
exports.LogService = LogService;
//# sourceMappingURL=log.service.js.map