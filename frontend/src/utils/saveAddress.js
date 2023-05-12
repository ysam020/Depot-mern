import axios from "axios";

export async function saveAddress(
  values,
  email,
  setPersonalDetails,
  setBillingFormSubmitted
) {
  axios.post(`https://depot-d06m.onrender.com/${email}/address`, values);

  setPersonalDetails(values);
  setBillingFormSubmitted(true);
}
