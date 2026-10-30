import express from "express";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import archiver from "archiver";


dotenv.config();
const app = express();
const PORT = Number(process.env.PORT || 3000);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.json({ limit: "12mb" }));
app.use(express.static(path.join(__dirname, "public")));

const demoFiles = {
  "index.html": `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Nova Studio | Home</title><link rel="stylesheet" href="styles.css"></head><body><header class="site-header"><a class="brand" href="index.html">NOVA<span>.</span></a><button class="menu-toggle" aria-label="Toggle navigation">☰</button><nav><a href="index.html">Home</a><a href="about.html">About</a><a href="services.html">Services</a><a href="contact.html">Contact</a></nav></header><main><section class="hero"><p class="eyebrow">GOOD IDEAS, BUILT BETTER</p><h1>Make your next big idea <em>real.</em></h1><p class="lead">A clear, thoughtful digital experience designed to help your business move forward.</p><a class="button" href="services.html">Explore services ↗</a></section><section class="section"><p class="eyebrow">WHAT WE DO</p><h2>Built around your goals.</h2><div class="cards"><article><h3>Strategy</h3><p>Turn ideas into a clear, achievable plan.</p></article><article><h3>Design</h3><p>Create a useful, distinctive digital experience.</p></article><article><h3>Development</h3><p>Build responsive pages that work across devices.</p></article></div></section></main><footer>© 2026 Nova Studio · Demo content</footer><script src="script.js"></script></body></html>`,
  "about.html": `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>About | Nova Studio</title><link rel="stylesheet" href="styles.css"></head><body><header class="site-header"><a class="brand" href="index.html">NOVA<span>.</span></a><button class="menu-toggle" aria-label="Toggle navigation">☰</button><nav><a href="index.html">Home</a><a href="about.html">About</a><a href="services.html">Services</a><a href="contact.html">Contact</a></nav></header><main class="inner-page"><p class="eyebrow">OUR STORY</p><h1>Good work starts with listening.</h1><p class="lead">We combine practical thinking, careful design, and technology to make digital experiences easier to use.</p><section class="section"><h2>How we work</h2><div class="cards"><article><h3>Curious</h3><p>We ask useful questions before choosing solutions.</p></article><article><h3>Collaborative</h3><p>We keep communication clear throughout a project.</p></article><article><h3>Thoughtful</h3><p>We care about the small details and the bigger picture.</p></article></div></section></main><footer>© 2026 Nova Studio · Demo content</footer><script src="script.js"></script></body></html>`,
  "services.html": `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Services | Nova Studio</title><link rel="stylesheet" href="styles.css"></head><body><header class="site-header"><a class="brand" href="index.html">NOVA<span>.</span></a><button class="menu-toggle" aria-label="Toggle navigation">☰</button><nav><a href="index.html">Home</a><a href="about.html">About</a><a href="services.html">Services</a><a href="contact.html">Contact</a></nav></header><main class="inner-page"><p class="eyebrow">WHAT WE OFFER</p><h1>Services that move you forward.</h1><p class="lead">A flexible set of services for teams who want to make their online presence clearer and more effective.</p><section class="section"><div class="cards"><article><h3>Website strategy</h3><p>Site structure, content direction, and user journeys.</p></article><article><h3>Visual design</h3><p>Clean layouts, consistent styling, and responsive components.</p></article><article><h3>Web development</h3><p>Accessible front-end builds with useful interactions.</p></article></div></section><a class="button" href="contact.html">Discuss your project ↗</a></main><footer>© 2026 Nova Studio · Demo content</footer><script src="script.js"></script></body></html>`,
  "contact.html": `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Contact | Nova Studio</title><link rel="stylesheet" href="styles.css"></head><body><header class="site-header"><a class="brand" href="index.html">NOVA<span>.</span></a><button class="menu-toggle" aria-label="Toggle navigation">☰</button><nav><a href="index.html">Home</a><a href="about.html">About</a><a href="services.html">Services</a><a href="contact.html">Contact</a></nav></header><main class="inner-page"><p class="eyebrow">LET'S TALK</p><h1>Tell us what you're building.</h1><p class="lead">This demo form validates your inputs in the browser. Connect a backend or form service to receive submissions.</p><form id="contact-form"><label>Name<input name="name" required minlength="2" placeholder="Your name"></label><label>Email<input name="email" type="email" required placeholder="you@example.com"></label><label>Project details<textarea name="message" required minlength="10" rows="5" placeholder="A few details about your project"></textarea></label><button class="button" type="submit">Validate message ↗</button><p id="form-message" role="status"></p></form></main><footer>© 2026 Nova Studio · Demo content</footer><script src="script.js"></script></body></html>`,
  "styles.css": `:root{--ink:#14211f;--muted:#60716d;--paper:#f7f8f5;--accent:#c8f169;--line:#dfe5dd}*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font:16px/1.6 Inter,Arial,sans-serif}.site-header{display:flex;align-items:center;justify-content:space-between;padding:22px 7%;border-bottom:1px solid var(--line)}.brand{font-weight:900;font-size:23px;color:var(--ink);text-decoration:none;letter-spacing:-1px}.brand span{color:#7aa52a}.site-header nav{display:flex;gap:26px}.site-header nav a{color:var(--ink);text-decoration:none;font-weight:650;font-size:14px}.site-header nav a:hover{opacity:.65}.menu-toggle{display:none}.hero,.inner-page{max-width:1180px;margin:auto;padding:100px 7% 90px}.hero h1,.inner-page h1{font-size:clamp(44px,7vw,82px);letter-spacing:-.065em;line-height:1.02;max-width:850px;margin:18px 0}.hero h1 em{font-style:normal;background:var(--accent);padding:0 .1em}.eyebrow{font-size:12px;font-weight:800;letter-spacing:.15em;color:#557c29}.lead{font-size:19px;max-width:650px;color:var(--muted)}.button{display:inline-block;border:0;background:var(--ink);color:white;text-decoration:none;padding:14px 22px;border-radius:999px;font-weight:750;margin-top:20px;cursor:pointer}.section{padding:40px 7% 85px;max-width:1320px;margin:auto}.section h2{font-size:clamp(30px,4vw,46px);letter-spacing:-.04em}.cards{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px;margin-top:28px}.cards article{padding:28px;background:white;border:1px solid var(--line);border-radius:18px;min-height:160px}.cards h3{margin-top:0;font-size:21px}.cards p{color:var(--muted)}footer{padding:26px 7%;border-top:1px solid var(--line);color:var(--muted);font-size:13px}form{max-width:650px;margin-top:32px;display:grid;gap:18px}label{font-weight:700;display:grid;gap:7px}input,textarea{font:inherit;border:1px solid #cbd5ce;border-radius:10px;padding:13px;background:white;width:100%}#form-message{color:#557c29}@media(max-width:720px){.site-header{padding:18px 5%;flex-wrap:wrap}.menu-toggle{display:block;border:0;background:transparent;font-size:24px}.site-header nav{display:none;flex-basis:100%;flex-direction:column;gap:12px;padding-top:18px}.site-header nav.open{display:flex}.hero,.inner-page{padding:70px 6%}.section{padding:30px 6% 60px}.cards{grid-template-columns:1fr}.hero h1,.inner-page h1{font-size:clamp(42px,12vw,64px)}}`,
  "script.js": `document.querySelectorAll('.menu-toggle').forEach(button=>button.addEventListener('click',()=>{const nav=button.parentElement.querySelector('nav');if(nav)nav.classList.toggle('open')}));const form=document.querySelector('#contact-form');if(form)form.addEventListener('submit',event=>{event.preventDefault();const message=document.querySelector('#form-message');if(message)message.textContent='Looks good! This demo does not send data. Connect a backend or form service to receive messages.';form.reset()});`
};

