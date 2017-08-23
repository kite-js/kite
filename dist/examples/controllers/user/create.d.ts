import { UserModel } from './../../model/user.model';
export declare class GreetingController {
    exec(user: UserModel): Promise<{
        user: UserModel;
    }>;
}
