import { useState } from "react";

function useHandleCardDetails(props) {
  const [cardNumber, setCardNumber] = useState([]);
  const [cardHolder, setCardHolder] = useState();
  const [month, setMonth] = useState(
    new Date().toLocaleDateString().split("/")[1]
  );
  const [year, setYear] = useState(
    new Date().toLocaleDateString().split("/")[2]
  );
  const [cvv, setCvv] = useState();
  const [toggleBackCard, setToggleBackCard] = useState(false);

  const handleCardDetails = (e) => {
    e.preventDefault();
    if (!cardNumber || !cardHolder?.trim() || !month || !year || !cvv?.trim()) {
      alert("Enter Correct Card Details");
      return;
    }

    const address = props.useSavedAddress
      ? props.selectedAddress
      : props.personalDetails;

    const orderDetails = {
      ...address,
      cardNumber,
      cardHolder,
      month,
      year,
      cvv,
    };
  };
  return {
    handleCardDetails,
    cardNumber,
    setCardNumber,
    setCardHolder,
    setMonth,
    setYear,
    setCvv,
    toggleBackCard,
    setToggleBackCard,
  };
}

export default useHandleCardDetails;
