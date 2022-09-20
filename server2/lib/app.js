"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const fs_1 = __importDefault(require("fs"));
const https = require('https');
const cheerio_1 = __importDefault(require("cheerio"));
const PORT = process.env.PORT || 3001;
const server = http_1.default.createServer((req, res) => {
    if (req.url === '/' && req.method === 'POST') {
        let body = '';
        req.on('data', (data) => {
            body += data.toString();
        });
        console.log(body);
        req.on('end', () => {
            let url = JSON.parse(body);
            https.get(url, (response) => {
                let data = [];
                response.on('data', (chunk) => {
                    data.push(chunk);
                });
                response
                    .on('end', () => {
                    const html = cheerio_1.default.load(data.toString());
                    const title = html('meta[property="og:title"]').attr('content') ||
                        html('title').text() ||
                        html('meta[name="title"]').attr('content');
                    const description = html('meta[property="og:description"]').attr('content') ||
                        html('meta[name="description"]').attr('content');
                    const imageUrl = html('meta[property="og:image"]').attr('content') ||
                        html('meta[property="og:image:url"]').attr('content') ||
                        html('meta[name="image:url"]').attr('content') ||
                        html('h1[logo-text]').text() ||
                        html('nav[h1]').text();
                    const webPage = {
                        title: title,
                        metaDescription: description,
                        urlImagery: imageUrl,
                    };
                    fs_1.default.writeFile('./database.json', JSON.stringify(webPage, null, 2), (err) => {
                        console.log(err);
                    });
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.write(JSON.stringify(webPage));
                    res.end();
                })
                    .on('Error', (err) => console.log(err.message));
            });
        });
    }
});
server.listen(PORT, () => {
    console.log('Server is not deaf');
});
