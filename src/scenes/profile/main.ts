import { Keyboard } from 'vk-io';

import { bot, users } from '../..';
import User from '../../controllers/user.controller';
import Frame from '../../frame';
import Scene from '../../scene';
import ProfileCreateScene from './create';
import ProfileEditScene from './edit';


export default function ProfileMainScene(payload?) {
    return new Scene(payload).add(new Frame(
        async scene => {
            let profileController = await new User(scene.user.id).profile;
            let render = await profileController.render(profileController, null, true);
            scene.payload.profileController = profileController;
            bot.sendMessage({
                peer_id: scene.user.id,
                message: `Вот твоя анкета:\n\n${render.text}`,
                attachment: render.photo
            });
            bot.sendMessage({
                peer_id: scene.user.id,
                message: '1 - Продолжить поиск\n2 - Редактировать\n3 - Настройки поиска\n4 - Заполнить анкету заного',
                keyboard: Keyboard.builder()
                .textButton({
                    label: '1',
                    payload: {
                        scene: 'search'
                    },
                    color: Keyboard.POSITIVE_COLOR
                })
                .textButton({
                    label: '2',
                    payload: {
                        scene: 'profileEdit'
                    },
                    color: Keyboard.SECONDARY_COLOR
                })
                .textButton({
                    label: '3',
                    payload: {
                        scene: 'searchSettings'
                    },
                    color: Keyboard.SECONDARY_COLOR
                })
                .textButton({
                    label: '4',
                    payload: {
                        scene: 'profileCreate'
                    },
                    color: Keyboard.NEGATIVE_COLOR
                }).oneTime()
            })
        },
        async (message, scene) => {
            let payload = message.messagePayload;
            if (payload) {
                scene.end();
                switch (payload.scene) {
                    case 'profileCreate':
                        users[scene.user.id].setScene(ProfileCreateScene(await scene.payload.profileController.data()));
                        break;
                    case 'profileEdit':
                        users[scene.user.id].setScene(ProfileEditScene(await scene.payload.profileController.data()));
                        break;
                }
            } else {
                scene.retry();
            }
        }
    ));
}