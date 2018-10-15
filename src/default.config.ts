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
import { Config } from './core/types/config';
import { JsonReceiverProvider } from './utils/json-receiver.provider';
import { XformReceiverProvider } from './utils/xform-receiver.provider';
import { KiteResponder } from './utils/kite.responder';

/**
 * Default settings for Kite
 */
export const DefaultConfig: Config = {
    maxContentLength: '10M',
    log: {
        level: 7
    },
    receiverProvider: [JsonReceiverProvider, XformReceiverProvider],
    responder: new KiteResponder(),

};
