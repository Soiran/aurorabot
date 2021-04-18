import 'colors';
import stringify from 'stringifier';


const timeFormat = function(date: Date) : string {
    return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}.${date.getMilliseconds()}`
};


export default class Logger {
    alias: string;

    constructor(alias: string) {
        this.alias = alias;
    }

    log(message: any, type?: 'info' | 'warn' | 'error' | 'success') {
        if (typeof message !== 'string') {
            message = stringify.stringify(message, {
                intend: '    ',
                maxDepth: 3
            });
        }
        let time: string = timeFormat(new Date()).gray;
        let alias: string = this.alias.bgWhite.black;
        if (type) {
            switch (type) {
                case 'info':
                    alias = this.alias.bgBlue;
                    break;
                case 'warn':
                    alias = this.alias.bgYellow;
                    break;
                case 'error':
                    alias = this.alias.bgRed;
                    break;
                case 'success':
                    alias = this.alias.bgGreen;
                    break;
            }
        }
        console.log(`${time} ${alias}: ${message}`);
    }
}