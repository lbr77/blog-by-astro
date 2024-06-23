import { buildSearchIndex } from "../../utils/notion/posts.ts"
export async function GET(){
    return new Response(JSON.stringify(await buildSearchIndex()
    ))
}