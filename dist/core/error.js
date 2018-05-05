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
class KiteError {
    constructor(code, extra) {
        this.code = code;
        this.extra = extra;
        Error.captureStackTrace(this);
    }
}
exports.KiteError = KiteError;
/**
 * A shortcut to `throw new KiteError(code, extra)` when you need to exit a controller.
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
function end(code, ...extra) {
    throw new KiteError(code, extra);
}
exports.end = end;
//# sourceMappingURL=error.js.map