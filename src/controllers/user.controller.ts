import { Keyboard } from 'vk-io';

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
    public id: number;
    public profile: ProfileController;
    public scene: Scene;
    public searchStack: Storage<User>;
    public viewStack: Storage<User>;
    public likedStack: Storage<User>;
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
            let filtered = users.select(user => user.id !== this.id && !this.searchStack.has(user.id) && !this.likedStack.has(user.id));
            if (!filtered.length) {
                return { found: false };
            }
            targetUser = filtered[ Math.floor(Math.random() * filtered.length) ];
            while (targetUser.scene?.name === 'ProfileSettings') {
                targetUser = filtered[ Math.floor(Math.random() * filtered.length) ];
            }
            relation = Relation.STRANGER;
        }
        //
        if (this.searchStack.size > (users.size / 2)) {
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
        if (this.scene?.name === 'SearchMain' || this.scene?.name === 'ProfileMain') {
            let count = this.viewStack.size + this.mutualStack.size;
            bot.sendMessage({
                peer_id: this.id,
                message: count === 1 ? `Ты понравился кое-кому 🥰` : `Ты понравился ${count} ${declineLikes(count)} 🥰`,
                keyboard: Keyboard.builder().textButton({
                    label: '👍',
                    color: Keyboard.POSITIVE_COLOR
                })
            });
        }
    }

    public async mutualRequest(requester: User) {
        this.mutualStack.set(requester.id, requester);
        if (this.scene?.name === 'SearchMain') {
            let count = this.viewStack.size + this.mutualStack.size;
            bot.sendMessage({
                peer_id: this.id,
                message: count === 1 ? `Кое-кто ответил тебе взаимностью 🥰` : `${count} ${declineLikes(count)} ответили тебе взаимностью 🥰`,
                keyboard: Keyboard.builder().textButton({
                    label: '👍',
                    color: Keyboard.POSITIVE_COLOR
                })
            });
        }
    }
}