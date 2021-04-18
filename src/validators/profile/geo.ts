import { ContextDefaultState, MessageContext } from 'vk-io';

import GeoController from '../../controllers/geo.controller';
import { Response } from './../../codes';


export default async function geoValidator(cityName: string, geo: MessageContext<ContextDefaultState>['geo']): Promise<Response> {
    if (!geo) {
        if (!cityName) {
            return Response.NO_VALUE;
        } else {
            let city = await GeoController.search(cityName);
            if (city.exists) {
                return Response.VALID_CITY;
            } else {
                return Response.NOT_FOUND;
            }
        }
    } else {
        if (geo.place) {
            return Response.VALID_LOCATION;
        } else {
            return Response.UNKNOWN_LOCATION;
        }
    }
}