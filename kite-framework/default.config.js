"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultConfig = void 0;
const json_receiver_provider_1 = require("./utils/json-receiver.provider");
const xform_receiver_provider_1 = require("./utils/xform-receiver.provider");
const kite_responder_1 = require("./utils/kite.responder");
/**
 * Default settings for Kite
 */
exports.DefaultConfig = {
    maxContentLength: '10M',
    log: {
        level: 7
    },
    receiverProvider: [json_receiver_provider_1.JsonReceiverProvider, xform_receiver_provider_1.XformReceiverProvider],
    responder: new kite_responder_1.KiteResponder(),
};
