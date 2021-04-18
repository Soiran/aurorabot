import { Keyboard, PhotoAttachment } from 'vk-io';

import { bot, users } from '../../../..';
import User from '../../../../controllers/user.controller';
import Frame from '../../../../frame';
import ProfileMainScene from '../../main';


export default new Frame(
    async (scene, options) => {
        let keyboard = Keyboard.builder().textButton({
            label: 'Импортировать из профиля',
            payload: {
               import: true
            },
            color: Keyboard.SECONDARY_COLOR
        }).oneTime();
        bot.sendMessage({
            message: options?.phrase || 'Ну и напоследок, самое главное - отправь мне фото для своей анкеты.',
            peer_id: scene.user.id,
            keyboard: scene.payload?.photo_id ? keyboard.textButton({
                label: 'Оставить текущую',
                payload: {
                   leaveCurrent: true
                },
                color: Keyboard.SECONDARY_COLOR
            }).oneTime() : keyboard
        });
    },
    async (message, scene) => {
        let profileController = new User(scene.user.id).profile;
        let photos: any[] = message.attachments.filter(a => a instanceof PhotoAttachment);
        let payload = message.messagePayload;
        let photoUrl: string;
        if (payload?.import) {
            const [ response ] = await bot.api.users.get({
                user_id: scene.user.id,
                fields: [ 'has_photo', 'photo_max_orig' ]
            });
            if (!response.has_photo) {
                scene.retry({
                    phrase: 'Упс... На данный момент у твоего профиля нет фото, поэтому лучше отправить фото сообщением.'
                });
                return;
            } else {
                photoUrl = response.photo_max_orig;
            }
        } else {
            if (!photos.length) {
                if (!payload?.leaveCurrent) {
                    scene.retry({
                        phrase: 'Пожалуйста, отправь мне фото для анкеты.'
                    });
                    return;
                }
            } else {
                photoUrl = photos[0].largeSizeUrl;
            }
        }
        if (photoUrl) {
            let attachment: PhotoAttachment = await bot.uploadPhoto(photoUrl);
            profileController.edit({ photo_id: attachment.toString() });
        }
        users[scene.user.id].setScene(ProfileMainScene());
    }
);