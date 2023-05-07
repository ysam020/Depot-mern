import { useEffect, useState } from "react";
import { getSavedAddress } from "../utils/getSavedAddress";
import { useSelector } from "react-redux";

function useSavedAddressHook() {
  const [savedAddress, setSavedAddress] = useState([]);
  const [useSavedAddress, setUseSavedAddress] = useState(true);
  const email = useSelector((state) => state.userReducer.email);

  useEffect(() => {
    setUseSavedAddress(savedAddress.length === 0 ? false : true);
  }, [savedAddress]);

  useEffect(() => {
    getSavedAddress(setSavedAddress, email);
    // eslint-disable-next-line
  }, [email]);

  return { savedAddress, setSavedAddress, useSavedAddress, setUseSavedAddress };
}

export default useSavedAddressHook;
