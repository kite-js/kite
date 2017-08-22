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
export declare type Parser = (data: string, encoding?: string) => {
    [name: string]: string;
};
export declare type ParserEntity = {
    contentType: string;
    parser: Parser;
};
/**
 * Data hub factory
 */
export declare type ParserProvider = () => ParserEntity;
