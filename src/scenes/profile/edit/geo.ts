import GeoController from "../../../controllers/geo.controller";
import User from "../../../controllers/user.controller";
import Frame from "../../../frame";
import geoValidator from "../../../validators/profile/geo";
import { ProfileMainScene } from "../../../scenes/profile/main";
import { Keyboard } from "vk-io";
import { bot, users } from "../../..";
import { Response } from "../../../codes";


export default new Frame(
    async (scene, options) => {
        let geoKeyboard = Keyboard.builder().locationRequestButton({}).oneTime();
        bot.sendMessage({
            message: options?.phrase || 'Укажи свой город или отправь текущее местоположение.',
            peer_id: scene.user.id,
            keyboard: scene.payload?.city ? geoKeyboard.textButton({
                label: scene.payload?.city,
                color: Keyboard.SECONDARY_COLOR
            }) : geoKeyboard
        });
    },
    async (message, scene) => {
        let cityName = message.text;
        let geo = message.geo;
        let response = await geoValidator(cityName, geo);
        let profileController = new User(scene.user.id).profile;
        if (response === Response.NO_VALUE) {
            scene.retry();
        } else if (response === Response.VALID_CITY) {
            let city = await GeoController.search(cityName);
            profileController.edit({
                city: city.name,
                latitude: +city.latitude,
                longitude: +city.longitude
            });
            users[scene.user.id].setScene(ProfileMainScene());
        } else if (response === Response.NOT_FOUND) {
            scene.retry({
                phrase: 'Данного города не существует, попробуй еще раз.'
            });
        } else if (response === Response.VALID_LOCATION) {
            profileController.edit({
                city: geo.place.city,
                latitude: geo.coordinates.latitude,
                longitude: geo.coordinates.longitude
            });
            users[scene.user.id].setScene(ProfileMainScene());
        } else if (response === Response.UNKNOWN_LOCATION) {
            scene.retry({
                phrase: 'Не могу определить адрес данного местоположения.'
            });
        }
    }
);