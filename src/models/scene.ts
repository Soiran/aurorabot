import { MessageContext } from 'vk-io';

import User from '../controllers/user.controller';
import Frame from './frame';


export default class Scene {
    public name: string;
    public user: User;
    public frames: Frame[];
    public frameIndex: number;
    public payload: any;
    private originPayload: any;


    constructor(name: string, payload?: any, frames?: Frame[]) {
        this.name = name;
        frames ? this.frames = frames : this.frames = new Array<Frame>();
        payload ? this.payload = payload : this.payload = {};
        payload ? this.originPayload = payload : this.originPayload = {};
        this.frameIndex = 0;
    }

    public get clone(): Scene {
        return new Scene(this.name, this.originPayload, this.frames);
    }

    public get currentFrame(): Frame {
        return this.frames[this.frameIndex];
    }

    public get framesCount(): number {
        return this.frames.length;
    }

    public enterCurrentFrame(options = null) {
        let frame = this.currentFrame;
        if (frame.enterCallback) {
            frame.enterCallback(this, options);
        }
    }

    public add(frame: Frame) {
        return new Scene(this.name, this.payload, this.frames.concat([ frame ]));
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

    public first(options = null) {
        this.frameIndex = 0;
        this.enterCurrentFrame(options);
    }

    public last(options = null) {
        this.frameIndex = this.frames.length - 1;
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