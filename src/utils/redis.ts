import {createClient} from 'redis';
import {REDIS_URL} from "../server_env.ts";

const client = await createClient({url: REDIS_URL}).on('error', (err) => {
    console.log(err);
}).connect().catch((err) => {
    console.log(err);
});

export async function get(key: string): Promise<string> {
    return await client.get(key).catch((err) => {
        console.log(err);
    }) as string;
}

export async function set(key: string, value: string, ttl?: number): Promise<void> {
    await client.set(key, value, ttl).catch((err) => {
        console.log(err);
    });
}

export async function del(key: string): Promise<void> {
    await client.del(key).catch((err) => {
        console.log(err);
    });
}