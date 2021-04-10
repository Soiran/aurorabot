import { Client, Result } from 'pg';
import Logger from '../utils/cl';


export default class DBController {
    private client: Client;
    private logger: Logger;


    constructor(connectionURL: string) {
        this.client = new Client(connectionURL);
        this.logger = new Logger('DBController');
    }

    public async connect(callback?: Function) {
        await this.client.connect();
        if (callback) callback();
        this.logger.log('Connected to the PostgreSQL.', 'info');
    }

    public async end() {
        await this.client.end();
        this.logger.log('Disconnected from the PostgreSQL.', 'info');
    }

    public async query(queryString: string, values: any[]) {
        let response = await this.client.query(queryString, values);
        return response;
    }

    public async insert(table: string, keyValue: any) {
        let keys = Object.keys(keyValue);
        let values = keys.map(key => keyValue[key]);
        await this.client.query(`INSERT INTO ${table} (${keys.join(', ')}) VALUES (${keys.map((_, i) => `\$${i + 1}`).join(', ')})`, values);
    }

    public async select(fields: string, table: string, condition?: string): Result {
        let response = await this.client.query(`SELECT ${fields} FROM ${table}${condition ? ` WHERE ${condition}` : ''}`);
        return response;
    }

    public async update(table: string, keyValue: any, condition?: string) {
        let keys = Object.keys(keyValue);
        let values = keys.map(key => keyValue[key]);
        console.log(`UPDATE ${table} SET ${keys.map((k, i) => `${k}=\$${i + 1}`)}${condition ? ` WHERE ${condition}` : ''}`);
        await this.client.query(`UPDATE ${table} SET ${keys.map((k, i) => `${k}=\$${i + 1}`).join(', ')}${condition ? ` WHERE ${condition}` : ''}`, values);
    }
}