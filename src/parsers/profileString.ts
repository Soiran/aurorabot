import { ParsedProfileString, Response } from '../typings/global';


export default function profileStringParser(profileString: string): ParsedProfileString | Response {
    try {
        let patterns = profileString.substr(profileString.indexOf('\n\n') + 2).split('\n', 2);
        let [ name, age, city ] = patterns[0].split(',');
        let description = patterns[1]?.trim() || null;
        return {
            name: name.trim(),
            age: parseInt(age),
            city: city.trim(),
            description: description
        }
    } catch {
        return Response.NOT_VALID;
    }
}


console.log(profileStringParser('fuck you lol:\n\njesus, ok, bro\nfuck'))