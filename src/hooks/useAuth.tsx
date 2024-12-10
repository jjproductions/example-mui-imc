import { createContext, useEffect, useMemo, useState } from "react";
import { LoginType, ProviderProps, UserType } from "../types"
import axios from "axios";
import { api_domain } from '../utilities';


// Create an authentication context
export const AuthContext = createContext<ProviderProps>({
    userInfo: null,
    token: null,
    Login: async () => null,
    Logout: () => {},
});

interface login {
    email: string;
    password: string;
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const storedInfo: string | null = localStorage.getItem("user");
    const storedToken: string | null = localStorage.getItem("token");
    const [user, setUser] = useState<string | null>(storedInfo);
    //const [token, setToken] = useState<string | null>(storedToken);
    let token = localStorage.getItem('token');
    const storedAdmin: boolean = localStorage.getItem("isAdmin") === 'true' ? true : false;
    let isAdmin = storedAdmin;
    //const [isAdmin, setIsAdmin] = useState<boolean>(storedAdmin);
    //const [role, setRole] = useState<string | null>(localStorage.getItem("role"))
    const role = localStorage.getItem("role");
    console.log(`AuthProvider - local user:${storedInfo} :: local token:${storedToken}`);
    const api_login_url = `${api_domain}/signin`;
    const userInfo: UserType = {
        isAdmin: isAdmin,
        role: role,
        user: user
    }
    const api_register_url = `${api_domain}/register`;

    useEffect(() => {
        //localStorage.setItem('user', user as string);
        //localStorage.setItem('token', token as string);
        // localStorage.setItem('isAdmin', JSON.stringify(isAdmin));
        // localStorage.setItem('role', role as string);
        console.log(`AuthProvider: updating token`);
        console.log(`userInfo: user:${userInfo.user} role:${userInfo.role}`);
    }, [user])

    // call this function when you want to authenticate the user
    const Login = async (data: LoginType): Promise<string | null> => {
        try {
            const request: login = {
                email: data.email,
                password: data.password
            }

            console.log(`calling URL: ${api_login_url}`);
            const response = await axios.post(api_login_url, request);
            console.log(`Login Successful: token=${response.data.access_token}`);

            if (response.data.access_token) {
                console.log(response.data);
                const curRole: string = response.data.role;
                const isUserAdmin: boolean = curRole?.includes("Admin") === true ? true : false;
                //setToken(response.data.access_token);
                localStorage.setItem('token', response.data.access_token);
                token = response.data.access_token;
                setUser(data.email);
                
                console.log(`${data.email} role is ${curRole.includes("Admin")}:: token:${token}`);

                //setIsAdmin(isUserAdmin);
                //setRole(curRole);
                localStorage.setItem('role', curRole);
                localStorage.setItem('isAdmin', isUserAdmin ? "true" : "false");
                isAdmin = isUserAdmin
                userInfo.isAdmin = isUserAdmin;
                userInfo.role = curRole;

                return isUserAdmin ? 'statements' : 'expenses';
            }
            return null;
        } catch (error) {
            console.error("Error during login: ", error);
            Logout();
            return null;
        }
    };

    // call this function to sign out logged in user
    const Logout = () => {
        setUser(null);
        localStorage.setItem('token', '');
        localStorage.setItem('role', '');
        localStorage.setItem('isAdmin', '')
    };

    const value = {
        userInfo,
        token,
        Login,
        Logout
    }
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider

// export const useAuth = () => {
//     return useContext(AuthContext);
// };