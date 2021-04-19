import { Keyboard } from 'vk-io';

import { bot } from '../../../..';
import Frame from '../../../../models/frame';

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
        if (relationships === undefined) {
            scene.retry({
                phrase: 'Нажми на кнопку "Да" или "Нет", чтобы я узнала о твоем семейном положении.'
            });
            return;
        }
        scene.payload.relationships = relationships;
        scene.next();
    }
);