import { Keyboard } from 'vk-io';

import { bot, users } from '../../../..';
import User from '../../../../controllers/user.controller';
import Frame from '../../../../models/frame';
import ProfileMainScene from '../../main';


export default new Frame(
    async (scene, options) => {
        bot.sendMessage({
            message: options?.phrase || 'В режиме анонимности другие люди не смогут увидеть твое имя, пол, возраст и место проживания.',
            peer_id: scene.user.id,
            keyboard: Keyboard.builder()
            .textButton({
                label: scene.payload?.anonymous ? 'Отключить' : 'Включить',
                payload: {
                    toggle: true
                },
                color: Keyboard.PRIMARY_COLOR
            })
        });
    },
    (message, scene) => {
        let payload = message.messagePayload;
        let profileController = new User(scene.user.id).profile;
        if (!payload?.toggle) {
            scene.retry();
        } else {
            profileController.edit({ anonymous: !scene.payload?.anonymous });
            users.get(scene.user.id.toString()).setScene(ProfileMainScene());
        }
    }
);