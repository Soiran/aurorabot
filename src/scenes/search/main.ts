import { Keyboard } from 'vk-io';

import { bot } from '../..';
import calculateDistance from '../../../lib/distance';
import User from '../../controllers/user.controller';
import Frame from '../../models/frame';
import Scene from '../../models/scene';
import { ProfileView } from '../../typings/global';
import MenuScene from '../menu';
import MessageScene from './message';


export default function SearchMainScene(payload?) {
    return new Scene('SearchMain', payload).add(new Frame(
        async scene => {
            let controller = scene.user;
            let profile = scene.payload;
            let searchResult = await controller.search();

            if (!searchResult.found) {
                bot.sendMessage({
                    peer_id: controller.id,
                    message: 'Упс, анкеты закончились! Напиши позже, чтобы найти новых людей.',
                    keyboard: Keyboard.builder().textButton({
                        label: 'Посмотреть новые анкеты',
                        payload: { retry: true },
                        color: Keyboard.POSITIVE_COLOR
                    })
                });
            } else {
                let keyboard = Keyboard.builder().textButton({
                    label: 'Продолжить',
                    color: Keyboard.POSITIVE_COLOR
                });
                let topText: string;
                if (searchResult.type === ProfileView.STRANGER) {
                    topText = '';
                    keyboard = Keyboard.builder()
                    .textButton({
                        label: '❤',
                        payload: { like: true },
                        color: Keyboard.POSITIVE_COLOR
                    }).textButton({
                        label: '✍🏻',
                        payload: { message: true },
                        color: Keyboard.POSITIVE_COLOR
                    })
                    .textButton({
                        label: '👎🏻',
                        payload: { dislike: true },
                        color: Keyboard.NEGATIVE_COLOR
                    })
                    .textButton({
                        label: '😴',
                        payload: { menu: true },
                        color: Keyboard.SECONDARY_COLOR
                    });
                } else if (searchResult.type === ProfileView.LIKED) {
                    topText = 'Этому человеку понравилась твоя анкета:\n\n';
                    keyboard = Keyboard.builder()
                    .textButton({
                        label: '❤',
                        payload: { like: true },
                        color: Keyboard.POSITIVE_COLOR
                    })
                    .textButton({
                        label: '👎🏻',
                        payload: { dislike: true },
                        color: Keyboard.NEGATIVE_COLOR
                    })
                    .textButton({
                        label: '😴',
                        payload: { menu: true },
                        color: Keyboard.SECONDARY_COLOR
                    });
                } else if (searchResult.type === ProfileView.MUTUAL) {
                    topText = `Добавляйся в друзья - vk.com/id${searchResult.controller.id}\nУдачи вам провести время ;)\n\n`;
                } else if (searchResult.type === ProfileView.REPORT) {
                    topText = 'Этот человек пожаловался на твою анкету:\n\n';
                }

                let foundProfile = await searchResult.controller.profile.data();
                let distance = profile.latitude && foundProfile.latitude ? calculateDistance(
                    profile.latitude,
                    profile.longitude,
                    foundProfile.latitude,
                    foundProfile.longitude
                ) : 0;
                let render = await searchResult.controller.profile.render(controller.profile, distance);
                bot.sendMessage({
                    peer_id: controller.id,
                    message: topText + render.text,
                    keyboard: keyboard,
                    attachment: render.photo
                })

                scene.payload.searchResult = searchResult;
            }
        },
        async (message, scene) => {
            let payload = message.messagePayload;
            if (payload?.retry) {
                scene.retry();
                return;
            }
            let target: User = scene.payload.searchResult.controller;
            if (payload?.like) {
                scene.user.pick(target);
            } else if (payload?.message) {
                scene.user.setScene(MessageScene({ found: target }));
                return;
            } else if (payload?.menu) {
                scene.user.setScene(MenuScene(scene.payload));
                return;
            }
            scene.retry();
        }
    ));
}