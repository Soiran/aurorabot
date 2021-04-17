import axios from 'axios';

import { City } from '../types';


export default class GeoController {
    public static domain = 'http://api.geonames.org/';


    public static async search(name: string): Promise<City> {
        let { data } = await axios.get(encodeURI(`${GeoController.domain}searchJSON?q=${name}&lang=ru&username=ascentdev`));
        if (data.totalResultsCount === 0) {
            return { exists: false };
        }
        let city = data.geonames[0];
        return {
            exists: true,
            name: city.name,
            latitude: city.lat,
            longitude: city.lng
        } as City;
    }
}