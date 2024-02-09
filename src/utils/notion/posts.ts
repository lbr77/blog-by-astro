import {Client, isFullBlock} from '@notionhq/client';
import {NOTION_API_SECRET, NOTION_POST_DATABASE_ID} from "../../server_env.ts";
import {del, get, set} from "../redis.ts";
import katex from "katex";

export const client = new Client({
    auth: NOTION_API_SECRET,
});
//非文章内容
//构建索引
export async function buildSearchIndex() {
    const cache = await get("notion:search_index");
    if (cache) {
        return {posts: JSON.parse(cache),pages: []};
    }
    ;
    const posts = await getAllPosts();
    const indexs = [];
    for (const post of posts) {
        let index = {
            title: post.title,
            date: post.createdAt,
            tags: post.tags,
            path: `/posts/${post.slug}`,
            text: getPureText(await getContent(post.id))
        };
        let tags = post.tags;
        indexs.push(index);
    }
    await set("notion:search_index", JSON.stringify(indexs),15 * 60);
    return {posts: indexs,pages: []};
}

async function getTotalWords() {
    let totalwords = await get("notion:totalwords");
    if (totalwords) {
        return JSON.parse(totalwords);
    }
    await del("notion:totalwords");
    return 0;
}

async function setTotalWords(words) {
    await set("notion:totalwords", JSON.stringify(words));
}

export async function getWordCount(blockId) {
    const cache = await get(`notion:wordcount:${blockId}`);
    if (cache) {
        return JSON.parse(cache);
    }
    const results = await getContent(blockId);
    let words = 0;
    for (const result of results) {
        // console.log(result);
        words += result.text.length;
    }
    await set(`notion:wordcount:${blockId}`, JSON.stringify(words));
    let totalwords = await getTotalWords();
    totalwords += words;
    await setTotalWords(totalwords);
    return words;
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
    // if (cache) { //skip cache for testing purpose
    //     return JSON.parse(cache);
    // }
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

// 文章内容相关
async function getAllBlocksByBlockId(blockId: string) {
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
    return blocks;
}

function resultFormat(result) {
    const notionBlock = {
        text: "",
        type: "",
        children: [],
        children_level: 0,
        options: null,
    }
    switch (result.type) {
        case "paragraph":
            notionBlock.type = "paragraph";
            notionBlock.text = loopText(result.paragraph.rich_text);
            break;
        case "heading_1":
            notionBlock.type = "heading_1";
            notionBlock.text = loopText(result.heading_1.rich_text);
            break;
        case "heading_2":
            notionBlock.type = "heading_2";
            notionBlock.text = loopText(result.heading_2.rich_text);
            break;
        case "heading_3":
            notionBlock.type = "heading_3";
            notionBlock.text = loopText(result.heading_3.rich_text);
            break;
        case "bulleted_list_item":
            notionBlock.type = "bulleted_list_item";
            notionBlock.text = loopText(result.bulleted_list_item.rich_text);
            break;
        case "numbered_list_item":
            notionBlock.type = "numbered_list_item";
            notionBlock.text = loopText(result.numbered_list_item.rich_text);
            break;
        case "toggle":
            notionBlock.type = "toggle";
            notionBlock.text = loopText(result.toggle.rich_text);
            break;
        case "quote":
            notionBlock.type = "quote";
            notionBlock.text = loopText(result.quote.rich_text);
            break;
        case "callout":
            notionBlock.type = "callout";
            notionBlock.text = loopText(result.callout.rich_text);
            notionBlock.options = {
                icon: result.callout.icon,
            };
            break;
        case "code":
            notionBlock.type = "code";
            notionBlock.text = loopText(result.code.rich_text);
            notionBlock.options = {
                language: result.code.language,
            };
            break;
        case "image":
            notionBlock.type = "image";
            notionBlock.text = result.image.caption.length != 0 ? loopText(result.image.caption) : "";
            notionBlock.options = {
                url:
                    result.image.type == "file"
                        ? result.image.file.url
                        : result.image.external.url,
            };
            break;
        case "equation":
            notionBlock.type = "equation";
            notionBlock.text = result.equation.expression;
            break;
        case "synced_block":
            notionBlock.type = "synced_block";
            notionBlock.text = "";
            break;
        default:
            break
    }
    notionBlock.type = result.type;
    return notionBlock;
}

function loopText(texts) {
    // deal with richtexts
    let htmlString = "";
    let textHolder = "";
    for (const text of texts) {
        textHolder = "";
        if (text.href != null) {
            textHolder = `<a href="${text.href}" target="_blank">${text.plain_text}</a>`;
        } else if (text.type == "equation") {
            textHolder = katex.renderToString(text.plain_text, {
                throwOnError: false,
                output: "mathml",
            });
        } else {
            textHolder = text.plain_text;
        }
        if (text.annotations.bold == true) {
            textHolder = `<strong>${textHolder}</strong>`;
        }
        if (text.annotations.italic == true) {
            textHolder = `<i>${textHolder}</i>`;
        }
        if (text.annotations.underline == true) {
            textHolder = `<ins>${textHolder}</ins>`;
        }
        if (text.annotations.strikethrough == true) {
            textHolder = `<del>${textHolder}</del>`;
        }
        if (text.annotations.code == true) {
            textHolder = `<code>${textHolder}</code>`;
        }
        htmlString += textHolder;
    }
    return htmlString;
}

async function addToContents(results, childLvl = 0) {
    let notionBlocks = [];
    let notionBlock = {
        text: "",
        type: "",
        children: [],
        children_level: 0,
        options: null,
    };
    for (const result of results) {
        if (isFullBlock(result)) {
            notionBlock = resultFormat(result);
            notionBlock.children_level = childLvl;

            let id = "";
            if (result.type === "synced_block" && result.synced_block.synced_from) {
                id = result.synced_block.synced_from.block_id;
            }
            if (result.has_children) {
                notionBlock.children.push(await addToContents(await getAllBlocksByBlockId(id), childLvl + 1));
            }
            notionBlocks.push(notionBlock);
        }
    }
    return notionBlocks;
}

export async function getContent(blockId) {
    const cache = await get(`notion:block:${blockId}`);
    if (cache) { // skip cache for testing purpose
        return JSON.parse(cache);
    }
    const results = await getAllBlocksByBlockId(blockId);
    const ress = await addToContents(results);
    await set(`notion:block:${blockId}`, JSON.stringify(ress), 30 * 24 * 60 * 60); // 1day
    return ress;
}

export function getPureText(content){
    let text = "";
    for (const block of content) {
        text += block.text;
    }
    return text;
}