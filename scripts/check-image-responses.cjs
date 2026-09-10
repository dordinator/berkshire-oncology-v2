// Read-only HTTP check of the sitemap and every rendered responsive candidate.
// This is not a browser, Lighthouse run or real-user speed measurement.
const assert = require("node:assert/strict");
const base = process.env.IMAGE_AUDIT_URL || "http://127.0.0.1:3001";
assert(["127.0.0.1", "localhost"].includes(new URL(base).hostname));
const decode = s => s.replaceAll("&amp;", "&").replaceAll("&quot;", '"');
async function pool(items, fn) {
  let cursor=0; const output=[];
  await Promise.all(Array.from({length:3},async()=>{while(cursor<items.length){const i=cursor++;output[i]=await fn(items[i]);}}));
  return output;
}
async function main() {
  const sitemap=await fetch(base+"/sitemap.xml"); assert(sitemap.ok);
  const paths=[...new Set([...((await sitemap.text()).matchAll(/<loc>(.*?)<\/loc>/g))].map(m=>new URL(m[1]).pathname))];
  const candidates=new Set();
  const add=raw=>{if(!raw||raw.startsWith("data:"))return; const url=new URL(raw,base); assert.equal(url.origin,new URL(base).origin); candidates.add(url.href);};
  await pool(paths,async path=>{
    const res=await fetch(base+path); assert(res.ok,`${path}: ${res.status}`);
    const html=await res.text();
    for(const [tag] of html.matchAll(/<(?:img|source|link)\b[^>]*>/g)) {
      const attrs=Object.fromEntries([...tag.matchAll(/([\w-]+)="([^"]*)"/g)].map(a=>[a[1].toLowerCase(),decode(a[2])]));
      if(tag.startsWith("<link")&&attrs.as!=="image")continue;
      add(attrs.src); if(attrs.as==="image")add(attrs.href);
      for(const candidate of (attrs.srcset||attrs.imagesrcset||"").split(","))add(candidate.trim().split(/\s+/)[0]);
    }
  });
  const images=await pool([...candidates],async url=>{
    const res=await fetch(url,{headers:{Accept:"image/webp"}});
    assert(res.ok,`${url}: ${res.status}`);
    assert(res.headers.get("content-type")?.startsWith("image/"),url);
    const bytes=(await res.arrayBuffer()).byteLength; assert(bytes>0,url);
    return {url,bytes};
  });
  console.log(JSON.stringify({pages:paths.length,imageCandidates:images.length,failed:0,largest:images.sort((a,b)=>b.bytes-a.bytes).slice(0,5)},null,2));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
