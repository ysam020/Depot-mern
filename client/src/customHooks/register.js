import apiClient from "../config/axiosConfig";
import { useNavigate } from "react-router-dom";

function useRegister() {
  const navigate = useNavigate();

  async function register(values, handleCloseModal) {
    await apiClient.post("/auth/signup", values).then((res) => {
      navigate("/");
      alert(res.data.message);
    });

    handleCloseModal();
  }

  return register;
}

export default useRegister;
