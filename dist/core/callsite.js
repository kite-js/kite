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
const Path = require("path");
/**
 * Get the caller's path from error stack
 *
 * Thanks to [this thread](http://stackoverflow.com/questions/13227489/how-can-one-get-the-file-path-of-the-caller-function-in-node-js)
 */
function getCallerPath() {
    // Save original Error.prepareStackTrace
    let origPrepareStackTrace = Error.prepareStackTrace;
    // Override with function that just returns `stack`
    Error.prepareStackTrace = function (_, _stack) {
        return _stack;
    };
    // Create a new `Error`, which automatically gets `stack`
    let err = new Error();
    // Evaluate `err.stack`, which calls our new `Error.prepareStackTrace`
    let stack = err.stack;
    // Restore original `Error.prepareStackTrace`
    Error.prepareStackTrace = origPrepareStackTrace;
    // Remove superfluous function call on stack
    stack.shift(); // getStack --> Error
    // stack[0] : [ caller ] => getCallerPath()
    // stack[1] : [ original call ] => [ caller ]
    return Path.dirname(stack[1].getFileName());
}
exports.getCallerPath = getCallerPath;
