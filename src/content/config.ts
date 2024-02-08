import {defineCollection, z} from 'astro:content';

const pageCollection = defineCollection({
    type: "content",
    schema: z.object({
        title: z.string(),
        date: z.date().default(new Date()),
        banner: z.string().default(""),
        bannerStyle: z.number().default(0),//0显示在顶部 1显示在顶部+模糊 2.不显示
        bannerAsCover: z.number().default(1),//1:主图显示在标题上方 2:主图作为标题背景 0:不显示
        showToc: z.boolean().default(true),
        showFullContent: z.boolean().default(false),
    }),
})
export const collections = {
    'pages': pageCollection,
}