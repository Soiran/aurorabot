import { MessageContext } from 'vk-io';
import User from './controllers/user.controller';


type Frame = (message: MessageContext, scene: Scene) => void;


export default class Scene {
    public frameIndex = 0;
    public data = {};
    public user: User;
    public frames: Frame[];
    public active = true;
    public enterCallback: (scene: Scene) => void;


    constructor(enterCallback: (scene: Scene) => void, frames: Frame[]) {
        this.enterCallback = enterCallback;
        this.frames = frames;
    }

    public enter(user: User) {
        this.user = user;
        this.enterCallback(this);
    }

    public handle(message: MessageContext) {
        if (!this.active) return;
        this.frames[this.frameIndex](message, this);
    }

    public next() {
        this.frameIndex++;
    }

    public back() {
        this.frameIndex--;
    }

    public goto(index: number) {
        this.frameIndex = index;
    }

    public end() {
        this.active = false;
        // Setting an empty scene
        this.user.scene = new Scene(scene => {}, []);
    }
}