/**
 * Main file; Entry point to the PostgreSQL & VK API. 
 */

import config from '../config';
import VKController from './controllers/vk.controller';
import DBController from './controllers/db.controller';
import User from './controllers/user.controller';
import StartScene from './scenes/start';


export let users = {} as any; 
export const bot = new VKController(config.VKAPI_TOKEN);
export const db = new DBController(`postgres://${config.DB_USER}:${config.DB_PASSWORD}@${config.DB_IP_ADRESS}:${config.DB_PORT}`);

bot.startUpdates();
db.connect();

/**
 * Main listener.
 */

bot.updates.on('message_new', async context => {
    let userId = context.peerId;
    if (userId in users) {
        let user = users[userId];
        if (user.scene) user.scene.handle(user, context);
    } else {
        let user = new User(context.peerId);
        users[userId] = user;
        user.setScene(new StartScene());
    }
});