import {defineMiddleware} from 'astro:middleware';
import {THEME_CONFIG} from "./theme.config.ts";

export const onRequest = defineMiddleware(async (context, next) => {
    context.locals.config = THEME_CONFIG;
    return next();
});