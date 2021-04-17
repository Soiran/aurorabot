import { Response } from './../../codes';


export default function nameValidator(name: string): Response {
    if (!name) {
        return Response.NO_VALUE
    }
    let regexp = new RegExp('^[А-Яа-яA-Za-z0-9 _]*[А-Яа-яA-Za-z0-9][А-Яа-яA-Za-z0-9 _]*$', 'g');
    let regexpTest = regexp.test(name);
    regexp.test(''); // dump
    if (regexpTest && name.length <= 64) {
        return Response.VALID
    } else {
        return Response.INCORRECT
    }
}