import { bot, users } from '..';
import Scene from '../models/scene';
import Storage from '../models/storage';
import { Relation, SearchResult } from '../typings/global';
import ProfileController from './profile.controller';


const declineLikes = (count: number): string => {
    let s = count.toString();
    let l = parseInt(s[s.length - 1]);
    return l === 1 ? 'человеку' : 'людям';
}


export default class User {
    public created = false;
    public id: number;
    public profile: ProfileController;
    public scene: Scene;
    public searchStack: Storage<User>;
    public viewStack: Storage<User>;
    public likedStack: Storage<User>;
    public mutualStack: Storage<User>;
    public messagesStack: Storage<string>;

    
    constructor(id: number) {
        this.id = id;
        this.profile = new ProfileController(this.id);
        this.searchStack = new Storage<User>();
        this.viewStack = new Storage<User>();
        this.likedStack = new Storage<User>();
        this.mutualStack = new Storage<User>();
        this.messagesStack = new Storage<string>();
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
        let message: string;
    
        if (this.mutualStack.size) {
            targetUser = this.mutualStack.last;
            relation = Relation.MUTUAL;
        } else if (this.viewStack.size) {
            targetUser = this.viewStack.last;
            relation = Relation.LIKED;
            if (this.messagesStack.has(targetUser.id)) {
                message = this.messagesStack.get(targetUser.id);
                this.messagesStack.delete(targetUser.id);
            }
        } else {
            // SEARCH ALGORITHM
            let filtered = users.select(user => user.id !== this.id && user.created && !this.searchStack.has(user.id) && !this.likedStack.has(user.id));
            if (!filtered.length) {
                return { found: false };
            }
            targetUser = filtered[ Math.floor(Math.random() * filtered.length) ];
            while (targetUser.scene?.name === 'ProfileSettings' || targetUser.scene?.name === 'SearchSettings') {
                targetUser = filtered[ Math.floor(Math.random() * filtered.length) ];
            }
            // SEARCH ALGORITHM
            relation = Relation.STRANGER;
        }
        if (this.searchStack.size > (users.size / 2)) {
            this.searchStack.wipe();
        }
        this.searchStack.set(targetUser.id, targetUser);
        return {
            found: true,
            relation: relation,
            user: targetUser,
            message: message
        };
    }

    public async viewRequest(requester: User) {
        this.viewStack.set(requester.id, requester);
        if (!(requester.scene?.name === 'ProfileSettings' || requester.scene?.name === 'SearchSettings')) {
            let count = this.viewStack.size + this.mutualStack.size;
            bot.sendMessage({
                peer_id: this.id,
                message: count === 1 ? `Ты понравился кое-кому 🥰` : `Ты понравился ${count} ${declineLikes(count)} 🥰`
            });
        }
    }

    public async mutualRequest(requester: User) {
        this.mutualStack.set(requester.id, requester);
        if (!(requester.scene?.name === 'ProfileSettings' || requester.scene?.name === 'SearchSettings')) {
            let count = this.viewStack.size + this.mutualStack.size;
            bot.sendMessage({
                peer_id: this.id,
                message: count === 1 ? `Кое-кто ответил тебе взаимностью 🥰` : `${count} ${declineLikes(count)} ответили тебе взаимностью 🥰`
            });
        }
    }
}