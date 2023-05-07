import axios from "axios";

export async function saveAddress(
  values,
  email,
  setPersonalDetails,
  setBillingFormSubmitted
) {
  axios.post(`http://localhost:9002/${email}/address`, values);

  setPersonalDetails(values);
  setBillingFormSubmitted(true);
}
