import { getAllPosts,getContent } from "../../utils/notion/posts";

export async function GET(ctx) {
    const posts = await getAllPosts();
    let s = [];
    for(let i of posts){
        let pictures = [];
        const r = await getContent(i.id);
        for(let j of r){
            if(j.type === "image"){
                console.log(j)
                pictures.push(j);
            }
        }
        if(pictures.length > 0){
            s.push({id:i.id,pictures:pictures});
        }
    }
    return new Response(JSON.stringify({ code: 200, msg: "success", data: s }));
}