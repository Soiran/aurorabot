import { Keyboard } from 'vk-io';

import { bot } from '../..';
import calculateDistance from '../../../lib/distance';
import User from '../../controllers/user.controller';
import Frame from '../../models/frame';
import Scene from '../../models/scene';
import { Relation } from '../../typings/global';
import MenuScene from '../menu';


export default function SearchMainScene(payload?) {
    return new Scene('SearchMain', payload).add(new Frame(
        async scene => {
            let user = scene.user;
            let userProfile = scene.payload;
            let result = await user.search();
            if (!result.found) {
                bot.sendMessage({
                    peer_id: user.id,
                    message: 'Упс, анкеты закончились! Напиши позже, чтобы найти новых людей.',
                    keyboard: Keyboard.builder()
                    .textButton({
                        label: 'Попробовать еще раз',
                        payload: { retry: true },
                        color: Keyboard.POSITIVE_COLOR
                    })
                })
            } else {
                let standartKeyboard = Keyboard.builder()
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
                let foundProfile = await result.user.profile.data();
                let distance = userProfile.latitude && foundProfile.latitude ? calculateDistance(
                    userProfile.latitude,
                    userProfile.longitude,
                    foundProfile.latitude,
                    foundProfile.longitude
                ) : 0;
                let render = await result.user.profile.render(user.profile, distance);
                if (result.relation === Relation.STRANGER) {
                    bot.sendMessage({
                        peer_id: user.id,
                        message: render.text,
                        attachment: render.photo,
                        keyboard: standartKeyboard
                    });
                } else if (result.relation === Relation.LIKED) {
                    bot.sendMessage({
                        peer_id: user.id,
                        message: `Этому человеку понравилась твоя анкета:\n\n${render.text}`,
                        attachment: render.photo,
                        keyboard: standartKeyboard
                    });
                } else if (result.relation === Relation.MUTUAL) {
                    bot.sendMessage({
                        peer_id: user.id,
                        message: `Добавляйся в друзья - vk.com/id${result.user.id}\nУдачи вам провести время ;)\n\n${render.text}`,
                        attachment: render.photo,
                        keyboard: Keyboard.builder()
                        .textButton({
                            label: 'Продолжить',
                            color: Keyboard.POSITIVE_COLOR
                        })
                    });
                }
                scene.payload.found = result.user;
                scene.payload.relation = result.relation;
            }
        },
        async (message, scene) => {
            let payload = message.messagePayload;
            if (payload?.retry) {
                scene.retry();
                return;
            }
            let found: User = scene.payload.found;
            let relation = scene.payload.relation;
            scene.user.viewStack.delete(found.id);
            if (relation === Relation.MUTUAL) {
                scene.user.mutualStack.delete(found.id);
            }
            if (payload?.like) {
                if (relation === Relation.LIKED) {
                    found.likedStack.delete(scene.user.id);
                    found.mutualRequest(scene.user);
                    scene.user.mutualStack.set(found.id, found);
                } else {
                    scene.user.likedStack.set(found.id, found);
                    found.viewRequest(scene.user);
                }
            } else if (payload?.menu) {
                scene.user.setScene(MenuScene(scene.payload));
                return;
            }
            scene.retry();
        }
    ));
}