export declare class ErrorService {
    errors: any;
    /**
     *
     * @param code 错误代码
     * @param extra 附加错误消息
     */
    getError(code: number | string, extra?: string | string[]): {
        code: string | number;
        msg: string;
    };
}
