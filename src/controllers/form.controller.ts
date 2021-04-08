import { db } from '../index';
import { Form } from '../typings';


export default class FormController {
    public id: number;


    constructor(id: number) {
        this.id = id;
    }

    public async init(form: Form) {
        // ! IMPLEMENT
    }

    public async data(): Promise<Form> {
        // ! IMPLEMENT
        return {} as Form;
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

    public async setDescription(description: string) {
        // ! IMPLEMENT
    }

    public async setGender(gender: string) {
        // ! IMPLEMENT
    }
};