const promptInput=document.querySelector("#prompt"),generateButton=document.querySelector("#generate-btn"),preview=document.querySelector("#site-preview"),emptyState=document.querySelector("#empty-state"),canvas=document.querySelector("#preview-canvas"),statusText=document.querySelector("#preview-status"),notice=document.querySelector("#notice"),downloadButton=document.querySelector("#download-btn"),downloadPageButton=document.querySelector("#download-page-btn"),charCount=document.querySelector("#char-count"),desktopButton=document.querySelector("#desktop-btn"),mobileButton=document.querySelector("#mobile-btn"),pageSelect=document.querySelector("#page-select");
let currentFiles=null,currentPage="index.html",busy=false;
promptInput.addEventListener("input",()=>charCount.textContent=`${promptInput.value.length} / 5000`);
document.querySelectorAll(".example-link").forEach(b=>b.addEventListener("click",()=>{promptInput.value=b.dataset.prompt||"";promptInput.dispatchEvent(new Event("input"));promptInput.focus()}));
function setNotice(message="",kind=""){notice.textContent=message;notice.className=`notice ${kind}`.trim()}
function setBusy(value){busy=value;generateButton.disabled=value;generateButton.innerHTML=value?"<span class='spinner'></span> Building all pages…":"<span>✦</span> Generate full website <span>→</span>"}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}

async function generateWebsiteImage(prompt) {
  const response = await fetch("/api/generate-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Image generation failed.");
  }

  if (!data.image) {
    throw new Error("Gemini did not return an image.");
  }

  return data.image;
}

function insertGeneratedImage(imageData) {
  let html = currentFiles["index.html"] || "";

  const imageSection = `
    <section aria-label="AI-generated website image"
      style="max-width:1400px;margin:24px auto;padding:0 5%;">
      <img
        src="${imageData}"
        alt="AI-generated image for this website"
        style="display:block;width:100%;max-height:520px;object-fit:cover;border-radius:20px;"
      />
    </section>
  `;

  if (/<main\b[^>]*>/i.test(html)) {
    html = html.replace(/<main\b[^>]*>/i, tag => tag + imageSection);
  } else if (/<\/header>/i.test(html)) {
    html = html.replace(/<\/header>/i, tag => tag + imageSection);
  } else {
    html = html.replace(/<body\b[^>]*>/i, tag => tag + imageSection);
  }

  currentFiles["index.html"] = html;
}


function makePreviewDoc(fileName){
 const raw=currentFiles?.[fileName]||"<h1>Page not found</h1>";
 const css=currentFiles["styles.css"]||"",js=currentFiles["script.js"]||"";
 let html=raw;
 html=html.replace(/<link\b[^>]*href=["']styles\.css["'][^>]*>/gi,`<style>${css.replace(/<\/style/gi,"<\\/style")}</style>`);
 html=html.replace(/<script\b[^>]*src=["']script\.js["'][^>]*><\/script>/gi,`<script>${js.replace(/<\/script/gi,"<\\/script")}<\/script>`);
 // Also support common alternate generated stylesheet names by injecting shared CSS if no stylesheet was found.
 if(!/<style[\s>]/i.test(html)&&css)html=html.replace(/<\/head>/i,`<style>${css.replace(/<\/style/gi,"<\\/style")}</style></head>`);
 return html;
}
function renderPage(name){currentPage=name;preview.srcdoc=makePreviewDoc(name);preview.hidden=false;emptyState.hidden=true;statusText.textContent=`Previewing ${name}`;document.querySelector("#preview-url").textContent=`your-website.local/${name}`;downloadPageButton.disabled=false}
function setDevice(mode){const mobile=mode==="mobile";canvas.classList.toggle("mobile-mode",mobile);mobileButton.classList.toggle("selected",mobile);desktopButton.classList.toggle("selected",!mobile)}
desktopButton.addEventListener("click",()=>setDevice("desktop"));mobileButton.addEventListener("click",()=>setDevice("mobile"));
pageSelect.addEventListener("change",()=>renderPage(pageSelect.value));
generateButton.addEventListener("click",generateWebsite);
promptInput.addEventListener("keydown",e=>{if((e.ctrlKey||e.metaKey)&&e.key==="Enter")generateWebsite()});
async function generateWebsite(){
 if(busy)return;const prompt=promptInput.value.trim();if(!prompt){setNotice("First describe the website you want to create.","error");promptInput.focus();return}
 setBusy(true);setNotice("Generating a multi-page project. This may take up to 5 min");statusText.textContent="Generating your website pages…";
 try{
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),305000);
  let response;try{response=await fetch("/api/generate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt}),signal:controller.signal})}finally{clearTimeout(timer)}
  const data=await response.json();if(!response.ok)throw new Error(data.error||"Generation failed.");
  
currentFiles = data.files;

try {
  setNotice("Website ready. Generating its image...");
  statusText.textContent = "Generating AI website image...";

  const imageData = await generateWebsiteImage(
    "Create a professional, high-quality website hero image for this project. " +
    "Match the business, colors, mood, and subject to this website description: " +
    prompt
  );

  insertGeneratedImage(imageData);
} catch (imageError) {
  console.error("Website image generation failed:", imageError);
  setNotice(
    "Website created, but its image could not be generated: " +
    imageError.message,
    "error"
  );
}
const pages=(data.pages||Object.keys(currentFiles).filter(n=>n.endsWith(".html"))).sort((a,b)=>a==="index.html"?-1:b==="index.html"?1:a.localeCompare(b));
  if(!pages.length)throw new Error("No HTML pages were returned. Please try again.");
  pageSelect.innerHTML=pages.map(p=>`<option value="${escapeHtml(p)}">${escapeHtml(p)}</option>`).join("");pageSelect.disabled=false;pageSelect.value=pages.includes("index.html")?"index.html":pages[0];renderPage(pageSelect.value);
  downloadButton.disabled=false;statusText.textContent=`${pages.length} pages · ${Object.keys(currentFiles).length} project files`;
  if (!notice.textContent.includes("could not be generated")) {
  setNotice(
    data.message || "Website project is ready.",
    data.mode === "ai" ? "success" : ""
  );
}
 }catch(e){statusText.textContent="Could not generate website";setNotice(e.name==="AbortError"?"The request timed out. Check the server terminal, API key, model name, and Gemini quota, then try again.":(e.message||"Please try again."),"error")}
 finally{setBusy(false)}
}
async function downloadProject(){
 if(!currentFiles)return;
 try{
  setNotice("Preparing your website ZIP…");
  const response=await fetch("/api/download",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({files:currentFiles})});
  if(!response.ok){const data=await response.json().catch(()=>({}));throw new Error(data.error||"ZIP download failed")}
  const blob=await response.blob(),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="generated-website.zip";document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);setNotice("Website ZIP downloaded. Extract it to use the full project.","success");
 }catch(e){setNotice(e.message,"error")}
}
downloadButton.addEventListener("click",downloadProject);
downloadPageButton.addEventListener("click",()=>{if(!currentFiles)return;const blob=new Blob([currentFiles[currentPage]||""],{type:"text/html;charset=utf-8"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=currentPage;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)});
