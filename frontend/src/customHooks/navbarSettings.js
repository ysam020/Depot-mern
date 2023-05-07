import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Signout } from "../actions/userAction";

function useNavbarSettings() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const settings = [
    {
      name: "Orders",
      onClick: () => {
        navigate("/orders");
      },
    },
    {
      name: "Cart",
      onClick: () => {
        navigate("/cart");
      },
    },
    {
      name: "Wishlist",
      onClick: () => {
        navigate("/wishlist");
      },
    },
    {
      name: "Addresses",
      onClick: () => {
        navigate("/addresses");
      },
    },
    { name: "Logout", onClick: () => dispatch(Signout()) },
  ];

  return settings;
}

export default useNavbarSettings;
