import "dotenv/config";
export const NOTION_API_SECRET = process.env.NOTION_API_SECRET || "";
export const NOTION_POST_DATABASE_ID = process.env.NOTION_POST_DATABASE_ID || "";

export const NOTION_LINK_DATABASE_ID = process.env.NOTION_LINK_DATABASE_ID || "";
export const REQUEST_TIMEOUT_MS= process.env.REQUEST_TIMEOUT_MS || 5000;

export const NUMBER_OF_POSTS_PER_PAGE = process.env.NUMBER_OF_POSTS_PER_PAGE || 10;

export const DATABASE_ID=NOTION_LINK_DATABASE_ID;
export const BASE_PATH = process.env.BASE_URL || "";
export const REDIS_URL = process.env.REDIS_URL || "";
export const ENABLE_REDIS = process.env.ENABLE_REDIS || false;