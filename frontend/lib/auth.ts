import Cookies from "js-cookie";

export const TOKEN_KEY = "access_token";
export const USER_KEY = "user";

interface AuthUser {
  role?: string;
  [key: string]: unknown;
}

export const saveAuth = (
  token: string,
  user: AuthUser
) => {

  localStorage.setItem("role", user?.role || "");
  
  Cookies.set(
    TOKEN_KEY,
    token,
    {
      expires: 7,
      // expires: 30 / 86400,
    }
  );

  Cookies.set(
    'role', 
    user?.role || "",
    {
      expires: 7,
      // expires: 30 / 86400,
    }
  )

  Cookies.set(
    USER_KEY,
    JSON.stringify(user),
    {
      expires: 7,
      // expires: 30 / 86400,
    }
  );
};

export const logout = () => {
  Cookies.remove(TOKEN_KEY);

  Cookies.remove(USER_KEY);

  Cookies.remove('role');

  Cookies.remove('active_branch_id')

  localStorage.removeItem('role');

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
