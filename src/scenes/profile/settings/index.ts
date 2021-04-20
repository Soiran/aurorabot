import { Keyboard } from 'vk-io';

import { bot, users } from '../../..';
import Frame from '../../../models/frame';
import Scene from '../../../models/scene';
import { relationshipsFrame } from '../create/frames';
import ProfileMainScene from '../main';
import { ageFrame, anonymousFrame, descriptionFrame, geoFrame, photoFrame, statusFrame, tagsFrame } from './frames';


export default function ProfileSettingsScene(payload?) {
    return new Scene('ProfileSettings', payload).add(new Frame(
        async scene => {
            bot.sendMessage({
                peer_id: scene.user.id,
                message: 'Здесь ты можешь настроить свою анкету так, как тебе нужно, лишний раз не заполняя её полностью.\n1 - Возраст\n2 - Местоположение\n3 - Описание\n4 - Теги\n5 - Фотография\n6 - Режим анонимности\n7 - Семейное положение\n8 - Отключить анкету',
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
                })
                .textButton({
                    label: '3',
                    payload: {
                        goto: 3
                    },
                    color: Keyboard.SECONDARY_COLOR
                })
                .textButton({
                    label: '4',
                    payload: {
                        goto: 4
                    },
                    color: Keyboard.SECONDARY_COLOR
                }).row()
                .textButton({
                    label: '5',
                    payload: {
                        goto: 5
                    },
                    color: Keyboard.SECONDARY_COLOR
                })
                .textButton({
                    label: '6',
                    payload: {
                        goto: 6
                    },
                    color: Keyboard.SECONDARY_COLOR
                })
                .textButton({
                    label: '7',
                    payload: {
                        goto: 7
                    },
                    color: Keyboard.SECONDARY_COLOR
                })
                .textButton({
                    label: '8',
                    payload: {
                        goto: 8
                    },
                    color: Keyboard.SECONDARY_COLOR
                }).row()
                .textButton({
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
                    users.get(scene.user.id.toString()).setScene(ProfileMainScene());
                } else {
                    scene.goto(payload.goto);
                }
            } else {
                scene.retry();
            }
        }
    ))
    .add(ageFrame)
    .add(geoFrame)
    .add(descriptionFrame)
    .add(tagsFrame)
    .add(photoFrame)
    .add(anonymousFrame)
    .add(relationshipsFrame)
    .add(statusFrame);
}