import { db } from '../';
import { Form } from '../typings';


export default class FormController {
    public id: number;


    constructor(id: number) {
        this.id = id;
    }

    public async exists(): Promise<boolean> {
        let response = await db.select('*', 'form', `id = ${this.id}`);
        return response.rowCount > 0;
    }

    public async init(form: Form) {
        await db.insert('form', form);
    }

    public async data(): Promise<Form> {
        let response = await db.select('*', 'form', `id = ${this.id}`);
        return response;
    }

    public async setCity(city: string) {
        await db.update('form', {
            city: city
        }, `id = ${this.id}`);
    }

    public async setLocation(latitude: number, longitude: number) {
        await db.update('form', {
            latitude: latitude,
            longitude: longitude
        }, `id = ${this.id}`);
    }

    public async setTags(tags: string[]) {
        await db.update('form', {
            tags: tags
        }, `id = ${this.id}`);
    }

    public async setDescription(description: string) {
        await db.update('form', {
            description: description
        }, `id = ${this.id}`);
    }

    public async setGender(gender: string) {
        await db.update('form', {
            gender: gender
        }, `id = ${this.id}`);
    }
};