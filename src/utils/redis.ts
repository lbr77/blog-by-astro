import {createClient} from 'redis';
import "dotenv/config";
const client = await createClient({url:process.env.REDIS_URL}).on('error', (err) => {
    console.log(err);
}).connect();

export async function get(key:string){

    return await client.get(key);
}

export async function set(key:string,value:string,ttl?:number){
    return await client.set(key,value,ttl);
}