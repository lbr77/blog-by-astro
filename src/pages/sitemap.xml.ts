
async function genSiteMap(baseURL){
    const defaultFields = [
        {
            loc: `${baseURL}/`,
            lastmod: new Date().toISOString().split("T")[0],
            changefreq: "daily",
            priority: 0.7
        },

    ]
}
export async function GET() {
    return new Response();
}