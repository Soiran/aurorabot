import { Response } from '../../typings/global';


export default function messageValidator(message: string): Response {
    if (!message) {
        return Response.NO_VALUE;
    }
    if (message.length < 3 || message.length > 256) {
        return Response.OUT_OF_RANGE;
    }
    return Response.VALID;
}