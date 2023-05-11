// Retrieve the user data from local storage
const userFromStorage = JSON.parse(localStorage.getItem("user"));

// Set the initial state to the user data from storage (if available)
const initialState = userFromStorage ? userFromStorage : {};

export default function userReducer(state = initialState, action) {
  switch (action.type) {
    case "SIGN_IN":
      return action.payload;

    case "SIGN_OUT":
      localStorage.removeItem("user");
      return {};

    default:
      return state;
  }
}
