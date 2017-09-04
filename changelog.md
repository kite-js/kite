# 0.3.7 (2017-09-04) 
- Performance improved:
 + HttpRouter more simple, no file existing test
 + post entity body get logic improved
 + controller privilege check improved, only create new "Holder" class when privilege is given
- defaultly support "x-www-form-urlencoded" content type

# 0.3.6 (2017-09-01)
- export "XformParserProvider" & "JsonParserProvider" from utils

# 0.3.5 (2017-09-01)
- improved "HttpRouter": faster API location if controller source filename ends with '.controller.ts'

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