export const handleCardFlip = (e, setToggleBackCard, toggleBackCard) => {
  if (
    e.target.className !== "card-number__part" &&
    e.target.className !== "cardholder-name" &&
    e.target.className !== "front-card-select" &&
    e.target.className !== "back-card-cvv"
  ) {
    setToggleBackCard(!toggleBackCard);
  }
};
