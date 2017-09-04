"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/***
 * Copyright (c) 2017 [Arthur Xie]
 * <https://github.com/kite-js/kite>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 */
const _1 = require("./");
const json_parser_provider_1 = require("./utils/json.parser.provider");
const kite_responder_1 = require("./utils/kite.responder");
/**
 * Default settings for Kite
 */
exports.DefaultConfig = {
    hostname: '127.0.0.1',
    port: 4000,
    maxContentLength: '10M',
    watch: true,
    log: {
        level: 7
    },
    // router: new HttpRouter(''),  /* Just because can not determin work dir at this file */
    responder: new kite_responder_1.KiteResponder(),
    parserProvider: [json_parser_provider_1.JsonParserProvider, _1.XformParserProvider]
};
//# sourceMappingURL=default.config.js.map