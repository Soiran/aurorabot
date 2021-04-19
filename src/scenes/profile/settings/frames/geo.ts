import { Keyboard } from 'vk-io';

import { bot, users } from '../../../..';
import GeoController from '../../../../controllers/geo.controller';
import User from '../../../../controllers/user.controller';
import Frame from '../../../../models/frame';
import geoValidator from '../../../../validators/profile/geo';
import ProfileMainScene from '../../main';
import { Response } from './../../../../typings/global';


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
        let city = await GeoController.search(cityName);
        let response = await geoValidator(geo, city);
        let profileController = new User(scene.user.id).profile;
        if (response === Response.UNKNOWN_LOCATION) {
            scene.retry({
                phrase: 'Не могу определить город на данной карте. Попробуй еще раз.'
            });
        } else if (response === Response.UNKNOWN_CITY) {
            scene.retry({
                phrase: 'Не могу найти такой город. Попробуй еще раз.'
            });
        } else if (response === Response.NO_VALUE) {
            scene.retry();
        } else if (response === Response.VALID_LOCATION ) {
            city = await GeoController.search(geo.place.city);
            profileController.edit({
                city: geo.place.city,
                latitude: geo.coordinates.latitude,
                longitude: geo.coordinates.longitude,
                city_latitude: city.latitude,
                city_longitude: city.longitude
            });
            users.get(scene.user.id.toString()).setScene(ProfileMainScene());
        } else if (response === Response.VALID_CITY) {
            profileController.edit({
                city: city.name,
                latitude: null,
                longitude: null,
                city_latitude: city.latitude,
                city_longitude: city.longitude
            });
            users.get(scene.user.id.toString()).setScene(ProfileMainScene());
        }
    }
);