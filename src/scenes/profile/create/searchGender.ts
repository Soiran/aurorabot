import { Keyboard } from 'vk-io';

import { bot } from '../../..';
import Frame from '../../../frame';


export default new Frame(
    async (scene, options) => {
        bot.sendMessage({
            message: options?.phrase || 'Кого будем искать?',
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
        if (searchGender === undefined) {
            scene.retry({
                phrase: 'Пожалуйста, укажи того, кого хочешь найти.'
            });
            return;
        }
        scene.payload.search_gender = searchGender;
        scene.next();
    }
);