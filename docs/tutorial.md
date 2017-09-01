# Navigation

+ [Installation](#Installation)
+ [Writing APIs](#Writing-APIs)
  + [Typescript environment configuration](#Typescript-environment-configuration)
  + [Making Kite fly](#Making-Kite-fly)
  + [Hello world API](#Hello-world-API)
  + [Accessing client inputs](#Accessing-client-inputs)
  + [Mapping client inputs to certain types](#Mapping-client-inputs-to-certain-types)
  + [Mapping client inputs to Kite model](#Mapping-client-inputs-to-Kite-model)
  + [Mixing inputs mapping](#Mixing-inputs-mapping)
+ [Input filtering](#Input-filtering)
+ [Writing services](#Writing-services)


# Installation<a name="Installation"></a>
Assuming you're working on MacOS or Linux, make a directory from command line 
for your first Kite project:

```sh
mkdir myapp
cd myapp
```

Use `npm` to initialize your application, it'll create a `package.json` file for you.
```sh
npm init
```

Now install Kite framework:
```sh
npm install kite-framework --save
```

# Writing APIs<a name="Writing-APIs"></a>
Before you start writing Kite APIs, you should:
+ Install [NodeJs](https://nodejs.org/), version >= 8.0.0
+ Install [TypeScript](https://www.typescriptlang.org/), verstion >= 2.4
+ Get a TypeScript IDE, [Visual Studio Code](https://code.visualstudio.com/) is recommended here

## Typescript environment configuration<a name="Typescript-environment-configuration"></a>
Now you need configure Visual Studio Code & TypeScript to enable some features 
for your project, create a file `tsconfig.json` under project root, 
and copy this content to it:

```json
{
    "compilerOptions": {
        "moduleResolution": "node",
        "noImplicitAny": true,
        "target": "ES6",
        "lib": ["es2016"],
        "module": "commonjs",
        "sourceMap": true,
        "experimentalDecorators": true,
        "emitDecoratorMetadata": true,
        "declaration": false,
        "rootDir": "src",
        "outDir": "dist",
        "types": [
            "node"
        ],
        "typeRoots": ["node_modules/@types"]
    },
    "exclude": [
        "node_modules",
        "dist"
    ]
}
```

## Making Kite fly<a name="Making-Kite-fly"></a>
A Kite application project structure is generally like:
```
project_home/
├── src
│   ├── app.server.ts
│   └── controllers
│       ├── greeting.ts
│       └── user
│           └── echo.ts
├── dist
│   ├── app.server.js
│   └── controllers
│       ├── greeting.js
│       └── user
│           └── echo.js
└── node_modules
```
The source code is placed at "/src" folder, and is compiled to "/dist",
"app.server.js" is the entry of application. 
Create a file under "/src" and name it `app.server.ts`, then copy and paste the 
following code to it:

```typescript
import { Kite } from 'kite-framework';

new Kite().fly();
```

now compile the source and run the application:

```sh
tsc
node dist/app.server.js
```

if everthing goes correctly you should get these message:

```
2017-8-23 23:26:01 [ KITE  ] Kite framework ver 0.2.4
2017-8-23 23:26:01 [ KITE  ] Working at directory /Users/***/projects/myapp/dist
2017-8-23 23:26:01 [ KITE  ] Loading configuration from object
2017-8-23 23:26:01 [ KITE  ] Creating server
2017-8-23 23:26:01 [ KITE  ] Ready to fly
2017-8-23 23:26:01 [ KITE  ] Flying! server listening at 127.0.0.1:4000
2017-8-23 23:26:01 [ INFO  ] Watching for file changes
```

Now open your browser and visit "http://localhost:4000/", you'll get an error message:

```json
{
    "error": {
        "code": 1100,
        "msg": "Invalid request URL: failed to locate resource \"/\""
    }
}
```

## Hello world API <a name="Hello-world-API"></a>

APIs is also called controllers in Kite, each controller is placed into a single file, this is quite important:
+ Kite only picks one "controller" from imported modules, if more than one Kite
  controller is defined in a single file, only the first one is used, others are ignored
+ "one file one API" help you to keep projects be super simple and clean

Our first API `/greeting` is placed in `src/greeting.ts` like these:

```typescript
import { Controller, Entry } from 'kite-framework';

@Controller()
export class GreetingController {
    @Entry()
    async exec() {
        return { message: 'Hello world!' };
    }
}
```

As you can see from the above, it's quite different from JS, "@Controller()" & "@Entry()"
are called "[decorators](https://www.typescriptlang.org/docs/handbook/decorators.html)",
this is a feature of ES7 and implemented by TypeScript (experimentally), Kite is using 
decorators everywhere, it'll be explained in other documents, for now we just keep this
guide simple.

Press `Ctrl + C` to kill the previous Kite application if it's still running, 
then compile and run it again:

```sh
tsc
node dist/app.server.js
```

Now open your browser and visit "http://localhost:4000/greeting", you'll get this message from Kite:

```json
{
    "message": "Hello world!"
}
```

## Accessing client inputs <a name="Accessing-client-inputs"></a>

Client inputs data (query string, post data) can be easily accessed in Kite, there are
many ways to access them, the most simple way is announcing each parameter in argument
list of controllers entry point. Example '/user/echo' demonstrated this:

```typescript
import { Controller, Entry } from 'kite-framework';

@Controller()
export class EchoController {
    @Entry()
    async exec(name: string) {
        return { message: `Good day, ${name}!` };
    }
}
```

Now open your browser and visit "http://localhost:4000/user/echo?name=Kite", you'll get this message:

```json
{
    "message": "Good day, Kite!"
}
```

Try changing value of "name" in query string, you'll get different response.
If "name" is omitted from query string you'll get this error response:

```json
{
    "error": {
        "code": 1020,
        "msg": "Parameter error: \"name\" is required"
    }
}
```

Yes, Kite checks "name" input field for you, a set of parameter checking methods is
built in to help you to validate client inputs, this will introduce in another section.

## Mapping client inputs to certain types <a name="Mapping-client-inputs-to-certain-types"></a>

TypeScript is a statically typed language, if parameters defined a type (not `any`) Kite will 
try to map original type - `String` in query string and url-encoded form - to declared types.
Example API "/types":

```typescript
import { Controller, Entry } from 'kite-framework';

@Controller()
export class TypesController {
    @Entry()
    async exec(str: string, num: number, bool: boolean, date: Date) {
        console.log('typeof "str" is', typeof str);
        console.log('typeof "num" is', typeof num);
        console.log('typeof "bool" is', typeof bool);
        console.log('typeof "date" is', typeof date, ', "date" is instance of "Date":', date instanceof Date);

        return { values: { str, num, bool, date } };
    }
}
```

when request url is "http://localhost:4000/types?str=this%20is%20string&num=12345&bool=true&date=2017-08-22", 
response from server is like:
```json
{
    "values": {
        "str": "this is string",
        "num": 12345,
        "bool": true,
        "date": "2017-08-22T00:00:00.000Z"
    }
}
```

from server output log, you should get:

```
typeof "str" is string
typeof "num" is number
typeof "bool" is boolean
typeof "date" is object , "date" is instance of "Date": true
```

Kite maps original type "String" to declared type automatically. Although javascript
is untyped but this mapping is still useful for input filter (checking) and object 
creation, you don't have to check and create objects of certain types in controllers.

## Mapping client inputs to Kite model <a name="Mapping-client-inputs to-Kite-model"></a>

When APIs are design to process the input data that with lots of fields, 
writing them in argument list becomes unfriendly, you can do in that way though, 
but make your programme hard to read.

And alternative way is to declare a Kite model class, now let's create a folder
named `models` under project root directory, then create a model file `user.model.ts`
below.

```typescript
import { Model, In } from 'kite-framework';

@Model()
export class UserModel {
    _id: number;

    @In({
        required: true
    })
    name: string;

    @In({
        required: true
    })
    password: string;

    @In()
    email: string;

    createdTime: Date;
}
```

Every Kite model must annonced with "@Model()", inside the model, properties
with '@In()' decorator tells Kite this is an input field, rules can be defined
in this decorator, as the above code shows:

```javascript
{
    required: true
}
```

The above rule is applied to both "name" and "password", means these two
fields are "required" and can not be emitted from request query string / post body.

"email" property annonced as input without filter rule, Kite will fetch this
field for you if it's exists in raw input data.

Properties without "@In()" are ignored from mapping.

"/user/create" API like this:

```typescript
import { UserModel } from './../../model/user.model';
import { Controller, Entry } from 'kite-framework';

/**
 * Create a user with model mapping
 */
@Controller()
export class UserGreateController {
    @Entry()
    async exec(user: UserModel) {
        // save user to database
        return { user };
    }
}
```

Open your browser and visit 
"http://localhost:4000/user/create?name=Kite&password=APassword"
you'll get this response:

```json
{
    "user": {
        "name": "Kite",
        "password": "APassword"
    }
}
```

Properties with "@In()" are successfully set values except "email", because
"email" is an optional input, the above URL does not contain "email" in query 
string.

Try these request to see response:
- "http://localhost:4000/user/create?name=Kite&password=APassword&email=x@y.com"
- "http://localhost:4000/user/create?name=Kite&password=APassword&_id=1231"

## Mixing inputs mapping <a name="Mixing-inputs-mapping"></a>

Mixing declare basic types and Kite model in controller enty point is allowed.

The above example demonstrates how to "create a user", property "_id" is designed
to be a key and generated by database, so "_id" is excluded from inputs. 
But "update" API is required "_id" to be inputted, in this case you can write 
"/user/update" in this way:

```typescript
import { UserModel } from './../../model/user.model';
import { Controller, Entry } from 'kite-framework';

/**
 * Create a user with model mapping
 */
@Controller()
export class UserGreateController {
    @Entry()
    async exec(_id: number, user: UserModel) {
        // todo: get data from db
        // todo: update user to database
        console.log("_id = ", _id);
        console.log("user = ", user);
        user._id = _id;
        return { user };
    }
}
```

Mixed declaration `_id: number, user: UserModel` force Kite to treat "_id" as a required
input field, and other input fields will be mapped to "UserModel".

Let's take a look at response "http://localhost:4000/user/update?name=Kite&password=APassword&email=x@y.com&_id=1":

```json
{
    "user": {
        "name": "Kite",
        "password": "APassword",
        "email": "x@y.com",
        "_id": 1
    }
}
```

console logs at server side:
```
_id =  1
user =  UserModel { name: 'Kite', password: 'APassword', email: 'x@y.com' }
```

From console logs we can see "_id" from query string was mapped to parameter "_id", 
and other fields were mapped to `UserModel`.

# Input filtering <a name="Input-filtering"></a>

Client input filter is a very important feature provided by Kite.
Unlike other frameworks, Kite provides built-in filters, by writing 
filter rules for input fields you can easily get things done.

Previous section mentioned a basic filter which tells Kite to check a "required" field:

```typescript
@In({
    required: true
})
```

Assuming API "/user/check\_and\_create" needs to check "name", "password" and "email", let's create a Kite model "user.model.rules.ts" under folder "/models":

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

means of each rule:

+ __rule for `name`__ - it's a required field; minimal length limited to 3; 
    maximal length limited to 60;
+ __rule for `password`__ it's a required field; minimal length limited to 6;
+ __rule for `email`__ it's an optional field; if it's set by client, check it by given pattern 
    (a basic email regex)
+ __rule for `dateOfBirth`__ no rule is applied to this field, treated as an optional field;

controller for API "/user/check_and_create" is like this:

```typescript
import { UserModel } from './../../models/user.model.rules';
import { Controller, Entry } from 'kite-framework';

/**
 * Create a user with model mapping
 */
@Controller()
export class UserGreateController {
    @Entry()
    async exec(user: UserModel) {
        // save user to database
        return { user };
    }
}
```

try these requests to see responses if you're running Kite examples:
+ http://localhost:4000/user/check_and_create?name=Ben&password=123456
+ http://localhost:4000/user/check_and_create?name=Ben&password=123456&email=abc.com
+ http://localhost:4000/user/check_and_create?name=Ben&password=12
+ http://localhost:4000/user/check_and_create?name=Ben&password=123456&dateOfBirth=1988-01-01

Another way to apply rules to input fields it writing them in controller entry
point, API "/user/favor":

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

try these requests to see responses if you're running Kite examples:
+ http://localhost:4000/user/favor?name=Ben&language=Javascript
+ http://localhost:4000/user/favor?name=Ben&language=C

For more details about filter rules, [please click here](./filter.rules.md)


# Writing services <a name="Writing-services"></a>

Kite services are the shared modules that provide common functions - database accessing,
data sharing etc. - for controllers.

Kite services are annonced with "@Injectable()". Kite creates only single instance for each
service and share them, therefore different controllers are able to use the same service instance.

Let's create a folder named "services" under "/src", and create our first Kite service 
"counter.service.ts":

```typescript
import { Injectable } from 'kite-framework';

@Injectable()
export class CounterService {
    private _counter = 0;

    inc() {
        this._counter++;
    }

    get counter(): number {
        return this._counter;
    }
}
```

For using Kite servcies, controllers needs to inject them by annoncing properties with "@Inject()".

For the above "CounterService", we write two controllers to test this service, 
one is "/counter/inc" for increasing the counter:

```typescript
/**
 * /src/counter/inc.ts
 */
import { CounterService } from './../../services/counter.services';
import { Controller, Entry, Inject } from 'kite-framework';

/**
 * increase counter value
 */
@Controller()
export class CounterIncController {
    // inject counter service
    @Inject() counterService: CounterService;

    @Entry()
    async exec() {
        this.counterService.inc();
        return { success: true };
    }
}
```

another is "/counter/show" for showing the counter value:

```typescript
/**
 * /src/counter/show.ts
 */
import { CounterService } from './../../services/counter.services';
import { Controller, Entry, Inject } from 'kite-framework';

/**
 * show counter value
 */
@Controller()
export class CounterShowController {
    // inject counter service
    @Inject() counterService: CounterService;

    @Entry()
    async exec() {
        return { counter: this.counterService.counter };
    }
}
```

Firstly, we request "http://localhost:4000/counter/inc" to update the counter, you'll get:

```json
{
    "success": true
}
```

then we request "http://localhost:4000/counter/show" to get the counter value, you'll get 
response like this:

```json
{
    "counter": 1
}
```

# TO BE CONTINUED
