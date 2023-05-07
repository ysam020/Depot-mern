import axios from "axios";

export async function getSavedAddress(setSavedAddress, email) {
  await axios(`http://localhost:9002/${email}/address`).then((response) =>
    setSavedAddress(response.data)
  );
}
