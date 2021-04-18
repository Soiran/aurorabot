import { Keyboard } from 'vk-io';

import { bot, users } from '../../../..';
import { Response } from '../../../../codes';
import User from '../../../../controllers/user.controller';
import Frame from '../../../../frame';
import tagsValidator from '../../../../validators/profile/tags';
import ProfileMainScene from '../../main';


export default new Frame(
    async (scene, options) => {
        let keyboard = Keyboard.builder().textButton({
            label: 'Удалить теги',
            payload: {
               withoutTags: true
            },
            color: Keyboard.SECONDARY_COLOR
        }).oneTime();
        bot.sendMessage({
            message: options?.phrase || 'В добавок к твоему описанию помогут теги, строго определяющие твои предрасположенности и интересы. Укажи их через пробел.',
            peer_id: scene.user.id,
            keyboard: scene.payload?.description ? keyboard.textButton({
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
        let profileController = new User(scene.user.id).profile;
        if (payload?.withoutTags) {
            profileController.edit({ tags: [] });
        } else {
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
                profileController.edit({ tags: tags });
            }
        }
        if (payload?.withoutTags || payload?.leaveCurrent || Response.VALID) {
            users[scene.user.id].setScene(ProfileMainScene());
        }
    }
);