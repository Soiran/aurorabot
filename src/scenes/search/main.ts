import { Keyboard } from 'vk-io';

import { bot, users } from '../..';
import calculateDistance from '../../../lib/distance';
import User from '../../controllers/user.controller';
import Frame from '../../models/frame';
import Scene from '../../models/scene';
import ProfileMainScene from '../profile/main';


export default function SearchMainScene(payload?) {
    return new Scene(payload).add(new Frame(
        async scene => {
            let user = scene.user;
            let userProfile = scene.payload;
            let response = await user.search();
            if (!response.length) {
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
                let target: User = response[0]; 
                let targetProfile = await target.profile.data();
                let distance = userProfile.latitude && targetProfile.latitude ? calculateDistance(
                    userProfile.latitude,
                    userProfile.longitude,
                    targetProfile.latitude,
                    targetProfile.longitude
                ) : 0;
                let render = await target.profile.render(user.profile, distance);
                bot.sendMessage({
                    peer_id: user.id,
                    message: render.text,
                    attachment: render.photo,
                    keyboard: Keyboard.builder()
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
                        label: 'Моя анкета',
                        payload: { back: true },
                        color: Keyboard.SECONDARY_COLOR
                    })
                });
                scene.payload.target = target;
            }
        },
        async (message, scene) => {
            let payload = message.messagePayload;
            if (payload?.like) {
                let target: User = users.get(scene.payload.target.id);
                target.viewRequest(scene.user);
            } else if (payload?.back) {
                users.get(scene.user.id.toString()).setScene(ProfileMainScene(scene.payload));
                return;
            }
            scene.retry();
        }
    ));
}