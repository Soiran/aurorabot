/**
 * Main file; Entry point to the PostgreSQL & VK API. 
 */
import * as config from './config';
import DBController from './controllers/db.controller';
import User from './controllers/user.controller';
import VKController from './controllers/vk.controller';
import { StartScene } from './scenes/start';



export let users = {} as any; 
export const bot = new VKController(config.VKAPI.TOKEN);
export const db = new DBController(`postgres://${config.DB.USER}:${config.DB.PASSWORD}@${config.DB.IP_ADRESS}:${config.DB.PORT}`);

bot.startUpdates();
db.connect();

/**
 * Main listener.
 */

bot.updates.on('message_new', async context => {
    let userId = context.peerId;
    let controller: User = users[userId] || new User(userId);
    if (!users[userId]) {
        users[userId] = controller;
        controller.setScene(StartScene());
    } else {
        if (controller.scene) controller.scene.listenMessage(context);
    }
});