import Scene from '../../scene';
import {
    ageFrame,
    descriptionFrame,
    genderFrame,
    geoFrame,
    nameFrame,
    photoFrame,
    saveFrame,
    tagsFrame
} from '../../frames/profile/create';
import { searchGenderFrame } from '../../frames/search';



export const ProfileCreateScene = (payload?) => {
    return new Scene(payload)
    .add(nameFrame)
    .add(ageFrame)
    .add(geoFrame)
    .add(genderFrame)
    .add(searchGenderFrame)
    .add(descriptionFrame)
    .add(tagsFrame)
    .add(photoFrame)
    .add(saveFrame);
}