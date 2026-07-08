import Cookies from "js-cookie";

import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";


export const TOKEN_KEY = "access_token";
export const USER_KEY = "user";

export const saveAuth = (
  token: string,
  user: any
) => {

  console.log('user is this =>: ', user);

  localStorage.setItem("role", user?.role || "");
  
  Cookies.set(
    TOKEN_KEY,
    token,
    {
      expires: 7,
    }
  );

  Cookies.set(
    'role', 
    user?.role || "",
    {
      expires: 7,
    }
  )

  Cookies.set(
    USER_KEY,
    JSON.stringify(user),
    {
      expires: 7,
    }
  );
};

export const logout = () => {
  Cookies.remove(TOKEN_KEY);

  Cookies.remove(USER_KEY);

  Cookies.remove('active_branch_id')

  localStorage.removeItem('activeBranch');
};

export const getToken = () => {

  return Cookies.get(TOKEN_KEY);
};

export const getUser = () => {

  const user =
    Cookies.get(USER_KEY);

  return user
    ? JSON.parse(user)
    : null;
};