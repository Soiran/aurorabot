import { Keyboard } from 'vk-io';

import { bot, users } from '../../../..';
import User from '../../../../controllers/user.controller';
import Frame from '../../../../models/frame';


export default new Frame(
    async (scene, options) => {
        bot.sendMessage({
            message: options?.phrase || 'Анкета не будет появляться в поиске до тех пор, пока ты снова не напишешь боту. Точно хочешь ее отключить?',
            peer_id: scene.user.id,
            keyboard: Keyboard.builder().textButton({
                label: 'Да',
                payload: { disable: true },
                color: Keyboard.NEGATIVE_COLOR
            }).oneTime()
        });
    },
    (message, scene) => {
        let payload = message.messagePayload;
        let profileController = new User(scene.user.id).profile;
        if (!payload?.disable) {
            scene.retry();
        } else {
            profileController.edit({ status: 1 });
            scene.end();
            delete users[scene.user.id];
            message.send('Твоя анкета отключена, надеюсь скоро увидимся!');
        }
    }
);