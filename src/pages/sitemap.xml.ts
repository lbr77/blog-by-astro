import {getAllPosts, getAllTags} from "../utils/notion/posts.ts";
import {getCollection} from "astro:content";

async function generateeSiteMap() {
    const posts = await getAllPosts();
    const pages = await getCollection("pages");
    const tags = await getAllTags();
    // @ts-ignore
    let ret = `<xml version="1.0" encoding="UTF-8">
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     <url>
       <loc>http://nvme0n1p.dev/</loc>
     </url>
     <url>
       <loc>http://nvme0n1p.dev/archive</loc>
     </url>
     <url>
       <loc>http://nvme0n1p.dev/links</loc>
     </url>`
    for (let post of posts) {
        ret += `<url>
       <loc>http://nvme0n1p.dev/post/${post.slug}</loc>
     </url>`
    }
    for (let page of pages) {
        ret += `<url>
       <loc>http://nvme0n1p.dev/${page.slug}</loc>
     </url>`
    }
    for (let tag of tags) {
        ret += `<url>
       <loc>http://nvme0n1p.dev/category/${tag}</loc>
     </url>`
    }
    ret += `</urlset>
   </xml>
   `
    return ret;
}

export async function GET() {
    return new Response(await generateeSiteMap(), {
        headers: {
            "Content-Type": "application/xml",
        }
    })
}