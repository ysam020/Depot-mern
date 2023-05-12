import axios from "axios";

export async function getSavedAddress(setSavedAddress, email) {
  await axios(`https://depot-d06m.onrender.com/${email}/address`).then(
    (response) => setSavedAddress(response.data)
  );
}
