import { bot, users } from '..';
import { IntervalController, TimeoutController } from '../../lib/time';
import * as config from '../config';
import Scene from '../models/scene';
import StackedMap from '../models/StackedMap';
import NotifyScene from '../scenes/profile/notify';
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
    private likesWiping: IntervalController;
    private reportsWiping: IntervalController;
    private reportedWiping: IntervalController;

    // Counters
    private likesCount = 0;
    private reportsCount = 0;
    private reportedCount = 0;
    

    constructor(id: number) {
        this.id = id;
        this.profile = new ProfileController(this.id);

        this.viewed = new StackedMap<User>();
        this.liked = new StackedMap<LikedUser>();
        this.mutual = new StackedMap<MutualUser>();
        this.notifications = new StackedMap<UserNotification>();

        this.viewedWiping = new IntervalController(config.USER.VIEWED_WIPING_INTERVAL, () => {
            this.viewed.wipe();
        });
        this.likesWiping = new IntervalController(config.USER.LIKES_WIPING_INTERVAL, () => {
            this.likesCount = 0;
        });
        this.reportsWiping = new IntervalController(config.USER.REPORTS_WIPING_INTERVAL, () => {
            this.reportsCount = 0;
        });
        this.reportedWiping = new IntervalController(config.USER.REPORTED_WIPING_INTERVAL, () => {
            this.reportedCount = 0;
        });
    }

    public async exists(): Promise<boolean> {
        let response = await this.profile.exists();
        return response;
    }

    public get canSearch(): boolean {
        return this.likesCount < config.USER.LIKES_LIMIT;
    }

    public get canReport(): boolean {
        return this.reportsCount < config.USER.REPORTS_LIMIT;
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

    public setLike(controller: User) {
        this.liked.set(controller.id, {
            controller: controller,
            viewedAfter: 0
        });
        this.likesCount++;
    }

    public setMutual(controller: User) {
        this.removeLike(controller.id);
        this.mutual.set(controller.id, {
            controller: controller,
            wipingController: new TimeoutController(new Date(new Date().getTime() + config.USER.MUTUAL_WIPING_INTERVAL), () => {
                this.removeMutual(controller.id);
            })
        });
    }

    public pick(target: User) {
        let mutual = target.liked.has(this.id);
        if (mutual) {
            target.setMutual(this);
            this.setMutual(target);
            this.notify({
                controller: this,
                type: ProfileView.MUTUAL
            });
        } else {
            this.setLike(target);
        }
        target.notify({
            controller: this,
            type: mutual ? ProfileView.MUTUAL : ProfileView.LIKED
        });
    }

    public notify(notification: UserNotification) {
        let user = notification.controller;
        let type = notification.type;
        let messageText: string;
        let count: number;
        this.notifications.set(user.id, notification);
        if (user.id !== this.id) {
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
            let notDisturbScenes = [
                'ProfileCreate',
                'ProfileSettings',
                'SearchSettings',
                'Report',
                'Message',
                'Notify'
            ];
            let interruptScenes = [
                'ProfileMain',
                'Menu'
            ];
            if (notDisturbScenes.includes(this.scene?.name)) {
                return;
            } else if (interruptScenes.includes(this.scene?.name) || !this.scene) {
                this.setScene(NotifyScene({ message: messageText, last_scene: this.scene }));
            } else {
                bot.sendMessage({
                    peer_id: this.id,
                    message: messageText
                });
            }
        }
    }
}