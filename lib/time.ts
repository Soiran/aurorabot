import shedule, { Job } from 'node-schedule';

import { TimeSet } from '../src/typings/global';


export function unixTime(timeSet: TimeSet) {
    return (timeSet.ms || 0) +
        (timeSet.seconds * 1000 || 0) +
        (timeSet.minutes * 1000 * 60 || 0) +
        (timeSet.hours * 1000 * 60 * 60 || 0) +
        (timeSet.days * 1000 * 60 * 60 * 24 || 0);
}


export class TimeoutController {
    public callback: (fireDate: Date) => void;
    public date: Date;
    public shedule: Job;


    constructor(date: Date, callback: (fireDate: Date) => void) {
        this.date = date;
        this.callback = callback;
        this.shedule = shedule.scheduleJob(date, callback); 
    }

    public cancel() {
        this.shedule.cancel();
    }
}

export class IntervalController {
    public callback: (fireDate: Date) => void;
    public repeatTime: number;
    public shedule: Job;


    constructor(repeatTime: number, callback: (fireDate: Date) => void) {
        let now = new Date().getTime();
        this.repeatTime = repeatTime;
        this.callback = callback;
        this.repeat(now);
    }

    private repeat(time: number) {
        this.shedule = shedule.scheduleJob(new Date(time + this.repeatTime), fireDate => {
            this.callback(fireDate);
            this.repeat(fireDate.getTime());
        });
    }

    public cancel() {
        this.shedule.cancel();
    }
}