import { ArrayType } from './model';
import 'reflect-metadata';
import { Class } from '../types/class';
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
 * NOTE: This expression is invalid in typescript because of type checking,
 * but, it does work in Kite at run time, no parameter is passed to constructor.
 */
export declare function Model(globalRule?: FilterRule): <T extends Class>(constructor: T) => void;
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
     * different behavior will be took in filter:
     * - model property type is "String": define the minimal value of a string,
     *  strings are compared based on standard lexicographical ordering, using Unicode values. example:
     *  - 'a' - if input string < 'a' an error will be thrown
     *  - '2017-09-01' - if input string < '2017-09-01' an error will be thrown
     * - model property type is "Number": define the minimal value of input number
     * - others: ignored
     */
    min?: number | string | Date;
    /**
     * different behavior will be took in filter:
     * - model property type is "String": define the maximal value of a string
     * strings are compared based on standard lexicographical ordering, using Unicode values. example:
     *  - 'z' - if input string > 'z' an error will be thrown
     *  - '2017-09-30' - if input string > '2017-09-30' an error will be thrown
     * - model property type is "Number": define the maximal value of input number
     * - others: ignored
     */
    max?: number | string | Date;
    /**
     * defind the minimal length of a string, affects only on string types
     */
    minLen?: number;
    /**
     * defind the maximal length of a string, affects only on string types
     */
    maxLen?: number;
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
export declare function In(rules?: FilterRule): (target: Object, property: string) => void;
/**
 * Check if a class / prototype is a Kite model
 * @param cls target to check
 */
export declare function isKiteModel(cls: any): boolean;
/**
 * Check if a class / prototype has Kite input mappings
 * @param cls target to check
 */
export declare function hasModelInputs(cls: any): boolean;
