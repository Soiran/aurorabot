import User from "../../../controllers/user.controller";
import Frame from "../../../frame";
import nameValidator from '../../../validators/profile/name';
import { ProfileMainScene } from "../../../scenes/profile/main";
import { bot, users } from "../../..";
import { Response } from "../../../codes";


export default new Frame(
    async (scene, options) => {
        let response = await bot.api.users.get({
            user_id: scene.user.id
        });
        let firstName = scene.payload?.name || response[0].first_name;
        scene.payload.name = firstName;
        bot.sendMessage({
            message: options?.phrase || 'Укажи мне свое новое имя.',
            peer_id: scene.user.id
        });
    },
    (message, scene) => {
        let name = message.text;
        let response = nameValidator(name);
        let profileController = new User(scene.user.id).profile;
        if (response === Response.VALID) {
            profileController.edit({ name: name });
            users[scene.user.id].setScene(ProfileMainScene());
        } else if (response === Response.NO_VALUE) {
            scene.retry({
                phrase: 'Пожалуйста, укажи имя.'
            });
        } else if (response === Response.INCORRECT) {
            scene.retry({
                phrase: 'Имя может содержать только буквы, цифры и пробелы и не иметь длину больше 64 символов.'
            });
        }
    }
);