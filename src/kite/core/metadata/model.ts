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

import { KiteError } from '../error';
import 'reflect-metadata';
import * as vm from 'vm';

const MK_KITE_MODEL = 'kite:model'
const MK_KITE_INPUTS = 'kite:inputs';

// tslint:disable-next-line:quotemark
const SINGLE_QUOTE = "\\'";

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
 * When a Kite model is used to map client inputs, Kite will create an object with "new" operator 
 * `new User()` when client request comes in, without any constructor parameter, so if a Kite mode is 
 * coded like following, it'll not work as expected:
 * ```typescript
 * @Model
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
 * NOTE: This expression is invalid in typescript because of type checking,
 * but, it does work in Kite at run time, no parameter is passed to constructor.
 */
export function Model() {
    return function (constructor: Function) {
        Reflect.defineMetadata(MK_KITE_MODEL, true, constructor);
        createFilterFn(constructor.prototype);
    }
}


/**
 * Client inputs parameters filter rules
 */
export type FilterRule = {
    /**
     * Set to "true" to mark parameter as required, 
     * "false" or not set marks as optional
     */
    required?: boolean;

    /**
     * Value list, input parameter should be one of these values
     */
    values?: string[] | number[];


    /**
     * Different behavior will be took in filter:
     * - model property type is "String": define the minimal length of input string
     * - model property type is "Number": define the minimal value of input number
     * - others: ignored
     */
    min?: number

    /**
     * Tell Kite to check string's length or number,
     * different behavior will be took in filter:
     * - model property type is "String": define the maximal length of input string
     * - model property type is "Number": define the maximal value of input number
     * - others: ignored
     */
    max?: number

    /**
     * Tell Kite to check string length, the length of string is limited to this value
     */
    len?: number;

    /**
     * Tell Kite to check input string matches the pattern or not, only affected on "String" properties
     */
    pattern?: RegExp;

    /**
     * Tell Kite to check input value with this custom filter function
     */
    filter?: (input: any) => any;

    /**
     * Group property check,
     * at least one of "grouped" properties is required, an error will thrown if none of them is appeared in the inputs.
     * 
     * @example 
     * 
     * The following example tells Kite to check "phone" or "email"
     * ```typescript
     * class ExampleParam {
     *      @In({
     *          group: 'email'  // "phone" will group with "email"
     *      }) phone: string;
     *  
     *      @In() email: string;
     * }
     * ```
     */
    group?: string | string[];
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
 *          min: 3
 *      }) name: string;
 *
 *      @In({
 *          required: true,
 *          min: 6
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
function createFilterFn(target: KiteModel): void {
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

    let quoteRegx = /'/g;
    let groups: string[][] = [];

    // Loop every @In decorated properties and create filter code
    for (let [property, rule] of inputs) {
        // in case of someone named a property with sigle quotation like "it's me" cause runtime errors, following will escape it
        let name = property.replace(quoteRegx, SINGLE_QUOTE);

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

        // is required paramter
        if (rule.required) {
            fnStack.push(
                `if(inputs['${name}'] === undefined || inputs['${name}'] === null) { throw new KiteError(1020, '${name}'); } else `);
        } else {
            fnStack.push(`if(inputs['${name}'])`);
        }

        // custom filters
        if (rule.filter) {
            // let n = $customFilters.length;
            // $customFilters.push(rule.filter);
            let filtername = `_f${argnames.length}`;
            argnames.push(filtername);
            args.push(rule.filter);
            fnStack.push(`{ this['${name}'] = ${filtername}(inputs['${name}']);}`);
            continue;
        }

        let type = Reflect.getMetadata('design:type', target, property);

        // force default type to string
        if (!type) {
            type = String;
        }

        // String check points: 
        // if defined values array, input value should in the values list
        // if defined pattern, check pattern match 
        // if defined min, max, check for length
        if (type.prototype === String.prototype) {   // String
            fnStack.push(`{ this['${name}'] = String(inputs['${name}']);`);
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
                // check for string length
                if (rule.min) {
                    fnStack.push(`if(this['${name}'].length < ${rule.min}) { throw new KiteError(1023, ['${name}',${rule.min}]); }`);
                }
                if (rule.max) {
                    fnStack.push(`if(this['${name}'].length > ${rule.max}) { throw new KiteError(1024, ['${name}',${rule.max}]); }`);
                }
            }

            fnStack.push('}');
        } else if (type.prototype === Number.prototype) {
            // Number check points:
            // 1. parse number if input is a string
            // 2. if values is defined, input should be one of these values
            // 3. if min is defined, input should great than or equal to "min"
            // 4. if max is defined, input should less than or equal to "max"
            fnStack.push(
                `{
        let num = Number(inputs['${name}']);
        if(isNaN(num)) {
            throw new KiteError(1025, '${name}');
        }
        this['${name}'] = num;
        `);
            // check values
            if (rule.values) {
                let valuesname = `_v${argnames.length}`;
                argnames.push(valuesname);
                args.push(rule.values);
                fnStack.push(`if(!${valuesname}.includes(num)) { throw new KiteError(1021, ['${name}', '${rule.values}']); } `);
            } else {
                if (rule.min !== undefined) {
                    fnStack.push(`if(num < ${rule.min}) { throw new KiteError(1026, ['${name}', ${rule.min}]); } `);
                }
                if (rule.max !== undefined) {
                    fnStack.push(`if(num > ${rule.max}) { throw new KiteError(1027, ['${name}', ${rule.max}]); } `);
                }
            }
            fnStack.push('}');
        } else if (type.prototype === Boolean.prototype) {
            // Boolean
            fnStack.push(`this['${name}'] = typeof inputs['${name}'] === 'string' ?
                ['0', '', 'false'].indexOf(inputs['${name}'].toLowerCase()) === -1 :
                Boolean(inputs['${name}']); `);
        } else if (type.prototype === Array.prototype) {
            // Array
            // [ISSUE] https://github.com/Microsoft/TypeScript/issues/7169
            // Since Typescript does not emmit array types to metadata, we don't know array element types here,
            // so we can't parse the raw data to it's declared type
            // TODO: add "type" to rule
            fnStack.push(`this['${name}'] = inputs['${name}'];`);
        } else {
            // if type is already in args, use the existing one, else create a new arg
            let idx = args.indexOf(type);
            let typename;
            if (idx === -1) {
                typename = '_' + type.name;
                // if another type has the same name, but type prototype is different, give a new name
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

            // If it's a Kite model, create a model object and call _$filter to filter the inputs
            if (Reflect.getMetadata(MK_KITE_MODEL, type)) {
                fnStack.push(`{this['${name}'] = new ${typename}(); this['${name}']._$filter(inputs['${name}']);}`);
            } else {
                // If it's not a Kite model, pass the input value to constructor and create an object
                fnStack.push(`{ this['${name}'] = new ${typename}(typeof inputs === 'object' ? inputs['${name}'] : inputs); }`);
            }
        }

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
            let uniqueProperties = unique.join(', ').replace(quoteRegx, SINGLE_QUOTE);
            unique.forEach((prop, idx, arr) => {
                if (!inputs.has(prop)) {
                    throw new Error(`Group property "${prop}" does not exist in model "${target.constructor.name}"`);
                }

                let quoted = prop.replace(quoteRegx, SINGLE_QUOTE);
                arr[idx] = `!inputs['${quoted}']`;
            });

            let condition = unique.join(' && ');
            fnStack.unshift(`if(${condition}) { throw new KiteError(1028, '${uniqueProperties}')}`);

            return unique;
        });

    }

    argnames.push('KiteError');
    args.push(KiteError);

    fnStack.unshift(`(function(${argnames}) { return function(inputs) {`);   // start of function
    fnStack.push('return this;} })');  // end of return function{...}
    let fnBody = fnStack.join('\n');
    fnStack.length = 0;

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
