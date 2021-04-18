const months = {
    0: 'января',
    1: 'февраля',
    2: 'марта',
    3: 'апреля',
    4: 'мая',
    5: 'июня',
    6: 'июля',
    7: 'августа',
    8: 'сентября',
    9: 'октября',
    10: 'ноября',
    11: 'декабря'
};


export default function date(unixTime: number) {
    let now = new Date();
    let dateObject = new Date(+unixTime);
    return `${dateObject.getDate()} ${months[dateObject.getMonth()]}${now.getFullYear() === dateObject.getFullYear() ? '' : ` ${now.getFullYear()} г.`}`;
}