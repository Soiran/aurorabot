import Scene from '../../scene';
import ProfileViewScene from './view';
import { bot } from '../../index';
import { Keyboard } from 'vk-io';
import { Profile } from '../../types';


export default class ProfileCreateScene extends Scene {
    constructor(saved?: Profile) {
        super(
            async (scene) => {
                let response = await bot.api.users.get({
                    user_id: scene.user.id
                });
                let firstName = saved?.name || response[0].first_name;
                scene.data.name = firstName;
                bot.sendMessage({
                    message: 'Как будем тебя звать?',
                    peer_id: scene.user.id,
                    keyboard: Keyboard.builder().textButton({
                        label: firstName,
                        color: Keyboard.SECONDARY_COLOR
                    })
                });
            },
            [
                async (message, scene) => {
                    let name = message.text;
                    if (!name) {
                        bot.sendMessage({
                            message: 'Пожалуйста, укажи имя.',
                            peer_id: scene.user.id,
                            keyboard: Keyboard.builder().textButton({
                                label: scene.data.name,
                                color: Keyboard.SECONDARY_COLOR
                            })
                        });
                        return;
                    }
                    let regexp = new RegExp('^[A-Za-z0-9 _]*[A-Za-z0-9][A-Za-z0-9 _]*$', 'g');
                    let regexpTest = regexp.test(name);
                    regexp.test(''); // dump
                    if (regexpTest && name.length <= 64) {
                        bot.sendMessage({
                            message: 'Сколько тебе лет?',
                            peer_id: scene.user.id,
                            keyboard: saved?.age ? Keyboard.builder().textButton({
                                label: saved?.age.toString(),
                                color: Keyboard.SECONDARY_COLOR
                            }) : null
                        });
                        scene.next();
                    } else {
                        bot.sendMessage({
                            message: 'Имя может содержать только буквы, цифры и пробелы и не иметь длину больше 64 символов.',
                            peer_id: scene.user.id,
                            keyboard: Keyboard.builder().textButton({
                                label: scene.data.name,
                                color: Keyboard.SECONDARY_COLOR
                            })
                        });
                    }
                },
                async (message, scene) => {
                    let age = message.text;
                    if (!age) {
                        bot.sendMessage({
                            message: 'Пожалуйста, укажи возраст.',
                            peer_id: scene.user.id,
                            keyboard: saved?.age ? Keyboard.builder().textButton({
                                label: saved?.age.toString(),
                                color: Keyboard.SECONDARY_COLOR
                            }) : null
                        });
                        return;
                    }
                    let ageNumber = parseInt(age);
                    if (ageNumber && ageNumber > 0) {
                        let keyboard = Keyboard.builder().locationRequestButton({});
                        bot.sendMessage({
                            message: 'Укажи свой город или отправь текущее местоположение.',
                            peer_id: scene.user.id,
                            keyboard: saved?.city ? keyboard.textButton({
                                label: saved?.city,
                                color: Keyboard.SECONDARY_COLOR
                            }) : keyboard
                        });
                        scene.next();
                    } else {
                        bot.sendMessage({
                            message: 'Возраст должен быть целым положительным числом, отличным от нуля.',
                            peer_id: scene.user.id,
                            keyboard: saved?.age ? Keyboard.builder().textButton({
                                label: saved?.age.toString(),
                                color: Keyboard.SECONDARY_COLOR
                            }) : null
                        });
                    }
                },
                async (message, scene) => {
                    console.log(message);
                }
            ]
        );
    }
}