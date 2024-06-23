import fetch from 'node-fetch';

export async function GET(ctx){
    const params = new URL(ctx.request.url).searchParams.toString();
    ctx.request.headers.delete('host');
    const res = await fetch(`https://www.googletagmanager.com/gtag/js?${params}`,{
        method: ctx.request.method,
    });
    let text = await res.text();
    text = text.replace("var d=a+\"?\"+b",`var d="/action/ga?"+b`)
    return new Response(text,{
        status: res.status,
        statusText: res.statusText,
        headers: {

        }
    })
}
export async function POST(ctx){
    const params = ctx.request.url.searchParams;
    ctx.request.headers.delete('host');
    const res = await fetch(`https://analytics.google.com/g/collect?${params}`,{
        method: ctx.request.method,
        headers: ctx.request.headers,
    });
    return new Response("",{
        headers: res.headers
    });
}