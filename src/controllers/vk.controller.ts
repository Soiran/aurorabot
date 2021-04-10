import * as download from 'image-downloader';
import * as fs from 'fs';
import { VK, ExternalAttachment, PhotoAttachment, UploadSourceValue, DocumentAttachment, Attachment } from 'vk-io';
import { MessagesSendParams } from 'vk-io/lib/api/schemas/params';
import Logger from '../utils/cl';


export default class VKController {
    private controller: VK;
    private logger: Logger;


    constructor(token: string) {
        this.controller = new VK({
            token: token
        });
        this.logger = new Logger('VKController');
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

    public async uploadPhoto(peerId: number, value: UploadSourceValue): Promise<PhotoAttachment> {
        let attachment = this.controller.upload.messagePhoto({
            peer_id: peerId,
            source: {
                value: value
            }
        });
        return attachment;
    }

    public async uploadDocument(peerId: number, value: UploadSourceValue): Promise<DocumentAttachment> {
        let attachment = this.controller.upload.messageDocument({
            peer_id: peerId,
            source: {
                value: value
            }
        });
        return attachment;
    }

    public async uploadFolder(peerId: number, path: string) {
        let filenames = fs.readdirSync(path);
        let attachments = new Array<Attachment>();
        for (let file of filenames) {
            let attachment = await this.uploadPhoto(peerId, `${path}\\${file}`);
            attachments.push(attachment);
        }
        return attachments;
    }

    public async save<T extends Attachment | PhotoAttachment | DocumentAttachment | ExternalAttachment>(peerId: number, attachments: T[]) {
        let dir = __dirname + `\\${peerId}`;
        if (!fs.existsSync(dir)) fs.mkdirSync(dir);
        for (let attachment of attachments) {
            if (attachment instanceof PhotoAttachment) {
                await download.image({
                    url: attachment.largeSizeUrl,
                    dest: dir
                });
            } else if (attachment instanceof DocumentAttachment) {
                await download.image({
                    url: attachment.url,
                    dest: dir
                });
            }
        }
    }

    public get api() {
        return this.controller.api;
    }

    public get updates() {
        return this.controller.updates;
    }
}