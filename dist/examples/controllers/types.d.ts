export declare class TypesController {
    exec(str: string, num: number, bool: boolean, date: Date): Promise<{
        values: {
            str: string;
            num: number;
            bool: boolean;
            date: Date;
        };
    }>;
}
