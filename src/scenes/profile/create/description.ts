import { Keyboard } from 'vk-io';

import { bot } from '../../..';
import { Response } from '../../../codes';
import Frame from '../../../frame';
import descriptionValidator from '../../../validators/profile/description';


export default new Frame(
    async (scene, options) => {
        bot.sendMessage({
            message: options?.phrase || 'Расскажи о себе и своих интересах. Хорошее описание поможет найти подходящих тебе людей.',
            peer_id: scene.user.id,
            ...scene.payload?.description && { keyboard: Keyboard.builder().textButton({
                label: 'Оставить текущее',
                payload: {
                   leaveCurrent: true 
                },
                color: Keyboard.SECONDARY_COLOR
            }).oneTime() }
        });
    },
    (message, scene) => {
        let description = message.text;
        let leaveCurrent = message.messagePayload;
        let response = descriptionValidator(description);
        if (leaveCurrent) {
            scene.next();
            return;
        }
        if (response === Response.NO_VALUE) {
            scene.retry({
                phrase: 'Пожалуйста, расскажи о себе.'
            });
        } else if (response === Response.OUT_OF_RANGE) {
            scene.retry({
                phrase: 'Длина описание не должна быть меньше трёх и больше 512 символов в длину.'
            });
        } else if (response === Response.VALID) {
            scene.payload.description = description;
            scene.next();
        }
    }
);