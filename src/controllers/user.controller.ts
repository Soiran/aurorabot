import { bot, users } from '..';
import { IntervalController, TimeoutController } from '../../lib/time';
import Scene from '../models/scene';
import StackedMap from '../models/StackedMap';
import { MutualUser, ProfileView, SearchResult, UserNotification } from '../typings/global';
import { LikedUser } from './../typings/global';
import ProfileController from './profile.controller';


const declineLikes = (count: number): string => {
    let s = count.toString();
    let l = parseInt(s[s.length - 1]);
    return l === 1 ? 'человеку' : 'людям';
}

const declineMutual = (age: number): string => {
    let s = age.toString();
    let l = parseInt(s[s.length - 1]);
    return `${l === 1 ? 'человек ответил' : (l >= 5 ? 'человек ответили' : 'человека ответили')}`;
}

const declineReports = (age: number): string => {
    let s = age.toString();
    let l = parseInt(s[s.length - 1]);
    return `${l === 1 ? 'человек пожаловался' : (l >= 5 ? 'человек пожаловались' : 'человека пожаловались')}`;
}


export default class User {
    public created = false;
    public id: number;
    public profile: ProfileController;
    public scene: Scene;

    // Stacks
    public viewed: StackedMap<User>;
    public liked: StackedMap<LikedUser>;
    public mutual: StackedMap<MutualUser>;
    public notifications: StackedMap<UserNotification>;

    // Shedules
    private viewedWiping: IntervalController;
    

    constructor(id: number) {
        this.id = id;
        this.profile = new ProfileController(this.id);

        this.viewed = new StackedMap<User>();
        this.liked = new StackedMap<LikedUser>();
        this.mutual = new StackedMap<MutualUser>();
        this.notifications = new StackedMap<UserNotification>();

        let dayShift = 1000 * 60 * 60 * 24;
        this.viewedWiping = new IntervalController(dayShift, () => {
            this.viewed.wipe();
        });
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
        let target: User;

        if (this.notifications.size) {
            let notification = this.notifications.pop();
            return {
                found: true,
                type: notification.type,
                controller: notification.controller,
                message: notification.message
            } as SearchResult;
        } else {
            let filtered = users.select(user => {
                return user.created && user.id !== this.id && !this.viewed.has(user.id) && !this.liked.has(user.id) && !this.mutual.has(user.id);
            });
            if (filtered.length) {
                target = filtered[ Math.floor(Math.random() * filtered.length) ];
                setImmediate(() => {
                    this.viewed.set(target.id, target);
                    if (this.viewed.size === 64) {
                        this.viewed.wipe();
                    }
                });
                return {
                    found: true,
                    type: ProfileView.STRANGER,
                    controller: target
                } as SearchResult;
            } else {
                return { found: false } as SearchResult;
            }
        }
    }

    public removeLike(id: number) {
        this.liked.delete(id);
    }

    public removeMutual(id: number) {
        this.mutual.delete(id);
    }

    public setLike(target: User) {
        this.liked.set(target.id, {
            controller: target,
            viewedAfter: 0
        });
    }

    public setMutual(target: User) {
        this.removeLike(target.id);
        target.removeLike(this.id);
        let monthShift = 1000 * 60 * 60 * 24 * 30;
        this.mutual.set(target.id, {
            controller: target,
            wipingController: new TimeoutController(new Date(new Date().getTime() + monthShift), () => {
                this.removeMutual(target.id);
            })
        });
    }

    public pick(target: User) {
        let mutual = target.liked.has(this.id);
        if (mutual) {
            this.setMutual(target);
            target.setMutual(this);
        } else {
            this.setLike(target);
        }
        target.notify({
            controller: this,
            type: mutual ? ProfileView.MUTUAL : ProfileView.LIKED
        })
    }

    public notify(notification: UserNotification) {
        let user = notification.controller;
        let type = notification.type;
        let messageText: string;
        let count: number;
        this.notifications.set(user.id, notification);
        switch (type) {
            case ProfileView.LIKED:
                count = this.notifications.select(e => e.type === ProfileView.LIKED).length;
                messageText = `Ты понравился ${count} ${declineLikes(count)} 🥰`;
                break;
            case ProfileView.MUTUAL:
                count = this.notifications.select(e => e.type === ProfileView.MUTUAL).length;
                messageText = `${count} ${declineMutual(count)} тебе взаимностью 🥰`;
                break;
            case ProfileView.REPORT:
                count = this.notifications.select(e => e.type === ProfileView.REPORT).length;
                messageText = `${count} ${declineReports(count)} на твою анкету ⚠️`;
                break;
        }
        if (!(this.scene?.name === 'ProfileSettings' || this.scene?.name === 'SearchSettings') && messageText) {
            bot.sendMessage({
                peer_id: this.id,
                message: messageText
            })
        }
    }
}