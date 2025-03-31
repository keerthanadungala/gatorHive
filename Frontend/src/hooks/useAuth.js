export const isAuthenticated = () => {
  return !!localStorage.getItem("jwt_token");
};

export const logout = () => {
  localStorage.removeItem("jwt_token");
  localStorage.removeItem("user_email");
};
