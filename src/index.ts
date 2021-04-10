/**
 * Main file; Entry point to the PostgreSQL & VK API. 
 */

import config from '../config';
import VKController from './controllers/vk.controller';
import DBController from './controllers/db.controller';


export const bot = new VKController(config.TOKEN_VKAPI);
export const db = new DBController(`postgres://${config.DB_USER}:${config.DB_PASSWORD}@${config.DB_IP_ADRESS}:${config.DB_PORT}`);

bot.startUpdates();
db.connect(async () => {
    let response = await db.update('form', {
        name: 'Ascent'
    }, 'id = 1');
    console.log(response);
});

/**
 * Main listener.
 */

bot.updates.on('message_new', async context => {
    // ! IMPLEMENT
});