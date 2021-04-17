import { Response } from './../../codes';


export default function tagsValidator(tagsString: string): Response {
    if (!tagsString) {
        return Response.NO_VALUE;
    }
    let regexp = new RegExp('^[А-Яа-яA-Za-z0-9 _]*[А-Яа-яA-Za-z0-9][А-Яа-яA-Za-z0-9 _]*$', 'g');
    let regexpTest = regexp.test(tagsString);
    regexp.test(''); // dump
    if (regexpTest) {
        let tags = tagsString.split(/\s/g);
        if (tags.length > 16) {
            return Response.OUT_OF_RANGE;
        } else {
            return Response.VALID;
        }
    } else {
        return Response.INCORRECT;
    }
}