import { Keyboard } from 'vk-io';

import { bot, users } from '../../..';
import Frame from '../../../models/frame';
import Scene from '../../../models/scene';
import ProfileMainScene from '../../profile/main';
import { searchGenderFrame, searchModeFrame } from './frames';


export default function SearchSettingsScene(payload?) {
    return new Scene(payload).add(new Frame(
        async scene => {
            bot.sendMessage({
                peer_id: scene.user.id,
                message: 'Здесь ты можешь настроить поиск анкет так, как тебе нужно.\n1 - Пол\n2 - Режим поиска',
                keyboard: Keyboard.builder()
                .textButton({
                    label: '1',
                    payload: {
                        goto: 1
                    },
                    color: Keyboard.SECONDARY_COLOR
                })
                .textButton({
                    label: '2',
                    payload: {
                        goto: 2
                    },
                    color: Keyboard.SECONDARY_COLOR
                }).textButton({
                    label: 'Назад',
                    payload: {
                        back: true
                    },
                    color: Keyboard.PRIMARY_COLOR
                }).oneTime()
            })
        },
        async (message, scene) => {
            let payload = message.messagePayload;
            if (payload) {
                if (payload.back) {
                    users[scene.user.id].setScene(ProfileMainScene());
                } else {
                    scene.goto(payload.goto);
                }
            } else {
                scene.retry();
            }
        }
    ))
    .add(searchGenderFrame)
    .add(searchModeFrame)
}