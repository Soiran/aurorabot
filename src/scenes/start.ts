import Scene from '../scene';
import { bot, users } from '../index';
import { Keyboard } from 'vk-io';
import { ProfileCreateScene } from './profile/create';
import { ProfileViewScene } from './profile/view';


export const StartScene = (payload = null) => {
    return new Scene(payload).ask(
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
                users[scene.user.id].setScene(ProfileViewScene());
            } else {
                users[scene.user.id].setScene(ProfileCreateScene());
            }
        }
    );
}