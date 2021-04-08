import { db } from '../index';
import { Config } from '../typings';


export default class ConfigController {
    public id: number;


    constructor(id: number) {
        this.id = id;
    }

    public async init(config: Config) {
        // ! IMPLEMENT
    }

    public async setCity(city: string) {
        // ! IMPLEMENT
    }

    public async setLocation(latitude: number, longitude: number) {
        // ! IMPLEMENT
    }

    public async setTags(radius: number) {
        // ! IMPLEMENT
    }

    public async setRadius(radius: number) {
        // ! IMPLEMENT
    }
};