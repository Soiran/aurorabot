import * as config from './config';
import DBController from './controllers/db.controller';
import User from './controllers/user.controller';
import VKController from './controllers/vk.controller';
import Storage from './models/storage';
import { StartScene } from './scenes/start';

/**
 * Main file; Entry point to the PostgreSQL & VK API. 
 */


export let users = new Storage<User>();
export const bot = new VKController(config.VKAPI.TOKEN);
export const db = new DBController(`postgres://${config.DB.USER}:${config.DB.PASSWORD}@${config.DB.IP_ADRESS}:${config.DB.PORT}`);

bot.startUpdates();
db.connect(async () => {
    let response = await db.select('id, city', 'profile');
    let ids = response.map(r => r.id);
    for (let id of ids) {
        let controller: User = new User(parseInt(id));
        users.push(id, controller);
    }
});

/**
 * Main listener.
 */

bot.updates.on('message_new', async context => {
    let userId = context.peerId.toString();
    let controller: User = users.get(userId) || new User(parseInt(userId));
    if (!users.exists(userId)) {
        users.push(userId, controller);
        controller.setScene(StartScene());
    } else {
        if (!controller.scene) {
            controller.setScene(StartScene());
        } else {
            controller.scene.listenMessage(context);
        }
    }
});