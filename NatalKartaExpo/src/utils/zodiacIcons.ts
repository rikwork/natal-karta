export const ZODIAC_ICONS: Record<string, any> = {
  Овен: require('../../assets/images/zodiac/aries_icon.png'),
  Телец: require('../../assets/images/zodiac/taurus_icon.png'),
  Близнецы: require('../../assets/images/zodiac/gemini_icon.png'),
  Рак: require('../../assets/images/zodiac/cancer_icon.png'),
  Лев: require('../../assets/images/zodiac/leo_icon.png'),
  Дева: require('../../assets/images/zodiac/virgo_icon.png'),
  Весы: require('../../assets/images/zodiac/libra_icon.png'),
  Скорпион: require('../../assets/images/zodiac/scorpio_icon.png'),
  Стрелец: require('../../assets/images/zodiac/sagittarius_icon.png'),
  Козерог: require('../../assets/images/zodiac/capricorn_icon.png'),
  Водолей: require('../../assets/images/zodiac/aquarius_icon.png'),
  Рыбы: require('../../assets/images/zodiac/pisces_icon.png'),
};

export const getZodiacIcon = (sign: string) => {
  return ZODIAC_ICONS[sign] || ZODIAC_ICONS['Овен'];
};
