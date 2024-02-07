import {Client} from '@notionhq/client';
import {NOTION_API_SECRET, NOTION_POST_DATABASE_ID} from "../../server_env.ts";
import {get, set} from "../redis.ts";

export const client = new Client({
    auth: NOTION_API_SECRET,
});

export async function getWordCount(blockId) {
    // WIP
    return 0;
}

async function updateStatic(posts) {
    let tags = [];
    let years = {};
    let words = 0;
    posts.map(async (post) => {
        let year = new Date(post.createdAt).getFullYear();
        if (!years[year]) {
            years[year] = [];
        }
        years[year].push(post);
        post.tags.map((tag) => {
            tags.push(tag);
        });
        words += await getWordCount(post.id);
    })
    tags = Array.from(new Set(tags));
    await set("notion:tags", JSON.stringify(tags));
    await set("notion:years", JSON.stringify(years));
    await set("notion:words", JSON.stringify(words));
}

export async function getStatics() {
    const tags = await get("notion:tags");
    const years = await get("notion:years");
    const words = await get("notion:words");
    const posts = await getAllPosts();
    return {
        tags: JSON.parse(tags),
        years: JSON.parse(years),
        words: JSON.parse(words),
        posts: posts.length
    }
}

export async function getAllPosts() {
    // redis cache
    const cache = await get("notion:posts_data");
    if (cache) { //skip cache for testing purpose
        return JSON.parse(cache);
    }
    const params = {
        database_id: NOTION_POST_DATABASE_ID,
        filter: {
            and: [
                {
                    property: "Published",
                    checkbox: {
                        equals: true
                    }
                },
                {
                    property: "Updated",
                    date: {
                        on_or_before: new Date().toISOString()
                    }
                },
                {
                    property: "Created",
                    date: {
                        on_or_before: new Date().toISOString()
                    }
                }
            ]
        },
        sorts: [
            {
                property: "Created",
                direction: "descending"
            }
        ],
        page_size: 100,
    };
    let results = [];
    while (true) {
        const res = await client.databases.query(params as any);
        results = results.concat(res.results);
        if (!res.has_more) {
            break;
        }
        params["start_cursor"] = res.next_cursor;
    }
    results = results.map((post) => {
        const banner = post.properties.banner.rich_text.length != 0 ? post.properties.banner.rich_text[0].plain_text : "";
        const excerpt = post.properties.excerpt.rich_text.length != 0 ? post.properties.excerpt.rich_text[0].plain_text : "";
        const title = post.properties.Content.title.length != 0 ? post.properties.Content.title[0].plain_text : "";
        const slug = post.properties.slug.rich_text.length != 0 ? post.properties.slug.rich_text[0].plain_text : "";
        const bannerStyle = post.properties.bannerStyle.select ? post.properties.bannerStyle.select.name : "0";
        const bannerAsCover = post.properties.bannerAsCover.select ? post.properties.bannerAsCover.select.name : "0";
        return {
            id: post.id,
            title: title,
            tags: post.properties.Tags.multi_select.map((item) => item.name),
            slug: slug,
            createdAt: post.properties.Created.created_time,
            updatedAt: post.properties.Updated.last_edited_time,
            published: post.properties.Published.checkbox,
            banner: banner,
            excerpt: excerpt,
            bannerStyle: bannerStyle,
            bannerAsCover: bannerAsCover,
        }
    });
    // cache the results
    await set("notion:posts", JSON.stringify(results), 15 * 60); // 15min
    updateStatic(results);
    return results;
}


export async function getPosts(pagesize = 10, nowPage = 0) {
    const allPosts = await getAllPosts().catch((err) => {
        console.error(err);
        return [];
    });
    return allPosts.slice((nowPage - 1) * pagesize, nowPage * pagesize);
}

export async function getPostsByTag(slug, pagesize, nowPage) {
    const allPosts = await getAllPosts().catch((err) => {
        console.error(err);
        return [];
    });
    return allPosts
        .filter((post) => post.tags.some((item) => {
            // console.log(item ,slug,item === slug)
            return item === slug;
        }))
        .slice((nowPage - 1) * pagesize, nowPage * pagesize);
}

export async function getPostBySlug(slug: string) {
    const allPosts = await getAllPosts().catch((err) => {
        console.error(err);
        return [];
    });
    ;
    return allPosts.find((post) => post.slug === slug);
}

export async function getAllBlocksByBlockId(blockId: string) {
    const cache = await get(`notion:${blockId}`);
    // if(cache){ // skip cache for testing purpose
    //     return JSON.parse(cache);
    // }
    let blocks = [];
    const params = {
        block_id: blockId,
    };
    while (true) {
        const res = await client.blocks.children.list(
            params as any
        ).catch((err) => {
            console.error(err);
            return null;
        });
        blocks = blocks.concat(res.results);
        if (!res.has_more) {
            break;
        }
        params["start_cursor"] = res.next_cursor;
    }
    blocks = blocks.map((block) => {
        const type = block.type;
        const id = block.id;
        return {
            type: type,
            id: id,
            content: block[type]
        }
    })
    // cache the results
    await set(`notion:${blockId}`, JSON.stringify(blocks), 24 * 60 * 60);
    // 1 day.
    return blocks;
}

export async function getAllTags() {
    const cache = await get("notion:tags");
    if (cache) {
        return JSON.parse(cache);
    }
    const posts = await getAllPosts();
    let tags = [];
    posts.map((post) => {
        post.tags.map((tag) => {
            tags.push(tag);
        });
    });
    tags = Array.from(new Set(tags));
    await set("notion:tags", JSON.stringify(tags));
    return tags;
}