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
const _1 = require("../");
class JsonResponder {
    write(msg, res) {
        res.setHeader('Content-Type', 'application/json;charset=UTF-8');
        res.statusCode = 200;
        res.end(JSON.stringify(msg));
    }
    writeError(err, res, errorService) {
        let error;
        if (err instanceof _1.KiteError) {
            error = errorService.getError(err.code, err.extra);
        }
        else if (typeof err === 'number' || typeof err === 'string') {
            error = errorService.getError(err);
        }
        else {
            error = errorService.getError(1001);
        }
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json;charset=UTF-8');
        res.end(JSON.stringify({ error }));
    }
}
exports.JsonResponder = JsonResponder;
//# sourceMappingURL=json.responder.js.map