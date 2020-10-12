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
exports.XformReceiverProvider = void 0;
const querystring = require("querystring");
// tslint:disable-next-line:no-shadowed-variable
function XformReceiverProvider() {
    return {
        contentType: 'application/x-www-form-urlencoded',
        receiver: function (data) {
            return querystring.parse(data);
        }
    };
}
exports.XformReceiverProvider = XformReceiverProvider;
