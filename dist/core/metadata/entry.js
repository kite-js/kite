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
require("reflect-metadata");
const model_1 = require("./model");
const vm = require("vm");
const http = require("http");
const MK_ENTRY_POINT = 'kite:entry-point';
const MK_ENTRY_PARAMS = 'kite:entry-params';
const MK_MAP_INPUT_ONLY = 'kite:map-input-only';
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
 * `> 1000 Tom unknow`
 *
 * Kite maps "_id" and "name" from URL to parameters of controller entry point,
 * both "_id" and "name" are required fields, if any of them is omitted, Kite will give an error to clients;
 * the third parameter "country" is assigned with a default value, Kite will treat this field as an "optional" parameter,
 * means process is continued with the default value even it's omitted from request.
 * And, if "country" is given in request, parameter "country" of "UserUpdateController.exec()" is set to a given value,
 * for example http://localhost:4000/UserUpdate?_id=1000&name=Tom&country=US" outputs:
 *
 * `> 1000 Tom US`
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
 */
function Entry(config) {
    return function (target, propertyKey, descriptor) {
        // If more than one entrypoint be annotated, throw an error
        if (Reflect.hasMetadata(MK_ENTRY_POINT, target)) {
            // tslint:disable-next-line:max-line-length
            throw new Error(`Only one entry is allowed for controller "${target.constructor.name}", please remove "@Entry()" from function "${propertyKey}"`);
        }
        // Check return type, return type must be a "Promise"
        let returntype = Reflect.getMetadata('design:returntype', target, propertyKey);
        if (returntype !== Promise) {
            throw new Error(`Return type of controller "${target.constructor.name}" entry point must be a "Promise"`);
        }
        // define entry point metadata for controller, tell `@controller` there is an entry point
        Reflect.defineMetadata(MK_ENTRY_POINT, propertyKey, target);
        // Parameter types
        let paramtypes = Reflect.getMetadata('design:paramtypes', target, propertyKey);
        // split parameter names from function source, parameter names are used for client input mappings
        let fnstr = descriptor.value.toString();
        // Raw parameters with default value
        let rawParams = fnstr.match(/\(.*?\)/)[0].replace(/(\/\/.*$)|(\/\*[\s\S]*?\*\/)|(\s)|\(|\)/g, '');
        // parametre names only
        let params = rawParams.replace(/=.*?,(?=[_A-Za-z\.\$])/g, ',').replace(/=.*?$/g, '');
        // make the parameters to independent
        let paramnames = params ? params.split(',') : [];
        // save parameter name and relative type to object
        let paramReflection = {};
        paramnames.forEach((name, index) => {
            paramReflection[name] = paramtypes[index];
        });
        // save parameter names and tyes for reflection (for middleware)
        Reflect.defineMetadata(MK_ENTRY_PARAMS, paramReflection, target);
        let proxyMakerParamNames = [];
        let proxyMakerParams = [];
        // A dynamically created Kite model for mapping controller's entry point parameters
        let _Param;
        // Dynamically create a Kite model class for controller parameter mapping
        if (paramtypes.length) {
            let modelname = `__${target.constructor.name}Param`;
            _Param = vm.runInThisContext(`(class {})`, { filename: modelname + '.vm' });
        }
        // Walk through parameter types, check if there is only one Kite model exists
        let numModels = 0;
        paramtypes.forEach(type => {
            if (model_1.isKiteModel(type)) {
                numModels++;
            }
        });
        // Here, limit only one Kite model in parameter array of entry point
        // TODO: allow child models mapping in parameter directly ?
        if (numModels > 1) {
            throw Error(`Only one Kite model is allowed in parameter list of entry point, please check controller: "${target.constructor.name}"`);
        }
        let entryParams = [], numGlobalMapping = 0;
        paramnames.forEach((name, idx) => {
            let type = paramtypes[idx];
            if (type === http.IncomingMessage) {
                entryParams.push('request');
            }
            else if (model_1.isKiteModel(type) && numModels === 1) {
                numGlobalMapping++;
                let typename, index;
                // type is already cached?
                index = proxyMakerParams.indexOf(type);
                if (index === -1) {
                    typename = `_${type.name}`;
                    if (proxyMakerParamNames.includes(typename)) {
                        typename += proxyMakerParamNames.length;
                    }
                    proxyMakerParamNames.push(typename);
                    proxyMakerParams.push(type);
                }
                else {
                    typename = proxyMakerParamNames[index];
                }
                if (model_1.isKiteModel(type)) {
                    if (isMapInputOnly(target)) {
                        entryParams.push(`Object.create(${typename}.prototype)._$filter(inputs, true)`);
                    }
                    else {
                        entryParams.push(`new ${typename}()._$filter(inputs)`);
                    }
                }
                else {
                    entryParams.push(`new ${typename}(inputs)`);
                }
            }
            else {
                Reflect.defineMetadata('design:type', type, _Param.prototype, name);
                // by default, all parameters are required fields if no rule be defined, 
                // if any argument has a default value, let's treat it as an optional input
                let defaultValueArg = new RegExp(`(^|,)${name}=`);
                let rule = {
                    required: !defaultValueArg.test(rawParams)
                };
                // If filter rule available, use user defined, else create one
                if (config) {
                    Object.assign(rule, config[name]);
                }
                model_1.In(rule)(_Param.prototype, name);
                entryParams.push('param.' + name);
            }
        });
        let paramExp = '';
        // if `@In()` is applied to "_Param" class, this Kite model will have MK_KITE_INPUTS metadata, 
        // else the dynamically created class "_Param" does nothing, therefore it is an useless Kite model
        if (_Param && model_1.hasModelInputs(_Param.prototype)) {
            // "decoreate" the new created class as KiteModel, force it to create a _$filter() for this class
            model_1.Model()(_Param);
            paramExp = 'let param = new _Param()._$filter(inputs);';
            proxyMakerParamNames.push('_Param');
            proxyMakerParams.push(_Param);
        }
        let proxyMakerParamNameStr = proxyMakerParamNames.join(', ');
        let callParamsStr = entryParams.join(', ');
        let fnsrc = `(function(${proxyMakerParamNameStr}) {
                return function(inputs, request) {
                    ${paramExp}
                    return this.${propertyKey}(${callParamsStr});
                }
            })`;
        let proxyProviderSrc = new vm.Script(fnsrc, { filename: `__${target.constructor.name}.$proxy.vm` });
        let $proxy = proxyProviderSrc.runInThisContext()(...proxyMakerParams);
        target.$proxy = $proxy;
    };
}
exports.Entry = Entry;
/**
 * Test a class has entry point or not
 * @param controller any value
 */
