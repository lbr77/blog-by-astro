import {Client} from '@notionhq/client';
import {NOTION_API_SECRET, NOTION_LINK_DATABASE_ID} from "../../server_env.ts";
import {get, set} from "../redis.ts";
export const client = new Client({
    auth: NOTION_API_SECRET,
});

export async function getAllLinks() {
    try{
        const cache = await get("notion:links_data");
        if (cache) {
            return JSON.parse(cache);
        }
    }catch(e){
        console.log("In getAllLinks()");
        console.error(e);
    }
    let links = [];
    let params = {
        database_id: NOTION_LINK_DATABASE_ID,
        filter: {
            property: "published",
            checkbox: {
                equals: true
            }
        },
        page_size: 100,
    }
    while(true){
        const response = await client.databases.query(params as any).catch((error) => {
            console.error(error);
            return {results: []};
        });
        links = links.concat(response.results);
        if (!response.has_more) {
            break;
        }
        params["start_cursor"] = response.next_cursor;
    }
    links = links.map((link: any) => {
        const picLink = link.properties.picLink.rich_text[0].plain_text;
        const linkss = link.properties.links.rich_text[0].plain_text;
        const name = link.properties.name.title[0].plain_text;
        return {
            name: name,
            link: linkss,
            pic: picLink
        }
    });
    await set("notion:links_data", JSON.stringify(links), 15 * 60);
    return links;
}