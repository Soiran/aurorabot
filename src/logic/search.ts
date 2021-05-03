import { users } from "..";
import User from "../controllers/user.controller";


export default function searchAlgorithm(finder: User): User {
    let searchGender = finder.profile.syncedData.search_gender;

    let filtered: User[] = [];

    // Фильтрация пользователей от самого себя, незарегистрировавшихся, другого пола, просмотренных, понравившихся и взаимных
    for (let user of Object.values(users.heap)) {
        if (user.id !== finder.id &&
            user.created &&
            (searchGender === 2 ? true : (user.profile.syncedData?.gender === searchGender)) &&
            !finder.viewed.has(user.id) &&
            !finder.liked.has(user.id) &&
            !finder.mutual.has(user.id)) {
            filtered.push(user);
        }
    }

    if (!filtered.length) return null;

    // Сортировка по имени города
    for (let i = 0; i < filtered.length; i++) {
        for (let j = i + 1; j < filtered.length; j++) {
            if (Number(filtered[i].profile.syncedData.city === finder.profile.syncedData.city) >
                Number(filtered[j].profile.syncedData.city === finder.profile.syncedData.city)) {
                let tmp = filtered[i];
                filtered[i] = filtered[j];
                filtered[j] = tmp;
            }
        }
    }
    
    // Сортировка по расстоянию
    for (let i = 0; i < filtered.length; i++) {
        for (let j = i + 1; j < filtered.length; j++) {
            let distanceA = finder.distance(filtered[i]);
            let distanceB = finder.distance(filtered[j]);
            let cityA = filtered[i].profile.syncedData.city;
            let cityB = filtered[j].profile.syncedData.city;
            // Если пользователь не определил точное местоположение, то метод distance выдает null;
            // Это мы также применяем в сортировочном сравнении анкет
            if (cityA == cityB && (!distanceA || (distanceA > distanceB))) {
                let tmp = filtered[i];
                filtered[i] = filtered[j];
                filtered[j] = tmp;
            }
        }
    }

    // Возвращаем самую первую анкету
    return filtered[0];
}