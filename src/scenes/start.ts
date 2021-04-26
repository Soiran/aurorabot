import { Keyboard } from 'vk-io';

import { bot, users } from '..';
import Frame from '../models/frame';
import Scene from '../models/scene';
import MenuScene from './menu';
import ProfileCreateScene from './profile/create';


/**
 * Эта сцена используется как роутинг в случае, если: пользователь впервые пишет
 * боту, пользователь не активен больше двух недель или бот был перезапущен.
 */
export default function StartScene(payload?) {
    return new Scene('StartScene', payload).add(new Frame(
        async scene => {
            let user = scene.user;
            let profile = user.profile;
            if (user.created) {
                let data = await profile.data();
                let status = data.status;
                /* if (!status) {
                    bot.sendMessage({
                        message: 'Увы, но твой профиль забанен. Чтобы узнать больше информации о бане - напиши нашим модераторам. Вывести список страниц модераторов?',
                        peer_id: scene.user.id,
                        keyboard: Keyboard.builder().textButton({
                            label: 'Вывести список',
                            payload: {
                                show_moderators: true
                            },
                            color: Keyboard.PRIMARY_COLOR
                        })
                    });
                } else */ if (status === 1) {
                    bot.sendMessage({
                        message: 'С возвращением! Хочешь найти кого-нибудь еще?',
                        peer_id: scene.user.id,
                        keyboard: Keyboard.builder().textButton({
                            label: '👍',
                            color: Keyboard.POSITIVE_COLOR
                        })
                    });
                } else if (status === 2) {
                    bot.sendMessage({
                        message: 'Привет, продолжим искать?',
                        peer_id: scene.user.id,
                        keyboard: Keyboard.builder().textButton({
                            label: '👍',
                            color: Keyboard.POSITIVE_COLOR
                        })
                    });
                } else if (status === 2) {
                    bot.sendMessage({
                        message: 'Привет, продолжим искать?',
                        peer_id: scene.user.id,
                        keyboard: Keyboard.builder().textButton({
                            label: '👍',
                            color: Keyboard.POSITIVE_COLOR
                        })
                    });
                }
            } else {
                bot.sendMessage({
                    message: 'Привет, я Аврора, твой помощник в поиске людей. Создадим анкету?',
                    peer_id: scene.user.id,
                    keyboard: Keyboard.builder().textButton({
                        label: '👍',
                        color: Keyboard.POSITIVE_COLOR
                    })
                });
            }
        },
        async (message, scene) => {
            /* let payload = message.messagePayload;
            if (payload?.show_moderators) {
                let moderators = await db.select('id', 'profile', 'rank = 2');
                message.send('Список активных модераторов:\n' + moderators.map(p => `@id${p.id}`).join('\n'));
                return;
            } */
            if (scene.user.created) {
                users.get(scene.user.id.toString()).setScene(MenuScene());
            } else {
                users.get(scene.user.id.toString()).setScene(ProfileCreateScene({ gotoMenu: true }));
            }
        }
    ));
}