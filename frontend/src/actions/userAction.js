export const Signin = (data) => {
  return {
    type: "SIGN_IN",
    payload: data,
  };
};

export const Signout = (data) => {
  return {
    type: "SIGN_OUT",
  };
};
