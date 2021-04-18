import { db } from '..';
import date from '../../lib/date';
import { Profile, ProfileRender, ProfileUpdate } from '../typings/global';


const declineDistance = (distance: number): string => {
    let s = distance.toString();
    let l = parseInt(s[s.length - 1]);
    let w = distance >= 1000 ? 'километр' : 'метр';
    distance = distance >= 1000 ? Math.round(distance / 1000) : distance;
    return `${distance} ${l === 1 ? w : (l >= 5 || l === 0 ? w + 'ов' : w + 'а')}`;
}

const declineAge = (age: number): string => {
    let s = age.toString();
    let l = parseInt(s[s.length - 1]);
    return `${age} ${l === 0 ? 'лет' : (l === 1 ? 'год' : (l < 5 ? 'года' : 'лет'))}`
}


export default class ProfileController {
    public id: number;


    constructor(id: number) {
        this.id = id;
    }

    public async render(viewer: ProfileController, distance?: number, revealAnonymous?: boolean) {
        let viewerData = await viewer.data();
        let profileData = await this.data() as ProfileRender;
        let renderString = '';
        if (viewerData.rank >= 2) {
            renderString += `Страница: vk.com/id${profileData.id}\n`;
            renderString += `Первое появление: ${date(profileData.created)}\n`;
            renderString += `Последняя активность: ${date(profileData.created)}\n`;
            renderString += `Редактировано: ${date(profileData.created)}\n`;
            renderString += `Ищет: ${profileData.search_gender ? (profileData.search_gender > 1 ? 'всех' : 'девушек') : 'парней'}\n`;
            renderString += `Режим поиска: ${profileData.search_mode ? 'глобальный' : 'локальный'}\n`;
            renderString += `Лайков: ${profileData.likes}\n`;
            renderString += `Репортов: ${profileData.reports}\n\n`;
        }
        if (profileData.anonymous && this.id === viewer.id) {
            renderString += `🏴 Включен режим анонимности\n`;
        }
        if (profileData.anonymous && !revealAnonymous && !(this.id === viewer.id)) {
            renderString += `🏴 Аноним\n`;
        } else {
            renderString += `${profileData.gender ? (profileData.gender > 1 ? '🏳️' : '🙍‍') : '🙍‍♂‍'} ${profileData.name}, ${declineAge(profileData.age)}, ${distance ? declineDistance(distance) : profileData.city}\n`;
        }
        renderString += `${profileData.description}\n`;
        renderString += profileData.tags.map(t => '#' + t).join(', ');
        return {
            text: renderString,
            photo: profileData.photo_id
        };
    }

    public async exists(): Promise<boolean> {
        let response = await db.select('*', 'profile', `id = ${this.id}`);
        return response.length > 0;
    }

    public async init(profile: Profile) {
        await db.insert('profile', profile);
    }

    public async update(profile: Profile) {
        await db.delete('profile', `id = ${this.id}`);
        await this.init(profile);
    }

    public async data(): Promise<Profile> {
        let response = await db.select('*', 'profile', `id = ${this.id}`);
        return response[0];
    }

    public async get(field: string): Promise<any> {
        let response = await db.select(field, 'profile', `id = ${this.id}`);
        return response[0].field;
    }

    public async edit(update: ProfileUpdate) {
        await db.update<ProfileUpdate>('profile', update, `id = ${this.id}`);
    }
};