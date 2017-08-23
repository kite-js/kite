export declare function JsonParserProvider<ParserProvider>(): {
    contentType: string;
    parser: (data: string) => any;
};
