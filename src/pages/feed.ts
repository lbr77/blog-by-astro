import rss from '@astrojs/rss';
import {THEME_CONFIG as config} from '../theme.config.ts';
import {getCollection} from "astro:content";

export async function GET(ctx){
    // @ts-ignore
    const blog = await getCollection('posts');
    // @ts-ignore
    return rss({
        title: config.siteConfig.title,
        description: config.siteConfig.desc,
        site: config.siteConfig.website,
        items: blog.map((p)=>({
            title: p.data.title,
            pubDate: p.data.date,
            description: p.data.excerpt,
            link: "/posts/"+p.slug,
        })),
    })
}