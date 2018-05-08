# 0.5.5 (2018-05-08)
- Change default string trim behavior: keeps original input strings instead of trims it, auto-trim should be enabled by `KiteConfig.trim = true`

# 0.5.4 (2018-05-05)
- add short way to exit a controller, function `cut`, now exiting a controller can be more readable:
```ts
// old way
if (error) throw new KiteError(code);
// new way
if (error) end(code);
```

# 0.5.3 (2018-04-24)
- improved: parsing "Content-Type" with "charset" suffix, like "application/json;charset=UTF-8"

# 0.5.2 (2018-04-19)
- fix bug: show "unsupported content type ..." when receive 'POST' data

# 0.5.1 (2017-03-28)
- remove cluster support, if you want this feature please look for pagcakges like PM2

# 0.5.0 pre (2017-02-26)
- change the entry point @Entry decorator, move "map input only" to new decorator "@MapInputOnly"
- middleware re-design, return type is not restricted to `promise`, now it can be any type
- controllers now can handle http incoming message and server response in custom way
- framework never call `response.end()`, responder should handle the everything
- __Kite train__
  - loads configuration / profile from a custom provider


# 0.4.3 (2017-10-08)
- new "clean model" creates both top level model and its child models without calling their constructors
- improved `Date` type min / max value checking
- fixed error when "min" "max" or property name contains quote mark

# 0.4.2 (2017-10-02)
- rewirte model filter function creation code, fixed several bugs
- global filter rule is enabled in Kite model
- change "min" & "max" check behaviour for string type inputs
- add "minLen" & "maxLen" for string type inputs
- "min" & "max" rules now can apply to Date type
- array element type mapping is supported
- filter rule "trim" option is replaced by "noTrim"

# 0.4.1
- Add "trim" option to filter rule, default trim beginning and ending spaces from string

# 0.4.0 
- Recompiled for new feature "async/await" with tsc option "--target ESNext"
- More flexible controller metadata definition, enables middlewares to access these metadata
- Removed "Context" class, request (IncomingMessage) & response (ServerResponse) now can directly
  get from entry point function parameter
- Removed "Holder" & "HolderClass", privilege check is not a built-in function anymore, developer
  should implement this function in middleware
- Removed controller metadata "method" check, developer should implement this function in middleware
- Single Kite instance mode implemented, now can get Kite instance by "Kite.getInstance()" everywhere

# 0.3.9 (2017-09-10)
- changed "onKiteInit" function invoking time, invokes this function after all injections are successfully injected
- some code optimization

# 0.3.8 (2017-09-05)
- Performance improved in controller factory and watch service

# 0.3.7 (2017-09-04) 
- Performance improved:
 + HttpRouter more simple, no file existing test
 + post entity body get logic improved
 + controller privilege check improved, only create new "Holder" class when privilege is given
- defaultly support "x-www-form-urlencoded" content type

# 0.3.6 (2017-09-01)
- export "XformParserProvider" & "JsonParserProvider" from utils

# 0.3.5 (2017-09-01)
- improved "HttpRouter": faster API location if controller source filename ends with ".controller.ts"

# 0.3.4 (2017-08-31)
- Node republish for renew "readme" document

# 0.3.3 (2017-08-30)
- Remove access log from Kite core
- Remove "charset" split logic from "Content-Type", only accept "UTF-8" encoding
- Remove "; charset=utf-8" from response header if content type is "application/json"
- Tested benchmark again more fairly - loads a module from other file like Kite does:

framework     | concurrency    | requests     | time taken    | req / sec     | time
------------- | -------------- | ------------ | ------------- | ------------- | -----------
Kite          | 150            | 3000         | 0.842 sec     | 3563.14       | 1st
_             | _              | _            | 1.119 sec     | 2680.48       | 2nd
_             | _              | _            | 0.950 sec     | 3156.32       | 3rd
Raw Node.js   | 150            | 3000         | 0.575 sec     | 5215.37       | 1st
_             | _              | _            | 0.674 sec     | 4449.63       | 2nd
_             | _              | _            | 0.661 sec     | 4540.19       | 3rd
Express       | 150            | 3000         | 1.247 sec     | 2405.14       | 1st
_             | _              | _            | 1.155 sec     | 2596.52       | 2nd
_             | _              | _            | 1.105 sec     | 2715.58       | 3rd

# 0.3.2 (2017-08-29)
- Fixed bug on LogService, when log.level is set to `0` it caused crash
- Did a simple benchmark test to "greeting" API from example on my Macbook Pro, compare against Node.js raw server, still get things to improve: 

framework     | concurrency    | requests     | time taken    | time
------------- | -------------- | ------------ | ------------- | -----------
Kite          | 150            | 3000         | 0.987 sec     | 1st
_             | _              | _            | 0.738 sec     | 2nd
_             |                | _            | 0.998 sec     | 3rd
Raw Node.js   | 150            | 3000         | 0.558 sec     | 1st
_             | _              | _            | 0.487 sec     | 2nd
_             | _              | _            | 0.503 sec     | 3rd

# 0.3.1
- Fix error when controller called `response.write()`

# 0.3.0
- Fixed error when request content type is not set
- Fixed bug when responder error handler throws error
- Enhanced default responder, enables controllers return different types of results
- Reviewed `middleware` js document, fixed some errors

# 0.2.7
- Republish to npm with "@types/node" dependency added

# 0.2.6
- New filter rule `empty` added, empty string filter is configurable
- Remove unnecessary .js.map files

# 0.2.5
- For npm publish, rename to "kite-framework", now can install Kite by `npm install kite-framework`

# 0.2.4
- For npm publish

# 0.2.3
- Fix error when no parameter declared in controller entry point function

# 0.2.2
- For npm publish

# 0.2.1
- For npm publish

# 0.2.0 Core re-design, almost completely rewrote
- Added "Kite model", now it's able to create objects like `Date` & `ObjectId` on parameter mapping stage
- Move inputs filter function "$filter()" to Kite model, and create it when after module loaded
- Many bug fixed in dynamic filter creation, also performance improved
- Allmost rewrote Kite, now works more efficiently, more flexible and more like a framework

# 0.1.0a Initial release
First release of Kite. Kite is based on my PHP API framework "Fly". The idea of Fly comes from an open source e-commerce project called "TomatoCart" - about 6 years ago (now 2017) - which has a mechanism of loading PHP script and invoke it dynamically base on client requests. And recently I began to code `Javascript` & [Typescript](https://www.typescriptlang.org/) working both on client side and server, Javascript has advantages of manipulating JSON, and with Typescript, some new features like [decorator](https://www.typescriptlang.org/docs/handbook/decorators.html) and reflection are able to apply to my projects, so I decided to write a Typescript-edition "Fly", named "Kite".

Kite is designed for server side APIs, 