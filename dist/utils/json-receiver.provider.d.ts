export declare function JsonReceiverProvider<ParserProvider>(): {
    contentType: string;
    receiver: (data: string) => any;
};
