import { Keyboard } from 'vk-io';

import { bot, users } from '../../../..';
import Frame from '../../../../frame';
import ProfileMainScene from '../../../profile/main';


export default new Frame(
    async (scene, options) => {
        bot.sendMessage({
            message: options?.phrase || 
            'Сейчас есть два режима поиска людей:\n\
            1. Локальный - анкеты подбираются на основе твоего местоположения или города.\n\
            2. Глобальный - анкеты подбираются случайным образом со всего мира\n\nЧто выберем?',
            peer_id: scene.user.id,
            keyboard: Keyboard.builder().textButton({
                label: 'Локальный',
                payload: { searchMode: 0 },
                color: Keyboard.PRIMARY_COLOR
            }).textButton({
                label: 'Глобальный',
                payload: { searchMode: 1 },
                color: Keyboard.PRIMARY_COLOR
            }).oneTime()
        });
    },
    (message, scene) => {
        let searchMode = message.messagePayload?.searchMode;
        let profileController = scene.user.profile;
        if (searchMode === undefined) {
            scene.retry();
        } else {
            profileController.edit({ search_mode: searchMode });
            users[scene.user.id].setScene(ProfileMainScene());
        }
    }
);