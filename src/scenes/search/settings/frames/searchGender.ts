import { Keyboard } from 'vk-io';

import { bot, users } from '../../../..';
import Frame from '../../../../frame';
import ProfileMainScene from '../../../profile/main';


export default new Frame(
    async (scene, options) => {
        bot.sendMessage({
            message: options?.phrase || 'Кого теперь будем искать?',
            peer_id: scene.user.id,
            keyboard: Keyboard.builder().textButton({
                label: 'Парней',
                payload: { searchGender: 0 },
                color: Keyboard.SECONDARY_COLOR
            }).textButton({
                label: 'Девушек',
                payload: { searchGender: 1 },
                color: Keyboard.SECONDARY_COLOR
            }).textButton({
                label: 'Всех',
                payload: { searchGender: 2 },
                color: Keyboard.SECONDARY_COLOR
            }).oneTime()
        });
    },
    (message, scene) => {
        let searchGender = message.messagePayload?.searchGender;
        let profileController = scene.user.profile;
        if (searchGender === undefined) {
            scene.retry({
                phrase: 'Пожалуйста, укажи того, кого хочешь найти.'
            });
        } else {
            profileController.edit({ search_gender: searchGender });
            users[scene.user.id].setScene(ProfileMainScene());
        }
    }
);