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

import 'reflect-metadata';
import * as vm from 'vm';
import { KiteError } from '../error';
import { Class } from '../types/class';
import { ArrayType } from './model';

const MK_KITE_MODEL = 'kite:model'
const MK_KITE_ROOT_MODEL = 'kite:root-model'
const MK_KITE_INPUTS = 'kite:inputs';

const ESCAPED_QUOTE = '\\$1';
const QUOTE_REGEX = /('|"|`)/g;

type KiteModel = {
    new(...args: any[]): {}
    _$filter: (inputs: any) => void
};

/**
 * Annotate classes as Kite models
 * 
 * A Kite model is:
 * + a class map roughly to client request parameters
 * + a class map exactly to DB table (MongoDB document)
 * + often used as return values & data access object
 * 
 * ## Description
 * As descripted above, Kite models are used for data access: mapping data from requests and transfer to 
 * database services, or mapping from database outputs and respond to client.
 * 
 * The filter function named "_$filter" is created for Kite model at script loading time, custom
 * filter function is also alowed, if "_$filter" appears in a Kite model, Kite will not create
 * new filter function and will use original _$filter() to filter input paramters instead.
 * 
 * "_$filter" function should declare as:
 * ```typescript
 * @Model() User {
 *      name: string;
 *      password: string;
 * 
 *      _$filter(inputs: any) {
 *          // code your custom filter here
 *      }
 * }
 * ```
 * 
 * __NOTE__
 * 
 * When a Kite model is used for mapping client inputs, Kite will create an object with "new" operator 
 * `new User()` when client request comes in, without any constructor parameter, so if a Kite mode is 
 * coded like following, it'll not work as expected:
 * ```typescript
 * @Model()
 * class User {
 *      @In() name: string;
 *      @In() password: string;
 *      @In() type: string;
 *      
 *      constructor(type: string) {
 *          this.type = type;
 *      }
 * }
 * ```
 * 
 * It works fine if you manually initialize an object like below:
 * > let user = new User("admin");    // user.type = "admin"
 * 
 * In Kite, it will not work as expected, an object is created like:
 * 
 * > let user2 = new User(); 
 * 
 * or ( if $cleanModel is set to `true`)
 * 
 * > let user2 = Object.create(User.prototype);
 */
export function Model(globalRule?: FilterRule) {
    return function <T extends Class>(constructor: T) {
        Reflect.defineMetadata(MK_KITE_MODEL, true, constructor);
        createFilterFn(constructor.prototype, globalRule);
    }
}

/**
 * Array type definition, use only in FilterRule
 */
export interface ArrayType {
    /**
     * template of input array, etc:
     * + Simple array: "Array<Number>", this is also the default value
     * + Two-Dimensional array: "Array<Array<String>>"
     * 
     * Kite will resolve this template to filter inputs, this field is only used for
     * describing array dimensional formats
     */
    template: string;

    /**
     * element type of array template, can be one of:
     * + Number
     * + String
     * + Boolean
     * + Date
     * + Kite Model
     * + Any other types can be set value by `new Type(input)`
     * 
     * if field `template` is declared clearly with the following types, this field can be omitted:
     * + Number
     * + String
     * + Boolean
     * + Date
     */
    elementType?: Function;
}

/**
 * Client inputs parameters filter rules
 */
export interface FilterRule {
    /**
     * type: boolean - indicates a input field is required or not, default is "false"
     * + `true` - the field is required, if it's omitted from input, Kite will throw an 
     * + `fasle` - the field is optional, on error will be thrown even if it's omitted
     * 
     * @type boolean
     */
    required?: boolean;

    /**
     * available values for this input field, default is `undefined` - no value
     * checking for this field. If an array is given, Kite will check input value 
     * by searching given array, for example:
     * ```typescript
     * @In({
     *     values: ['Java', 'Javascript', 'PHP', 'GO', 'Python']
     * })
     * language: string;
     * ```
     * means input parameter "language" should be one of 
     * _'Java', 'Javascript', 'PHP', 'GO', *  'Python'_. 
     * If only one value is given to this array, the input field is limmited to 
     * this value.
     * 
     */
    values?: string[] | number[];


    /**
     * define the minimal value of input data, this filter supports the following types:
     * + __`Number`__ - model property type is number, filter value must be a number
     * + __`String`__ - model property type is string, filter value must be a string
     * + __`Date`__ - model property type is Date, filter value can be `string` or `number` or `Date`, 
     *   if string or number is given, this value should be possible to convert to a `Date` object:
     *   - if the value is a number, it must be a integer value representing the number of 
     *     milliseconds since 1 January 1970 00:00:00 UTC
     *   - if the value is a string, it represents a date which should be recognized by `Date.parse()` method
     * 
     * min value check for other types is not supported.
     * 
     * examples:
     * ```typescript
     * @Model()
     * export class Foo {
     *      @In({
     *          min: 18
     *      }) 
     *      age: number;
     * 
     *      @In({
     *          min: '2017'
     *      }) 
     *      year: string;
     * 
     *      @In({
     *          min: '2017-09-01'
     *      }) 
     *      startDate: Date;
     *      
     *      @In({
     *          min: new Date('2017-09-01')
     *      }) 
     *      startDate2: Date;
     * }
     * ```
     */
    min?: number | string | Date

    /**
     * define the maximal value of input data, this filter supports the following types:
     * + __`Number`__ - model property type is number, filter value must be a number
     * + __`String`__ - model property type is string, filter value must be a string
     * + __`Date`__ - model property type is Date, filter value can be `string` or `number` or `Date`, 
     *   if string or number is given, this value should be possible to convert to a `Date` object:
     *   - if the value is a number, it must be a integer value representing the number of 
     *     milliseconds since 1 January 1970 00:00:00 UTC
     *   - if the value is a string, it represents a date which should be recognized by `Date.parse()` method
     * 
     * max value check for other types is not supported.
     * 
     * examples:
     * ```typescript
     * @Model()
     * export class Foo {
     *      @In({
     *          max: 50
     *      }) 
     *      age: number;
     * 
     *      @In({
     *          max: '2020'
     *      }) 
     *      year: string;
     * 
     *      @In({
     *          max: '2017-09-30'
     *      }) 
     *      endDate: Date;
     *      
     *      @In({
     *          max: new Date('2017-09-30')
     *      }) 
     *      endDate2: Date;
     * }
     * ```
     */
    max?: number | string | Date

    /**
     * define the minimal length of a string, affects only on string types
     */
    minLen?: number

    /**
     * define the maximal length of a string, affects only on string types
     */
    maxLen?: number

    /**
     * limit input string with special length, example:
     * ```typescript
     * @In({
     *     len: 2
     * })
     * state: string;  // state length is restricted to 2
     * ```
     */
    len?: number;

    /**
     * test input string with special pattern, example:
     * 
     * ```typescript
     * @In({
     *     pattern: /^[a-z\d_\.\-]+@[a-z\d_\.\-]+\.[a-z]{2,}$/i
     * })
     * email: string;  // check email with the pattern
     * ```
     */
    pattern?: RegExp;

    /**
     * filter input value with given function, return value is used as
     * new value for this field, example: 
     * 
     * ```typescript
     * @In({
     *     filter: function(state: string) {
     *         return state ? state.toUpperCase() : '';
     *     }
     * })
     * state: string;  // conver input state to upper case
     * ```
     */
    filter?: (input: any) => any;

    /**
     * group property checking, tells Kite this field is connected
     * with other fields, at least one of grouped fields is required at input.
     * The following example means: either "phone" or "email" is required, 
     * if both "phone" and "email" are emitted an error will be thrown:
     * 
     *  ```typescript
     * @Model()
     * class ExampleParam {
     *     @In({
     *         group: 'email'  // "phone" will group with "email"
     *     })
     *     phone: string;
     * 
     *     @In()
     *     email: string;
     * }
     * ```
     */
    group?: string | string[];

    /**
     * accept empty values, the following values are considered as empty:
     * + `""` - an empty string
     * + `" "` - whitespace string
     * + `null` - null in JSON object
     * + `[]` - an empty array
     * 
     * default is `false`, disallow empty values
     * 
     * `true` - allow empty values as input value
     * `false` - disallow empty values as input value
     * 
     * By default, Kite filters out a string if it's empty; therefore controllers always 
     * receives nonempty strings from "String" typed parameters.
     * 
     * In most cases, people do not want "required" fields are empty strings, just like 
     * HTML `<input>` tag, if attribute "required" is set but nothing inputed, browser will warn you.
     * 
     * But sometimes people do, for example empty string is frequently used in database design, 
     * empty fields do mean something in some cases, so set this field to `true` if you want
     * Kite accept empty strings.
     * 
     */
    allowEmpty?: boolean;

    /**
     * disable trim action from strings
     * 
     * Kite trim benginning & ending spaces from string defaultly:
     * 
     * `true` - do not trim
     * `false` - trim
     */
    noTrim?: boolean;

    /**
     * element type of property, used when source type is Array. if this filter is omitted, Kite will
     * pass the whole input array to the controller.
     * 
     * example: 
     * ```typescript
     * class Foo {
     *      @In({
     *          arrayType: {
     *              template: 'Array<Number>',
     *              elementType: Number
     *          }
     *      })
     *      arr: Array<Number>;
     * }
     * ```
     */
    arrayType?: ArrayType;
}

/**
 * Decorate a model property as input
 * 
 * Kite will retrive data for this property from client request, and filter the raw data with filter rules if given.
 * 
 * Note this decorator must be used in a Kite model, or the rules won't take affect
 * 
 * ```typescript
 * @Model()
 * export class User {
 *      // Filter input parameter "name": it's a required value, and min length is 3
 *      @In({
 *          required: true,
 *          minLength: 3
 *      }) name: string;
 *
 *      @In({
 *          required: true,
 *          minLength: 6
 *      }) password: string;
 * }
 * 
 * ```
 */
export function In(rules: FilterRule = {}) {
    return function (target: Object, property: string) {
        let filterProperties: Map<string, FilterRule> = Reflect.getMetadata(MK_KITE_INPUTS, target) || new Map<string, FilterRule>();

        filterProperties.set(property, rules);
        // Save the rules to class metadata
        Reflect.defineMetadata(MK_KITE_INPUTS, filterProperties, target);
    }
}

/**
 * Create a filter function based on the rules of model.
 * 
 * Dynamically create code like:
 * ```javascript
 * function anonymous(_t0, _t1, _f0) {
 *      return function() {
 *          //...
 *      }
 * }
 * ```
 * @param target Target class
 */
function createFilterFn(target: KiteModel, globalRule: FilterRule): void {
    // Keep the original _$filter function if exists
    if (target._$filter) {
        return;
    }

    let inputs: Map<string, FilterRule> = Reflect.getMetadata(MK_KITE_INPUTS, target);

    // if no inputs field is declared ( No "@In()" is used ), map the all fields of input object to this Kite model
    if (!inputs || !inputs.size) {
        target._$filter = new Function('inputs', 'Object.assign(this, inputs); return this;') as any;
        return;
    }

    let fnStack: string[] = [];
    let argnames: string[] = [];
    let args: any[] = [];
    let groups: string[][] = [];

    /**
     * Get type name for filter function and put it to factory parameter list if type is not exist
     * @param type 
     */
    function getTypeName(type: Function): String {
        // property is other type or Kite Module, pass the original type to this filter function
        // so it can create right objects
        // if type is already in args, use the existing one, else create a new arg
        let idx = args.indexOf(type);
        let typename;
        if (idx === -1) {
            typename = '_' + type.name;
            // if another type has a same name, but prototype is different, give it a new name
            // this may happen in namespaces, two diferent namespaces both have the same object, 
            // `type.name` only give the name
            if (argnames.includes(typename)) {
                typename += argnames.length;
            }
            argnames.push(typename);
            args.push(type);
        } else {
            typename = argnames[idx];
        }

        return typename;
    }

    // Loop every @In decorated properties and create filter code
    for (let [property, rule] of inputs) {
        // if there is global rule defined, merge rules
        if (globalRule) {
            rule = Object.assign(globalRule, rule);
        }
        // in case of someone named a property with sigle quotation like "it's me" cause runtime errors, following will escape it
        let name = property.replace(QUOTE_REGEX, ESCAPED_QUOTE);

        // This property is grouped with another property / some other properties
        // temporary save the groups 
        if (rule.group) {
            if (property === (rule.group as string) || (rule.group instanceof Array && rule.group.includes(property))) {
                throw new Error(`Can not group with property it self! Model class: ${target.constructor.name}, property: ${property}`);
            }

            if (typeof rule.group === 'string') {
                groups.push([property, rule.group]);
            } else if (rule.group instanceof Array) {
                rule.group.push(property);
                groups.push(rule.group);
            }
        }

        let type = Reflect.getMetadata('design:type', target, property);

        // force default type to string
        if (!type) {
            type = String;
        }

        // field is a required parameter
        if (rule.required) {
            let condition = rule.allowEmpty ? `inputs['${name}'] === undefined` : `inputs['${name}'] == undefined`;
            fnStack.push(`if(${condition}) { throw new KiteError(1020, '${name}'); } else `);
        } else {
            let condition = rule.allowEmpty ? `inputs['${name}'] !== undefined` : `inputs['${name}'] != undefined`;
            fnStack.push(`if(${condition})`);
        }

        // custom filters
        if (rule.filter) {
            let filtername = `_f${argnames.length}`;
            argnames.push(filtername);
            args.push(rule.filter);
            fnStack.push(`{ this['${name}'] = ${filtername}(inputs['${name}']);}`);
            continue;
        }

        fnStack.push('{');

        // resolve template 'Array<T>', 'Array<Array<T>>'
        function parseArray(tpl: string) {
            if (tpl.startsWith('Array<') && tpl.endsWith('>')) {
                tpl = tpl.replace(/^Array<(.*)>$/, '$1');
                fnStack.push('input.map( input => ');
                parseArray(tpl);
                fnStack.push(')');
            } else {
                // if element type is not specified, determin type by template string
                if (!rule.arrayType.elementType) {
                    switch (tpl.toLocaleLowerCase()) {
                        case 'number':
                            rule.arrayType.elementType = Number;
                            break;
                        case 'boolean':
                            rule.arrayType.elementType = Boolean;
                            break;
                        case 'date':
                            rule.arrayType.elementType = Date;
                            break;
                        case 'string':
                        default:
                            rule.arrayType.elementType = String;
                    }
                }

                let elementTypeStr;
                switch (rule.arrayType.elementType) {
                    case Number:
                        elementTypeStr = 'Number';
                        break;
                    case Boolean:
                        elementTypeStr = 'Boolean';
                        break;
                    case String:
                        elementTypeStr = 'String'
                        break;
                    case Date:
                        elementTypeStr = 'new Date';
                        break;
                    default:
                        let typename = getTypeName(rule.arrayType.elementType);
                        if (isKiteModel(rule.arrayType.elementType)) {
                            elementTypeStr = `new ${typename}()._$filter`;
                        } else {
                            elementTypeStr = `new ${typename}`;
                        }
                }
                fnStack.push(`${elementTypeStr}(input)`);
            }
        }

        switch (type) {
            ////////////////////////////////////////////////////////////////////////////////////////////////
            // String check points: 
            // if defined values array, input value should in the values list
            // if defined pattern, check pattern match 
            // if defined min, max, check for minimal & maximal values
            // if defined minLen, maxLen, check for minimal length & maximal length
            ////////////////////////////////////////////////////////////////////////////////////////////////            
            case String:
                let trim = rule.noTrim ? '' : '.trim()';
                fnStack.push(`this['${name}'] = String(inputs['${name}'])${trim};`);

                // if "allowEmpty" is undefined or set to false, check original input for empty string '', null 
                if (rule.required && !rule.allowEmpty) {
                    fnStack.push(`if (this['${name}'] === '' || inputs['${name}'] === null) { throw new KiteError(1032, '${name}'); }`);
                }

                // check allowed values, ignore rule.pattern, rule.min, rule.max
                if (rule.values) {
                    // let src = toSource(rule.values);
                    let valuesname = `_v${argnames.length}`;
                    argnames.push(valuesname);
                    args.push(rule.values);
                    fnStack.push(`if(!${valuesname}.includes(this['${name}'])) { throw new KiteError(1021, ['${name}','${rule.values}']); } `);
                } else if (rule.pattern) {
                    // check pattern match, ingore rule.min, rule.max
                    fnStack.push(`if(!(${rule.pattern}).test(this['${name}'])) { throw new KiteError(1022, ['${name}','${rule.pattern}']); }`);
                } else if (rule.len) {
                    // check for string length(limited length)
                    fnStack.push(`if(this['${name}'].length !== ${rule.len}) { throw new KiteError(1030, ['${name}',${rule.len}]); }`);
                } else {
                    if (rule.minLen) {
                        fnStack.push(`if(this['${name}'].length < ${rule.minLen}) { throw new KiteError(1023, ['${name}',${rule.minLen}]); }`);
                    }
                    if (rule.maxLen) {
                        fnStack.push(`if(this['${name}'].length > ${rule.maxLen}) { throw new KiteError(1024, ['${name}',${rule.maxLen}]); }`);
                    }
                }

                // check for string minimal & maximal value
                if (rule.min && typeof rule.min === 'string') {
                    let quotedMin = rule.min.replace(QUOTE_REGEX, ESCAPED_QUOTE);
                    fnStack.push(`if(this['${name}'] < '${quotedMin}') { throw new KiteError(1026, ['${name}', '${quotedMin}']); }`);
                }
                if (rule.max && typeof rule.max === 'string') {
                    let quotedMax = rule.max.replace(QUOTE_REGEX, ESCAPED_QUOTE);
                    fnStack.push(`if(this['${name}'] > '${quotedMax}') { throw new KiteError(1027, ['${name}', '${quotedMax}']); }`);
                }
                break;
            ////////////////////////////////////////////////////////////////////////////////////////////////                
            // Number check points:
            // 1. parse number if input is a string
            // 2. if values is defined, input should be one of these values
            // 3. if min is defined, input should great than or equal to "min"
            // 4. if max is defined, input should less than or equal to "max"
            ////////////////////////////////////////////////////////////////////////////////////////////////            
            case Number:
                fnStack.push(`let num = Number(inputs['${name}']); if(isNaN(num)) { throw new KiteError(1025, '${name}'); } this['${name}'] = num; `);
                // check values
                if (rule.values) {
                    let valuesname = `_v${argnames.length}`;
                    argnames.push(valuesname);
                    args.push(rule.values);
                    fnStack.push(`if(!${valuesname}.includes(num)) { throw new KiteError(1021, ['${name}', '${rule.values}']); } `);
                } else {
                    if (typeof rule.min === 'number') {
                        fnStack.push(`if(num < ${rule.min}) { throw new KiteError(1026, ['${name}', ${rule.min}]); } `);
                    }
                    if (typeof rule.max === 'number') {
                        fnStack.push(`if(num > ${rule.max}) { throw new KiteError(1027, ['${name}', ${rule.max}]); } `);
                    }
                }
                break;
            ////////////////////////////////////////////////////////////////////////////////////////////////
            // Date check points:
            // 1. create date object by 'new' operator
            // 2. check min limitation if available
            // 3. check max limitation if available
            ////////////////////////////////////////////////////////////////////////////////////////////////            
            case Date:
                fnStack.push(`let date = new Date(inputs['${name}']); if (!date.valueOf()) { throw new KiteError(1031, '${name}'); }`);

                // validate min & max value of date
                if (rule.min) {
                    let minDate = rule.min instanceof Date ? rule.min : new Date(rule.min as any);
                    let argName = '_dateMin' + argnames.length;
                    argnames.push(argName);
                    args.push(minDate);
                    fnStack.push(`if(date < ${argName}) { throw new KiteError(1026, ['${name}', ${argName}.toISOString()]); }`);
                }

                if (rule.max) {
                    let maxDate = rule.max instanceof Date ? rule.max : new Date(rule.max as any);
                    let argName = '_dateMax' + argnames.length;
                    argnames.push(argName);
                    args.push(maxDate);
                    fnStack.push(`if(date < ${argName}) { throw new KiteError(1027, ['${name}', ${argName}.toISOString()]); }`);
                }

                fnStack.push(`this['${name}'] = date;`);
                break;
            ////////////////////////////////////////////////////////////////////////////////////////////////
            // Boolean check points
            // if input is a string, treat '0', '', 'false' as falsy value, else true
            // else use Boolean() to test input vlue
            ////////////////////////////////////////////////////////////////////////////////////////////////                
            case Boolean:
                fnStack.push(`this['${name}'] = typeof inputs['${name}'] === 'string' ? ['0', '', 'false'].indexOf(inputs['${name}'].toLowerCase()) === -1 : Boolean(inputs['${name}']); `);
                break;
            ////////////////////////////////////////////////////////////////////////////////////////////////                
            // Array
            // [ISSUE] https://github.com/Microsoft/TypeScript/issues/7169
            // Since Typescript does not emmit array types to metadata, we don't know array element types here,
            // so we can't parse the raw data to its declared type
            ////////////////////////////////////////////////////////////////////////////////////////////////            
            case Array:

                fnStack.push(`let input = inputs['${name}']; if (!Array.isArray(input)) { input = [input]; }`);

                // not allow empty array
                if (!rule.allowEmpty) {
                    fnStack.push(`else if (!input.length) { throw new KiteError(1033, '${name}'); }`);
                }

                if (rule.arrayType) {
                    let template = rule.arrayType.template.replace(/\s/g, '');
                    fnStack.push(`this['${name}'] = `);
                    parseArray(template);
                } else {
                    fnStack.push(`this['${name}'] = input;`);
                }
                break;
            default:
                // any other types
                let typename = getTypeName(type);
                // If it is a Kite model, create a model object and call _$filter to filter the inputs
                if (isKiteModel(type)) {
                    fnStack.push(`if (cleanModel) {
                        this['${name}'] = Object.create(${typename}.prototype);
                    } else {
                        this['${name}'] = new ${typename}();
                    }
                    this['${name}']._$filter(inputs['${name}']);
                    `);
                } else {
                    // If it is not a Kite model, pass the input value to constructor and create an object
                    fnStack.push(`this['${name}'] =
                        typeof(inputs['${name}'])  === 'object' ?
                        inputs['${name}'] : new ${typename}(inputs['${name}']);`);
                }
        }
        fnStack.push('}');
    }

    // group the properties
    // [ [A, B], [B, A] ] =(union)=> [ A, B, B, A ] =(unique)=> [ A, B ]
    // [ [A, B], [B, C] ] =(union)=> [ A, B, B, C ] =(unique)=> [ A, B, C ]
    // [ [A, B], [C, D], [D, A] ] =(union 1)=> [ [A, B, D, A], [C, D]] =(union 2)=> [ [A, B, D, A, C, D] ] =(unique)=> [ A, B, C, D ]
    // [ [A, B], [C, D] ] =(union)=> [ [A, B], [C, D] ] =(unique)=> [ [A, B], [C, D] ]
    if (groups.length) {
        // union
        for (let i = 0; i < groups.length; i++) {
            for (let j = 0; j < groups.length; j++) {
                // skip current union target
                if (i === j) { continue };
                // walk through every property names in group, if it's exists in union target "groups[i]", merge them
                for (let k = 0; k < groups[j].length; k++) {
                    if (groups[i].includes(groups[j][k])) {
                        groups[i] = groups[i].concat(groups[j]);
                        groups.splice(j, 1);    // remove the merged array
                        break;
                    }
                }
            }
        }

        // unique and check property exists
        groups = groups.map(group => {
            let set = new Set(group);
            let unique = [...set];
            let uniqueProperties = unique.join(', ').replace(QUOTE_REGEX, ESCAPED_QUOTE);
            unique.forEach((prop, idx, arr) => {
                if (!inputs.has(prop)) {
                    throw new Error(`Group property "${prop}" does not exist in model "${target.constructor.name}"`);
                }

                let quoted = prop.replace(QUOTE_REGEX, ESCAPED_QUOTE);
                arr[idx] = `!inputs['${quoted}']`;
            });

            let condition = unique.join(' && ');
            fnStack.unshift(`if(${condition}) { throw new KiteError(1028, '${uniqueProperties}')}`);

            return unique;
        });

    }

    argnames.push('KiteError');
    args.push(KiteError);

    // filter function, first parameter 'inputs' type is Object, commonly set to client inputs (filter target)
    // second parameter 'cleanModel' type is boolean, if it's set to 'true', will create an Kite model (sub-model)
    // by calling 'Object.create()' instead of 'new' operator, that means creates an object without calling it's
    // constructor
    fnStack.unshift(`(function(${argnames}) { return function(inputs, cleanModel) {`);   // start of function
    fnStack.push('return this;} })');  // end of return function{...}
    let fnBody = fnStack.join('\n');

    let fn = vm.runInThisContext(fnBody, { filename: `__${target.constructor.name}._$filter.vm` });
    target._$filter = fn(...args);

    // Remove the metadata, won't use it any more ??
    Reflect.deleteMetadata(MK_KITE_INPUTS, target);
}


/**
 * Check if a class / prototype is a Kite model
 * @param cls target to check
 */
export function isKiteModel(cls: any): boolean {
    return Reflect.hasMetadata(MK_KITE_MODEL, cls);
}

/**
 * Check if a class / prototype has Kite input mappings
 * @param cls target to check
 */
export function hasModelInputs(cls: any): boolean {
    return Reflect.hasMetadata(MK_KITE_INPUTS, cls);
}
