import { Keyboard } from 'vk-io';

import { bot, users } from '..';
import GeoController from '../controllers/geo.controller';
import User from '../controllers/user.controller';
import Frame from '../models/frame';
import Scene from '../models/scene';
import { Response } from '../typings/global';
import geoValidator from '../validators/profile/geo';
import ProfileMainScene from './profile/main';


/**
 * Временная сцена для заполнения новых полей.
 */
export const TempScene = (payload?) => {
    return new Scene('TempScene', payload).add(new Frame(
        async scene => {
            let response = await bot.api.users.get({
                user_id: scene.user.id
            });
            let firstName = scene.payload?.name || response[0].first_name;
            bot.sendMessage({
                peer_id: scene.user.id,
                message: `Привет, ${firstName}, вышло небольшое обновление, не составит труда ответить на пару вопросов?`,
                keyboard: Keyboard.builder().textButton({
                    label: '👍',
                    color: Keyboard.POSITIVE_COLOR
                })
            })
        },
        async (message, scene) => {
            scene.next();
        }
    ))
    .add(new Frame(
        async (scene, options) => {
            bot.sendMessage({
                message: options?.phrase || 'Состоишь в отношениях/браке?',
                peer_id: scene.user.id,
                keyboard: Keyboard.builder().textButton({
                    label: 'Да',
                    payload: { relationships: 1 },
                    color: Keyboard.PRIMARY_COLOR
                }).textButton({
                    label: 'Нет',
                    payload: { relationships: 0 },
                    color: Keyboard.PRIMARY_COLOR
                })
            });
        },
        (message, scene) => {
            let relationships = message.messagePayload?.relationships;
            let profileController = new User(scene.user.id).profile;
            if (relationships === undefined) {
                scene.retry({
                    phrase: 'Нажми на кнопку "Да" или "Нет", чтобы я узнала о твоем семейном положении.'
                });
                return;
            }
            profileController.edit({ relationships: relationships });
            scene.next();
        }
    ))
    .add(new Frame(
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
            let profileController = new User(scene.user.id).profile;
            
            if (response === Response.UNKNOWN_LOCATION) {
                scene.retry({
                    phrase: 'Не могу определить город на данной карте. Попробуй еще раз.'
                });
            } else if (response === Response.UNKNOWN_CITY) {
                scene.retry({
                    phrase: 'Не могу найти такой город. Попробуй еще раз.'
                });
            } else if (response === Response.VALID_LOCATION ) {
                city = await GeoController.search(geo.place.city);
                profileController.edit({
                    latitude: geo.coordinates.latitude,
                    longitude: geo.coordinates.longitude,
                    city_latitude: city.latitude,
                    city_longitude: city.longitude
                });
                users.get(scene.user.id.toString()).setScene(ProfileMainScene());
            } else if (response === Response.VALID_CITY) {
                profileController.edit({
                    latitude: null,
                    longitude: null,
                    city_latitude: city.latitude,
                    city_longitude: city.longitude
                });
                users.get(scene.user.id.toString()).setScene(ProfileMainScene());
            }
        }
    ));
}