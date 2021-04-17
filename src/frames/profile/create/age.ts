import { Keyboard } from "vk-io";
import { bot } from "../../..";
import { Response } from "../../../codes";
import Frame from "../../../frame";
import ageValidator from '../../../validators/profile/age';


export default new Frame(
    async (scene, options) => {
        bot.sendMessage({
            message: options?.phrase || 'Сколько тебе лет?',
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
        if (response === Response.NO_VALUE) {
            scene.retry({
                phrase: 'Пожалуйста, укажи возраст.'
            });
        } else if (response === Response.OUT_OF_RANGE) {
            scene.retry({
                phrase: 'Возраст должен быть целым положительным числом, отличным от нуля.'
            });
        } else if (response === Response.VALID) {
            scene.payload.age = age;
            scene.next();
        }
    }
);