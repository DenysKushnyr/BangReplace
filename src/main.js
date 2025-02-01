const timeKeys = ["!y", "!m", "!w", "!d"]; // ONLY  for google

const BANGS = {
    "!r": "site:reddit.com",
    "!gh": "site:github.com",
    "!pdf": "filetype:pdf",
    "!docx": "filetype:docx",
    "!doc": "filetype:doc",
    
    ...Object.fromEntries(timeKeys.map(k => [k, ""]))
}

const keys = Object.keys(BANGS).sort((a, b) => b.length - a.length)
const maxLength = keys[0].length + keys[1].length;

const HOST_PERMISSIONS = [
    "*://www.google.com/*",
    "*://*.bing.com/*",
    "*://*.duckduckgo.com/*",
    "*://*.brave.com/*"
]

chrome.webRequest.onBeforeRequest.addListener(
    webRequestHandler,
    { urls: HOST_PERMISSIONS, types: ['main_frame'] },
    ['requestBody']
);



async function webRequestHandler(r) {
    const url = new URL(r.url);
    const query = url.searchParams.get("q");
    
    if (!query)
        return;

    for (const key of keys) {
        if (query.indexOf(key, query.length - maxLength) !== -1) {
            const newQuery = query.replace(key, BANGS[key]);

            url.searchParams.set("q", newQuery);
            if (url.searchParams.get("oq")) {
                url.searchParams.set("oq", newQuery);
            }

            if (url.host === "www.google.com" && timeKeys.indexOf(key) !== -1) {
                url.searchParams.set("tbs", `qdr:${key[1]}`);
            }

            await chrome.tabs.update(r.tabId, { url: url.toString() });
        }
    }
}