const months = {
    1: 'января',
    2: 'февраля',
    3: 'марта',
    4: 'апреля',
    5: 'мая',
    6: 'июня',
    7: 'июля',
    8: 'августа',
    9: 'сентября',
    10: 'октября',
    11: 'ноября',
    12: 'декабря'
};


export default function date(unixTime: number) {
    let now = new Date();
    let dateObject = new Date(+unixTime);
    return `${dateObject.getDate()} ${months[dateObject.getDay()]}${now.getFullYear() === dateObject.getFullYear() ? ` ${now.getFullYear()} г.` : ''}`;
}