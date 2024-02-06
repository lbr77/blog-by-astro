import {getCollection} from "astro:content";
export async function statics() {
  const posts = await getCollection("posts");
  let cate = [];
  let tags = [];
  let words = 0;
  for(let post of posts){
      cate.push(post.data.category);
      tags = tags.concat(post.data.tags);
      words += getPostWords(post.body);
  }
    return {
        cate: Array.from(new Set(tags)).length,
        words: words,
        posts: posts.length
    }
}
export function getPostWords(markdownText) {
    const textWithoutTags = markdownText.replace(/<[^>]*>/g, '');

    const words = textWithoutTags.split(/\s+/).filter(word => word !== '');

    return textWithoutTags.length;
}

export async function buildByYear(){
    let posts = await getCollection("posts");
    posts = posts.sort((a, b) => new Date(b.data.date) - new Date(a.data.date));
    let years = {};
    for(let post of posts){
        let year = new Date(post.data.date).getFullYear();
        if(!years[year]){
            years[year] = [];
        }
        years[year].push(post);
    }
    return years;
}


export async function buildByTags(){
    let posts = await getCollection("posts");
    let tags = [];
    for(let post of posts){
        for(let tag of post.data.tags){
            tags.push(tag);
        }
    }
    return Array.from(new Set(tags));
}