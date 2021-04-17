/**
 * Entry point to the project config.
 */
define("config", ["require", "exports", "dotenv"], function (require, exports, dotenv) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    dotenv.config({ path: __dirname + '/.env' });
    exports.default = Object.assign(process.env, { sourceDir: __dirname });
});
define("src/utils/cl", ["require", "exports", "stringifier", "colors"], function (require, exports, stringifier_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const timeFormat = function (date) {
        return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}.${date.getMilliseconds()}`;
    };
    class Logger {
        alias;
        constructor(alias) {
            this.alias = alias;
        }
        log(message, type) {
            if (typeof message !== 'string') {
                message = stringifier_1.default.stringify(message, {
                    intend: '    ',
                    maxDepth: 3
                });
            }
            let time = timeFormat(new Date()).gray;
            let alias = this.alias.bgWhite.black;
            if (type) {
                switch (type) {
                    case 'info':
                        alias = this.alias.bgBlue;
                        break;
                    case 'warn':
                        alias = this.alias.bgYellow;
                        break;
                    case 'error':
                        alias = this.alias.bgRed;
                        break;
                    case 'success':
                        alias = this.alias.bgGreen;
                        break;
                }
            }
            console.log(`${time} ${alias}: ${message}`);
        }
    }
    exports.default = Logger;
});
define("src/controllers/vk.controller", ["require", "exports", "src/utils/cl", "vk-io"], function (require, exports, cl_1, vk_io_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class VKController {
        controller;
        logger;
        constructor(token) {
            this.controller = new vk_io_1.VK({
                token: token,
                apiRequestMode: 'burst',
                apiMode: 'parallel'
            });
            this.logger = new cl_1.default('VKController');
        }
        get api() {
            return this.controller.api;
        }
        get upload() {
            return this.controller.upload;
        }
        get updates() {
            return this.controller.updates;
        }
        async startUpdates(callback) {
            await this.controller.updates.start();
            if (callback)
                callback();
            this.logger.log('Listening to the longpoll updates.', 'info');
        }
        async sendMessage(params) {
            await this.api.messages.send(Object.assign(params, {
                random_id: Math.floor(Math.random() * 25012005)
            }));
        }
        async uploadPhoto(value) {
            let attachment = await this.controller.upload.messagePhoto({
                peer_id: 0,
                source: {
                    value: value
                }
            });
            return attachment;
        }
        async uploadDocument(value) {
            let attachment = await this.controller.upload.messageDocument({
                peer_id: 0,
                source: {
                    value: value
                }
            });
            return attachment;
        }
    }
    exports.default = VKController;
});
define("src/controllers/db.controller", ["require", "exports", "src/utils/cl", "pg"], function (require, exports, cl_2, pg_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class DBController {
        client;
        logger;
        constructor(connectionURL) {
            this.client = new pg_1.Client(connectionURL);
            this.logger = new cl_2.default('DBController');
        }
        async connect(callback) {
            await this.client.connect();
            if (callback)
                callback();
            this.logger.log('Connected to the PostgreSQL.', 'info');
        }
        async end() {
            await this.client.end();
            this.logger.log('Disconnected from the PostgreSQL.', 'info');
        }
        async query(queryString, values) {
            let response = await this.client.query(queryString, values);
            return response;
        }
        async insert(table, keyValue) {
            let keys = Object.keys(keyValue);
            let values = keys.map(key => keyValue[key]);
            await this.client.query(`INSERT INTO ${table} (${keys.join(', ')}) VALUES (${keys.map((_, i) => `\$${i + 1}`).join(', ')})`, values);
        }
        async select(fields, table, condition) {
            let response = await this.client.query(`SELECT ${fields} FROM ${table}${condition ? ` WHERE ${condition}` : ''}`);
            return response.rows;
        }
        async update(table, keyValue, condition, returning) {
            let keys = Object.keys(keyValue);
            let values = keys.map(key => keyValue[key]);
            let conditionForm = condition ? ` WHERE ${condition}` : '';
            let returningForm = returning ? ` RETURNING ${returning}` : '';
            await this.client.query(`UPDATE ${table} SET ${keys.map((k, i) => `${k}=\$${i + 1}`).join(', ')}${conditionForm}${returningForm}`, values);
        }
        async delete(table, condition) {
            await this.client.query(`DELETE FROM ${table}${condition ? ` WHERE ${condition}` : ''}`);
        }
    }
    exports.default = DBController;
});
define("src/frame", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Frame {
        enterCallback;
        listenCallback;
        constructor(enterCallback, listenCallback) {
            this.enterCallback = enterCallback;
            this.listenCallback = listenCallback;
        }
    }
    exports.default = Frame;
});
define("src/scene", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Scene {
        user;
        frames;
        frameIndex;
        payload;
        constructor(payload, frames) {
            frames ? this.frames = frames : this.frames = new Array();
            payload ? this.payload = payload : this.payload = {};
            this.frameIndex = 0;
        }
        get currentFrame() {
            return this.frames[this.frameIndex];
        }
        enterCurrentFrame(options = null) {
            let frame = this.currentFrame;
            if (frame.enterCallback) {
                frame.enterCallback(this, options);
            }
        }
        add(frame) {
            return new Scene(this.payload, this.frames.concat([frame]));
        }
        listenMessage(message) {
            this.frames[this.frameIndex].listenCallback(message, this);
        }
        next(options = null) {
            this.frameIndex++;
            this.enterCurrentFrame(options);
        }
        back(options = null) {
            this.frameIndex--;
            this.enterCurrentFrame(options);
        }
        goto(index, options = null) {
            this.frameIndex = index;
            this.enterCurrentFrame(options);
        }
        shift(count, options = null) {
            this.frameIndex += count;
            this.enterCurrentFrame(options);
        }
        retry(options = null) {
            this.enterCurrentFrame(options);
        }
        end() {
            this.user.scene = null;
        }
    }
    exports.default = Scene;
});
define("src/utils/date", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const months = {
        1: 'января',
        2: 'февраля',
        3: 'марта',
        4: 'апреля',
        5: 'мая',
        6: 'июня',
        7: 'июля',
        8: 'августа',
        9: 'сентября',
        10: 'октября',
        11: 'ноября',
        12: 'декабря'
    };
    function date(unixTime) {
        let now = new Date();
        let dateObject = new Date(+unixTime);
        return `${dateObject.getDate()} ${months[dateObject.getDay()]}${now.getFullYear() === dateObject.getFullYear() ? ` ${now.getFullYear()} г.` : ''}`;
    }
    exports.default = date;
});
define("src/controllers/profile.controller", ["require", "exports", "src/utils/date", "src/index"], function (require, exports, date_1, __1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const declineDistance = (distance) => {
        let s = distance.toString();
        let l = parseInt(s[s.length - 1]);
        let w = distance >= 1000 ? 'километр' : 'метр';
        distance = distance >= 1000 ? Math.round(distance / 1000) : distance;
        return `${distance} ${l === 1 ? w : (l >= 5 || l === 0 ? w + 'ов' : w + 'а')}`;
    };
    const declineAge = (age) => {
        let s = age.toString();
        let l = parseInt(s[s.length - 1]);
        return `${age} ${l === 0 ? 'лет' : (l === 1 ? 'год' : (l < 5 ? 'года' : 'лет'))}`;
    };
    class ProfileController {
        id;
        constructor(id) {
            this.id = id;
        }
        async render(viewer, distance, revealAnonymous) {
            let viewerData = await viewer.data();
            let profileData = await this.data();
            let renderString = '';
            if (viewerData.rank >= 2) {
                renderString += `Страница: vk.com/id${profileData.id}\n`;
                renderString += `Первое появление: ${(0, date_1.default)(profileData.created)}\n`;
                renderString += `Последняя активность: ${(0, date_1.default)(profileData.created)}\n`;
                renderString += `Редактировано: ${(0, date_1.default)(profileData.created)}\n`;
                renderString += `Ищет: ${profileData.search_gender ? (profileData.search_gender > 1 ? 'всех' : 'девушек') : 'парней'}\n`;
                renderString += `Режим поиска: ${profileData.search_mode ? 'глобальный' : 'локальный'}\n`;
                renderString += `Лайков: ${profileData.likes}\n`;
                renderString += `Репортов: ${profileData.reports}\n\n`;
            }
            if (profileData.anonymous && !revealAnonymous) {
                renderString += `🏴 Аноним\n`;
            }
            else {
                renderString += `${profileData.gender ? (profileData.gender > 1 ? '🏳️' : '🙍‍') : '🙍‍♂‍'} ${profileData.name}, ${declineAge(profileData.age)}, ${distance ? declineDistance(distance) : profileData.city}\n`;
            }
            renderString += `${profileData.description}\n`;
            renderString += profileData.tags.map(t => '#' + t).join(', ');
            return {
                text: renderString,
                photo: profileData.photo_id
            };
        }
        async exists() {
            let response = await __1.db.select('*', 'profile', `id = ${this.id}`);
            return response.length > 0;
        }
        async init(profile) {
            await __1.db.insert('profile', profile);
        }
        async update(profile) {
            await __1.db.delete('profile', `id = ${this.id}`);
            await this.init(profile);
        }
        async data() {
            let response = await __1.db.select('*', 'profile', `id = ${this.id}`);
            return response[0];
        }
        async get(field) {
            let response = await __1.db.select(field, 'profile', `id = ${this.id}`);
            return response[0].field;
        }
        async edit(update) {
            await __1.db.update('profile', update, `id = ${this.id}`);
        }
    }
    exports.default = ProfileController;
    ;
});
define("src/controllers/user.controller", ["require", "exports", "src/controllers/profile.controller"], function (require, exports, profile_controller_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class User {
        id;
        profile;
        scene;
        constructor(id) {
            this.id = id;
            this.profile = new profile_controller_1.default(this.id);
        }
        async exists() {
            let response = await this.profile.exists();
            return response;
        }
        setScene(scene) {
            this.scene = scene;
            scene.user = this;
            scene.enterCurrentFrame();
        }
    }
    exports.default = User;
});
define("src/codes", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Response = void 0;
    var Response;
    (function (Response) {
        Response[Response["VALID"] = 0] = "VALID";
        Response[Response["VALID_CITY"] = 1] = "VALID_CITY";
        Response[Response["VALID_LOCATION"] = 2] = "VALID_LOCATION";
        Response[Response["UNKNOWN_LOCATION"] = 3] = "UNKNOWN_LOCATION";
        Response[Response["NO_VALUE"] = 4] = "NO_VALUE";
        Response[Response["TOO_LONG"] = 5] = "TOO_LONG";
        Response[Response["TOO_SHORT"] = 6] = "TOO_SHORT";
        Response[Response["OUT_OF_RANGE"] = 7] = "OUT_OF_RANGE";
        Response[Response["FORBIDDEN_SYMBOLS"] = 8] = "FORBIDDEN_SYMBOLS";
        Response[Response["UNKNOWN"] = 9] = "UNKNOWN";
        Response[Response["NOT_FOUND"] = 10] = "NOT_FOUND";
        Response[Response["NOT_VALID"] = 11] = "NOT_VALID";
        Response[Response["INCORRECT"] = 12] = "INCORRECT";
    })(Response = exports.Response || (exports.Response = {}));
    ;
});
define("src/validators/profile/age", ["require", "exports", "src/codes"], function (require, exports, codes_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function ageValidator(age) {
        if (!age) {
            return codes_1.Response.NO_VALUE;
        }
        let ageNumber = parseInt(age);
        if (ageNumber && ageNumber > 0) {
            return codes_1.Response.VALID;
        }
        else {
            return codes_1.Response.INCORRECT;
        }
    }
    exports.default = ageValidator;
});
define("src/frames/profile/create/age", ["require", "exports", "vk-io", "src/index", "src/codes", "src/frame", "src/validators/profile/age"], function (require, exports, vk_io_2, __2, codes_2, frame_1, age_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = new frame_1.default(async (scene, options) => {
        __2.bot.sendMessage({
            message: options?.phrase || 'Сколько тебе лет?',
            peer_id: scene.user.id,
            ...scene.payload?.age && { keyboard: vk_io_2.Keyboard.builder().textButton({
                    label: scene.payload?.age.toString(),
                    color: vk_io_2.Keyboard.SECONDARY_COLOR
                }).oneTime() }
        });
    }, (message, scene) => {
        let age = message.text;
        let response = (0, age_1.default)(age);
        if (response === codes_2.Response.NO_VALUE) {
            scene.retry({
                phrase: 'Пожалуйста, укажи возраст.'
            });
        }
        else if (response === codes_2.Response.OUT_OF_RANGE) {
            scene.retry({
                phrase: 'Возраст должен быть целым положительным числом, отличным от нуля.'
            });
        }
        else if (response === codes_2.Response.VALID) {
            scene.payload.age = age;
            scene.next();
        }
    });
});
define("src/validators/profile/description", ["require", "exports", "src/codes"], function (require, exports, codes_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function descriptionValidator(description) {
        if (!description) {
            return codes_3.Response.NO_VALUE;
        }
        if (description.length < 3 || description.length > 512) {
            return codes_3.Response.OUT_OF_RANGE;
        }
        return codes_3.Response.VALID;
    }
    exports.default = descriptionValidator;
});
define("src/frames/profile/create/description", ["require", "exports", "vk-io", "src/index", "src/codes", "src/frame", "src/validators/profile/description"], function (require, exports, vk_io_3, __3, codes_4, frame_2, description_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = new frame_2.default(async (scene, options) => {
        __3.bot.sendMessage({
            message: options?.phrase || 'Расскажи о себе и своих интересах. Хорошее описание поможет найти подходящих тебе людей.',
            peer_id: scene.user.id,
            ...scene.payload?.description && { keyboard: vk_io_3.Keyboard.builder().textButton({
                    label: 'Оставить текущее',
                    payload: {
                        leaveCurrent: true
                    },
                    color: vk_io_3.Keyboard.SECONDARY_COLOR
                }).oneTime() }
        });
    }, (message, scene) => {
        let description = message.text;
        let leaveCurrent = message.messagePayload;
        let response = (0, description_1.default)(description);
        if (leaveCurrent) {
            scene.next();
            return;
        }
        if (response === codes_4.Response.NO_VALUE) {
            scene.retry({
                phrase: 'Пожалуйста, расскажи о себе.'
            });
        }
        else if (response === codes_4.Response.OUT_OF_RANGE) {
            scene.retry({
                phrase: 'Длина описание не должна быть меньше трёх и больше 512 символов в длину.'
            });
        }
        else if (response === codes_4.Response.VALID) {
            scene.payload.description = description;
            scene.next();
        }
    });
});
define("src/frames/profile/create/gender", ["require", "exports", "vk-io", "src/index", "src/frame"], function (require, exports, vk_io_4, __4, frame_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = new frame_3.default(async (scene, options) => {
        __4.bot.sendMessage({
            message: options?.phrase || 'Определимся с твоим полом.',
            peer_id: scene.user.id,
            keyboard: vk_io_4.Keyboard.builder().textButton({
                label: 'Я парень',
                payload: { gender: 0 },
                color: vk_io_4.Keyboard.SECONDARY_COLOR
            }).textButton({
                label: 'Я девушка',
                payload: { gender: 1 },
                color: vk_io_4.Keyboard.SECONDARY_COLOR
            }).textButton({
                label: 'Другое',
                payload: { gender: 2 },
                color: vk_io_4.Keyboard.SECONDARY_COLOR
            }).oneTime()
        });
    }, (message, scene) => {
        let gender = message.messagePayload?.gender;
        if (gender === undefined) {
            scene.retry({
                phrase: 'Пожалуйста, укажи свой пол.'
            });
            return;
        }
        scene.payload.gender = gender;
        scene.next();
    });
});
define("src/controllers/geo.controller", ["require", "exports", "axios"], function (require, exports, axios_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class GeoController {
        static domain = 'http://api.geonames.org/';
        static async search(name) {
            let { data } = await axios_1.default.get(encodeURI(`${GeoController.domain}searchJSON?q=${name}&lang=ru&username=ascentdev`));
            if (data.totalResultsCount === 0) {
                return { exists: false };
            }
            let city = data.geonames[0];
            return {
                exists: true,
                name: city.name,
                latitude: city.lat,
                longitude: city.lng
            };
        }
    }
    exports.default = GeoController;
});
define("src/validators/profile/geo", ["require", "exports", "src/controllers/geo.controller", "src/codes"], function (require, exports, geo_controller_1, codes_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    async function geoValidator(cityName, geo) {
        if (!geo) {
            if (!cityName) {
                return codes_5.Response.NO_VALUE;
            }
            else {
                let city = await geo_controller_1.default.search(cityName);
                if (city.exists) {
                    return codes_5.Response.VALID_CITY;
                }
                else {
                    return codes_5.Response.NOT_FOUND;
                }
            }
        }
        else {
            if (geo.place) {
                return codes_5.Response.VALID_LOCATION;
            }
            else {
                return codes_5.Response.UNKNOWN_LOCATION;
            }
        }
    }
    exports.default = geoValidator;
});
define("src/frames/profile/create/geo", ["require", "exports", "vk-io", "src/index", "src/codes", "src/controllers/geo.controller", "src/frame", "src/validators/profile/geo"], function (require, exports, vk_io_5, __5, codes_6, geo_controller_2, frame_4, geo_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = new frame_4.default(async (scene, options) => {
        let geoKeyboard = vk_io_5.Keyboard.builder().locationRequestButton({}).oneTime();
        __5.bot.sendMessage({
            message: options?.phrase || 'Укажи свой город или отправь текущее местоположение.',
            peer_id: scene.user.id,
            keyboard: scene.payload?.city ? geoKeyboard.textButton({
                label: scene.payload?.city,
                color: vk_io_5.Keyboard.SECONDARY_COLOR
            }) : geoKeyboard
        });
    }, async (message, scene) => {
        let cityName = message.text;
        let geo = message.geo;
        let response = await (0, geo_1.default)(cityName, geo);
        if (response === codes_6.Response.NO_VALUE) {
            scene.retry();
        }
        else if (response === codes_6.Response.VALID_CITY) {
            let city = await geo_controller_2.default.search(cityName);
            scene.payload.geo = {
                coordinates: {
                    latitude: +city.latitude,
                    longitude: +city.longitude
                },
                place: {
                    city: city.name
                }
            };
            scene.next();
        }
        else if (response === codes_6.Response.NOT_FOUND) {
            scene.retry({
                phrase: 'Данного города не существует, попробуй еще раз.'
            });
        }
        else if (response === codes_6.Response.VALID_LOCATION) {
            scene.payload.geo = geo;
            scene.next();
        }
        else if (response === codes_6.Response.UNKNOWN_LOCATION) {
            scene.retry({
                phrase: 'Не могу определить адрес данного местоположения.'
            });
        }
    });
});
define("src/validators/profile/name", ["require", "exports", "src/codes"], function (require, exports, codes_7) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function nameValidator(name) {
        if (!name) {
            return codes_7.Response.NO_VALUE;
        }
        let regexp = new RegExp('^[А-Яа-яA-Za-z0-9 _]*[А-Яа-яA-Za-z0-9][А-Яа-яA-Za-z0-9 _]*$', 'g');
        let regexpTest = regexp.test(name);
        regexp.test(''); // dump
        if (regexpTest && name.length <= 64) {
            return codes_7.Response.VALID;
        }
        else {
            return codes_7.Response.INCORRECT;
        }
    }
    exports.default = nameValidator;
});
define("src/frames/profile/create/name", ["require", "exports", "vk-io", "src/index", "src/codes", "src/frame", "src/validators/profile/name"], function (require, exports, vk_io_6, __6, codes_8, frame_5, name_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = new frame_5.default(async (scene, options) => {
        let response = await __6.bot.api.users.get({
            user_id: scene.user.id
        });
        let firstName = scene.payload?.name || response[0].first_name;
        scene.payload.name = firstName;
        __6.bot.sendMessage({
            message: options?.phrase || 'Как будем тебя звать?',
            peer_id: scene.user.id,
            keyboard: vk_io_6.Keyboard.builder().textButton({
                label: firstName,
                color: vk_io_6.Keyboard.SECONDARY_COLOR
            }).oneTime()
        });
    }, (message, scene) => {
        let name = message.text;
        let response = (0, name_1.default)(name);
        if (response === codes_8.Response.VALID) {
            scene.payload.name = name;
            scene.next();
        }
        else if (response === codes_8.Response.NO_VALUE) {
            scene.retry({
                phrase: 'Пожалуйста, укажи имя.'
            });
        }
        else if (response === codes_8.Response.INCORRECT) {
            scene.retry({
                phrase: 'Имя может содержать только буквы, цифры и пробелы и не иметь длину больше 64 символов.'
            });
        }
    });
});
define("src/frames/profile/create/photo", ["require", "exports", "vk-io", "src/index", "src/frame"], function (require, exports, vk_io_7, __7, frame_6) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = new frame_6.default(async (scene, options) => {
        let keyboard = vk_io_7.Keyboard.builder().textButton({
            label: 'Импортировать из профиля',
            payload: {
                import: true
            },
            color: vk_io_7.Keyboard.SECONDARY_COLOR
        }).oneTime();
        __7.bot.sendMessage({
            message: options?.phrase || 'Ну и напоследок, самое главное - отправь мне фото для своей анкеты.',
            peer_id: scene.user.id,
            keyboard: scene.payload?.photo_id ? keyboard.textButton({
                label: 'Оставить текущую',
                payload: {
                    leaveCurrent: true
                },
                color: vk_io_7.Keyboard.SECONDARY_COLOR
            }).oneTime() : keyboard
        });
    }, async (message, scene) => {
        let photos = message.attachments.filter(a => a instanceof vk_io_7.PhotoAttachment);
        let payload = message.messagePayload;
        let photoUrl;
        if (payload?.import) {
            const [response] = await __7.bot.api.users.get({
                user_id: scene.user.id,
                fields: ['has_photo', 'photo_max_orig']
            });
            if (!response.has_photo) {
                scene.retry({
                    phrase: 'Упс... На данный момент у твоего профиля нет фото, поэтому лучше отправить фото сообщением.'
                });
            }
            else {
                photoUrl = response.photo_max_orig;
            }
        }
        else {
            if (!photos.length) {
                if (!payload?.leaveCurrent) {
                    scene.retry({
                        phrase: 'Пожалуйста, отправь мне фото для анкеты.'
                    });
                    return;
                }
            }
            else {
                photoUrl = photos[0].largeSizeUrl;
            }
        }
        if (photoUrl) {
            let attachment = await __7.bot.uploadPhoto(photoUrl);
            scene.payload.photo_id = attachment.toString();
        }
        scene.next();
    });
});
define("src/frames/profile/edit/age", ["require", "exports", "vk-io", "src/index", "src/codes", "src/controllers/user.controller", "src/frame", "src/scenes/profile/main", "src/validators/profile/age"], function (require, exports, vk_io_8, __8, codes_9, user_controller_1, frame_7, main_1, age_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = new frame_7.default(async (scene, options) => {
        __8.bot.sendMessage({
            message: options?.phrase || 'Укажи мне свой новый возраст.',
            peer_id: scene.user.id,
            ...scene.payload?.age && { keyboard: vk_io_8.Keyboard.builder().textButton({
                    label: scene.payload?.age.toString(),
                    color: vk_io_8.Keyboard.SECONDARY_COLOR
                }).oneTime() }
        });
    }, (message, scene) => {
        let age = message.text;
        let response = (0, age_2.default)(age);
        let profileController = new user_controller_1.default(scene.user.id).profile;
        if (response === codes_9.Response.NO_VALUE) {
            scene.retry({
                phrase: 'Пожалуйста, укажи возраст.'
            });
        }
        else if (response === codes_9.Response.OUT_OF_RANGE) {
            scene.retry({
                phrase: 'Возраст должен быть целым положительным числом, отличным от нуля.'
            });
        }
        else if (response === codes_9.Response.VALID) {
            profileController.edit({ age: parseInt(age) });
            __8.users[scene.user.id].setScene((0, main_1.ProfileMainScene)());
        }
    });
});
define("src/frames/profile/edit/description", ["require", "exports", "vk-io", "src/index", "src/codes", "src/controllers/user.controller", "src/frame", "src/validators/profile/description", "src/scenes/profile/main"], function (require, exports, vk_io_9, __9, codes_10, user_controller_2, frame_8, description_2, main_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = new frame_8.default(async (scene, options) => {
        __9.bot.sendMessage({
            message: options?.phrase || 'Расскажи о себе и своих интересах. Хорошее описание поможет найти подходящих тебе людей.',
            peer_id: scene.user.id,
            ...scene.payload?.description && { keyboard: vk_io_9.Keyboard.builder().textButton({
                    label: 'Оставить текущее',
                    payload: {
                        leaveCurrent: true
                    },
                    color: vk_io_9.Keyboard.SECONDARY_COLOR
                }).oneTime() }
        });
    }, (message, scene) => {
        let description = message.text;
        let leaveCurrent = message.messagePayload;
        let response = (0, description_2.default)(description);
        let profileController = new user_controller_2.default(scene.user.id).profile;
        if (response === codes_10.Response.NO_VALUE) {
            scene.retry({
                phrase: 'Пожалуйста, расскажи о себе.'
            });
        }
        else if (response === codes_10.Response.OUT_OF_RANGE) {
            scene.retry({
                phrase: 'Длина описание не должна быть меньше трёх и больше 512 символов в длину.'
            });
        }
        else if (response === codes_10.Response.VALID) {
            profileController.edit({ description: description });
        }
        if (leaveCurrent || response === codes_10.Response.VALID) {
            __9.users[scene.user.id].setScene((0, main_2.ProfileMainScene)());
        }
    });
});
define("src/frames/profile/edit/gender", ["require", "exports", "vk-io", "src/index", "src/controllers/user.controller", "src/frame", "src/scenes/profile/main"], function (require, exports, vk_io_10, __10, user_controller_3, frame_9, main_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = new frame_9.default(async (scene, options) => {
        __10.bot.sendMessage({
            message: options?.phrase || 'Определимся с твоим полом.',
            peer_id: scene.user.id,
            keyboard: vk_io_10.Keyboard.builder().textButton({
                label: 'Я парень',
                payload: { gender: 0 },
                color: vk_io_10.Keyboard.SECONDARY_COLOR
            }).textButton({
                label: 'Я девушка',
                payload: { gender: 1 },
                color: vk_io_10.Keyboard.SECONDARY_COLOR
            }).textButton({
                label: 'Другое',
                payload: { gender: 2 },
                color: vk_io_10.Keyboard.SECONDARY_COLOR
            }).oneTime()
        });
    }, (message, scene) => {
        let gender = message.messagePayload?.gender;
        let profileController = new user_controller_3.default(scene.user.id).profile;
        if (gender === undefined) {
            scene.retry({
                phrase: 'Пожалуйста, укажи свой пол.'
            });
            return;
        }
        profileController.edit({ gender: gender });
        __10.users[scene.user.id].setScene((0, main_3.ProfileMainScene)());
    });
});
define("src/frames/profile/edit/geo", ["require", "exports", "vk-io", "src/index", "src/codes", "src/controllers/geo.controller", "src/controllers/user.controller", "src/frame", "src/scenes/profile/main", "src/validators/profile/geo"], function (require, exports, vk_io_11, __11, codes_11, geo_controller_3, user_controller_4, frame_10, main_4, geo_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = new frame_10.default(async (scene, options) => {
        let geoKeyboard = vk_io_11.Keyboard.builder().locationRequestButton({}).oneTime();
        __11.bot.sendMessage({
            message: options?.phrase || 'Укажи свой город или отправь текущее местоположение.',
            peer_id: scene.user.id,
            keyboard: scene.payload?.city ? geoKeyboard.textButton({
                label: scene.payload?.city,
                color: vk_io_11.Keyboard.SECONDARY_COLOR
            }) : geoKeyboard
        });
    }, async (message, scene) => {
        let cityName = message.text;
        let geo = message.geo;
        let response = await (0, geo_2.default)(cityName, geo);
        let profileController = new user_controller_4.default(scene.user.id).profile;
        if (response === codes_11.Response.NO_VALUE) {
            scene.retry();
        }
        else if (response === codes_11.Response.VALID_CITY) {
            let city = await geo_controller_3.default.search(cityName);
            profileController.edit({
                city: city.name,
                latitude: +city.latitude,
                longitude: +city.longitude
            });
            __11.users[scene.user.id].setScene((0, main_4.ProfileMainScene)());
        }
        else if (response === codes_11.Response.NOT_FOUND) {
            scene.retry({
                phrase: 'Данного города не существует, попробуй еще раз.'
            });
        }
        else if (response === codes_11.Response.VALID_LOCATION) {
            profileController.edit({
                city: geo.place.city,
                latitude: geo.coordinates.latitude,
                longitude: geo.coordinates.longitude
            });
            __11.users[scene.user.id].setScene((0, main_4.ProfileMainScene)());
        }
        else if (response === codes_11.Response.UNKNOWN_LOCATION) {
            scene.retry({
                phrase: 'Не могу определить адрес данного местоположения.'
            });
        }
    });
});
define("src/frames/profile/edit/name", ["require", "exports", "src/index", "src/codes", "src/controllers/user.controller", "src/frame", "src/scenes/profile/main", "src/validators/profile/name"], function (require, exports, __12, codes_12, user_controller_5, frame_11, main_5, name_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = new frame_11.default(async (scene, options) => {
        let response = await __12.bot.api.users.get({
            user_id: scene.user.id
        });
        let firstName = scene.payload?.name || response[0].first_name;
        scene.payload.name = firstName;
        __12.bot.sendMessage({
            message: options?.phrase || 'Укажи мне свое новое имя.',
            peer_id: scene.user.id
        });
    }, (message, scene) => {
        let name = message.text;
        let response = (0, name_2.default)(name);
        let profileController = new user_controller_5.default(scene.user.id).profile;
        if (response === codes_12.Response.VALID) {
            profileController.edit({ name: name });
            __12.users[scene.user.id].setScene((0, main_5.ProfileMainScene)());
        }
        else if (response === codes_12.Response.NO_VALUE) {
            scene.retry({
                phrase: 'Пожалуйста, укажи имя.'
            });
        }
        else if (response === codes_12.Response.INCORRECT) {
            scene.retry({
                phrase: 'Имя может содержать только буквы, цифры и пробелы и не иметь длину больше 64 символов.'
            });
        }
    });
});
define("src/frames/profile/edit/photo", ["require", "exports", "vk-io", "src/index", "src/controllers/user.controller", "src/frame", "src/scenes/profile/main"], function (require, exports, vk_io_12, __13, user_controller_6, frame_12, main_6) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = new frame_12.default(async (scene, options) => {
        let keyboard = vk_io_12.Keyboard.builder().textButton({
            label: 'Импортировать из профиля',
            payload: {
                import: true
            },
            color: vk_io_12.Keyboard.SECONDARY_COLOR
        }).oneTime();
        __13.bot.sendMessage({
            message: options?.phrase || 'Ну и напоследок, самое главное - отправь мне фото для своей анкеты.',
            peer_id: scene.user.id,
            keyboard: scene.payload?.photo_id ? keyboard.textButton({
                label: 'Оставить текущую',
                payload: {
                    leaveCurrent: true
                },
                color: vk_io_12.Keyboard.SECONDARY_COLOR
            }).oneTime() : keyboard
        });
    }, async (message, scene) => {
        let profileController = new user_controller_6.default(scene.user.id).profile;
        let photos = message.attachments.filter(a => a instanceof vk_io_12.PhotoAttachment);
        let payload = message.messagePayload;
        let photoUrl;
        if (payload?.import) {
            const [response] = await __13.bot.api.users.get({
                user_id: scene.user.id,
                fields: ['has_photo', 'photo_max_orig']
            });
            if (!response.has_photo) {
                scene.retry({
                    phrase: 'Упс... На данный момент у твоего профиля нет фото, поэтому лучше отправить фото сообщением.'
                });
                return;
            }
            else {
                photoUrl = response.photo_max_orig;
            }
        }
        else {
            if (!photos.length) {
                if (!payload?.leaveCurrent) {
                    scene.retry({
                        phrase: 'Пожалуйста, отправь мне фото для анкеты.'
                    });
                    return;
                }
            }
            else {
                photoUrl = photos[0].largeSizeUrl;
            }
        }
        if (photoUrl) {
            let attachment = await __13.bot.uploadPhoto(photoUrl);
            profileController.edit({ photo_id: attachment.toString() });
        }
        __13.users[scene.user.id].setScene((0, main_6.ProfileMainScene)());
    });
});
define("src/validators/profile/tags", ["require", "exports", "src/codes"], function (require, exports, codes_13) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function tagsValidator(tagsString) {
        if (!tagsString) {
            return codes_13.Response.NO_VALUE;
        }
        let regexp = new RegExp('^[А-Яа-яA-Za-z0-9 _]*[А-Яа-яA-Za-z0-9][А-Яа-яA-Za-z0-9 _]*$', 'g');
        let regexpTest = regexp.test(tagsString);
        regexp.test(''); // dump
        if (regexpTest) {
            let tags = tagsString.split(/\s/g);
            if (tags.length > 16) {
                return codes_13.Response.OUT_OF_RANGE;
            }
            else {
                return codes_13.Response.VALID;
            }
        }
        else {
            return codes_13.Response.INCORRECT;
        }
    }
    exports.default = tagsValidator;
});
define("src/frames/profile/edit/tags", ["require", "exports", "vk-io", "src/index", "src/codes", "src/controllers/user.controller", "src/frame", "src/scenes/profile/main", "src/validators/profile/tags"], function (require, exports, vk_io_13, __14, codes_14, user_controller_7, frame_13, main_7, tags_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = new frame_13.default(async (scene, options) => {
        let keyboard = vk_io_13.Keyboard.builder().textButton({
            label: 'Удалить теги',
            payload: {
                withoutTags: true
            },
            color: vk_io_13.Keyboard.SECONDARY_COLOR
        }).oneTime();
        __14.bot.sendMessage({
            message: options?.phrase || 'В добавок к твоему описанию помогут теги, строго определяющие твои предрасположенности и интересы. Укажи их через пробел.',
            peer_id: scene.user.id,
            keyboard: scene.payload?.description ? keyboard.textButton({
                label: 'Оставить текущие',
                payload: {
                    leaveCurrent: true
                },
                color: vk_io_13.Keyboard.SECONDARY_COLOR
            }).oneTime() : keyboard
        });
    }, (message, scene) => {
        let tagsString = message.text;
        let tags = tagsString.split(/\s/g);
        let payload = message.messagePayload;
        let response = (0, tags_1.default)(tagsString);
        let profileController = new user_controller_7.default(scene.user.id).profile;
        if (payload?.withoutTags) {
            profileController.edit({ tags: [] });
        }
        else {
            if (response === codes_14.Response.NO_VALUE) {
                scene.retry({
                    phrase: 'Пожалуйста, укажи теги через пробел.'
                });
            }
            else if (response === codes_14.Response.OUT_OF_RANGE) {
                scene.retry({
                    phrase: 'Максимальное количество тегов, которых ты можешь указать - 16.'
                });
            }
            else if (response === codes_14.Response.INCORRECT) {
                scene.retry({
                    phrase: 'Теги могут содержать только буквы и цифры, будьте внимательны.'
                });
            }
            else if (response === codes_14.Response.VALID) {
                profileController.edit({ tags: tags });
            }
        }
        if (payload?.withoutTags || payload?.leaveCurrent || codes_14.Response.VALID) {
            __14.users[scene.user.id].setScene((0, main_7.ProfileMainScene)());
        }
    });
});
define("src/frames/profile/edit/index", ["require", "exports", "src/frames/profile/edit/age", "src/frames/profile/edit/description", "src/frames/profile/edit/gender", "src/frames/profile/edit/geo", "src/frames/profile/edit/name", "src/frames/profile/edit/photo", "src/frames/profile/edit/tags"], function (require, exports, age_3, description_3, gender_1, geo_3, name_3, photo_1, tags_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.tagsFrame = exports.photoFrame = exports.nameFrame = exports.geoFrame = exports.genderFrame = exports.descriptionFrame = exports.ageFrame = void 0;
    exports.ageFrame = age_3.default;
    exports.descriptionFrame = description_3.default;
    exports.genderFrame = gender_1.default;
    exports.geoFrame = geo_3.default;
    exports.nameFrame = name_3.default;
    exports.photoFrame = photo_1.default;
    exports.tagsFrame = tags_2.default;
});
define("src/scenes/profile/edit", ["require", "exports", "src/scene", "src/index", "vk-io", "src/frames/profile/edit/index", "src/frame"], function (require, exports, scene_1, index_1, vk_io_14, edit_1, frame_14) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ProfileEditScene = void 0;
    const ProfileEditScene = (payload) => {
        return new scene_1.default(payload).add(new frame_14.default(async (scene) => {
            index_1.bot.sendMessage({
                peer_id: scene.user.id,
                message: 'Что отредактируем?\n1 - Имя\n2 - Пол\n3 - Возраст\n4 - Местоположение\n5 - Описание\n6 - Теги\n7 - Фотографию',
                keyboard: vk_io_14.Keyboard.builder()
                    .textButton({
                    label: '1',
                    payload: {
                        goto: 1
                    },
                    color: vk_io_14.Keyboard.SECONDARY_COLOR
                })
                    .textButton({
                    label: '2',
                    payload: {
                        goto: 2
                    },
                    color: vk_io_14.Keyboard.SECONDARY_COLOR
                })
                    .textButton({
                    label: '3',
                    payload: {
                        goto: 3
                    },
                    color: vk_io_14.Keyboard.SECONDARY_COLOR
                }).row()
                    .textButton({
                    label: '4',
                    payload: {
                        goto: 4
                    },
                    color: vk_io_14.Keyboard.SECONDARY_COLOR
                })
                    .textButton({
                    label: '5',
                    payload: {
                        goto: 5
                    },
                    color: vk_io_14.Keyboard.SECONDARY_COLOR
                })
                    .textButton({
                    label: '6',
                    payload: {
                        goto: 6
                    },
                    color: vk_io_14.Keyboard.SECONDARY_COLOR
                }).row()
                    .textButton({
                    label: '7',
                    payload: {
                        goto: 7
                    },
                    color: vk_io_14.Keyboard.SECONDARY_COLOR
                }).oneTime()
            });
        }, async (message, scene) => {
            let payload = message.messagePayload;
            if (payload) {
                scene.goto(payload.goto);
            }
            else {
                scene.retry();
            }
        }))
            .add(edit_1.nameFrame)
            .add(edit_1.genderFrame)
            .add(edit_1.ageFrame)
            .add(edit_1.geoFrame)
            .add(edit_1.descriptionFrame)
            .add(edit_1.tagsFrame)
            .add(edit_1.photoFrame);
    };
    exports.ProfileEditScene = ProfileEditScene;
});
define("src/scenes/profile/main", ["require", "exports", "src/scene", "src/controllers/user.controller", "src/index", "vk-io", "src/scenes/profile/create", "src/frame", "src/scenes/profile/edit"], function (require, exports, scene_2, user_controller_8, index_2, vk_io_15, create_1, frame_15, edit_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ProfileMainScene = void 0;
    const ProfileMainScene = (payload) => {
        return new scene_2.default(payload).add(new frame_15.default(async (scene) => {
            let profileController = await new user_controller_8.default(scene.user.id).profile;
            let render = await profileController.render(profileController, null, true);
            scene.payload.profileController = profileController;
            index_2.bot.sendMessage({
                peer_id: scene.user.id,
                message: `Вот твоя анкета:\n\n${render.text}`,
                attachment: render.photo
            });
            index_2.bot.sendMessage({
                peer_id: scene.user.id,
                message: '1 - Продолжить поиск\n2 - Редактировать\n3 - Настройки поиска\n4 - Заполнить анкету заного',
                keyboard: vk_io_15.Keyboard.builder()
                    .textButton({
                    label: '1',
                    payload: {
                        scene: 'search'
                    },
                    color: vk_io_15.Keyboard.POSITIVE_COLOR
                })
                    .textButton({
                    label: '2',
                    payload: {
                        scene: 'profileEdit'
                    },
                    color: vk_io_15.Keyboard.SECONDARY_COLOR
                })
                    .textButton({
                    label: '3',
                    payload: {
                        scene: 'searchSettings'
                    },
                    color: vk_io_15.Keyboard.SECONDARY_COLOR
                })
                    .textButton({
                    label: '4',
                    payload: {
                        scene: 'profileCreate'
                    },
                    color: vk_io_15.Keyboard.NEGATIVE_COLOR
                }).oneTime()
            });
        }, async (message, scene) => {
            let payload = message.messagePayload;
            if (payload) {
                scene.end();
                switch (payload.scene) {
                    case 'profileCreate':
                        index_2.users[scene.user.id].setScene((0, create_1.ProfileCreateScene)(await scene.payload.profileController.data()));
                        break;
                    case 'profileEdit':
                        index_2.users[scene.user.id].setScene((0, edit_2.ProfileEditScene)(await scene.payload.profileController.data()));
                        break;
                }
            }
            else {
                scene.retry();
            }
        }));
    };
    exports.ProfileMainScene = ProfileMainScene;
});
define("src/frames/profile/create/save", ["require", "exports", "src/index", "src/controllers/user.controller", "src/frame", "src/scenes/profile/main"], function (require, exports, __15, user_controller_9, frame_16, main_8) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = new frame_16.default(async (scene) => {
        let controller = new user_controller_9.default(scene.user.id);
        __15.bot.sendMessage({
            peer_id: scene.user.id,
            text: 'Сохраняю твою анкету...'
        });
        let now = new Date().getTime();
        let profile = {
            id: scene.user.id,
            created: now,
            last_edit: now,
            last_active: now,
            status: 2,
            name: scene.payload.name,
            age: scene.payload.age,
            tags: scene.payload.tags,
            description: scene.payload.description,
            city: scene.payload.geo?.place?.city || 'Мир',
            latitude: scene.payload.geo?.coordinates ? scene.payload.geo?.coordinates?.latitude : scene.payload.geo?.latitude,
            longitude: scene.payload.geo?.coordinates ? scene.payload.geo?.coordinates?.longitude : scene.payload.geo?.longitude,
            photo_id: scene.payload.photo_id,
            likes: scene.payload.likes || 0,
            reports: scene.payload.reports || 0,
            gender: scene.payload.gender,
            search_gender: scene.payload.search_gender,
            search_mode: scene.payload.search_mode || 0,
            anonymous: scene.payload.anonymous || false,
            rank: scene.payload.rank || 0
        };
        await controller.profile.update(profile);
        scene.end();
        __15.users[scene.user.id].setScene((0, main_8.ProfileMainScene)());
    });
});
define("src/frames/profile/create/tags", ["require", "exports", "vk-io", "src/index", "src/codes", "src/frame", "src/validators/profile/tags"], function (require, exports, vk_io_16, __16, codes_15, frame_17, tags_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = new frame_17.default(async (scene, options) => {
        let keyboard = vk_io_16.Keyboard.builder().textButton({
            label: 'Не добавлять теги',
            payload: {
                withoutTags: true
            },
            color: vk_io_16.Keyboard.SECONDARY_COLOR
        }).oneTime();
        __16.bot.sendMessage({
            message: options?.phrase || 'В добавок к твоему описанию помогут теги, строго определяющие твои предрасположенности и интересы. Укажи их через пробел.',
            peer_id: scene.user.id,
            keyboard: scene.payload?.description ? keyboard.textButton({
                label: 'Оставить текущие',
                payload: {
                    leaveCurrent: true
                },
                color: vk_io_16.Keyboard.SECONDARY_COLOR
            }).oneTime() : keyboard
        });
    }, (message, scene) => {
        let tagsString = message.text;
        let tags = tagsString.split(/\s/g);
        let payload = message.messagePayload;
        let response = (0, tags_3.default)(tagsString);
        if (payload?.withoutTags) {
            scene.payload.tags = [];
            scene.next();
            return;
        }
        if (payload?.leaveCurrent) {
            scene.next();
            return;
        }
        if (response === codes_15.Response.NO_VALUE) {
            scene.retry({
                phrase: 'Пожалуйста, укажи теги через пробел.'
            });
        }
        else if (response === codes_15.Response.OUT_OF_RANGE) {
            scene.retry({
                phrase: 'Максимальное количество тегов, которых ты можешь указать - 16.'
            });
        }
        else if (response === codes_15.Response.INCORRECT) {
            scene.retry({
                phrase: 'Теги могут содержать только буквы и цифры, будьте внимательны.'
            });
        }
        else if (response === codes_15.Response.VALID) {
            scene.payload.tags = tags;
            scene.next();
        }
    });
});
define("src/frames/profile/create/index", ["require", "exports", "src/frames/profile/create/age", "src/frames/profile/create/description", "src/frames/profile/create/gender", "src/frames/profile/create/geo", "src/frames/profile/create/name", "src/frames/profile/create/photo", "src/frames/profile/create/save", "src/frames/profile/create/tags"], function (require, exports, age_4, description_4, gender_2, geo_4, name_4, photo_2, save_1, tags_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.tagsFrame = exports.saveFrame = exports.photoFrame = exports.nameFrame = exports.geoFrame = exports.genderFrame = exports.descriptionFrame = exports.ageFrame = void 0;
    exports.ageFrame = age_4.default;
    exports.descriptionFrame = description_4.default;
    exports.genderFrame = gender_2.default;
    exports.geoFrame = geo_4.default;
    exports.nameFrame = name_4.default;
    exports.photoFrame = photo_2.default;
    exports.saveFrame = save_1.default;
    exports.tagsFrame = tags_4.default;
});
define("src/frames/search/gender", ["require", "exports", "vk-io", "src/index", "src/frame"], function (require, exports, vk_io_17, __17, frame_18) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = new frame_18.default(async (scene, options) => {
        __17.bot.sendMessage({
            message: options?.phrase || 'Кого будем искать?',
            peer_id: scene.user.id,
            keyboard: vk_io_17.Keyboard.builder().textButton({
                label: 'Парней',
                payload: { searchGender: 0 },
                color: vk_io_17.Keyboard.SECONDARY_COLOR
            }).textButton({
                label: 'Девушек',
                payload: { searchGender: 1 },
                color: vk_io_17.Keyboard.SECONDARY_COLOR
            }).textButton({
                label: 'Всех',
                payload: { searchGender: 2 },
                color: vk_io_17.Keyboard.SECONDARY_COLOR
            }).oneTime()
        });
    }, (message, scene) => {
        let searchGender = message.messagePayload?.searchGender;
        if (searchGender === undefined) {
            scene.retry({
                phrase: 'Пожалуйста, укажи того, кого хочешь найти.'
            });
            return;
        }
        scene.payload.search_gender = searchGender;
        scene.next();
    });
});
define("src/frames/search/index", ["require", "exports", "src/frames/search/gender"], function (require, exports, gender_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.searchGenderFrame = void 0;
    exports.searchGenderFrame = gender_3.default;
});
define("src/scenes/profile/create", ["require", "exports", "src/scene", "src/frames/profile/create/index", "src/frames/search/index"], function (require, exports, scene_3, create_2, search_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ProfileCreateScene = void 0;
    const ProfileCreateScene = (payload) => {
        return new scene_3.default(payload)
            .add(create_2.nameFrame)
            .add(create_2.ageFrame)
            .add(create_2.geoFrame)
            .add(create_2.genderFrame)
            .add(search_1.searchGenderFrame)
            .add(create_2.descriptionFrame)
            .add(create_2.tagsFrame)
            .add(create_2.photoFrame)
            .add(create_2.saveFrame);
    };
    exports.ProfileCreateScene = ProfileCreateScene;
});
define("src/scenes/start", ["require", "exports", "src/scene", "src/index", "vk-io", "src/scenes/profile/create", "src/scenes/profile/main", "src/frame"], function (require, exports, scene_4, index_3, vk_io_18, create_3, main_9, frame_19) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StartScene = void 0;
    /**
     * Эта сцена используется как роутинг в случае, если: пользователь впервые пишет
     * боту, пользователь не активен больше двух недель или бот был перезапущен.
     */
    const StartScene = (payload) => {
        return new scene_4.default(payload).add(new frame_19.default(async (scene) => {
            let user = scene.user;
            let profile = user.profile;
            let exists = await profile.exists();
            if (exists) {
                index_3.bot.sendMessage({
                    message: 'Привет, хочешь найти кого-нибудь еще?',
                    peer_id: scene.user.id,
                    keyboard: vk_io_18.Keyboard.builder().textButton({
                        label: '👍',
                        color: vk_io_18.Keyboard.POSITIVE_COLOR
                    })
                });
                scene.payload.created = true;
            }
            else {
                index_3.bot.sendMessage({
                    message: 'Привет, я Аврора, твой помощник в поиске людей. Создадим анкету?',
                    peer_id: scene.user.id,
                    keyboard: vk_io_18.Keyboard.builder().textButton({
                        label: '👍',
                        color: vk_io_18.Keyboard.POSITIVE_COLOR
                    })
                });
            }
        }, (message, scene) => {
            if (scene.payload.created) {
                index_3.users[scene.user.id].setScene((0, main_9.ProfileMainScene)());
            }
            else {
                index_3.users[scene.user.id].setScene((0, create_3.ProfileCreateScene)());
            }
        }));
    };
    exports.StartScene = StartScene;
});
/**
 * Main file; Entry point to the PostgreSQL & VK API.
 */
define("src/index", ["require", "exports", "config", "src/controllers/vk.controller", "src/controllers/db.controller", "src/controllers/user.controller", "src/scenes/start"], function (require, exports, config_1, vk_controller_1, db_controller_1, user_controller_10, start_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.db = exports.bot = exports.users = void 0;
    exports.users = {};
    exports.bot = new vk_controller_1.default(config_1.default.VKAPI_TOKEN);
    exports.db = new db_controller_1.default(`postgres://${config_1.default.DB_USER}:${config_1.default.DB_PASSWORD}@${config_1.default.DB_IP_ADRESS}:${config_1.default.DB_PORT}`);
    exports.bot.startUpdates();
    exports.db.connect();
    /**
     * Main listener.
     */
    exports.bot.updates.on('message_new', async (context) => {
        let userId = context.peerId;
        let controller = exports.users[userId] || new user_controller_10.default(userId);
        if (!exports.users[userId]) {
            exports.users[userId] = controller;
            controller.setScene((0, start_1.StartScene)());
        }
        else {
            if (controller.scene)
                controller.scene.listenMessage(context);
        }
    });
});
