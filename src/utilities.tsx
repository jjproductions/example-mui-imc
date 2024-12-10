import axios from "axios";
import { users } from "./types";

export const api_domain = `${process.env.REACT_APP_DOMAIN}${process.env.REACT_APP_API_VERSION}`;
//export const Authorization = localStorage ? `Bearer ${localStorage.getItem("token")}` : "";

const api_url = `${api_domain}/users?allusers=1`;

const auth = `Bearer ${localStorage.getItem('token')}`;
    const userHeaders = {
      "Authorization": auth
    };

export const getCCUsers = async () => {
    console.log(`Calling Users Api: ${api_url}`);

    try {    
        const response = await axios.get(api_url, {
            headers: userHeaders
        });
        console.log(`Get CC Users: ${JSON.stringify(response.data.response)}`);
        return response.data.users;
    } catch (error) {
        console.error("Error fetching data:", error);  
        return null;
    } 
};