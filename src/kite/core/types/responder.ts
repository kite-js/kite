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
import { ErrorService } from './../error.service';

export interface Responder {

    /**
     * Success handler, called when controller ends normally
     */
    write(msg: any, res: http.ServerResponse): void;

    /**
     * Failure handler, called when controller ends with error, usually thrown something
     */
    writeError(err: any, res: http.ServerResponse, errorService: ErrorService): void;
}