function demoProject(prompt) {
  const p = String(prompt || "").toLowerCase();
  const brand = p.includes("restaurant") ? "Gather & Grain" : p.includes("fitness") ? "FORM FITNESS" : p.includes("portfolio") ? "Alex Morgan" : p.includes("plumb") ? "ClearFlow Plumbing" : "Nova Studio";
  const rename = (s) => s.replaceAll("Nova Studio", brand).replaceAll("NOVA", brand.toUpperCase().replace(/[^A-Z0-9 ]/g,"").slice(0,14));
  const result = Object.fromEntries(Object.entries(demoFiles).map(([name, content]) => [name, rename(content)]));
  return result;
}
function safeProjectFiles(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("AI response was not a file object.");
  const files = {};
  for (const [rawName, rawContent] of Object.entries(input)) {
    const name = String(rawName).replaceAll("\\", "/");
    if (!/^[a-zA-Z0-9/_-]+\.(html|css|js|json|txt|svg|md)$/i.test(name) || name.startsWith("/") || name.split("/").includes("..")) continue;
    if (typeof rawContent !== "string") continue;
    files[name] = rawContent.slice(0, 10000000);
  }
  if (!files["index.html"]) throw new Error("AI did not return index.html. Please try again.");
  if (!files["styles.css"]) files["styles.css"] = demoFiles["styles.css"];
  if (!files["script.js"]) files["script.js"] = "";
  return files;
}
app.get("/api/health", (_req,res)=>res.json({ok:true}));
app.post("/api/generate", async (req,res) => {
  const prompt = String(req.body?.prompt || "").trim();
  if (!prompt) return res.status(400).json({error:"Please describe the website you want to build."});
  if (prompt.length > 5000) return res.status(400).json({error:"Keep your description under 5,000 characters."});
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const files = demoProject(prompt);
    return res.json({files, pages:Object.keys(files).filter(n=>n.endsWith(".html")), mode:"demo", message:"Demo multi-page project loaded. Add a Gemini API key to generate a custom AI website."});
  }
  const controller = new AbortController();
  const timeout = setTimeout(()=>controller.abort(), 180000);
  try {
    const model = process.env.GEMINI_MODEL || "gemini-3.8-flash";
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method:"POST", signal:controller.signal,
      headers:{"Content-Type":"application/json","x-goog-api-key":apiKey},
      body:JSON.stringify({
        systemInstruction:{parts:[{text:`You are a senior full-stack front-end website builder. Return ONLY valid JSON, no markdown. Required schema: {"files":{"index.html":"...","about.html":"...","services.html":"...","contact.html":"...","styles.css":"...","script.js":"..."}}. Build a cohesive MULTI-PAGE static website project with at least 4 HTML pages (Home, About, Services/Features, Contact plus any relevant page). Every page must be a complete HTML document and link to shared styles.css and script.js using relative paths. Add working cross-page navigation with matching file names. Make it visually polished, responsive, accessible, semantic, mobile-friendly, with real content tailored to the user prompt, clear CTA, cards, footer, and useful interactions (mobile nav, FAQ accordion or tabs when relevant, contact form client-side validation). Use no build tools and no external libraries. Do not claim forms actually send unless a backend is provided; explain that the demo form needs a service/backend. Do not add login/payment functionality. Keep each file concise; output valid JSON and keep total response manageable. Use only file names with letters/numbers/dashes/underscores and allowed extensions.`}]},
        contents:[{role:"user",parts:[{text:`Create a complete multi-page website project for this request. Include appropriate pages and functionality, not just a landing page:\n${prompt}`}]}],
        generationConfig:{temperature:0.65,maxOutputTokens:16000,responseMimeType:"application/json"}
      })
    });
    const data = await response.json();
    if (!response.ok) {
      const msg = data?.error?.message || "Gemini returned an error.";
      return res.status(502).json({error:`AI request failed (${response.status}): ${msg}`});
    }
    const raw = data?.candidates?.[0]?.content?.parts?.map(p=>p.text||"").join("").trim();
    if (!raw) return res.status(502).json({error:"AI returned an empty response. Try again with a shorter description."});
    let parsed;
    try { parsed = JSON.parse(raw.replace(/^```(?:json)?\s*/i,"").replace(/\s*```$/,"")); }
    catch { return res.status(502).json({error:"AI response was not valid JSON. Please click Generate again."}); }
    const files = safeProjectFiles(parsed.files || parsed);
    const pages = Object.keys(files).filter(n=>n.toLowerCase().endsWith(".html"));
    return res.json({files,pages,mode:"ai",message:`Generated ${pages.length} pages and ${Object.keys(files).length} files.`});
  
} catch (error) {
  console.error("Generation error name:", error.name);
  console.error("Generation error message:", error.message);
  console.error("Generation error cause:", error.cause);

  const msg =
    error.name === "AbortError"
      ? "Website generation timed out. Check the server logs."
      : `Generation failed: ${error.message || "Unknown error"}`;

  return res.status(error.name === "AbortError" ? 504 : 500)
    .json({ error: msg });
} finally {
  clearTimeout(timeout);
}

});

