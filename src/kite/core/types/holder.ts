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


export type HolderClass = {
    new(...args: any[]): {
        extract(request: http.IncomingMessage): void;
        hasPrivilege(privilege: string | number): Promise<boolean>;
    }
};

/**
 * A `Holder` is used if `privilege` metadata defined for a Kite controller.
 * 
 * For controller access privilege check, ...
 */
export abstract class Holder {
    /**
     * Extract holder data from HTTP request, such as HTTP header, query string
     * 
     * @param request 
     */
    abstract extract(request: http.IncomingMessage): void;

    /**
     * Validate current holder data
     */
    abstract hasPrivilege(privilege: string | number): Promise<boolean>;
}
