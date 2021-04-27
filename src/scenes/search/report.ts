import { Keyboard } from 'vk-io';

import { bot } from '../..';
import User from '../../controllers/user.controller';
import Frame from '../../models/frame';
import Scene from '../../models/scene';
import { ProfileView, Response } from '../../typings/global';
import messageValidator from '../../validators/search/message';
import SearchMainScene from './main';


export default function ReportScene(payload?) {
    return new Scene('Report', payload).add(new Frame(
        async scene => {
            if (scene.user.canReport) {
                bot.sendMessage({
                    peer_id: scene.user.id,
                    message: 'Напиши жалобу для пользователя или выбери один из пунктов нарушения ✍🏻\n1. Порнография\n2. Реклама\n3. Мошенничество\n4. Призыв к незаконным действиям',
                    keyboard: Keyboard.builder()
                    .textButton({
                        label: '1',
                        payload: { item: true, porn: true },
                        color: Keyboard.PRIMARY_COLOR
                    })
                    .textButton({
                        label: '2',
                        payload: { item: true, ad: true },
                        color: Keyboard.PRIMARY_COLOR
                    })
                    .textButton({
                        label: '3',
                        payload: { item: true, scam: true },
                        color: Keyboard.PRIMARY_COLOR
                    })
                    .textButton({
                        label: '4',
                        payload: { item: true, call: true },
                        color: Keyboard.PRIMARY_COLOR
                    }).row()
                    .textButton({
                        label: 'Продолжить поиск',
                        payload: { back: true },
                        color: Keyboard.SECONDARY_COLOR
                    })
                });
            } else {
                bot.sendMessage({
                    peer_id: scene.user.id,
                    message: 'За эти 24 часа вы отправили достаточно жалоб, доверьтесь остальным 🤝🏻',
                    keyboard: Keyboard.builder()
                    .textButton({
                        label: 'Продолжить поиск',
                        payload: { back: true },
                        color: Keyboard.SECONDARY_COLOR
                    })
                });
            }
            
        },
        async (message, scene) => {
            let payload = message.messagePayload;
            let reportText: string;
            if (payload?.back) {
                scene.user.setScene(SearchMainScene());
                return;
            }
            if (payload?.item) {
                if (payload?.porn) {
                    reportText = 'Порнография';
                } else if (payload?.ad) {
                    reportText = 'Реклама';
                } else if (payload?.scam) {
                    reportText = 'Мошенничество';
                } else if (payload?.call) {
                    reportText = 'Призыв к незаконным действиям';
                }
            } else {
                reportText = message.text;
                let response = messageValidator(reportText);
                if (response === Response.NO_VALUE) {
                    scene.retry();
                    return;
                } else if (response === Response.OUT_OF_RANGE) {
                    scene.retry({
                        phrase: 'Длина текста жалобы не должна быть меньше трёх и больше 256 символов в длину.'
                    });
                    return;
                }
            }
            let found: User = scene.payload.found;
            found.notify({
                controller: scene.user,
                type: ProfileView.REPORT,
                message: reportText
            });
            scene.user.setScene(SearchMainScene(await scene.user.profile.data()));
        }
    ));
}