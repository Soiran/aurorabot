import * as crypto from 'crypto';
import { db, bot } from '../index';


export default class ClientController {
    public id: number;
    private static accessCodes = [];


    constructor(id: number) {
        this.id = id;
    }

    public async exists(): Promise<boolean> {
        let response = await db.select('*', 'client', `id = ${this.id}`);
        return response.rowCount > 0;
    }

    public async init() {
        let token: string;
        crypto.randomBytes(64, (_, buffer) => {
            token = buffer.toString('hex');
        });
        await db.insert('client', {
            id: this.id,
            token: token
        });
    }

    public async getToken(): Promise<string> {
        let response = await db.select('*', 'client', `id = ${this.id}`);
        return response.rows[0].token;
    }

    private static createAccessCode(id: number): number {
        let accessCode = parseInt(Array(6).fill(0).map(() => Math.floor(Math.random() * 10)).join(''));
        ClientController.accessCodes[accessCode] = id;
        return accessCode;
    }

    /**
     * Client have only ONE attempt to get token by access code.
     * Otherwise, client must send the request again.
     */
    public static requestToken(id: number) {
        let accessCode = ClientController.createAccessCode(id);
        bot.sendMessage({
            message: `Код доступа для стороннего клиента - ${accessCode}.`
        });
    }

    public static async getTokenByAccessCode(accessCode: number): Promise<string | boolean> {
        let userId = ClientController.accessCodes[accessCode];
        if (userId) {
            let token = await new ClientController(userId).getToken();
            return token;
        } else {
            delete ClientController.accessCodes[accessCode];
            return false;
        }
    }
};