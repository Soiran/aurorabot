import Scene from '../scene';
import { bot } from '../index';
import { Keyboard } from 'vk-io';
import ProfileView from './profile/view';

export default class StartScene extends Scene {
    constructor() {
        super(
            async scene => {
                let user = scene.user;
                let profile = user.profile;
                let exists = await profile.exists();
                if (exists) {
                    bot.sendMessage({
                        message: 'Привет, хочешь найти кого-то еще?',
                        peer_id: scene.user.id,
                        keyboard: Keyboard.builder().textButton({
                            label: '👍',
                            color: Keyboard.POSITIVE_COLOR
                        })
                    });
                    user.setScene(ProfileView);
                    scene.end();
                } else {
                    bot.sendMessage({
                        message: 'Привет, я Аврора, твой помощник в поиске людей. Начнем?',
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
                    bot.sendMessage({
                        message: 'Это весь функционал, который имеется на данный момент ;)',
                        peer_id: scene.user.id,
                    });
                    scene.end();
                }
            ]
        );
    }
}