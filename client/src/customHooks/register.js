import axios from "axios";
import { useNavigate } from "react-router-dom";

function useRegister() {
  const navigate = useNavigate();

  async function register(values, handleCloseModal) {
    await axios.post("http://localhost:9002/register", values).then((res) => {
      navigate("/");
      alert(res.data.message);
    });

    handleCloseModal();
  }

  return register;
}

export default useRegister;
