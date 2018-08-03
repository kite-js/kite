export declare class ErrorService {
    errors: any;
    /**
     *
     * @param code error code
     * @param extra error extra message
     */
    getError(code: number | string, extra?: string | string[]): {
        code: string | number;
        msg: string;
    };
}
