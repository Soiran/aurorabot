import { users } from '../../../..';
import User from '../../../../controllers/user.controller';
import Frame from '../../../../models/frame';
import ProfileMainScene from '../../../../scenes/profile/main';
import { Profile } from '../../../../typings/global';


export default new Frame(
    async (scene) => {
        let controller = new User(scene.user.id);
        let now = new Date().getTime();
        let profile: Profile = {
            id: scene.user.id,
            created: now,
            last_edit: now,
            last_active: now,
            status: 2,
            name: scene.payload.name,
            age: scene.payload.age,
            tags: scene.payload.tags,
            description: scene.payload.description,
            city: scene.payload.geo?.place?.city || 'Мир',
            latitude: scene.payload.latitude,
            longitude: scene.payload.longitude,
            city_latitude: scene.payload.city_latitude,
            city_longitude: scene.payload.city_longitude,
            photo_id: scene.payload.photo_id,
            likes: scene.payload.likes || 0,
            reports: scene.payload.reports || 0,
            gender: scene.payload.gender,
            relationships: scene.payload.relationships,
            search_gender: scene.payload.search_gender,
            search_mode: scene.payload.search_mode || 0,
            anonymous: scene.payload.anonymous || false,
            rank: scene.payload.rank || 0
        };
        await controller.profile.update(profile);
        scene.end();
        users[scene.user.id].setScene(ProfileMainScene());
    }
);