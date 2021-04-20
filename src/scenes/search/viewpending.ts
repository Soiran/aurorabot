import { Keyboard } from 'vk-io';

import { bot, users } from '../..';
import Frame from '../../models/frame';
import Scene from '../../models/scene';
import SearchMainScene from './main';


const declineLikes = (count: number): string => {
    let s = count.toString();
    let l = parseInt(s[s.length - 1]);
    return l === 1 ? 'человеку' : 'людям';
}


export default function ViewPendingScene(payload?) {
    return new Scene(payload).add(new Frame(
        async scene => {
            let count = scene.user.viewStack.size + scene.user.mutualStack.size;
            bot.sendMessage({
                peer_id: scene.user.id,
                message: count === 1 ? `Тебя кто-то лайкнул, показать анкету?` : `Тебя лайкнули ${count} ${declineLikes(count)}, показать их анкеты?`,
                keyboard: Keyboard.builder().textButton({
                    label: '👍',
                    color: Keyboard.POSITIVE_COLOR
                })
            });
        },
        async (message, scene) => {
            users.get(scene.user.id).setScene(SearchMainScene(scene.payload));
        }
    ));
}