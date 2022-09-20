import http, { IncomingMessage, Server, ServerResponse } from 'http';
import fs from 'fs';
import path from 'path';
// import { v4 as uuidv4 } from 'uuid';
/*
implement your server code here
*/
const PORT = process.env.PORT || 3005;

const DB_PATH = path.join(__dirname, '/database.json');

const server: Server = http.createServer(
  (req: IncomingMessage, res: ServerResponse) => {
    if (req.method === 'GET') {
      const database = get();
      send(res, database);
    } else if (req.method === 'POST') {
      req.on('data', (chunk) => {
        const data = JSON.parse(chunk.toString());
        create(data);
        send(res, data);
      });
    } else if (req.method === 'PUT') {
      console.log('updating');
      const id = Number(req.url?.slice(1));
      req.on('data', (chunk) => {
        const data = JSON.parse(chunk.toString());
        const editedData = edit(id, data);
        console.log(editedData);
        send(res, editedData);
      });
    } else if (req.method === 'DELETE') {
      const id = Number(req.url?.slice(1));
      remove(id);
      send(res, { message: `record with id ${id} deleted successfully` });
    }
  }
);

// functions to send response to the client
const send = (res: ServerResponse, data: unknown, statusCode = 200) => {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
};

const get = () => {
  let database;
  try {
    database = readDB();
  } catch (error) {
    writeToDB([]);
    database = readDB();
  }
  return JSON.parse(database);
};

const create = (data: unknown) => {
  const db = get();
  db.push(data);
  writeToDB(db);
};

const edit = (id: number, data: { [key: string]: any }) => {
  let db = get();
  let updatedRecord;
  db = db.map((record: { [key: string]: any }) => {
    if (record.id === id) {
      delete data.id;
      updatedRecord = {
        ...record,
        ...data,
      };
      return updatedRecord;
    }
    return record;
  });

  writeToDB(db);
  return updatedRecord;
};

const remove = (id: number) => {
  let db = get();
  db = db.filter((record: { [key: string]: any }) => record.id !== id);
  writeToDB(db);
};

const writeToDB = (data: unknown) => {
  fs.writeFileSync(DB_PATH, JSON.stringify(data));
};

const readDB = () => {
  return fs.readFileSync(DB_PATH, { encoding: 'utf8', flag: 'r' });
};

// starts the server to listen on port 3005
server.listen(PORT, () => console.log('Server is not deaf'));
