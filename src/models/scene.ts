import { MessageContext } from 'vk-io';

import User from '../controllers/user.controller';
import Frame from './frame';


export default class Scene {
    public user: User;
    public frames: Frame[];
    public frameIndex: number;
    public payload: any;


    constructor(payload?: any, frames?: Frame[]) {
        frames ? this.frames = frames : this.frames = new Array<Frame>();
        payload ? this.payload = payload : this.payload = {};
        this.frameIndex = 0;
    }

    public get currentFrame(): Frame {
        return this.frames[this.frameIndex];
    }

    public enterCurrentFrame(options = null) {
        let frame = this.currentFrame;
        if (frame.enterCallback) {
            frame.enterCallback(this, options);
        }
    }

    public add(frame: Frame) {
        return new Scene(this.payload, this.frames.concat([ frame ]));
    }

    public listenMessage(message: MessageContext) {
        this.frames[this.frameIndex].listenCallback(message, this);
    }

    public next(options = null) {
        this.frameIndex++;
        this.enterCurrentFrame(options);
    }

    public back(options = null) {
        this.frameIndex--;
        this.enterCurrentFrame(options);
    }

    public goto(index: number, options = null) {
        this.frameIndex = index;
        this.enterCurrentFrame(options);
    }

    public shift(count: number, options = null) {
        this.frameIndex += count;
        this.enterCurrentFrame(options);
    }

    public retry(options = null) {
        this.enterCurrentFrame(options);
    }

    public end() {
        this.user.scene = null;
    }
}