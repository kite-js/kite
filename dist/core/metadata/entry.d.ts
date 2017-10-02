/**
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
import 'reflect-metadata';
import { FilterRule } from './model';
/**
 * Controller entry point definition structure
 */
export declare type InputRules = {
    [name: string]: FilterRule;
};
/**
 * Entry Point Configuration
 */
export interface EntryConfig {
    /**
     * initialize Kite model with it's default values
     *
     * default is false, create Kite model with `new` operator
     */
    $cleanModel?: boolean;
    /**
     * Input rules for entry point
     */
    $inputRules?: InputRules;
}
/**
 * Kite controller entry point decorator.
 *
 * ## Description
 *
 * Entry decorator marks a function of controller as "entry point" for Kite, the framework will invoke it
 * when request comes in.
 *
 * The name of entry point function is not limited, you can name it at will.
 * Please note that __only one entry point__ can be annotated in a Kite controller, if more
 * than one `@Entry()` appeares in controller, an error will be given.
 *
 * ## How to use
 * An entry point must be an
 * "[asynchronous function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)",
 * means it must be declared like following:
 *
 * ```typescript
 * @Controller()
 * class AController {
 *      @Entry()
 *      async exec() {
 *          // statments
 *      }
 * }
 * ```
 * or with a return type declared:
 * ```typescript
 * @Controller()
 * class AController {
 *      @Entry()
 *      exec(): Promise<any> {
 *          // statments
 *      }
 * }
 * ```
 * or combine both:
 * ```typescript
 * @Controller()
 * class AController {
 *      @Entry()
 *      async exec(): Promise<any> {
 *          // statments
 *      }
 * }
 * ```
 *
 * ## Parameter mapping
 * The parameters of entry point function are mapped to client inputs or / and some other special context variables,
 * base on types paramters:
 * + __javascript types (number, string, boolean, array, boolean)__ - search for property which has the same name with the
 *   parameter in the raw input object, and parse input value to declared types
 * + __Other objects__ - create a parameter object with "new XObject(inputs.paramName)" and set to these parameters,
 *   these objects should support constructor initialization, such as Date `new Date(inputs)` and MongoDB ObjectId `new ObjectId(inputs)`
 * + __Kite model__ - create an model and filter the inputs with declared rules
 * + __[IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage)__ - current IncomingMessage (request) object
 * + __[ServerResponse](https://nodejs.org/api/http.html#http_class_http_serverresponse)__ - current ServerResponse (response) object
 * + __"Holder" class__ - a decoded holder object is passed in,
 *
 * ### Basic mappings
 * A shortcut to map client inputs to controllers is define map rules for parameters of entry points.
 * For example, let's assume "http://localhost:4000/UserUpdate?_id=1000&name=Tom" mapped to a controller named "UserUpdateController":
 * ```typescript
 * @Controller()
 * export class UserUpdateController {
 *     @Entry()
 *     async exec(_id: number, name: string, country: string = 'unknown') {
 *         // do your things here
 *         console.log(_id, name, country);
 *         return {_id, name, country};
 *     }
 * }
 * ```
 * the server console will output "
 *
 * > 1000 Tom unknow
 *
 * Kite maps "_id" and "name" from URL to parameters of controller entry point,
 * both "_id" and "name" are required fields, if any of them is omitted, Kite will give an error to clients;
 * the third parameter "country" is assigned with a default value, Kite will treat this field as an "optional" parameter,
 * means process is continued with the default value even it's omitted from request.
 * And, if "country" is given in request, parameter "country" of "UserUpdateController.exec()" is set to a given value,
 * for example http://localhost:4000/UserUpdate?_id=1000&name=Tom&country=US" outputs:
 *
 * > 1000 Tom US
 *
 * Kite treats non-default arguments as "required" fields for entry points, and arguments with default values are treated
 * as optional fields, so you can place the optional arguments any where:
 * ```typescript
 * export class UserUpdateController {
 *     @Entry()
 *     async exec(_id: number, country: string = 'unknown', name: string) {
 *         // do your things here
 *         console.log(_id, name, country);
 *         return {_id, name, country};
 *     }
 * }
 * ```
 *
 * Sometimes you might need arguments to be "optional" without default values, in this case, you should
 * assign 'undefined' as default values to these arguments, the following code shows this trick:
 * ```typescript
 * export class UserUpdateController {
 *     @Entry()
 *     async exec(_id: number, country: string = undefined, name: string) {
 *         // do your things here
 *         console.log(_id, name, country);
 *         return {_id, name, country};
 *     }
 * }
 * ```
 *
 * This "required/optional" checking mechanism is different from Kite model, where fields be treated as
 * "optional" if `required: true` is not explicitly annonced in "@In()".
 *
 * Kite allows you define rules for each parameter at `@Entry()` decorator as well, rule definition is as same as `@In()`:
 * ```typescript
 * @Controller()
 * export class UserUpdateController {
 *     @Entry({
 *          name: { min: 3 }    // "name" minimal length is 3
 *     })
 *     async exec(_id: number, name: string, country: string = 'unknown') {
 *         // do your things here
 *     }
 * }
 * ```
 * Please note that, the above example has implicit "required" rules applied to "_id" and "name", even though there is no "required: true"
 * defined in the rule.
 *
 * ### Kite model mapping
 * Any argument annonced as type of Kite model will cause Kite to map entire raw input object to this argument, this is useful when coding
 * "insert", "update" APIs, generally these APIs accept the data that maps to database tables or documents, it's not friendly writing
 * losts of arguments in entry point functions, so "Kite model" is a workaround.
 * ```typescript
 * @Model()
 * export class UserModel {
 *     _id: number;
 *
 *     @In({required: true, min: 3})    // limit input "name" minimal length to 3
 *     name: string;
 *
 *     @In({min: 10})   // limit input "age" minimal value to 10
 *     age: number;
 *
 *     @In()    // no rule for input "country", accept any value
 *     country: string;
 * }
 *
 * @Controller()
 * export class UserCreateController {
 *     @Entry()
 *     async exec(user: UserModel) {
 *         // db.user.insertOne(user);      // insert to DB, that's it
 *         return { success: true };
 *     }
 *
 * }
 * ```
 * The above code shows a controller named "UserCreateController", accept `user: UserModel` as parameter, `UserModel` mapping
 * client inputs: "name", "age" and "country" as input values, And, `UserModel` is also mapping to a database table -
 * let's assume table name is "user" - which owns fields "_id", "name", "age", "country", in this table, "_id" is generated as
 * key by database when data is inserted.
 *
 * Here, "_id" is excluded from client inputs because it's a "key" for this row of data and you don't want a client-input value
 * set to this key.
 *
 * Before Kite call this controller, the framework checks the input data follow the rules that defined in "@In(...)" for you.
 *
 * With this feature, Kite is extremely easy to map & validate complex data objects:
 * ```typescript
 * @Model() export class Addr {
 *      @In()
 *      addr: string;
 *
 *      @In()
 *      city: string;
 *
 *      @In()
 *      state: string;
 *
 *      @In()
 *      zipcode: string;
 * }
 *
 * @Model() export class User {
 *
 *      _id: number;
 *
 *      @In()
 *      name: string;
 *
 *      @In()
 *      addr: Addr;
 * }
 *
 * @Controller()
 * export class UserCreateController {
 *     @Entry()
 *     async exec(user: User) {
 *        // save 'user' to db
 *     }
 * }
 * ```
 *
 * ### Mixing basic types and Kite model
 * As the above example shows, "_id" is not an input field, this is reasonable to insert data to database,
 * but it's unreasonable to update, we certainly require "_id" here. Therefore, you can mix basic types
 * and Kite model in an entry point:
 * ```typescript
 * export class UserUpdateController {
 *     @Entry()
 *     async exec(_id: number, user: User) {
 *        // update 'user' to db
 *     }
 * }
 * ```
 *
 * ### Access raw `request` and `response` object
 * ```typescript
 * import { IncomingMessage, ServerResponse } from 'http';
 *
 * export class UserUpdateController {
 *     @Entry()
 *     async exec(request: IncomingMessage, response: ServerResponse) {
 *          return {url: ctx.request.url};
 *     }
 * }
 * ```
 *
 */
export declare function Entry(config?: EntryConfig | InputRules): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
/**
 * Test a class has entry point or not
 * @param controller any value
 */
export declare function hasEntryPoint(controller: any): boolean;
