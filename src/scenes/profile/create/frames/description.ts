import { Keyboard } from 'vk-io';

import { bot } from '../../../..';
import Frame from '../../../../models/frame';
import descriptionValidator from '../../../../validators/profile/description';
import { Response } from './../../../../typings/global';


export default new Frame(
    async (scene, options) => {
        let keyboard = Keyboard.builder().textButton({
            label: 'Не добавлять описание',
            payload: {
               withoutDescription: true 
            },
            color: Keyboard.SECONDARY_COLOR
        }).oneTime();
        bot.sendMessage({
            message: options?.phrase || 'Расскажи о себе и своих интересах. Хорошее описание поможет найти подходящих тебе людей.',
            peer_id: scene.user.id,
            keyboard: scene.payload?.description ? keyboard.textButton({
                label: 'Оставить текущее',
                payload: {
                   leaveCurrent: true 
                },
                color: Keyboard.SECONDARY_COLOR
            }) : keyboard
        });
    },
    (message, scene) => {
        let description = message.text;
        let payload = message.messagePayload;
        let response = descriptionValidator(description);
        if (payload) {
            if (payload?.withoutDescription) {
                scene.payload.description = null;
            }
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