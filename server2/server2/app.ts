import http, { IncomingMessage, Server, ServerResponse } from 'http';
import fs from 'fs';
const https = require('https');
import Cheerio from 'cheerio';
/*
implement your server code here
*/

interface Serve {
  title: string | undefined;
  metaDescription: string | undefined;
  urlImagery: string;
}

const PORT = process.env.PORT || 3001;

const server: Server = http.createServer(
  (req: IncomingMessage, res: ServerResponse) => {
    if (req.url === '/' && req.method === 'POST') {
      let body = '';
      req.on('data', (data: any) => {
        body += data.toString();
      });
      console.log(body);
      req.on('end', () => {
        let url = JSON.parse(body);
        https.get(url, (response: IncomingMessage) => {
          let data: string[] = [];
          response.on('data', (chunk: string) => {
            data.push(chunk);
          });
          response
            .on('end', () => {
              const html = Cheerio.load(data.toString());

              const title =
                html('meta[property="og:title"]').attr('content') ||
                html('title').text() ||
                html('meta[name="title"]').attr('content');

              const description =
                html('meta[property="og:description"]').attr('content') ||
                html('meta[name="description"]').attr('content');

              const imageUrl =
                html('meta[property="og:image"]').attr('content') ||
                html('meta[property="og:image:url"]').attr('content') ||
                html('meta[name="image:url"]').attr('content') ||
                html('h1[logo-text]').text() ||
                html('nav[h1]').text();

              const webPage: Serve = {
                title: title,
                metaDescription: description,
                urlImagery: imageUrl,
              };

              fs.writeFile(
                './database.json',
                JSON.stringify(webPage, null, 2),
                (err) => {
                  console.log(err);
                }
              );

              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.write(JSON.stringify(webPage));
              res.end();
            })
            .on('Error', (err) => console.log(err.message));
        });
      });
    }
  }
);

server.listen(PORT, () => {
  console.log('Server is not deaf');
});
