import { UserModel } from './../../model/user.model';
import { Controller, Entry } from '../../../kite';

@Controller()
export class GreetingController {
    @Entry()
    async exec(user: UserModel) {
        return { user };
    }
}
