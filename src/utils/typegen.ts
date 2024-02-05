
export const getType = (url: URL) => {
    const path = url.pathname;
    if(path === '/'){
        return "index";
    }
    if(path.startsWith("/posts")){
        return "post";
    }
    if(path.startsWith("/archive")){
        return "archive";
    }
    return "page";
}
