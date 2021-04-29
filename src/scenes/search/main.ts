import { Keyboard } from 'vk-io';

import { bot } from '../..';
import calculateDistance from '../../../lib/distance';
import User from '../../controllers/user.controller';
import Frame from '../../models/frame';
import Scene from '../../models/scene';
import { ProfileView } from '../../typings/global';
import MenuScene from '../menu';
import MessageScene from './message';
import ReportScene from './report';


export default function SearchMainScene(payload?) {
    return new Scene('SearchMain', payload).add(new Frame(
        async scene => {
            let controller = scene.user;

            if (!controller.canSearch) {
                bot.sendMessage({
                    peer_id: controller.id,
                    message: 'Вы лайкнули достаточное количество людей за эти 24 часа, думаю вам стоит приостановиться.',
                    keyboard: Keyboard.builder()
                    .textButton({
                        label: '😴',
                        payload: { menu: true },
                        color: Keyboard.SECONDARY_COLOR
                    })
                });
            }

            let profile = scene.payload;
            let searchResult = await controller.search();

            if (!searchResult.found) {
                bot.sendMessage({
                    peer_id: controller.id,
                    message: 'Упс, анкеты закончились! Напиши позже, чтобы найти новых людей.',
                    keyboard: Keyboard.builder()
                    .textButton({
                        label: '😴',
                        payload: { menu: true },
                        color: Keyboard.SECONDARY_COLOR
                    })
                });
            } else {
                let keyboard = Keyboard.builder().textButton({
                    label: 'Продолжить',
                    color: Keyboard.POSITIVE_COLOR
                });
                let topText: string = '';
                let bottomText: string = '';
                if (searchResult.type === ProfileView.STRANGER) {
                    keyboard = Keyboard.builder()
                    .textButton({
                        label: '❤',
                        payload: { like: true },
                        color: Keyboard.POSITIVE_COLOR
                    })
                    .textButton({
                        label: '✍🏻',
                        payload: { message: true },
                        color: Keyboard.POSITIVE_COLOR
                    })
                    .textButton({
                        label: '👎🏻',
                        payload: { dislike: true },
                        color: Keyboard.NEGATIVE_COLOR
                    }).row()
                    .textButton({
                        label: '😴',
                        payload: { menu: true },
                        color: Keyboard.SECONDARY_COLOR
                    })
                    .textButton({
                        label: '⚠️',
                        payload: { report: true },
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
                    }).row()
                    .textButton({
                        label: '😴',
                        payload: { menu: true },
                        color: Keyboard.SECONDARY_COLOR
                    })
                    .textButton({
                        label: '⚠️',
                        payload: { report: true },
                        color: Keyboard.NEGATIVE_COLOR
                    });
                    if (searchResult.message) bottomText = `\n\n✉️: ${searchResult.message}`;
                } else if (searchResult.type === ProfileView.MUTUAL) {
                    topText = `Добавляйся в друзья - vk.com/id${searchResult.controller.id}\nУдачи вам провести время ;)\n\n`;
                } else if (searchResult.type === ProfileView.REPORT) {
                    topText = 'Этот человек пожаловался на твою анкету:\n\n';
                    bottomText = `\n\n⚠️: ${searchResult.message}`;
                }

                let foundProfile = await searchResult.controller.profile.data();
                let distance = controller.distance(searchResult.controller);
                let render = await searchResult.controller.profile.render(controller.profile, distance);
                bot.sendMessage({
                    peer_id: controller.id,
                    message: topText + render.text + bottomText,
                    keyboard: keyboard,
                    attachment: render.photo
                })

                scene.payload.searchResult = searchResult;
            }
        },
        async (message, scene) => {
            let payload = message.messagePayload;
            let target: User = scene.payload?.searchResult?.controller;
            if (payload?.like) {
                await scene.user.like(target);
            } else if (payload?.message) {
                scene.user.setScene(MessageScene({ found: target }));
                return;
            } else if (payload?.report) {
                scene.user.setScene(ReportScene({ found: target }));
                return;
            } else if (payload?.menu) {
                scene.user.setScene(MenuScene(scene.payload));
                return;
            }
            scene.retry();
        }
    ));
}