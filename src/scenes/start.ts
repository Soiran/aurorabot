import Scene from '../scene';
import { bot, users } from '../index';
import { Keyboard } from 'vk-io';
import ProfileViewScene from './profile/view';
import ProfileCreateScene from './profile/create';


export default class StartScene extends Scene {
    constructor() {
        super(
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
                    scene.data.created = true;
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
            [
                (message, scene) => {
                    scene.end();
                    if (scene.data.created) {
                        users[scene.user.id].setScene(new ProfileViewScene());
                    } else {
                        users[scene.user.id].setScene(new ProfileCreateScene());
                    }
                }
            ]
        );
    }
}