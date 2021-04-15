import Scene from '../../scene';
import { bot } from '../../index';
import { Keyboard } from 'vk-io';
import { Profile, ProfileRender } from '../../types';
import User from '../../controllers/user.controller';
import ProfileController from '../../controllers/profile.controller';
import config from '../../../config';


export const ProfileViewScene = (payload = null) => {
    return new Scene(payload).ask(
        async scene => {
            let profile = await new User(scene.user.id).profile.data();
            await bot.sendMessage({
                peer_id: scene.user.id,
                message: ProfileController.profileRenderer(profile as ProfileRender) as string,
                attachment: profile.photoid
            });
        },
        (message, scene) => {
            
        }
    );
}