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

import * as http from 'http';
import { Responder, KiteError, ErrorService } from '../';


export class JsonResponder implements Responder {
    write(msg: any, res: http.ServerResponse): void {
        res.setHeader('Content-Type', 'application/json;charset=UTF-8');
        res.statusCode = 200;
        res.end(JSON.stringify(msg));
    }

    writeError(err: any, res: http.ServerResponse, errorService: ErrorService): void {
        let error;
        if (err instanceof KiteError) {
            error = errorService.getError(err.code, err.extra);
        } else if (typeof err === 'number' || typeof err === 'string') {
            error = errorService.getError(err);
        } else {
            error = errorService.getError(1001);
        }

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json;charset=UTF-8');
        res.end(JSON.stringify({ error }));
    }

}
