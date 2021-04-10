import { db } from '../';
import { Config } from '../typings';


export default class ConfigController {
    public id: number;


    constructor(id: number) {
        this.id = id;
    }

    public async exists(): Promise<boolean> {
        let response = await db.select('*', 'config', `id = ${this.id}`);
        return response.rowCount > 0;
    }

    public async init(config: Config) {
        await db.insert('config', config);
    }

    public async data(): Promise<Config> {
        let response = await db.select('*', 'config', `id = ${this.id}`);
        return response;
    }

    public async setCity(city: string) {
        await db.update('config', {
            city: city
        }, `id = ${this.id}`);
    }

    public async setLocation(latitude: number, longitude: number) {
        await db.update('config', {
            latitude: latitude,
            longitude: longitude
        }, `id = ${this.id}`);
    }

    public async setTags(tags: string[]) {
        await db.update('config', {
            tags: tags
        }, `id = ${this.id}`);
    }

    public async setRadius(radius: number) {
        await db.update('config', {
            radius: radius
        }, `id = ${this.id}`);
    }
};