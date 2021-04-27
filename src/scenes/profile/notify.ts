import { Keyboard } from 'vk-io';

import { bot } from '../..';
import Frame from '../../models/frame';
import Scene from '../../models/scene';
import SearchMainScene from '../search/main';


export default function NotifyScene(payload?) {
    return new Scene('Notify', payload).add(new Frame(
        async scene => {
            bot.sendMessage({
                peer_id: scene.user.id,
                message: payload.message,
                keyboard: Keyboard.builder()
                .textButton({
                    label: 'Посмотреть',
                    payload: { view: true },
                    color: Keyboard.POSITIVE_COLOR
                }).row()
                .textButton({
                    label: 'Позже',
                    payload: { back: true },
                    color: Keyboard.SECONDARY_COLOR
                })
            })
        },
        async (message, scene) => {
            scene.end();
            let payload = message.messagePayload;
            if (payload?.view) {
                scene.user.setScene(SearchMainScene(await scene.user.profile.data()));
                return;
            }
            if (payload.last_scene) scene.user.setScene(payload.last_scene?.clone);
        }
    ));
}