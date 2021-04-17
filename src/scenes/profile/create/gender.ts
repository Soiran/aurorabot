import { Keyboard } from 'vk-io';

import { bot } from '../../..';
import Frame from '../../../frame';

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
        if (gender === undefined) {
            scene.retry({
                phrase: 'Пожалуйста, укажи свой пол.'
            });
            return;
        }
        scene.payload.gender = gender;
        scene.next();
    }
);