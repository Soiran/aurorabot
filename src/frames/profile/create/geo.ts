import { Keyboard } from "vk-io";
import { bot } from "../../..";
import { Response } from "../../../codes";
import GeoController from "../../../controllers/geo.controller";
import Frame from "../../../frame";
import geoValidator from "../../../validators/profile/geo";


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
        if (response === Response.NO_VALUE) {
            scene.retry();
        } else if (response === Response.VALID_CITY) {
            let city = await GeoController.search(cityName);
            scene.payload.geo = {
                coordinates: {
                    latitude: +city.latitude,
                    longitude: +city.longitude
                },
                place: {
                    city: city.name
                }
            }
            scene.next();
        } else if (response === Response.NOT_FOUND) {
            scene.retry({
                phrase: 'Данного города не существует, попробуй еще раз.'
            });
        } else if (response === Response.VALID_LOCATION) {
            scene.payload.geo = geo;
            scene.next();
        } else if (response === Response.UNKNOWN_LOCATION) {
            scene.retry({
                phrase: 'Не могу определить адрес данного местоположения.'
            });
        }
    }
);