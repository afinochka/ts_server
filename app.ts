import * as koa from 'koa';
import * as koaRouter from 'koa-router';
import * as koaBodyparser from 'koa-bodyparser';
import * as fs from 'fs';
import * as bodyParser from './utils'
import serverFn from './server';
import thunk from './controllers/thunk';
import mysql = require('./controllers/mysql');

(async () => {
    var app = new koa();
    var router = new koaRouter();
    app.use(koaBodyparser());
    router.get('/', async (ctx) => {
        ctx.body = await thunk(fs.readFile, ['./views/index.html', 'utf-8'], fs);

    });

    router.get('/:table', async (ctx) => {
        var parsedString = bodyParser.parseBodyToWhere(ctx.query);
        ctx.body = await mysql.query("SELECT * FROM " + ctx.params.table + " " + parsedString.whereString
            + " ORDER BY id", 
            parsedString.params);
    });

    router.post('/:table', async (ctx) => {
        if(ctx.params.table == "images")
        ctx.body = await mysql.insert(ctx.params.table, ctx.request.body);
    });

    router.put('/:table/:id', async (ctx) => {
        ctx.body = await mysql.update(ctx.params.table, "id", ctx.params.id, ctx.request.body);
    });

    router.delete('/:table/:id', async (ctx) => {
        ctx.body = await mysql.delete(ctx.params.table, "id", ctx.params.id);
    });


    app.use(function *(next){
        try{
            yield next;
        }  catch (err){
            this.status = err.status || 500;
            this.body = err;
        }
    });

    app.use(router.routes())
        .use(router.allowedMethods());

    app.listen(3000, "0.0.0.0");
})();