import rss from '@astrojs/rss';
import {THEME_CONFIG as config} from '../theme.config.ts';
import {getAllPosts} from "../utils/notion/posts.ts";

export async function GET(){
    // @ts-ignore
    const blog = await getAllPosts();
    // @ts-ignore
    return rss({
        title: config.siteConfig.title,
        description: config.siteConfig.desc,
        site: config.siteConfig.website,
        items: blog.map((p)=>({
            title: p.title,
            pubDate: p.createdAt,
            description: p.excerpt,
            link: "/posts/"+p.slug,
        })),
    })
}