import Scene from '../../../models/scene';
import {
    ageFrame,
    descriptionFrame,
    genderFrame,
    geoFrame,
    nameFrame,
    photoFrame,
    relationshipsFrame,
    saveFrame,
    searchGenderFrame,
    tagsFrame,
} from './frames';



export default function ProfileCreateScene(payload?) {
    return new Scene(payload)
    // .add(new Frame(
    //     async scene => {
    //         bot.sendMessage({
    //             peer_id: scene.user.id,
    //             message: 'Заполним анкету с нуля или импортируем из Дайвинчика?',
    //             keyboard: Keyboard.builder()
    //             .textButton({
    //                 label: 'С нуля',
    //                 payload: { from_scratch: true },
    //                 color: Keyboard.PRIMARY_COLOR
    //             })
    //             .textButton({
    //                 label: 'Импортировать',
    //                 payload: { import: true },
    //                 color: Keyboard.PRIMARY_COLOR
    //             })
    //         });
    //     },
    //     async (message, scene) => {
    //         let payload = message.messagePayload;
    //         if (!payload) {
    //             scene.retry();
    //         } else {
    //             if (payload.from_scratch) {
    //                 scene.shift(2);
    //             } else if (payload.import) {
    //                 scene.next();
    //             }
    //         }
    //     }
    // ))
    .add(nameFrame)
    .add(ageFrame)
    .add(geoFrame)
    .add(genderFrame)
    .add(searchGenderFrame)
    .add(relationshipsFrame)
    .add(descriptionFrame)
    .add(tagsFrame)
    .add(photoFrame)
    .add(saveFrame);
}