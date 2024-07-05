import { UAParser } from 'ua-parser-js';
import fetch from 'node-fetch';
import {get, set} from "./redis.ts";
import crypto from "node:crypto";
import sizeOf from 'image-size';
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

export async function getImageInfo(url: string){
    console.log(url);
    const hash = crypto.createHash('md5').update(url).digest('hex');
    if(await get(`image:${hash}`)){
        return JSON.parse(await get(`image:${hash}`));
    }
    return await fetch(url).then(async (response)=>{
        const status = response.status;
        if(status == 200){
            const buffer = await response.arrayBuffer();
            const dim =  sizeOf(Buffer.from(buffer));
            try{
                const dim =  sizeOf(Buffer.from(buffer));
                console.log(url,dim);
                await set(`image:${hash}`, JSON.stringify(dim));
                return dim;
            }catch(err){
                console.log(err);
                return {
                    width: 0,
                    height: 0
                }
            }
            
        }
        return {
            width: 0,
            height: 0
        }
    }).catch((err)=>{
        console.log(err);
    });
}