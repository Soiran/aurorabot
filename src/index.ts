/**
 * Main file; Entry point to the PostgreSQL & VK API. 
 */

import { app } from './api/index'; // RESTAPI
import config from '../config';
import Logger from './utils/cl';
import VKController from './controllers/vk.controller';
import DBController from './controllers/db.controller';


export const bot = new VKController(config.VKAPI_TOKEN);
export const db = new DBController(`postgres://${config.DB_USER}:${config.DB_PASSWORD}@${config.DB_IP_ADRESS}:${config.DB_PORT}`);
const port = parseInt(config.RESTAPI_PORT);
const apiLoger = new Logger('API'); 

bot.startUpdates();
db.connect();
app.listen(port, () => {
    apiLoger.log(`Listening at the port ${port}.`, 'info');
});

/**
 * Main listener.
 */

bot.updates.on('message_new', async context => {
    // ! IMPLEMENT
});