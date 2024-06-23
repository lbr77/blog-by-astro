import { UAParser } from 'ua-parser-js';
export const util = (url: URL) => {
    const path = url.pathname;
    if (path === '/') {
        return "index";
    }
    if (path.startsWith("/posts")) {
        return "post";
    }
    if (path.startsWith("/archive")) {
        return "archive";
    }
    return "page";
}

export default function getUA(header: Headers) {
    const ua = new UAParser(header.get("user-agent") || "");
    const os = ua.getOS().name;
    console.log(os);
    if(os === 'Android') {
        return "mobile";
    }
    if(os == 'iOS') {
        return "mobile ios-safari";
    }
    return "";
}