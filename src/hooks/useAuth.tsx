import { createContext, useEffect, useMemo, useState } from "react";
import { LoginType, ProviderProps, UserType } from "../types"
import axios from "axios";
import { api_domain } from '../utilities';
import { isatty } from "tty";


// Create an authentication context
export const AuthContext = createContext<ProviderProps>({
    userInfo: null,
    Login: async () => null,
    Logout: () => { },
    creditCard: null,
    setCreditCard: () => { }
});

interface login {
    email: string;
    password: string;
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const api_login_url = `${api_domain}/signin`;
    const [creditCard, setCreditCard] = useState<string | null>(localStorage.getItem("userCC"));
    let userInfo: UserType = {
        isAdmin: localStorage.getItem("isAdmin") === 'true' ? true : false,
        role: localStorage.getItem("role"),
        user: localStorage.getItem("user")
    }
    const api_register_url = `${api_domain}/register`;

    console.log(`AuthProvider: Initial look at userInfo: ${JSON.stringify(userInfo)} :: Credit Card: ${creditCard}`);

    // call this function when you want to authenticate the user
    const Login = async (data: LoginType): Promise<string | null> => {
        try {
            const request: login = {
                email: data.email.replace(/^"(.*)"$/, "$1"),
                password: data.password
            }

            console.log(`AuthProvider: calling URL: ${api_login_url}`);
            const response = await axios.post(api_login_url, request);

            if (response.data.access_token) {
                console.log(`AuthProvider: Login Response: ${JSON.stringify(response.data)}`);
                userInfo.isAdmin = response.data.role?.includes("Admin") === true ? true : false;
                userInfo.role = response.data.role ? response.data.role : '';
                userInfo.user = request.email ? request.email : '';
                const userCC = response.data.card_number ? response.data.card_number : '';

                localStorage.setItem('token', response.data.access_token ? response.data.access_token : '');
                localStorage.setItem('user', userInfo.user ? userInfo.user : '');
                localStorage.setItem('role', userInfo.role ? userInfo.role : '');
                localStorage.setItem('isAdmin', userInfo.isAdmin ? "true" : "false");
                localStorage.setItem('userCC', userCC);
                setCreditCard(userCC);
                console.log(`AuthProvider: setting local storage and userInfo obj: token - ${response.data.access_token} :: card :: ${userCC} :: userInfo -  ${JSON.stringify(userInfo)}`);

                return userInfo.isAdmin ? 'statements' : 'expenses';
            }
            return null;
        } catch (error) {
            console.error("AuthProvider: Error during login: ", error);
            Logout();
            return null;
        }
    };

    // call this function to sign out logged in user
    const Logout = () => {
        console.log(`Logging out user: ${userInfo.user}`);
        localStorage.setItem('token', '');
        localStorage.setItem('role', '');
        localStorage.setItem('isAdmin', '');
        localStorage.setItem('userCC', '');
        localStorage.setItem('sasTokenCache', '');
        localStorage.setItem('user', '');
        setCreditCard(null);
    };

    const value = {
        userInfo,
        Login,
        Logout,
        creditCard,
        setCreditCard
    }
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider

// export const useAuth = () => {
//     return useContext(AuthContext);
// };