import React from "react";
import CardTypeSVG from "./CardTypeSVG";
import { months } from "../../assets/data/Months";
import { years } from "../../assets/data/Years";
import { handleCardFlip } from "../../utils/handleCardFlip";
import useHandleCardDetails from "../../customHooks/handleCardDetails";

function CheckoutCard(props) {
  const {
    handleCardDetails,
    cardNumber,
    setCardNumber,
    setCardHolder,
    setMonth,
    setYear,
    setCvv,
    toggleBackCard,
    setToggleBackCard,
  } = useHandleCardDetails(props);

  return (
    <form action="submit" onSubmit={handleCardDetails}>
      <div
        className={`checkout-card-container ${
          toggleBackCard ? "isFlipped" : ""
        }`}
        onClick={(e) => handleCardFlip(e, setToggleBackCard, toggleBackCard)}
      >
        <div className="front-card">
          <div className="header">
            <div className="logo">
              <img
                src={require("../../assets/images/logo_white.png")}
                alt="card-logo"
                width={100}
              />
            </div>
            <div className="card-type">
              <CardTypeSVG />
            </div>
          </div>
          <div className="card-content">
            <div className="card-number">
              <p>Card Number</p>
              <fieldset
                className="card-number-field"
                onChange={(e) =>
                  e.target.value.length === 4
                    ? setCardNumber([...cardNumber, e.target.value])
                    : ""
                }
              >
                <input
                  type="tel"
                  className="card-number__part"
                  maxLength="4"
                  pattern="[^\\s]*"
                />
                <input
                  type="tel"
                  className="card-number__part"
                  maxLength="4"
                  pattern="[^\\s]*"
                />
                <input
                  type="tel"
                  className="card-number__part"
                  maxLength="4"
                  pattern="[^\\s]*"
                />
                <input
                  type="tel"
                  className="card-number__part"
                  maxLength="4"
                  pattern="[^\\s]*"
                />
              </fieldset>
            </div>
            <div className="card-details">
              <div className="card-holder">
                <p>Card Holder</p>
                <div className="card-holder-name">
                  <input
                    type="text"
                    onChange={(e) => {
                      setCardHolder(e.target.value);
                    }}
                    className="cardholder-name"
                  />
                </div>
              </div>
              <div className="validity">
                <p>Expires</p>

                <select
                  name="month"
                  onChange={(e) => setMonth(e.target.value)}
                  className="front-card-select"
                >
                  {months
                    .slice(
                      +new Date().toLocaleDateString().split("/")[1] - 1,
                      12
                    )
                    .map((val) => {
                      return <option key={val.id}>{val.option}</option>;
                    })}
                </select>

                <select
                  name="year"
                  onChange={(e) => setYear(e.target.value)}
                  className="front-card-select"
                >
                  {years.map((val) => {
                    return <option key={val.id}>{val.option}</option>;
                  })}
                </select>
              </div>
            </div>
          </div>
        </div>
        <div className="back-card">
          <div className="mag-strip"></div>
          <div className="cvv-container">
            <p>CVV</p>
            <div className="cvv">
              <input
                type="text"
                maxLength={3}
                onChange={(e) => setCvv(e.target.value)}
                className="back-card-cvv"
                pattern="[0-9]{3}"
                onKeyPress={(e) => {
                  if (isNaN(parseInt(e.key))) {
                    e.preventDefault();
                  }
                }}
              />
            </div>
            <div className="card-type">
              <CardTypeSVG />
            </div>
          </div>
        </div>
      </div>
      <p className="card-message">Click the card to enter CVV</p>
      <button type="submit" className="submit-card-details">
        Place order
      </button>
    </form>
  );
}

export default CheckoutCard;
