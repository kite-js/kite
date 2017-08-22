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
/**
 * Context class for passing Node http.IncomingMessage & http.ServerResponse to the controller.
 *
 * Since `http.IncomingMessage` and `http.ServerResponse` are defined as interfaces in Typescript,
 * Kite can not determine type of these objects in controller entry point, for example:
 * ```typescript
 * @Controller()
 * export class UserCreateController {
 *     @Entry()
 *     async exec(_id: string, name: string, request: http.IncomingMessage) {
 *         // to your things here
 *     }
 * }
 * ```
 * Kite knows the types of `_id name` are "String" because "String" is a class, but can not determine the type of `request`,
 * it's actually compiled to type "Object" for reflection, so Kite won't know it's type and will not pass the `http.IncomingMessage`
 * object to controller ( and if you do so, Kite will create an object with `new Object()` ).
 *
 * Thus, Kite needs a way to wrap these things, `Context` class takes this job.
 * By simply wrap `http.IncomingMessage` and `http.ServerResponse` and other interfaces in future, Kite is able to detect type `Context`,
 * and creates an `Context` object and fills it with `http.IncomingMessage` & `http.ServerResponse`, then gives them to controller.
 */
class Context {
}
exports.Context = Context;
//# sourceMappingURL=context.js.map