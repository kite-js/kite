# Kite framework
Next generation, fast, flexible HTTP RPC (API) framework

Please visit [Kite Tutorial](https://github.com/kite-js/kite/blob/master/docs/tutorial.md) for more examples.

For quickly starts a Kite application, we suggest you use [Kite CLI tools](https://github.com/kite-js/kite-tools):

```sh
npm install -g kite-tools
```

PS: if you're using Linux and MacOS systems, you suppose to run `sudo npm install -g kite-tools`

# Installation
Before you start, please make sure:
+ Install [NodeJs](https://nodejs.org/), version >= 8.0.0
+ Install [TypeScript](https://www.typescriptlang.org/), verstion >= 2.4
+ Get a TypeScript IDE, [Visual Studio Code](https://code.visualstudio.com/) is recommended here

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

# Make Kite fly


# Why KiteJS and what's the differences with ExpressJS / Koa
KiteJS is designed for easier / faster writing web APIs that using new ECMA features, 
like `async`, `await`, reflection etc. It's writen from TypeScript, and 
TypeScript is a suggested language for writing Kite APIs, though you can 
write them in JavaScript.

With TypeScript, Kite implemented another important feature - schema checking -
yes, the missing MogonDB schema is here! See ...

With TypeScript, something is awsome in KiteJS:
* input data type conversion - Kite automatically convert input data
  from `string` (or any other types) to declared types
* input data mapping - Kite can easily map input data to custom objects or contoller arguments
* input data checking - by defining some rules for a input data, Kite checks it for you

