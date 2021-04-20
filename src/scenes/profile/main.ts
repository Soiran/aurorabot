import { Keyboard } from 'vk-io';

import { bot } from '../..';
import User from '../../controllers/user.controller';
import Frame from '../../models/frame';
import Scene from '../../models/scene';
import MenuScene from '../menu';
import SearchMainScene from '../search/main';
import SearchSettingsScene from '../search/settings';
import ProfileCreateScene from './create';
import ProfileSettingsScene from './settings';


export default function ProfileMainScene(payload?) {
    return new Scene('ProfileMain', payload).add(new Frame(
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
                message: '1 - Смотреть анкеты\n2 - Настроить анкету\n3 - Настроить поиск\n4 - Зона отдыха\n5 - Заполнить анкету заного',
                keyboard: Keyboard.builder()
                .textButton({
                    label: '1',
                    payload: {
                        scene: 'search'
                    },
                    color: Keyboard.POSITIVE_COLOR
                }).row()
                .textButton({
                    label: '2',
                    payload: {
                        scene: 'profileSettings'
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
                        scene: 'menu'
                    },
                    color: Keyboard.PRIMARY_COLOR
                }).textButton({
                    label: '5',
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
                    case 'menu':
                        scene.user.setScene(MenuScene(await scene.payload.profileController.data()));
                        break;
                    case 'search':
                        scene.user.setScene(SearchMainScene(await scene.payload.profileController.data()));
                        break;
                    case 'profileCreate':
                        scene.user.setScene(ProfileCreateScene(await scene.payload.profileController.data()));
                        break;
                    case 'profileSettings':
                        scene.user.setScene(ProfileSettingsScene(await scene.payload.profileController.data()));
                        break;
                    case 'searchSettings':
                        scene.user.setScene(SearchSettingsScene(await scene.payload.profileController.data()));
                        break;
                }
            } else {
                scene.retry();
            }
        }
    ));
}