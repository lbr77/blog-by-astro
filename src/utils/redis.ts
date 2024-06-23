import {createClient} from 'redis';
import {REDIS_URL,ENABLE_REDIS} from "../server_env.ts";
let client = null;
if(ENABLE_REDIS){
    client = await createClient({url: REDIS_URL}).on('error', (err) => {
        console.log(err);
    }).connect().catch((err) => {
        console.log(err);
    });
}

export async function get(key: string): Promise<string> {
    if(ENABLE_REDIS){
        return await client.get(key) as string;
    }
    return null;
}

export async function set(key: string, value: string, ttl?: number): Promise<void> {
    if(ENABLE_REDIS){
        await client.set(key, value, ttl);
    }
    return;
}

export async function del(key: string): Promise<void> {
    if(ENABLE_REDIS){
        await client.del(key);
    }
    return;
}