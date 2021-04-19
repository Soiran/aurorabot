import { Keyboard } from 'vk-io';

import { bot, users } from '../../../..';
import User from '../../../../controllers/user.controller';
import Frame from '../../../../models/frame';
import tagsValidator from '../../../../validators/profile/tags';
import ProfileMainScene from '../../main';
import { Response } from './../../../../typings/global';


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
            message: options?.phrase || 'Укажи новые теги через пробел.',
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
                return;
            } else if (response === Response.OUT_OF_RANGE) {
                scene.retry({
                    phrase: 'Максимальное количество тегов, которых ты можешь указать - 16.'
                });
                return;
            } else if (response === Response.INCORRECT) {
                scene.retry({
                    phrase: 'Теги могут содержать только буквы и цифры, будьте внимательны.'
                });
                return;
            } else if (response === Response.VALID) {
                profileController.edit({ tags: tags });
            }
        }
        users.get(scene.user.id.toString()).setScene(ProfileMainScene());
    }
);