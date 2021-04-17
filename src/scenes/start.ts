import { Keyboard } from 'vk-io';

import { bot, users } from '..';
import Frame from '../frame';
import Scene from '../scene';
import ProfileCreateScene from './profile/create';
import ProfileMainScene from './profile/main';


/**
 * Эта сцена используется как роутинг в случае, если: пользователь впервые пишет
 * боту, пользователь не активен больше двух недель или бот был перезапущен.
 */
export const StartScene = (payload?) => {
    return new Scene(payload).add(new Frame(
        async scene => {
            let user = scene.user;
            let profile = user.profile;
            let exists = await profile.exists();
            if (exists) {
                bot.sendMessage({
                    message: 'Привет, хочешь найти кого-нибудь еще?',
                    peer_id: scene.user.id,
                    keyboard: Keyboard.builder().textButton({
                        label: '👍',
                        color: Keyboard.POSITIVE_COLOR
                    })
                });
                scene.payload.created = true;
            } else {
                bot.sendMessage({
                    message: 'Привет, я Аврора, твой помощник в поиске людей. Создадим анкету?',
                    peer_id: scene.user.id,
                    keyboard: Keyboard.builder().textButton({
                        label: '👍',
                        color: Keyboard.POSITIVE_COLOR
                    })
                });
            }
        },
        (message, scene) => {
            if (scene.payload.created) {
                users[scene.user.id].setScene(ProfileMainScene());
            } else {
                users[scene.user.id].setScene(ProfileCreateScene());
            }
        }
    ));
}