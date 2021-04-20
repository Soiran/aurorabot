import { users } from '..';
import Scene from '../models/scene';
import Storage from '../models/storage';
import ViewPendingScene from '../scenes/search/viewpending';
import { Relation, SearchResult } from '../typings/global';
import ProfileController from './profile.controller';


export default class User {
    public id: number;
    public profile: ProfileController;
    public scene: Scene;
    public searchStack: Storage<User>;
    public viewStack: Storage<User>;
    public mutualStack: Storage<User>;

    
    constructor(id: number) {
        this.id = id;
        this.profile = new ProfileController(this.id);
        this.searchStack = new Storage<User>();
        this.viewStack = new Storage<User>();
        this.mutualStack = new Storage<User>();
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

    public async search(): Promise<SearchResult> {
        let profile = this.profile;
        let targetUser: User;
        let relation: Relation;
        //
        if (this.viewStack.size) {
            targetUser = this.viewStack.last;
            relation = Relation.LIKED;
        } else if (this.mutualStack.size) {
            targetUser = this.mutualStack.last;
            relation = Relation.MUTUAL;
        } else {
            let filtered = users.select(user => user.id !== this.id && !this.searchStack.has(user.id.toString()));
            if (!filtered.length) {
                return { found: false };
            }
            targetUser = filtered[ Math.floor(Math.random() * filtered.length) ];
            relation = Relation.STRANGER;
        }
        //
        if (this.searchStack.size > 10) {
            this.searchStack.wipe();
        }
        this.searchStack.set(targetUser.id.toString(), targetUser);
        return {
            found: true,
            relation: relation,
            user: targetUser
        };
    }

    public async viewRequest(requester: User) {
        this.viewStack.set(requester.id, requester);
        this.setScene(ViewPendingScene());
    }

    public async mutualRequest(requester: User) {
        this.mutualStack.set(requester.id, requester);
        this.setScene(ViewPendingScene());
    }
}