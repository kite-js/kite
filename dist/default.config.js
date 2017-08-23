"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const json_parser_provider_1 = require("./utils/json.parser.provider");
const json_responder_1 = require("./utils/json.responder");
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
    responder: new json_responder_1.JsonResponder(),
    parserProvider: json_parser_provider_1.JsonParserProvider
};
//# sourceMappingURL=default.config.js.map