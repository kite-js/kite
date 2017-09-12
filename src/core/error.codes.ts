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

export const ERROR_CODES = {
    1000: '%s', // any error msg
    1001: 'Service is not available',
    1002: 'Resource not found',
    1003: 'Script error',
    // 1004: 'Deprecated API',
    // 1005: 'Access token required',
    // 1006: 'Invalid / Expired access token',
    // 1007: 'Access token expired',
    // 1008: 'Access denied, required privilege: %s',
    1009: 'Message body is too big, limited to %s',
    1010: 'Failed to parse request data',
    // 1011: 'Request method is "%s", but "%s" is required',

    1020: 'Parameter error: "%s" is required',
    1021: 'Parameter error: "%s" should be one of [%s]',
    1022: 'Parameter error: "%s" does not match pattern %s',
    1023: 'Parameter error: "%s" is too short, minimal length is %d',
    1024: 'Parameter error: "%s" is too long, maximal length is %d',
    1025: 'Parameter error: "%s" is not a number',
    1026: 'Parameter error: "%s" can not less than %d',
    1027: 'Parameter error: "%s" can not greater than %d',
    1028: 'Parameter error: at least one of these parameters [%s] is required',
    // 1029: 'Parameter error: property "%s" require an object but %s is found',
    1030: 'Parameter error: length of "%s" is limited to %d',

    1100: 'Invalid request URL: failed to locate resource "%s"',
    1101: 'Invalid request URL: illegal characters detected',
}
