import { db } from '..';
import { Profile, ProfileUpdate, ProfileRender } from '../types';


export default class ProfileController {
    public id: number;


    constructor(id: number) {
        this.id = id;
    }

    public static profileRenderer(
        profile: ProfileRender,
        distance?: number
    ) {
        let { name, age, tags, description, city, gender } = profile;
        let _ageString = age.toString();
        let _ageLastNumber = parseInt(_ageString[_ageString.length - 1]);
        let _ageDeclination = _ageLastNumber < 5 ? 'года' : 'лет';
        let _distanceString: string;
        let _distanceLastNumber: number;
        let _distanceDeclination: string;
        if (distance) {
            _distanceString = distance.toString();
            _distanceLastNumber = parseInt(_distanceString[_distanceString.length - 1]);
            _distanceDeclination = _distanceLastNumber === 1 ? 'метр' : (_distanceLastNumber >= 5 || _distanceLastNumber === 0 ? 'метров' : 'метра');
        }
        let renderString = new String();
        renderString += `${gender ? '🙍' : '🙍‍♂️'} ${name}, ${age} ${_ageDeclination}, ${distance ? `${distance} ${_distanceDeclination} от тебя` : city}\n`;
        renderString += `${tags.map(t => '#' + t).join(', ')}\n\n`;
        renderString += description;
        return renderString;
    }

    public async exists(): Promise<boolean> {
        let response = await db.select('*', 'profile', `id = ${this.id}`);
        return response.length > 0;
    }

    public async init(profile: Profile) {
        await db.insert('profile', profile);
    }

    public async data(): Promise<Profile> {
        let response = await db.select('*', 'profile', `id = ${this.id}`);
        return response[0];
    }

    public async get(field: string): Promise<any> {
        let response = await db.select(field, 'profile', `id = ${this.id}`);
        return response[0].field;
    }

    public async toggleActive(): Promise<boolean> {
        let active = await db.select('active', 'profile', `id = ${this.id}`);
        await db.update<ProfileUpdate>('profile', {
            active: !active
        }, `id = ${this.id}`);
        return !active;
    }

    public async setCity(city: string) {
        await db.update<ProfileUpdate>('profile', {
            city: city
        }, `id = ${this.id}`);
    }

    public async setLocation(latitude: number, longitude: number) {
        await db.update<ProfileUpdate>('profile', {
            latitude: latitude,
            longitude: longitude
        }, `id = ${this.id}`);
    }

    public async setTags(tags: string[]) {
        await db.update<ProfileUpdate>('profile', {
            tags: tags
        }, `id = ${this.id}`);
    }

    public async setDescription(description: string) {
        await db.update<ProfileUpdate>('profile', {
            description: description
        }, `id = ${this.id}`);
    }

    public async setGender(gender: number) {
        await db.update<ProfileUpdate>('profile', {
            gender: gender
        }, `id = ${this.id}`);
    }

    public async setRadius(radius: number) {
        await db.update<ProfileUpdate>('profile', {
            radius: radius
        }, `id = ${this.id}`);
    }
};