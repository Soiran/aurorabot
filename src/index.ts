/**
 * Main file; Entry point to the PostgreSQL & VK API. 
 */

import config from '../config';
import VKController from './controllers/vk.controller';
import DBController from './controllers/db.controller';
import User from './controllers/user.controller';
import { PhotoAttachment } from 'vk-io';
import { StartScene } from './scenes/start';
import { ProfileCreateScene } from './scenes/profile/create';
import { ProfileViewScene } from './scenes/profile/view';


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
    let controller: User = users[userId] || new User(userId);
    if (!users[userId]) {
        users[userId] = controller;
        controller.setScene(StartScene());
    } else {
        if (controller.scene) controller.scene.listenMessage(context);
    }
});