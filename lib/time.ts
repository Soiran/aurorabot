import shedule, { Job } from 'node-schedule';


interface RepeatTime {
    second?: number,
    minute?: number,
    hour?: number,
    day?: number,
    month?: number,
    year?: number
};


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