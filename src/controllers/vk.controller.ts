import { VK } from 'vk-io';
import Logger from '../utils/cl';


export default class VKController {
    private controller: VK;
    private logger: Logger;


    constructor(token: string) {
        this.controller = new VK({
            token: token
        });
        this.logger = new Logger('VKController');
    }


    public async startUpdates() {
        await this.controller.updates.start();
        this.logger.log('Listening to the longpoll updates.', 'info');
    }

    public get api() {
        return this.controller.api;
    }
}