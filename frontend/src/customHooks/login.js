import axios from "axios";
import { useDispatch } from "react-redux";
import { Signin } from "../actions/userAction";
import { useNavigate } from "react-router-dom";

function useLogin() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  async function login(values, handleCloseModal) {
    await axios.post("http://localhost:9002/login", values).then((res) => {
      if (res.data.message === "Login Successfull") {
        dispatch(
          Signin({ name: res.data.user.name, email: res.data.user.email })
        );
        localStorage.setItem(
          "user",
          JSON.stringify({
            name: res.data.user.name,
            email: res.data.user.email,
          })
        );
        navigate("/");
        handleCloseModal();
      } else if (res.data.message === "Password didn't match") {
        alert("Password didn't match");
      } else {
        alert("User not registered");
      }
    });

    handleCloseModal();
  }

  return login;
}

export default useLogin;