function hasEntryPoint(controller) {
    return Reflect.hasMetadata(MK_ENTRY_POINT, controller);
}
exports.hasEntryPoint = hasEntryPoint;
/**
 * Get parameter reflection object from a controller
 * @param controller constroller instance
 */
function getEntryParams(controller) {
    return Reflect.getMetadata(MK_ENTRY_PARAMS, controller);
}
exports.getEntryParams = getEntryParams;
/**
 * Tell Kite only map client input to a Kite model and its children,
 * without calling the constructor.
 *
 * This decorator can be only applied to Kite controller entry point function,
 * and must be placed after `@Entry()` decorator, for example:
 * ```typescript
 * import { Controller, Entry } from 'kite-framework';
 *
 * @Controller()
 * export class TypesController {
 *     @Entry()
 *     @MapInputOnly
 *     async exec(str: string, num: number, bool: boolean, date: Date = undefined) {
 *         return { values: { str, num, bool, date } };
 *     }
 * }
 * ```
 */
function MapInputOnly(target, propertyKey, descriptor) {
    Reflect.defineMetadata(MK_MAP_INPUT_ONLY, true, target);
}
exports.MapInputOnly = MapInputOnly;
/**
 * Test a Kite model is only map client inputs or not
 * @param target
 */
function isMapInputOnly(target) {
    return Reflect.hasMetadata(MK_MAP_INPUT_ONLY, target);
}
exports.isMapInputOnly = isMapInputOnly;
