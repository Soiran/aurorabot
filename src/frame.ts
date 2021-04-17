import { MessageContext } from 'vk-io';
import Scene from './scene';


export default class Frame {
    public enterCallback: (scene?: Scene, options?: any) => void;
    public listenCallback: (message?: MessageContext, scene?: Scene, options?: any) => void;


    constructor(enterCallback: Frame['enterCallback'], listenCallback?: Frame['listenCallback']) {
        this.enterCallback = enterCallback;
        this.listenCallback = listenCallback;
    }
}