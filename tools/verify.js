#!/usr/bin/env node

/* ==========================================
   INVARIANT CHECKER

   Guards the data a large refactor loses quietly: photo order, video
   URLs, article URLs, contact-form wiring, dead links.

   Run: node tools/verify.js
========================================== */

const fs   = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");

function read(file){
    try {
        return fs.readFileSync(path.join(ROOT, file), "utf8");
    } catch {
        return "";
    }
}

/* Every file that may legitimately hold site content. Missing files
   read as "" so this works before and after the page deletions. */

const SOURCES = [
    "index.html",
    "gallery.html",
    "featured.html",
    "contact.html",
    "achievements.html",
    "assets/js/gallery.js",
    "assets/js/home.js",
    "assets/js/script.js",
    "assets/js/achievements.js",
    "assets/js/featured.js",
    "assets/js/race.js",
    "assets/js/swim.js"
];

const expected = JSON.parse(read("tools/expected.json"));
const haystack = SOURCES.map(read).join("\n");

const failures = [];

function check(condition, message){
    if(!condition){
        failures.push(message);
    }
}

/* 1. Gallery photo order, exactly */

const order = [...read("assets/js/gallery.js")
    .matchAll(/image:\s*"([^"]+)"/g)].map(m => m[1]);

check(
    JSON.stringify(order) === JSON.stringify(expected.galleryOrder),
    "gallery order changed\n" +
    "      expected: " + expected.galleryOrder.join(" ") + "\n" +
    "      actual:   " + order.join(" ")
);

check(
    !order.includes("4.jpg"),
    "4.jpg was added to the gallery; it is deliberately excluded"
);

/* 2. Media and article URLs all still reachable somewhere */

expected.videoUrls.forEach(url =>
    check(haystack.includes(url), "missing video URL: " + url));

expected.articleUrls.forEach(url =>
    check(haystack.includes(url), "missing article URL: " + url));

/* 3. Contact form wiring */

check(haystack.includes(expected.formKey),
    "Web3Forms access key missing — the contact form is dead");

expected.formFields.forEach(field =>
    check(haystack.includes('name="' + field + '"'),
        "missing form field: " + field));

/* 4. No links to pages that were removed */

expected.deletedPages.forEach(page => {
    if(!fs.existsSync(path.join(ROOT, page))){
        check(!haystack.includes('"' + page + '"'),
            "dead link to removed page: " + page);
    }
});

/* 5. Protocol-less external hrefs resolve as relative paths and 404 */

const protocolLess = [...haystack.matchAll(/href="www\.[^"]+"/g)]
    .map(m => m[0]);

check(protocolLess.length === 0,
    "protocol-less href (resolves relative, 404s): " + protocolLess.join(", "));

/* ==========================================
   REPORT
========================================== */

if(failures.length){
    console.error("FAIL\n" + failures.map(f => "    x " + f).join("\n"));
    process.exit(1);
}

console.log(
    "PASS — " + expected.galleryOrder.length + " photos, " +
    expected.videoUrls.length + " videos, " +
    expected.articleUrls.length + " articles, form intact"
);
