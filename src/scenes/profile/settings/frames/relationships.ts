import { Keyboard } from 'vk-io';

import { bot, users } from '../../../..';
import User from '../../../../controllers/user.controller';
import Frame from '../../../../models/frame';
import ProfileMainScene from '../../main';


export default new Frame(
    async (scene, options) => {
        bot.sendMessage({
            message: options?.phrase || 'Состоишь в отношениях/браке?',
            peer_id: scene.user.id,
            keyboard: Keyboard.builder().textButton({
                label: 'Да',
                payload: { relationships: 1 },
                color: Keyboard.PRIMARY_COLOR
            }).textButton({
                label: 'Нет',
                payload: { relationships: 0 },
                color: Keyboard.PRIMARY_COLOR
            })
        });
    },
    (message, scene) => {
        let relationships = message.messagePayload?.relationships;
        let profileController = new User(scene.user.id).profile;
        if (relationships === undefined) {
            scene.retry({
                phrase: 'Нажми на кнопку "Да" или "Нет", чтобы я узнала о твоем семейном положении.'
            });
            return;
        }
        profileController.edit({ relationships: relationships });
        users[scene.user.id].setScene(ProfileMainScene());
    }
);