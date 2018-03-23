# KiteJS framework
Next generation, fast, efficient, flexible web API framework.

Please visit [Kite Tutorial](./docs/tutorial.md) for more examples.

We also provided [Kite CLI tools](https://github.com/kite-js/kite-tools):

```sh
npm install -g kite-tools
```

If you're using Linux and MacOS systems, you suppose to run 

```sh
sudo npm install -g kite-tools
```

With "kite-tools" you can easily create Kite projects and write APIs. 
The following examples are demostrated with "kite-tools", if you wonder 
more about creating Kite projects with bare hands, please see 
[Kite project step by step](./docs/kite-project-step-by-step.md).

# Installation
Before you start, please make sure you have:
+ [NodeJs](https://nodejs.org/), version >= 8.0.0
+ [TypeScript](https://www.typescriptlang.org/), verstion >= 2.4
+ TypeScript IDE, [Visual Studio Code](https://code.visualstudio.com/) is recommended here

Once you've installed Kite CLI tools, type this command in terminal 
to create a Kite project:

```sh
kite -p --yes first-kite-app
```

Explanation for the upper command:
+ __kite__ : Kite CLI tools command name
+ __-p__ option : create and initialize a Kite project
+ __--yes__ option : create without questioning, use default configuration
+ __first-kite-app__ option: application name, here we use "first-kite-app"

Then Kite CLI tools will create a folder `first-kite-app`, initialize the project folder with some files and directories, install NodeJS dependencies as well.

# Making Kite fly

If the above steps finished without error (generally network problems),
now you can enter the project folder, and start Kite application server:

```sh
cd first-kite-app
npm start
```

After a few seconds waiting for TypeScript compilation / NodeJS running, you'll see a message like:

```
2018-3-23 10:13:24 [ KITE  ] Flying! server listening at 127.0.0.1:4000
```

which means Kite application server is successfully started, then open
a browser window and visit [127.0.0.1:4000](http://127.0.0.1:4000) (or [localhost:4000](http://localhost:4000)), you
will get a message like:

```json
{"error":{"code":1002,"msg":"Resource not found"}}
```

don't worry about this error message, it's just means the request 
resource `/` was not found on server, your application just works great.

# First API

Using `kite-tools`, you can easily create Kite APIs. Open a new terminal
(keep previous terminal running, which servicing your application), 
under project folder type this command:

```sh
kite -a greet
```

Kite CLI tools will generate a file named `greet.controller.ts` under
`src/controllers/` folder, it looks like this:

```typescript
import { Controller, Entry, KiteError, Inject } from 'kite-framework';

@Controller()
export class GreetController {
    @Entry()
    async exec() {
        throw new KiteError(1000, 'this api is not implemented');
    }
}
```

then run command `tsc` to compile this TypeScript source:

```sh
tsc
```

Now you can try this API by visiting [http://localhost:4000/greet](http://localhost:4000/greet), here is the response:

```json
{"error":{"code":1000,"msg":"this api is not implemented"}}
```

## Hello world! (plain text output)

Simply returns a string from APIs will cause the framework outputs content in `text/plain` type. API source `greet.controller.ts` example:

```typescript
import { Controller, Entry, KiteError, Inject } from 'kite-framework';

@Controller()
export class GreetController {
    @Entry()
    async exec() {
        return "hello world!";
    }
}
```

Save and run `tsc` to compile ( __boring with typing `tsc` everytime?__ open a new terminal and try `tsc -w`, see [TypeScript compiler watch mode](http://www.typescriptlang.org/docs/handbook/compiler-options.html) ).

Now refresh the page([http://localhost:4000/greet](http://localhost:4000/greet)), response:

```text
hello world!
```

## Hello world! (json output)

KiteJS is a framework focusing on web APIs, an API is generally output a
JSON formatted string, and in JavaScript/NodeJs, why not JSON?

Returns an object from APIs will cause the framework outputs content in
`application/json` type. API source `greet.controller.ts` example:

```typescript
import { Controller, Entry, KiteError, Inject } from 'kite-framework';

@Controller()
export class GreetController {
    @Entry()
    async exec() {
        return { msg: "hello world!" };
    }
}
```

Compile the source (if not running `tsc -w`) and refresh the page, response like:

```json
{"msg":"hello world!"}
```

## Accepting client parameters

Declared arguments in Kite entry point function (`exec()` as of yet) is
mapped to client parameters by KiteJS framework at controller loading time.

Here is an example (create a new controller `welcome.controller.ts` by kite-tools `kite -a welcome`):

```typescript
import { Controller, Entry, KiteError, Inject } from 'kite-framework';

@Controller()
export class WelcomeController {
    @Entry()
    async exec(name: string) {
        return { msg: `Hello, ${name}!` };
    }
}
```

Compile the source (if not running `tsc -w`), and visit
[http://localhost:4000/welcome?name=Kite](http://localhost:4000/welcome?name=Kite), response like:

```json
{"msg":"Hello, Kite!"}
```

__Note__

Variable type declaration is strongly recommended in KiteJS, this improves coding efficiency, and also saves the time of dynamical loading stage of
the framework. If you ommitted type declaration from parameter, it'll be treated as "string" defaultly.

# Why KiteJS? What's the differences between ExpressJS / KoaJS
KiteJS is designed for easier / faster writing web APIs that using new ECMA features,  like decorator, `async`, `await`, reflection etc. 
It's writen from TypeScript, and TypeScript is suggested for writing Kite APIs.

With TypeScript, Kite implemented another important feature - schema checking - yes, the missing MogonDB schema is here! See ...

With TypeScript, something is awsome in KiteJS:
* input data type conversion - Kite automatically convert input data
  from `string` (or any other types) to declared types
* input data mapping - Kite can easily map input data to custom objects or contoller arguments
* input data validation - by defining some rules, Kite checks the input data for you
* modularization APIs - one API one file, easy group working, easy code maintainance
