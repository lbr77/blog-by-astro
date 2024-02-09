import {getAllPosts} from "../utils/notion/posts.ts";
import {getCollection, getEntries} from "astro:content";

async function generateeSiteMap(){
    const posts = await getAllPosts();
    const pages  = await getCollection("pages");
    return `<xml version="1.0" encoding="UTF-8">
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     <url>
       <loc>http://nvme0n1p.dev/</loc>
     </url>
     <url>
       <loc>http://nvme0n1p.dev/archive</loc>
     </url>
     <url>
       <loc>http://nvme0n1p.dev/links</loc>
     </url>
     ${pages.map((page)=>{
         return `<url>
         <loc>http://nvme0n1p.dev/${page.slug}</loc>
</url>`
    })}
     ${
        posts.map((post)=>{
            return `<url>
                <loc>http://nvme0n1p.dev/posts/${post.slug}</loc>
                <lastmod>${post.updatedAt.split("T")[0]}</lastmod>
            </url>`
        })
    }
   </urlset>
   </xml>
   `
}
export async function GET(){
    return new Response(await generateeSiteMap(),{
        headers:{
            "Content-Type":"application/xml",
        }
    })
}