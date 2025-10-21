import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { signout } from "../redux/features/users/users";

function useNavbarSettings() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const settings = [
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
      name: "Orders",
      onClick: () => {
        navigate("/orders");
      },
    },
    {
      name: "Addresses",
      onClick: () => {
        navigate("/addresses");
      },
    },
    { name: "Logout", onClick: () => dispatch(signout()) },
  ];

  return settings;
}

export default useNavbarSettings;
