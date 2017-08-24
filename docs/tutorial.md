# Installation
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
npm i -s kite-framework
```

# Write APIs
Before you start writing Kite APIs, you should:
+ Install [NodeJs](https://nodejs.org/), version >= 8.0.0
+ Install [TypeScript](https://www.typescriptlang.org/), verstion >= 2.4
+ Get a TypeScript IDE, [Visual Studio Code](https://code.visualstudio.com/) is recommended here

## Typescript environment configuration
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
        "rootDir": "./src/",
        "outDir": "./dist/",
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

## Make Kite fly
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

## Hello world API
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

## Get client inputs
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

# TO BE CONTINUED