import { Keyboard } from 'vk-io';

import { bot } from '../..';
import User from '../../controllers/user.controller';
import Frame from '../../models/frame';
import Scene from '../../models/scene';
import { ProfileView, Response } from '../../typings/global';
import messageValidator from '../../validators/search/message';
import SearchMainScene from './main';


export default function MessageScene(payload?) {
    return new Scene('Message', payload).add(new Frame(
        async scene => {
            bot.sendMessage({
                peer_id: scene.user.id,
                message: 'Оставь для пользователя сообщение ✍🏻',
                keyboard: Keyboard.builder()
                .textButton({
                    label: 'Продолжить поиск',
                    payload: { back: true },
                    color: Keyboard.PRIMARY_COLOR
                })
            })
        },
        async (message, scene) => {
            let payload = message.messagePayload;
            let text = message.text;
            let response = messageValidator(text);
            if (payload?.back) {
                scene.user.setScene(SearchMainScene());
                return;
            }
            if (response === Response.NO_VALUE) {
                scene.retry({
                    phrase: 'Пожалуйста, оставь сообщение для пользователя.'
                });
            } else if (response === Response.OUT_OF_RANGE) {
                scene.retry({
                    phrase: 'Длина сообщения не должна быть меньше трёх и больше 256 символов в длину.'
                });
            } else if (response === Response.VALID) {
                let found: User = scene.payload.found;
                found.notify({
                    controller: scene.user,
                    type: ProfileView.LIKED,
                    message: text
                });
                scene.user.setScene(SearchMainScene(await scene.user.profile.data()));
            }
        }
    ));
}