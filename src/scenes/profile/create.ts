import * as download from 'image-downloader';
import * as shell from 'shelljs';
import Scene from '../../scene';
import ProfileViewScene from './view';
import config from '../../../config';
import { bot } from '../../index';
import { Keyboard, PhotoAttachment } from 'vk-io';
import { Profile, ProfileRender } from '../../types';
import User from '../../controllers/user.controller';
import ProfileController from '../../controllers/profile.controller';


export const CreateScene = (payload = null) => {
    return new Scene(payload).ask(
        async (scene, options) => {
            let response = await bot.api.users.get({
                user_id: scene.user.id
            });
            let firstName = payload?.name || response[0].first_name;
            scene.payload.name = firstName;
            bot.sendMessage({
                message: options?.phrase || 'Как будем тебя звать?',
                peer_id: scene.user.id,
                keyboard: Keyboard.builder().textButton({
                    label: firstName,
                    color: Keyboard.SECONDARY_COLOR
                }).oneTime()
            });
        },
        (message, scene) => {
            let name = message.text;
            if (!name) {
                scene.retry({
                    phrase: 'Пожалуйста, укажи имя.'
                });
                return;
            }
            let regexp = new RegExp('^[А-Яа-яA-Za-z0-9 _]*[А-Яа-яA-Za-z0-9][А-Яа-яA-Za-z0-9 _]*$', 'g');
            let regexpTest = regexp.test(name);
            regexp.test(''); // dump
            if (regexpTest && name.length <= 64) {
                scene.payload.name = name;
                scene.next();
            } else {
                scene.retry({
                    phrase: 'Имя может содержать только буквы, цифры и пробелы и не иметь длину больше 64 символов.'
                });
            }
        }
    ).ask(
        async (scene, options) => {
            bot.sendMessage({
                message: options?.phrase || 'Сколько тебе лет?',
                peer_id: scene.user.id,
                ...payload?.age && { keyboard: Keyboard.builder().textButton({
                    label: payload?.age.toString(),
                    color: Keyboard.SECONDARY_COLOR
                }).oneTime() }
            });
        },
        (message, scene) => {
            let age = message.text;
            if (!age) {
                scene.retry({
                    phrase: 'Пожалуйста, укажи возраст.'
                });
                return;
            }
            let ageNumber = parseInt(age);
            if (ageNumber && ageNumber > 0) {
                scene.payload.age = age;
                scene.next();
            } else {
                scene.retry({
                    phrase: 'Возраст должен быть целым положительным числом, отличным от нуля.'
                });
            }
        }
    ).ask(
        async (scene, options) => {
            let geoKeyboard = Keyboard.builder().locationRequestButton({}).oneTime();
            bot.sendMessage({
                message: options?.phrase || 'Укажи свой город или отправь текущее местоположение.',
                peer_id: scene.user.id,
                keyboard: payload?.city ? geoKeyboard.textButton({
                    label: payload?.city,
                    color: Keyboard.SECONDARY_COLOR
                }) : geoKeyboard
            });
        },
        (message, scene) => {
            let geo = message.geo;
            if (!geo) {
                scene.retry();
                return;
            }
            scene.payload.geo = geo;
            if (!geo.place) {
                scene.next();
            } else {
                scene.shift(2);
            }
        }
    ).ask(
        async (scene, options) => {
            bot.sendMessage({
                message: 'Не могу определить адрес этого местоположения. Точно хочешь оставить его?',
                peer_id: scene.user.id,
                keyboard: Keyboard.builder().textButton({
                    label: 'Выбрать другое',
                    color: Keyboard.PRIMARY_COLOR
                }).textButton({
                    label: 'Да',
                    color: Keyboard.SECONDARY_COLOR
                }).oneTime()
            });
        },
        (message, scene) => {
            if (message.text === 'Да') {
                scene.next();
                return;
            } else {
                scene.back();
                return;
            }
        }
    ).ask(
        async (scene, options) => {
            bot.sendMessage({
                message: options?.phrase || 'Определимся с твоим полом.',
                peer_id: scene.user.id,
                keyboard: Keyboard.builder().textButton({
                    label: 'Я парень',
                    payload: { gender: 0 },
                    color: Keyboard.SECONDARY_COLOR
                }).textButton({
                    label: 'Я девушка',
                    payload: { gender: 1 },
                    color: Keyboard.SECONDARY_COLOR
                }).textButton({
                    label: 'Другое',
                    payload: { gender: 2 },
                    color: Keyboard.SECONDARY_COLOR
                }).oneTime()
            });
        },
        (message, scene) => {
            let gender = message.messagePayload?.gender;
            if (gender === undefined) {
                scene.retry({
                    phrase: 'Пожалуйста, укажи свой пол.'
                });
                return;
            }
            scene.payload.gender = gender;
            scene.next();
        }
    ).ask(
        async (scene, options) => {
            bot.sendMessage({
                message: options?.phrase || 'Кого будем искать?',
                peer_id: scene.user.id,
                keyboard: Keyboard.builder().textButton({
                    label: 'Парней',
                    payload: { searchGender: 0 },
                    color: Keyboard.SECONDARY_COLOR
                }).textButton({
                    label: 'Девушек',
                    payload: { searchGender: 1 },
                    color: Keyboard.SECONDARY_COLOR
                }).textButton({
                    label: 'Всех',
                    payload: { searchGender: 2 },
                    color: Keyboard.SECONDARY_COLOR
                }).oneTime()
            });
        },
        (message, scene) => {
            let searchGender = message.messagePayload?.searchGender;
            if (!searchGender) {
                scene.retry({
                    phrase: 'Пожалуйста, укажи того, кого хочешь найти.'
                });
                return;
            }
            scene.payload.searchGender = searchGender;
            scene.next();
        }
    ).ask(
        async (scene, options) => {
            bot.sendMessage({
                message: options?.phrase || 'Расскажи о себе и своих интересах. Хорошее описание поможет найти подходящих тебе людей.',
                peer_id: scene.user.id,
                ...payload?.description && { keyboard: Keyboard.builder().textButton({
                    label: 'Оставить текущее',
                    payload: {
                       leaveCurrent: true 
                    },
                    color: Keyboard.SECONDARY_COLOR
                }).oneTime() }
            });
        },
        (message, scene) => {
            let description = message.text;
            let leaveCurrent = message.messagePayload;
            if (leaveCurrent) {
                scene.next();
                return;
            }
            if (!description) {
                scene.retry({
                    phrase: 'Пожалуйста, расскажи о себе.'
                });
                return;
            }
            scene.payload.description = description;
            scene.next();
        }
    ).ask(
        async (scene, options) => {
            let keyboard = Keyboard.builder().textButton({
                label: 'Не добавлять теги',
                payload: {
                   withoutTags: true
                },
                color: Keyboard.SECONDARY_COLOR
            }).oneTime();
            bot.sendMessage({
                message: options?.phrase || 'В добавок к твоему описанию помогут теги, строго определяющие твои предрасположенности и интересы. Укажи их через пробел.',
                peer_id: scene.user.id,
                keyboard: payload?.description ? keyboard.textButton({
                    label: 'Оставить текущие',
                    payload: {
                       leaveCurrent: true
                    },
                    color: Keyboard.SECONDARY_COLOR
                }).oneTime() : keyboard
            });
        },
        (message, scene) => {
            let tagsString = message.text;
            let payload = message.messagePayload;
            if (payload?.withoutTags) {
                scene.payload.tags = [];
                scene.next();
                return;
            }
            if (payload?.leaveCurrent) {
                scene.next();
                return;
            }
            if (!tagsString) {
                scene.retry({
                    phrase: 'Пожалуйста, укажи теги через пробел.'
                });
                return;
            }
            let regexp = new RegExp('^[А-Яа-яA-Za-z0-9 _]*[А-Яа-яA-Za-z0-9][А-Яа-яA-Za-z0-9 _]*$', 'g');
            let regexpTest = regexp.test(tagsString);
            regexp.test(''); // dump
            if (regexpTest) {
                let tags = tagsString.split(/\s/g);
                if (tags.length > 16) {
                    scene.retry({
                        phrase: 'Максимальное количество тегов, которых ты можешь указать - 16.'
                    });
                } else {
                    scene.payload.tags = tags;
                    scene.next();
                }
            } else {
                scene.retry({
                    phrase: 'Теги могут содержать только буквы и цифры, будьте внимательны.'
                });
            }
        }
    ).ask(
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
                keyboard: payload?.photo ? keyboard.textButton({
                    label: 'Оставить текущую',
                    payload: {
                       leaveCurrent: true
                    },
                    color: Keyboard.SECONDARY_COLOR
                }).oneTime() : keyboard
            });
        },
        async (message, scene) => {
            let photos: any[] = message.attachments.filter(a => a instanceof PhotoAttachment);
            let payload = message.messagePayload;
            let controller = new User(scene.user.id);
            let photoDir = `${config.sourceDir}\\db\\photos\\${scene.user.id}`;
            shell.mkdir('-p', photoDir);
            if (payload?.import) {
                const [ response ] = await bot.api.users.get({
                    user_id: scene.user.id,
                    fields: [ 'has_photo', 'photo_max_orig' ]
                });
                if (!response.has_photo) {
                    scene.retry({
                        phrase: 'Упс... На данный момент у твоего профиля нет фото, поэтому лучше отправить фото сообщением.'
                    });
                } else {
                    scene.payload.photo = true;
                    await controller.profile.deletePhoto();
                    let photoUrl = response.photo_max_orig;
                    message.send('Загружаем фотографию...');
                    await download.image({
                        url: photoUrl,
                        dest: photoDir,
                        dir: photoDir
                    });
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
                    scene.payload.photo = true;
                    message.send('Загружаем фотографию...');
                    await download.image({
                        url: photos[0].largeSizeUrl,
                        dest: photoDir,
                        dir: photoDir
                    });
                }
            }
            message.send('Сохраняем твою анкету...');
            let profile: Profile = {
                id: scene.user.id,
                active: true,
                name: scene.payload.name,
                age: scene.payload.age,
                tags: scene.payload.tags,
                description: scene.payload.description,
                city: scene.payload.geo?.place?.city || 'Мир',
                latitude: scene.payload.geo.latitude,
                longitude: scene.payload.geo.longitude,
                photo: scene.payload.photo,
                likes: scene.payload.likes || 0,
                radius: scene.payload.radius || 100000,
                gender: scene.payload.gender,
                searchGender: scene.payload.searchGender
            };
            await controller.profile.init(profile);
            message.send('Готово!');
            let photo = await bot.uploadFolder(scene.user.id, photoDir);
            message.send(ProfileController.profileRenderer(profile as ProfileRender), {
                attachment: photo
            });
        }
    );
}