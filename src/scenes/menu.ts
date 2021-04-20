import { Keyboard } from 'vk-io';

import { bot } from '../..';
import Frame from '../models/frame';
import Scene from '../models/scene';
import ProfileMainScene from './profile/main';
import SearchMainScene from './search/main';


export default function MenuScene(payload?) {
    return new Scene('ProfileMain', payload).add(new Frame(
        async scene => {
            bot.sendMessage({
                peer_id: scene.user.id,
                message: 'Ты в зоне отдыха, можешь в любой момент начать поиск или посмотреть свою анкету 😴',
                keyboard: Keyboard.builder()
                .textButton({
                    label: 'Начать поиск',
                    payload: {
                        scene: 'search'
                    },
                    color: Keyboard.PRIMARY_COLOR
                })
                .textButton({
                    label: 'Моя анкета',
                    payload: {
                        scene: 'profileMain'
                    },
                    color: Keyboard.PRIMARY_COLOR
                })
            })
        },
        async (message, scene) => {
            let payload = message.messagePayload;
            if (payload) {
                scene.end();
                switch (payload.scene) {
                    case 'search':
                        scene.user.setScene(SearchMainScene(scene.payload));
                        break;
                    case 'profileMain':
                        scene.user.setScene(ProfileMainScene(scene.payload));
                        break;
                }
            } else {
                scene.retry();
            }
        }
    ));
}