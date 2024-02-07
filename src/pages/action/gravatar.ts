
import {sign} from "../../utils/signature.ts";
// gravatar转发（乐
export async function GET(ctx){
    const email = ctx.url.searchParams.get("email");
    const params = ctx.url.searchParams.toString();
    const hashes = sign(email);
    if(email === null) return new Response("email is required", {status: 400});
    return await fetch(`https://www.gravatar.com/avatar/${hashes}?${params}`);
}