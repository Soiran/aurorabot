import Scene from '../../../scene';
import Frame from '../../../frame';
import { bot } from '../../../index';
import { Keyboard } from 'vk-io';
import {
    ageFrame,
    descriptionFrame,
    genderFrame,
    geoFrame,
    nameFrame,
    photoFrame,
    tagsFrame
} from './frames';


export default function ProfileEditScene(payload?) {
    return new Scene(payload).add(new Frame(
        async scene => {
            bot.sendMessage({
                peer_id: scene.user.id,
                message: 'Что отредактируем?\n1 - Имя\n2 - Пол\n3 - Возраст\n4 - Местоположение\n5 - Описание\n6 - Теги\n7 - Фотографию',
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
                }).row()
                .textButton({
                    label: '4',
                    payload: {
                        goto: 4
                    },
                    color: Keyboard.SECONDARY_COLOR
                })
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
                }).row()
                .textButton({
                    label: '7',
                    payload: {
                        goto: 7
                    },
                    color: Keyboard.SECONDARY_COLOR
                }).oneTime()
            })
        },
        async (message, scene) => {
            let payload = message.messagePayload;
            if (payload) {
                scene.goto(payload.goto);
            } else {
                scene.retry();
            }
        }
    ))
    .add(nameFrame)
    .add(genderFrame)
    .add(ageFrame)
    .add(geoFrame)
    .add(descriptionFrame)
    .add(tagsFrame)
    .add(photoFrame);
}