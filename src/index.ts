/**
 * Main file; Entry point to the PostgreSQL & VK API. 
 */

import config from '../config';
import VKController from './controllers/vk.controller';
import DBController from './controllers/db.controller';
import User from './controllers/user.controller';
import { PhotoAttachment } from 'vk-io';
import { StartScene } from './scenes/start';
import { CreateScene } from './scenes/profile/create';


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
    let user: User = users[userId] || new User(userId);
    if(!(userId in users)) {
        users[userId] = user;
        user.setScene(StartScene());
        return;
    }
    if (context.text === 'create') {
        user.setScene(CreateScene(await user.profile.exists() ? await user.profile.data() : {}));
    } else {
        if (user.scene) user.scene.listenMessage(context);
    }
});