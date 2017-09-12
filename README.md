# Kite framework
Next generation, fast, flexible HTTP-JSON-RPC framework

Please visit [Kite Tutorial](https://github.com/kite-js/kite/blob/master/docs/tutorial.md) for more examples.

For quickly starts a Kite application, please use [Kite tools](https://github.com/kite-js/kite-tools):

```sh
npm install -g kite-tools
```

PS: if you're using Linux and MacOS systems, you suppose to run `sudo npm install -g kite-tools`

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

Now use Kite CLI to initialize application environment:
```sh
kite init
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
        "target": "ESNext",
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

## Make Kite fly
A Kite application project structure is generally like:
```
project_home/
├── src
│   ├── app.server.ts
│   └── controllers
│       ├── greeting.controller.ts
│       └── user
│           └── echo.controller.ts
├── dist
│   ├── app.server.js
│   └── controllers
│       ├── greeting.controller.js
│       └── user
│           └── echo.controller.js
└── node_modules
```
The source code is placed at "/src" folder, and is compiled to "/dist",
"app.server.js" is the entry of application. 
Create a file under "/src" and name it `app.server.ts`, then copy and paste the 
following code to it:

```typescript
import { Kite } from 'kite-framework';

Kite.init().fly();
```

now compile the source and run the application:

```sh
tsc
node dist/app.server.js
```

if everthing goes correctly you should get these message:

```
2017-8-23 23:26:01 [ KITE  ] Kite framework ver 0.2.4
2017-8-23 23:26:01 [ KITE  ] Working at directory /***/projects/myapp/dist
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
        "code": 1002,
        "msg": "Resource not found"
    }
}
```

## Hello world API
APIs is also called controllers in Kite, each controller is placed into a single file, this is quite important:
+ Kite only picks one "controller" from imported modules, if more than one Kite
  controller is defined in a single file, only the first one is used, others are ignored
+ "one file one API" help you to keep projects be super simple and clean

Our first API `/greeting` is placed in `src/controllers/greeting.controller.ts` like these:

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

Press `Ctrl + C` to kill the previous Kite application if it's still running, 
then compile and run it again:

```sh
tsc
node dist/app.server.js
```

Now open your browser and visit "http://localhost:4000/greeting", 
you'll get the greeting message:

```json
{
    "message": "Hello world!"
}
```
