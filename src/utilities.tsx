export const api_domain = `${process.env.REACT_APP_DOMAIN}${process.env.REACT_APP_API_VERSION}`;

export const Authorization = localStorage ? `Bearer ${localStorage.getItem("jwtToken")}` : "";