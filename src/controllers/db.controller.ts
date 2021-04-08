import { Client } from 'pg';
import Logger from '../utils/cl';


export default class DBController {
    private client: Client;
    private logger: Logger;


    constructor(connectionURL: string) {
        this.client = new Client(connectionURL);
        this.logger = new Logger('DBController');
    }

    public async connect() {
        await this.client.connect();
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
}