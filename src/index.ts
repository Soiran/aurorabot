import sizeof from 'object-sizeof';

import * as config from './config';
import DBController from './controllers/db.controller';
import User from './controllers/user.controller';
import VKController from './controllers/vk.controller';
import StackedMap from './models/stackedMap';
import StartScene from './scenes/start';


export let users = new StackedMap<User>();
export const bot = new VKController(config.VKAPI.TOKEN);
export const db = new DBController(`postgres://${config.DB.USER}:${config.DB.PASSWORD}@${config.DB.IP_ADRESS}:${config.DB.PORT}`);

bot.startUpdates();
db.connect(async () => {
    let response = await db.select('id, city', 'profile');
    let ids = response.map(r => r.id);
    for (let id of ids) {
        let controller: User = new User(parseInt(id));
        controller.created = true;
        if (await controller.profile.banned()) {
            return;
        }
        users.set(id, controller);
    }
});


/**
 * Main listener.
 */
bot.updates.on('message_new', async context => {
    users.logger.log(`Current heap size - ${sizeof(users)} bytes`, 'info');
    let userId = context.peerId;
    let controller: User = users.get(userId) || new User(userId);
    if (!users.has(userId)) {
        if (await controller.profile.banned()) {
            return;
        }
        controller.created = await controller.exists();
        users.set(userId, controller);
        controller.setScene(StartScene());
    } else {
        if (!controller.scene) {
            controller.setScene(StartScene());
        } else {
            controller.scene.listenMessage(context);
        }
    }
    if (controller.created) controller.profile.edit({ last_active: new Date().getTime() });
});

bot.updates.on('message_deny', async context => {
    let userId = context.userId;
    if (users.has(userId)) {
        users.delete(userId);
    }
    await db.update('profile', {
        status: 0
    }, `id = ${userId}`);
    // Object.values(users.heap).forEach(user => {
    //     user.viewStack.delete(userId);
    //     user.mutualStack.delete(userId);
    //     user.likedStack.delete(userId);
    // });
})

bot.updates.on('message_allow', context => {
    let userId = context.userId;
    db.update('profile', {
        status: 1
    }, `id = ${userId}`);
})