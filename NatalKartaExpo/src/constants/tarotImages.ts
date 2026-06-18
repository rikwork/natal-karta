const imagesList = [
  require('../../assets/tarot/cards/the_fool.png'),
  require('../../assets/tarot/cards/the_star.png'),
  require('../../assets/tarot/cards/the_high_priestess.png'),
  require('../../assets/tarot/cards/the_empress.png'),
  require('../../assets/tarot/cards/the_emperor.png'),
  require('../../assets/tarot/cards/the_hierophant.png'),
  require('../../assets/tarot/cards/the_lovers.png'),
  require('../../assets/tarot/cards/the_chariot.png'),
  require('../../assets/tarot/cards/strength.png'),
  require('../../assets/tarot/cards/the_hermit.png'),
  require('../../assets/tarot/cards/wheel_of_fortune.png'),
];

export const tarotImages: { [key: string | number]: any } = {
  // Fallback / Back side
  default: require('../../assets/tarot/back/back.png'),
};

// Dynamically map all 78 card IDs to the available 11 images
for (let i = 1; i <= 78; i++) {
  tarotImages[i] = imagesList[(i - 1) % imagesList.length];
}
