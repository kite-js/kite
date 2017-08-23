import { Controller, Entry } from '../../kite';

@Controller()
export class GreetingController {
    @Entry()
    async exec() {
        return { message: 'Hello world!' };
    }
}
