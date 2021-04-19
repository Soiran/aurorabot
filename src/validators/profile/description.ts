import { Response } from './../../typings/global';


export default function descriptionValidator(description: string): Response {
    if (!description) {
        return Response.NO_VALUE;
    }
    if (description.length < 3 || description.length > 512) {
        return Response.OUT_OF_RANGE;
    }
    return Response.VALID;
}