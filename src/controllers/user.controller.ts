import Scene from '../scene';
import ProfileController from './profile.controller';


export default class User {
    public id: number;
    public profile: ProfileController;
    public scene: Scene;

    
    constructor(id: number) {
        this.id = id;
        this.profile = new ProfileController(this.id);
    }

    public async exists(): Promise<boolean> {
        let response = await this.profile.exists();
        return response;
    }

    public setScene(scene: Scene) {
        this.scene = scene;
        scene.enter(this);
    }
}