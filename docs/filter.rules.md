# Input filtering

Client input filter is a very important feature provided by Kite.
Unlike other frameworks, Kite provides built-in filters, by writing 
filter rules for input fields you can easily get things done.

## Rules annotation

Input filters can be annotated in Kite model or controller entry.

For Kite model, filter rules are placed in an "@In()" decorator:

```typescript

import { Model, In } from 'kite-framework';

@Model()
export class UserModel {
    _id: number;

    @In({
        required: true,
        min: 3,
        max: 60
    })
    name: string;

    @In({
        required: true,
        min: 6
    })
    password: string;

    @In({
        pattern: /^[a-z\d_\.\-]+@[a-z\d_\.\-]+\.[a-z]{2,}$/i
    })
    email: string;

    @In()
    dateOfBirth: Date;

    createdTime: Date;
}
```

For controller entry point function, filter rules are placed in `@Entry()` decorator:

```typescript
import { Controller, Entry } from 'kite-framework';

/**
 * Create a user with model mapping
 */
@Controller()
export class UserFavorController {
    @Entry({
        // define rule for "name" parameter
        name: {
            min: 3
        },

        // define name for "language" parameter
        language: {
            values: ['Java', 'Javascript', 'PHP', 'GO', 'Python']
        }
    })
    async exec(name: string, language: string) {
        let msg = `${name}'s favor programming language is ${language}`;
        return { msg };
    }
}
```

## Available rules

Currently Kite provides these rules:

+ __required__ ( boolean ) - indicates a input field is required or not, default is `false`
    + `true` - the field is required, if it's omitted from input, Kite will throw an error
    + `fasle` - the field is optional, on error will be thrown even if it's omitted

+ __values__ ( array ) - available values for this input field, default is `undefined` -
    no value checking for this filed. If an array is given, Kite will check input 
    value by searching given array, for example:
    ```typescript
    @In({
        values: ['Java', 'Javascript', 'PHP', 'GO', 'Python']
    })
    language: string;
    ```
    means input parameter "language" should be one of _'Java', 'Javascript', 'PHP', 'GO', 'Python'_. If only one value is given to this array, the input field is limmited to 
    this value.

+ __min__ ( number ) - different behavior will be took in filter:
     - model property type is "String": define the minimal length of input string:
        ```typescript
        @In({
            min: 6
        })
        password: string;   // Minimal length of password is limited to 6
        ```
     - model property type is "Number": define the minimal value of input number
        ```typescript
        @In({
            min: 15
        })
        age: number;   // Minimal value of age is limited to 15
        ```
     - others: ignored

+ __max__ ( number ) - different behavior will be took in filter:
     - model property type is "String": define the maximal length of input string
     - model property type is "Number": define the maximal value of input number
     - others: ignored

+ __len__ ( number ) - limit input string with special length, example:
    ```typescript
    @In({
        len: 2
    })
    state: string;  // state length is restricted to 2
    ```

+ __pattern__ ( RegExp ) - test input string with special pattern, example:
    ```typescript
    @In({
        pattern: /^[a-z\d_\.\-]+@[a-z\d_\.\-]+\.[a-z]{2,}$/i
    })
    email: string;  // check email with the pattern
    ```

+ __filter__ ( function ) - filter input value with given function, return value is 
    used as new value for this field, example: 
    ```typescript
    @In({
        filter: function(state: string) {
            return state ? state.toUpperCase() : '';
        }
    })
    state: string;  // conver input state to upper case
    ```

+ __group__ ( array ) - group property checking, tells Kite this field is connected
    with other fields, at least one of grouped fields is required at input.
    The following example means: either "phone" or "email" is required, 
    if both "phone" and "email" are emitted an error will be thrown:
     ```typescript
    @Model()
    class ExampleParam {
        @In({
            group: 'email'  // "phone" will group with "email"
        })
        phone: string;
    
        @In()
        email: string;
    }
    ```

+ __empty__ ( boolean ) - accept empty string, default is `false`, this field is only works when 
     `required` is set to `true`.
     - `true` - allow empty string as input value
     - `false` - disallow empty string as input value

    By default, Kite filters out strings if they are empty; therefore controllers always 
    receives nonempty strings from "String" typed parameters.
    In most cases, people do not want "required" fields are set by empty strings, just like 
    HTML `<input>` tag, if attribute "required" is set but nothing inputed, browser will warn you.
    But sometimes people do, for example empty string is frequently used in database design, 
    empty fields do mean something in some cases, so set this field to `true` if you want
    Kite accept empty strings.

