"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.KiteResponder = void 0;
const __1 = require("../");
class KiteResponder {
    constructor() {
        this.html = /^[\w\n\r]*<[a-z!]/m;
    }
    write(msg, res) {
        res.statusCode = 200;
        let content, contentType;
        if (typeof msg === 'object') {
            contentType = 'application/json';
            content = JSON.stringify(msg);
        }
        else if (msg === undefined) {
            contentType = 'text/plain';
            content = '';
        }
        else if (typeof msg === 'string') {
            content = msg;
            // it it starts with html tag, content type html
            if (this.html.test(msg)) {
                contentType = 'text/html; charset=utf-8';
            }
            else {
                contentType = 'text/plain; charset=utf-8';
            }
        }
        else {
            contentType = 'text/plain';
            content = JSON.stringify(msg);
        }
        if (!res.getHeader('content-type')) {
            res.setHeader('Content-Type', `${contentType}`);
        }
        res.end(content);
    }
    writeError(err, res, errorService) {
        let error;
        if (err instanceof __1.KiteError) {
            error = errorService.getError(err.code, err.extra);
        }
        else if (typeof err === 'number' || typeof err === 'string') {
            error = errorService.getError(err);
        }
        else {
            error = errorService.getError(1001);
        }
        res.statusCode = 200;
        let content = JSON.stringify({ error });
        res.setHeader('Content-Type', 'application/json');
        res.end(content);
    }
}
exports.KiteResponder = KiteResponder;
