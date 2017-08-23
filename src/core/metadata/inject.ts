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
 **/

import 'reflect-metadata';

/**
 * Tell Kite to inject an "injectable" #Injectable# instance for a controller.
 * 
 * An `@Inject()` target must be decorated with `@Injectable()`
 * 
 * ```typescript
 * // Service definition
 * @Injectable()
 * export class DatabaseService {
 *      async createUser(user: any) {
 *          // ...
 *      }
 * }
 * 
 * // Controller definition
 * @Controller()
 * export class UserCreateController {
 *      // inject a "DatabaseService" instance here
 *      @Inject()
 *      db: DatabaseService;
 * 
 *      @Entry()
 *      exec(name: string, password: string) {
 *          this.db.createUser({name, password});
 *      }
 * }
 * ```
 */
export function Inject() {
    return function (target: any, key: string) {
        let injections: Map<string, any> = Reflect.getMetadata('kite:injections', target) || new Map<string, any>();
        injections.set(key, Reflect.getMetadata('design:type', target, key));
        Reflect.defineMetadata('kite:injections', injections, target);
    }
}
