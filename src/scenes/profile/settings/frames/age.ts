import { Keyboard } from 'vk-io';

import { bot, users } from '../../../..';
import User from '../../../../controllers/user.controller';
import Frame from '../../../../models/frame';
import ageValidator from '../../../../validators/profile/age';
import ProfileMainScene from '../../main';
import { Response } from './../../../../typings/global';


export default new Frame(
    async (scene, options) => {
        bot.sendMessage({
            message: options?.phrase || 'Укажи мне свой новый возраст.',
            peer_id: scene.user.id,
            ...scene.payload?.age && { keyboard: Keyboard.builder().textButton({
                label: scene.payload?.age.toString(),
                color: Keyboard.SECONDARY_COLOR
            }).oneTime() }
        });
    },
    (message, scene) => {
        let age = message.text;
        let response = ageValidator(age);
        let profileController = new User(scene.user.id).profile;
        if (response === Response.NO_VALUE) {
            scene.retry({
                phrase: 'Пожалуйста, укажи возраст.'
            });
        } else if (response === Response.OUT_OF_RANGE) {
            scene.retry({
                phrase: 'Возраст должен быть целым положительным числом, отличным от нуля.'
            });
        } else if (response === Response.VALID) {
            profileController.edit({ age: parseInt(age) })
            users[scene.user.id].setScene(ProfileMainScene());
        }
    }
);