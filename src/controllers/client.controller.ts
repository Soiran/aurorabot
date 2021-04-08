import { db } from '../index';


export default class ClientController {
    public id: number;


    constructor(id: number) {
        this.id = id;
    }

    public async init() {
        // ! IMPLEMENT
    }

    public async getToken() {
        // ! IMPLEMENT
    }

    public async requireToken() {
        // ! IMPLEMENT
    }
};