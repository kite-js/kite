import 'reflect-metadata';
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
export declare function Model(): (constructor: Function) => void;
/**
 * Client inputs parameters filter rules
 */
export declare type FilterRule = {
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
    min?: number;
    /**
     * Tell Kite to check string's length or number,
     * different behavior will be took in filter:
     * - model property type is "String": define the maximal length of input string
     * - model property type is "Number": define the maximal value of input number
     * - others: ignored
     */
    max?: number;
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
    /**
     * accept empty string, default is `false`, this field is only works when `required` is set to `true`
     *
     * `true` - allow empty string as input value
     * `false` - disallow empty string as input value
     *
     * By default, Kite filters out a string if it's empty; therefore "String" type input fields in
     * Kite models are always set by a nonempty string.
     *
     * In most cases, people do not want "required" fields are set by empty strings, just like
     * HTML <input> tag, if attribute "required" is set but nothing inputed, browser will warn you.
     *
     * But sometimes people do, for example empty string is frequently used in database design,
     * empty fields do mean something in some cases, so set this field to `true` if you want
     * Kite accept empty strings.
     *
     */
    empty?: boolean;
};
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
