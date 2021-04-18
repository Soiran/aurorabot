import { DocumentAttachment, PhotoAttachment, UploadSourceValue, VK } from 'vk-io';
import { MessagesSendParams } from 'vk-io/lib/api/schemas/params';

import Logger from '../../lib/cl';


export default class VKController {
    private controller: VK;
    private logger: Logger;


    constructor(token: string) {
        this.controller = new VK({
            token: token,
            apiRequestMode: 'burst',
            apiMode: 'parallel'
        });
        this.logger = new Logger('VKController');
    }

    public get api() {
        return this.controller.api;
    }

    public get upload() {
        return this.controller.upload;
    }

    public get updates() {
        return this.controller.updates;
    }

    public async startUpdates(callback?: Function) {
        await this.controller.updates.start();
        if (callback) callback();
        this.logger.log('Listening to the longpoll updates.', 'info');
    }

    public async sendMessage(params: MessagesSendParams) {
        await this.api.messages.send(Object.assign(params, {
            random_id: Math.floor(Math.random() * 25012005)
        }));
    }

    public async uploadPhoto(value: UploadSourceValue): Promise<PhotoAttachment> {
        let attachment = await this.controller.upload.messagePhoto({
            peer_id: 0,
            source: {
                value: value
            }
        });
        return attachment;
    }

    public async uploadDocument(value: UploadSourceValue): Promise<DocumentAttachment> {
        let attachment = await this.controller.upload.messageDocument({
            peer_id: 0,
            source: {
                value: value
            }
        });
        return attachment;
    }

    // public async save<T extends Attachment | PhotoAttachment | DocumentAttachment | ExternalAttachment>(peerId: number, attachments: T[]) {
    //     let dir = __dirname + `\\${peerId}`;
    //     if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    //     for (let attachment of attachments) {
    //         if (attachment instanceof PhotoAttachment) {
    //             await download.image({
    //                 url: attachment.largeSizeUrl,
    //                 dest: dir
    //             });
    //         } else if (attachment instanceof DocumentAttachment) {
    //             await download.image({
    //                 url: attachment.url,
    //                 dest: dir
    //             });
    //         }
    //     }
    // }
}