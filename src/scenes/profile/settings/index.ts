import { Keyboard } from 'vk-io';

import { bot, users } from '../../..';
import Frame from '../../../models/frame';
import Scene from '../../../models/scene';
import ProfileMainScene from '../main';
import {
    ageFrame,
    anonymousFrame,
    descriptionFrame,
    genderFrame,
    geoFrame,
    nameFrame,
    photoFrame,
    statusFrame,
    tagsFrame,
} from './frames';


export default function ProfileSettingsScene(payload?) {
    return new Scene(payload).add(new Frame(
        async scene => {
            bot.sendMessage({
                peer_id: scene.user.id,
                message: 'Здесь ты можешь настроить свою анкету так, как тебе нужно, лишний раз не заполняя её полностью.\n1 - Имя\n2 - Пол\n3 - Возраст\n4 - Местоположение\n5 - Описание\n6 - Теги\n7 - Фотография\n8 - Режим анонимности\n9 - Отключить анкету',
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
                    label: '9',
                    payload: {
                        goto: 9
                    },
                    color: Keyboard.NEGATIVE_COLOR
                }).row()
                .textButton({
                    label: 'Назад',
                    payload: {
                        back: true
                    },
                    color: Keyboard.PRIMARY_COLOR
                }).inline()
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
    .add(nameFrame)
    .add(genderFrame)
    .add(ageFrame)
    .add(geoFrame)
    .add(descriptionFrame)
    .add(tagsFrame)
    .add(photoFrame)
    .add(anonymousFrame)
    .add(statusFrame);
}