/// <reference types="node" />
export declare const LogFlags: {
    none: number;
    info: number;
    warn: number;
    error: number;
};
/**
 * Kite log service
 */
export declare class LogService {
    private logger;
    /**
     * Output some normal information
     */
    info: (output: any, ...optionalMsgs: any[]) => void;
    /**
     * Output warnings
     */
    warn: (output: any, ...optionalMsgs: any[]) => void;
    /**
     * Output errors
     */
    error: (output: any, ...optionalMsgs: any[]) => void;
    /**
     * Log access
     */
    constructor(level: number, stdout?: string | NodeJS.WritableStream, stderr?: string | NodeJS.WritableStream);
    private _dummy(...optionalMsgs);
    _info(output: any, ...optionalMsgs: any[]): void;
    _warn(output: any, ...optionalMsgs: any[]): void;
    _error(output: any, ...optionalMsgs: any[]): void;
}
