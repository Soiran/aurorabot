import Scene from '../scene';
import FormController from './form.controller';
import ConfigController from './config.controller';
import ClientController from './client.controller';


export default class User {
    public id: number;
    public form: FormController;
    public config: ConfigController;
    public client: ClientController;
    private scene: Scene;

    
    constructor(id: number) {
        this.id = id;
        this.form = new FormController(this.id);
        this.config = new ConfigController(this.id);
        this.client = new ClientController(this.id);
    }

    public setScene(scene: Scene) {
        // ! IMPLEMENT
    }
}