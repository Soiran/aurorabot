import { Keyboard } from 'vk-io';

import { bot } from '../../../..';
import Frame from '../../../../models/frame';
import tagsValidator from '../../../../validators/profile/tags';
import { Response } from './../../../../typings/global';


export default new Frame(
    async (scene, options) => {
        let keyboard = Keyboard.builder().textButton({
            label: 'Не добавлять теги',
            payload: {
               withoutTags: true
            },
            color: Keyboard.SECONDARY_COLOR
        }).oneTime();
        bot.sendMessage({
            message: options?.phrase || 'Ты можешь добавить к анкете теги, чтобы подчеркнуть свои интересы и предрасположенности. Укажи их через пробел.',
            peer_id: scene.user.id,
            keyboard: scene.payload?.tags ? keyboard.textButton({
                label: 'Оставить текущие',
                payload: {
                   leaveCurrent: true
                },
                color: Keyboard.SECONDARY_COLOR
            }).oneTime() : keyboard
        });
    },
    (message, scene) => {
        let tagsString = message.text;
        let tags = tagsString.split(/\s/g);
        let payload = message.messagePayload;
        let response = tagsValidator(tagsString);
        if (payload?.withoutTags) {
            scene.payload.tags = [];
            scene.next();
            return;
        }
        if (payload?.leaveCurrent) {
            scene.next();
            return;
        }
        if (response === Response.NO_VALUE) {
            scene.retry({
                phrase: 'Пожалуйста, укажи теги через пробел.'
            });
        } else if (response === Response.OUT_OF_RANGE) {
            scene.retry({
                phrase: 'Максимальное количество тегов, которых ты можешь указать - 16.'
            });
        } else if (response === Response.INCORRECT) {
            scene.retry({
                phrase: 'Теги могут содержать только буквы и цифры, будьте внимательны.'
            });
        } else if (response === Response.VALID) {
            scene.payload.tags = tags;
            scene.next();
        }
    }
);