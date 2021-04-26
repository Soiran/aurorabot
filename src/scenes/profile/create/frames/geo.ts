import { Keyboard } from 'vk-io';

import { bot } from '../../../..';
import GeoController from '../../../../controllers/geo.controller';
import Frame from '../../../../models/frame';
import geoValidator from '../../../../validators/profile/geo';
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
        let city = cityName ? await GeoController.search(cityName) : null;
        let response = await geoValidator(geo, city);
        
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
        } else if (response === Response.VALID_LOCATION) {
            city = await GeoController.search(geo.place.city);
            scene.payload.city = geo.place.city;
            scene.payload.latitude = geo.coordinates.latitude;
            scene.payload.longitude = geo.coordinates.longitude;
            scene.payload.city_latitude = city.latitude;
            scene.payload.city_longitude = city.longitude;
            scene.next();
        } else if (response === Response.VALID_CITY) {
            scene.payload.city = city.name;
            scene.payload.latitude = null;
            scene.payload.longitude = null;
            scene.payload.city_latitude = city.latitude;
            scene.payload.city_longitude = city.longitude;
            scene.next();
        }
    }
);