app.post("/api/generate-image", async (req, res) => {
  const prompt = String(req.body?.prompt || "").trim();

  if (!prompt) {
    return res.status(400).json({
      error: "Please describe the image you want to generate."
    });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({
      error: "GEMINI_API_KEY is missing from your .env file."
    });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 180000);

  try {
    const model =
      process.env.GEMINI_IMAGE_MODEL || "gemini-3.1-flash-image";

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text:
                    "Generate a high-quality, professional website image. " +
                    "Create the actual image, not HTML or code. " +
                    "Image brief: " + prompt
                }
              ]
            }
          ],
          generationConfig: {
            responseModalities: ["IMAGE"],
            imageConfig: {
              aspectRatio: "16:9",
              imageSize: "1K"
            }
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini image API error:", data);
      return res.status(502).json({
        error:
          data?.error?.message || "Gemini could not generate the image."
      });
    }

    const parts =
      data?.candidates?.[0]?.content?.parts || [];

    const imagePart = parts.find(
      part => part.inlineData?.data || part.inline_data?.data
    );

    const imageData =
      imagePart?.inlineData || imagePart?.inline_data;

    if (!imageData?.data) {
      return res.status(502).json({
        error: "Gemini returned no image. Try another prompt."
      });
    }

    return res.json({
      image:
        `data:${imageData.mimeType || imageData.mime_type || "image/png"};base64,` +
        imageData.data
    });
  } catch (error) {
    console.error("Image generation error:", error);

    return res.status(error.name === "AbortError" ? 504 : 500).json({
      error:
        error.name === "AbortError"
          ? "Image generation timed out. Please try again."
          : "Image generation failed. Check your API key and server logs."
    });
  } finally {
    clearTimeout(timeout);
  }
});

app.post("/api/download", (req,res)=>{
  const files = req.body?.files;
  if (!files || typeof files !== "object" || Array.isArray(files)) return res.status(400).json({error:"No project files were provided."});
  let safe;
  try { safe = safeProjectFiles(files); } catch(e) { return res.status(400).json({error:e.message}); }
  res.setHeader("Content-Type","application/zip");
  res.setHeader("Content-Disposition",'attachment; filename="generated-website.zip"');
  const archive = archiver("zip",{zlib:{level:9}});
  archive.on("error",err=>{console.error(err);if(!res.headersSent)res.status(500).end("Could not create ZIP.");});
  archive.pipe(res);
  for (const [name,content] of Object.entries(safe)) archive.append(content,{name});
  archive.append("# Generated Website\n\nOpen `index.html` to start. Shared styles are in `styles.css`; interactions are in `script.js`.\n\nReview forms and integrations before production use.\n",{name:"README.md"});
  archive.finalize();
});
app.listen(PORT,()=>console.log(`AI Website Builder Pro running at http://localhost:${PORT}`));