import { Keyboard } from 'vk-io';

import { bot, users } from '../../../..';
import User from '../../../../controllers/user.controller';
import Frame from '../../../../frame';
import ProfileMainScene from '../../main';


export default new Frame(
    async (scene, options) => {
        bot.sendMessage({
            message: options?.phrase || 'Определимся с твоим полом.',
            peer_id: scene.user.id,
            keyboard: Keyboard.builder().textButton({
                label: 'Я парень',
                payload: { gender: 0 },
                color: Keyboard.SECONDARY_COLOR
            }).textButton({
                label: 'Я девушка',
                payload: { gender: 1 },
                color: Keyboard.SECONDARY_COLOR
            }).textButton({
                label: 'Другое',
                payload: { gender: 2 },
                color: Keyboard.SECONDARY_COLOR
            }).oneTime()
        });
    },
    (message, scene) => {
        let gender = message.messagePayload?.gender;
        let profileController = new User(scene.user.id).profile;
        if (gender === undefined) {
            scene.retry({
                phrase: 'Пожалуйста, укажи свой пол.'
            });
            return;
        }
        profileController.edit({ gender: gender });
        users[scene.user.id].setScene(ProfileMainScene());
    }
);