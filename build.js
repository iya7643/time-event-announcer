import fs from 'fs';

const version = "1.1.0";

const html = fs.readFileSync('index.html', 'utf8');
const js = fs.readFileSync('app.js', 'utf8');
const css = fs.readFileSync('app.css', 'utf8');
const svg = fs.readFileSync('favicon.svg', 'utf8');

const svg_base64 = Buffer.from(svg).toString('base64');
const favicon_data_url = `data:image/svg+xml;base64,${svg_base64}`

let bundled = html.replace(
    /<link\s+rel=["']stylesheet["']\s+href=["']app\.css["']\s*\/?>/,
    `<style>${css}</style>`
);

bundled = bundled.replace(
    /<script\s+src=["']app\.js["']><\/script>/,
    `<script>${js}</script>`
);

bundled = bundled.replace(
    /<link\s+rel=["']icon["'][^>]*href=["'][^"']+["'][^>]*>/,
    `<link rel="icon" type="image/svg+xml" href="${favicon_data_url}">`
);

bundled = bundled.replace('{VERSION_NO}', version);

const output_name = `TimeEventAnnouncer_v${version}.html`;
fs.writeFileSync(output_name, bundled);
console.log(`✅ ${output_name} を生成した`);
