import { Controller, Entry } from '../../kite';

@Controller()
export class GreetingController {
    @Entry()
    async exec(name: string = 'abc') {
        return { message: 'Hello world!' };
    }
}
