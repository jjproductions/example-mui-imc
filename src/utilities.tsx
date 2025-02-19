import axios from "axios";
import { sasTokenCache, users } from "./types";

export const api_domain = `${process.env.REACT_APP_DOMAIN}${process.env.REACT_APP_API_VERSION}`;
//export const Authorization = localStorage ? `Bearer ${localStorage.getItem("token")}` : "";

const api_url = `${api_domain}/users?allusers=1`;

const authToken = localStorage.getItem('token');

// Create an Axios instance with default headers
export const axiosInstance = axios.create({
    headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
    },
});

export const getCCUsers = async () => {
    console.log(`Utilities:getCCUsers: Calling Users Api: ${api_url}`);

    try {
        const response = await axiosInstance.get(api_url);
        console.log(`Utilities:getCCUsers: Get CC Users: ${JSON.stringify(response.data.response)}`);
        return response.data.users;
    } catch (error) {
        console.error("Utilities:getCCUsers: Error fetching data:", error);
        return null;
    }
};

export const checkSASExpiration = (sasToken: string) => {
    try {
        const urlParams = new URLSearchParams(sasToken.split("?")[1]);
        const expiry = urlParams.get("se");

        if (!expiry) {
            console.log("Utilities:checkSASExpiration: Invalid SAS token. Expiry date not found.");
            return true;
        }

        const expiryDateTime = new Date(expiry);
        const now = new Date();

        return (expiryDateTime <= now);
    } catch (error) {
        console.error("Utilities:checkSASExpiration: parsing SAS token.");
        return true;
    }
};

// called when a new token is geneated and needs to be cached
export const sasTokenCacheUpdate = (sasToken: string) => {
    let sasTokenCache: sasTokenCache[] = [localStorage.getItem("sasTokenCache") ? JSON.parse(localStorage.getItem("sasTokenCache") as string) : []];
    const urlParams: URLSearchParams = new URLSearchParams(sasToken.split("?")[1]);
    const tokenExpiration: string | null = urlParams.get("se");   // get the expiration date from the SAS token);
    const tokenKey: string | null = sasToken.split("/").slice(4).join("/").split("?")[0];
    console.log(`Utilities:sasTokenCacheUpdate:  token - ${sasToken} :: Expiration - ${tokenExpiration} :: Key - ${tokenKey}`);
    // remove if the token is already in the cache
    sasTokenCache = sasTokenCache.filter((item) => item.key !== tokenKey);
    if (tokenExpiration && tokenKey) {
        sasTokenCache.push({ token: sasToken, expiration: tokenExpiration, key: tokenKey });
        localStorage.setItem("sasTokenCache", JSON.stringify(sasTokenCache));
        console.log(`Utilities:sasTokenCacheUpdate:  token - ${JSON.stringify(sasTokenCache)}}`);
    }
}

export const sasIsTokenCached = (sasToken: string) => {
    try {
        let sasTokenCache: sasTokenCache[] = [localStorage.getItem("sasTokenCache") ? JSON.parse(localStorage.getItem("sasTokenCache") as string) : []];
        const cachedToken: sasTokenCache = sasTokenCache?.filter((item) => item.key === sasToken)[0];
        console.log(`Utilities:sasIsTokenCached:  token - ${sasToken} :: Cached Token - ${cachedToken?.token}`);
        if (cachedToken && cachedToken.token !== '') {
            return (new Date(cachedToken.expiration) <= new Date()) ? undefined : cachedToken.token;
        }
        else {
            console.log(`Utilities:sasIsTokenCached:  token not in cache}`);
            return undefined;
        }
    } catch (error) {
        console.error("Utilities:sasIsTokenCached: Error checking SAS token.");
        return undefined;
    } finally {

    }

}
