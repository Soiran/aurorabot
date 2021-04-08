import { MessageContext } from 'vk-io';
import User from './controllers/user.controller';


type Frame = (message: MessageContext, scene: Scene) => void;


export default class Scene {
    public frameIndex = 0;
    public data = {};
    public user: User;
    public frames: Frame[];


    constructor(frames: Frame[]) {
        this.frames = frames;
    }

    public handle(message: MessageContext) {
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
}