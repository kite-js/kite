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
const util = require("util");
class ErrorService {
    /**
     *
     * @param code 错误代码
     * @param extra 附加错误消息
     */
    getError(code, extra) {
        let msg = this.errors[code];
        if (extra && typeof extra === 'string') {
            extra = [extra];
        }
        if (msg && extra) {
            msg = util.format(msg, ...extra);
        }
        return { code, msg };
    }
}
exports.ErrorService = ErrorService;
