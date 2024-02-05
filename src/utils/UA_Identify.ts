
export default function getUA(header: Headers){
    let ret = "";
    if(header.get("X_WAP_PROFILE")){
        // return "mobile";
        ret = "mobile";
    }
    if(header.get("user-agent")){
        let keys = ['mobile','nokia','sony','ericsson','mot','samsung','htc','sgh','lg','sharp','sie-','philips','panasonic','alcatel','lenovo','iphone','ipod','blackberry','meizu','android','netfront','symbian','ucweb','windowsce','palm','operamini','operamobi','openwave','nexusone','cldc','midp','wap']
        let ua = header.get("user-agent");
        for (let i = 0; i < keys.length; i++) {
            if (ua.indexOf(keys[i]) !== -1) {
               ret = "mobile";
            }
        }
        //iOS判定
        if(header.get("user-agent").indexOf("iPhone") !== -1){
            ret += " ios-safari";
        }
    }
    if(header.get("ACCEPT")){
        if(header.get("ACCEPT").indexOf("wap") !== -1){
            ret = "mobile";
        }
    }
    return ret;
}