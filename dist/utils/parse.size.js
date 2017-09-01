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
const SIZE_REGEX = /^(\d+(\.\d+)?)\s*(b|k|m|g)$/i;
function parseSize(input) {
    let size;
    if (typeof input === 'number') {
        size = input;
    }
    else {
        let matches = input.match(SIZE_REGEX);
        if (matches) {
            size = parseInt(matches[1], 0);
            let surfix = matches[3].toUpperCase();
            if (size > 0) {
                if (surfix === 'B') {
                    // nothing
                }
                else if (surfix === 'K') {
                    size *= 1024;
                }
                else if (surfix === 'M') {
                    size *= 1024 * 1024;
                }
                else if (surfix === 'G') {
                    size *= 1024 * 1024 * 1024;
                }
            }
        }
    }
    return size;
}
exports.parseSize = parseSize;
//# sourceMappingURL=parse.size.js.map