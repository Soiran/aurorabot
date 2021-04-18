import { Response } from '../../codes';


export default function ageValidator(age: string): Response {
    if (!age) {
        return Response.NO_VALUE;
    }
    let ageNumber = parseInt(age);
    if (ageNumber && ageNumber > 0) {
        return Response.VALID;
    } else {
        return Response.INCORRECT;
    }
}