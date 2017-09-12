"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const json_parser_provider_1 = require("./utils/json.parser.provider");
const xform_parser_provider_1 = require("./utils/xform.parser.provider");
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
    parserProvider: [json_parser_provider_1.JsonParserProvider, xform_parser_provider_1.XformParserProvider]
};
//# sourceMappingURL=default.config.js.map