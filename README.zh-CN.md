# 语言
[English](./README.md) | [简体中文](./README.zh-CN.md)

# KiteJS 框架简介
KiteJS 是一个新一代的、快速、高效、可扩展的 web API 框架。

请参见 [Kite 教程](./docs/tutorial.md) 了解更多实例。

我们同时提供了 [Kite 命令行工具](https://github.com/kite-js/kite-tools)：

```sh
npm install -g kite-tools
```

如果你使用的是 MacOS 或 Linux 系统，你可能需要用 `sudo` 安装：

```sh
sudo npm install -g kite-tools
```

使用 "kite-tools" 你可以轻松地创建 KiteJS 工程以及编写API。下面的例子都假设你已经安装了 "kite-tools"，如果你要了解如何从0创建一个KiteJS项目，请参见
[Kite project step by step](./docs/kite-project-step-by-step.md).

# 安装
在开始 KiteJS 项目之前，请确保如下软件正确安装：
+ [NodeJs](https://nodejs.org/), version >= 8.0.0
+ [TypeScript](https://www.typescriptlang.org/), verstion >= 2.4
+ TypeScript 开发工具，这里推荐使用 [Visual Studio Code](https://code.visualstudio.com/) 

如果你安装好了 Kite 命令行工具，在终端中输入如下命令以创建一个工程：

```sh
kite -p --yes first-kite-app
```

上述命令的释义：
+ __kite__： Kite 命令行工具名称
+ __-p__ 选项： 创建一个 KiteJS 项目
+ __--yes__ 选项：创建项目过程中不进行任何提示，全部使用默认配置
+ __first-kite-app__ 选项：要创建的项目名称，这里我们使用 "first-kite-app"

之后，Kite 命令行工具会创建一个名为 `first-kite-app` 的目录，为其初始化一些文件及子目录，并安装相关的依赖包。

# 让 Kite（风争）飞起来

如果上面的步骤没有问题（如果有，通常是网络故障），现在就可以进入项目目录，并启动 Kite
应用程序服务器：

```sh
cd first-kite-app
npm start
```

等待几秒钟，让TypeScript 完成编译、NodeJS 运行代码，你将会看到如下的信息：

```
2018-3-23 10:13:24 [ KITE  ] Flying! server listening at 127.0.0.1:4000
```

这意味着 Kite 应用程序服务器已经成功启动，之后可以打开浏览器，访问 [127.0.0.1:4000](http://127.0.0.1:4000) （或者 [localhost:4000](http://localhost:4000)），
将会看到如下输出：

```json
{"error":{"code":1002,"msg":"Resource not found"}}
```

不要太在意这个错误信息，它表示请求的资源 `/` 不存在，服务器现在运行一切正常。

# 第一个 API

使用 `kite-tools`，你可以方便地创建 Kite API。打开一个新的命令行终端窗口（前一个窗口保存应用服务器运行，不要关闭），在项目目录下录入这行命令：

```sh
kite -a greet
```

Kite 命令行工具将在`src/controllers/`目录下创建一个名为 `greet.controller.ts`
的文件，内容如下：

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

之后运行 `tsc` 命令来编译源代码：

```sh
tsc
```

现在你可以访问
[http://localhost:4000/greet](http://localhost:4000/greet) 试试，得到输出：

```json
{"error":{"code":1000,"msg":"this api is not implemented"}}
```

## Hello world! （纯文本版）

如果API返回一个字符串，那么框架将会把内容类型设置为 `text/plain` 并返回给客户端。来看 `greet.controller.ts` 的例子：

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

保存文件并运行 `tsc` 来编译，（__如果你已经厌倦了每次都输入 `tsc` 命令__，可以打开一个新的命令行窗口，输入 `tsc -w` 进入 TypeScript 监视编译模式，见 [TypeScript compiler watch mode](http://www.typescriptlang.org/docs/handbook/compiler-options.html) ）。

现在刷新浏览器页面（[http://localhost:4000/greet](http://localhost:4000/greet)），响应内容如下：

```text
hello world!
```

## Hello world! （JSON版）

KiteJS 是一个偏重编写 web API 的框架，当下大多数 web API 都采用了 JSON
作为输出。从另外一个角度说，在 JavaScript 下编程，JSON确实是一个再好不过的格式。

API返回一个对象的话，框架将其输出成`application/json` 类型。`greet.controller.ts` 新的代码如下：

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

编译代码（如果没有运行 `tsc -w`）并刷新页面，得到结果：

```json
{"msg":"hello world!"}
```

## 接收客户端传入的参数

Kite API 入口函数（目前可以认为是`exec()`函数）的参数将会被映射为客户端参数，这个过程收框架在加载API时完成。

这里举个例子（先用命令 `kite -a welcome` 创建 `welcome.controller.ts` 文件）：

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

编译代码（如果没有运行 `tsc -w`），然后访问
[http://localhost:4000/welcome?name=Kite](http://localhost:4000/welcome?name=Kite)，响应内容如下：

```json
{"msg":"Hello, Kite!"}
```

__注意__

在 KiteJS 里，我们强烈建议你声明参数的类型，一方面可以提高开发效率，另一方面可以加速API的加载过程。如果省略了参数类型声明，将默认按字符串类型处理。

# 为什么选择 KiteJS？它和 ExpressJS / KoaJS 区别是什么？

KiteJS 设计为让你更简单、快速地开发运行 web API，它使用了 ECMA 最新的功能，例如：修饰器、`async`函数、`await`关键字、反射等等。它由 TypeScript 写成，同时我们也建议你使用 TypeScript 开发API。

由于使用了 TypeScript，KiteJS 实现了另一个很重要的功能 —— 数据库表格结构（schema）检查，解决了 MongoDB 没有 schema 的疼点。

在 TypeScript 的实现下，KiteJS 有一些相当不错的功能：
* 输入类型转换 —— Kite 框架自动地将输入数据由 `string` （或其它类型）转换为声明类型
* 输入数据映射 —— Kite 框架可以轻松地将输入的数据映射到一个对象或控制器（API）参数中
* 输入数据校验 —— 如果一个 Model 定义了检查规则，框架将在请求进来时完成这些校验作业
* 模块接口开发 —— 一个API一个文件，轻松实现团队开发（互不影响，代码合并无痛点），方便后期维护
