import { Keyboard } from 'vk-io';

import { bot } from '../../../..';
import { Response } from '../../../../codes';
import Frame from '../../../../frame';
import nameValidator from '../../../../validators/profile/name';


export default new Frame(
    async (scene, options) => {
        let response = await bot.api.users.get({
            user_id: scene.user.id
        });
        let firstName = scene.payload?.name || response[0].first_name;
        scene.payload.name = firstName;
        bot.sendMessage({
            message: options?.phrase || 'Как будем тебя звать?',
            peer_id: scene.user.id,
            keyboard: Keyboard.builder().textButton({
                label: firstName,
                color: Keyboard.SECONDARY_COLOR
            }).oneTime()
        });
    },
    (message, scene) => {
        let name = message.text;
        let response = nameValidator(name);
        if (response === Response.VALID) {
            scene.payload.name = name;
            scene.next();
        } else if (response === Response.NO_VALUE) {
            scene.retry({
                phrase: 'Пожалуйста, укажи имя.'
            });
        } else if (response === Response.INCORRECT) {
            scene.retry({
                phrase: 'Имя может содержать только буквы, цифры и пробелы и не иметь длину больше 64 символов.'
            });
        }
    }
);