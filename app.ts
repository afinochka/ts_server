/// <reference path="typings/async-busboy.d.ts" />

import * as koa from 'koa';
import * as koaRouter from 'koa-router';
import * as koaBodyparser from 'koa-bodyparser';
import * as fs from 'fs';
import * as crypto from 'crypto';
import * as bodyParser from './utils'
import serverFn from './server';
import thunk from './controllers/thunk';
import mysql = require('./controllers/mysql');
import asyncBusboy = require('async-busboy');

async function read_file(path: string) {
    return await thunk(fs.readFile, [path], fs);
}

(async () => {
    var app = new koa();
    var router = new koaRouter();
    app.use(koaBodyparser());
    router.get('/', async (ctx) => {
        ctx.body = await thunk(fs.readFile, ['./views/index.html', 'utf-8'], fs);
    });

    router.post('/upload', async function (ctx, next) {
        var parsedString = bodyParser.parseBodyToWhere(ctx.query);
        const {files, fields} = await asyncBusboy(ctx.req);
        files.forEach(element => {
            let start = Math.floor(Math.random() * 54);
            let hash = crypto.createHash('sha256').update(JSON.stringify(element)).digest('hex').substring(start, start + 10)
            let fileType = '.' + element.mimeType.substring(element.mimeType.search('/') + 1);
            element.pipe(fs.createWriteStream('./uploads/' + hash + fileType));

            var insert = { 
                id: null,
                post_id: parsedString.params[0], 
                title: hash + fileType
            };
            mysql.insert('images', insert);
        });
        
        ctx.body = "OK";
    });

    router.get('/upload/:name', async (ctx) => {
        ctx.type = 'image/jpeg';
        ctx.body = await read_file('./uploads/' + ctx.params.name);
        
    });

    router.get('/:table', async (ctx) => {
        var parsedString = bodyParser.parseBodyToWhere(ctx.query);
        ctx.body = await mysql.query("SELECT * FROM " + ctx.params.table + " "
            + parsedString.whereString
            + " ORDER BY id",
            parsedString.params);
    });

    router.post('/:table', async (ctx) => {
        ctx.body = await mysql.insert(ctx.params.table, ctx.request.body);
    });

    router.put('/:table/:id', async (ctx) => {
        ctx.body = await mysql.update(ctx.params.table, "id", ctx.params.id, ctx.request.body);
    });

    router.delete('/:table/:id', async (ctx) => {
        ctx.body = await mysql.delete(ctx.params.table, "id", ctx.params.id);
    });


    app.use(function* (next) {
        try {
            yield next;
        } catch (err) {
            this.status = err.status || 500;
            this.body = err;
        }
    });

    app.use(router.routes())
        .use(router.allowedMethods());

    app.listen(3000, "0.0.0.0");
})();