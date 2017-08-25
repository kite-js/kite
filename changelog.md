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