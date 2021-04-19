import { ContextDefaultState, MessageContext } from 'vk-io';

import { City, Response } from './../../typings/global';


export default async function geoValidator(geo?: MessageContext<ContextDefaultState>['geo'], city?: City): Promise<Response> {
    if (!city) {
       if (geo) {
            if (!geo.place?.city) {
                return Response.UNKNOWN_LOCATION;
            } else {
                return Response.VALID_LOCATION;
            }
       } else {
           return Response.NO_VALUE;
       }
    } else {
        if (!city.exists) {
            return Response.UNKNOWN_CITY;
        } else {
            return Response.VALID_CITY;
        }
    }
}