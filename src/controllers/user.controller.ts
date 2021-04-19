import { users } from '..';
import Scene from '../models/scene';
import Storage from '../models/storage';
import ProfileController from './profile.controller';


export default class User {
    public id: number;
    public profile: ProfileController;
    public scene: Scene;
    public searchStack: Storage<User>;
    public viewPending: Storage<User>;

    
    constructor(id: number) {
        this.id = id;
        this.profile = new ProfileController(this.id);
        this.searchStack = new Storage<User>();
        this.viewPending = new Storage<User>();
    }

    public async exists(): Promise<boolean> {
        let response = await this.profile.exists();
        return response;
    }

    public setScene(scene: Scene) {
        this.scene = scene;
        scene.user = this;
        scene.enterCurrentFrame();
    }

    public async search(): Promise<User[]> {
        let profile = this.profile;
        let targetUser: User;
        //
        let filtered = users.select(user => user.id !== this.id && !this.searchStack.exists(user.id.toString()));
        if (!filtered.length) {
            return [];
        }
        targetUser = filtered[ Math.floor(Math.random() * filtered.length) ];
        //
        this.searchStack.push(targetUser.id.toString(), targetUser);
        return [ targetUser ];
    }

    public viewRequest(requester: User) {
        this.viewPending.push(requester.id.toString(), requester);
        // TODO: viewRequest
    }
}