# Installation
Kite requires [Node.js ver 8.0+](https://nodejs.org/) and [TypeScript](https://www.typescriptlang.org/) to work, please make sure you've these pacakges installed.

Assuming you're working on MacOS or Linux bash system, make a directory for your 
first Kite project:

```sh
mkdir myapp
cd myapp
```

Use npm to initialize your application, it'll create a `package.json` file for you.
```sh
npm init
```

Now install Kite framework:
```sh
npm i -s kite-framework
```

# Write APIs
APIs is also called controllers in Kite, each controller is placed into a single file, this is quite important:
+ Kite only picks one "controller" from imported modules, if more than one Kite
  controller is defined in a file, only the first one is used, others are ignored
+ help you to keep projects be super simple and clean

These thining should be done before you write APIs:
+ Install [NodeJs](https://nodejs.org/), version >= 8.0.0
+ Install [TypeScript](https://www.typescriptlang.org/), verstion >= 2.4
+ Get a TypeScript IDE, [Visual Studio Code](https://code.visualstudio.com/) is recommended here

## Kite application project structure
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
The source code is placed at "src" folder, and is compiled to "dist",
"app.server.js" is the entry of application, to create a Kite application, 
you should firstly write this entry application, it's quite simple:
```typescript
import { Kite } from 'kite-framework';

new Kite().fly();
```
Kite maps client request to root folder "controllers" - which is a relative 
directory to application entry "app.server.js". For example:
 + "http://localhost:4000/greeting" - "/greeting" - is mapped to "dist/controllers/greeting.js"
 + "http://localhost:4000/user/echo" - "/user/echo" - is mapped to "dist/controllers/user/echo.js"

This is a default mapping mechanism in Kite, simply map URLs to some javascript files.

A short URL like "/greeting" and "user/echo" will be introduced below; therefore, you
should know what it means for URL and what it means for source.

## Hello world API
Our first API "greeting.ts" like this:

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

Then compile the source and run it:

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

## Get client inputs
Client inputs data (query string, post data) can be easily accessed in Kite, there are
many ways to access them, the most simple way is announcing each parameter in argument
list of controllers entry point. Example '/user/echo' demonstrated this:

```typescript
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

### Map client inputs to certain types
TypeScript is a statically typed language, if parameters defined a type (not `any`) Kite will try to map original type - `String` in query string and url-encoded form - to declared types.
Example "/types":
```typescript
@Controller()
export class TypesController {
    @Entry()
    async exec(str: string, num: number, bool: boolean, date: Date) {
        return { values: { str, num, bool, date } };
    }
}
```
