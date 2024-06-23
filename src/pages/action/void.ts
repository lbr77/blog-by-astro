import {get,set} from '../../utils/redis.ts';

export async function POST(ctx){
    const {id,type} = await ctx.request.json();
    if(type === "up"){
        let cur = await get(id);
        if(cur){
            await set(id,parseInt(cur)+1);
        }else{
            await set(id,1);
        }
    }
    if(type === "down"){
        let cur = await get(id);
        if(cur){
            await set(id,parseInt(cur)-1);
        }else{
            await set(id,-1);
        }
    }
    return new Response(JSON.stringify({code:200,msg:"success"}))
}