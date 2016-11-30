import * as mysql from "mysql";
var dbConfig = require('../../database.json');
import thunk from './thunk';

class Mysql {
  connection: mysql.Connection;

  constructor() {
    this.connection = mysql.createConnection(dbConfig.dev);
    this.connect();
  }
  async connect() {
    this.connection.connect((err) => {
    console.log('connected to db');
      if (err) {
        console.log('error when connecting to db:', err);
        return setTimeout(this.connect, 2000);
      }
    });
    this.connection.on('error', function (err) {
      console.log('db error', err);
      if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        this.connect();
      } else {
        throw err;
      }
    });
  }
  oldQuery(...args) {
    this.connection.query.apply(this, Array.prototype.slice.call(args));
  }
  async query(query: string, ...args) {
    return thunk(this.connection.query, arguments, this);
  }
  async insert(table: string, inserts: Object): Promise<any> {
    return await this.query('INSERT INTO ' + table + ' SET ? ', inserts);
  }

  async update(table: string, column: string, value: string | number, updates: Object) {
    return await this.query('UPDATE ' + table + ' SET ? WHERE ' + column + ' = "' + value + '"', updates);
  };

  async delete(table: string, column: string, value: string | number) {
    var query = ' DELETE FROM ' + table + ' WHERE ' + column + '="' + value + '"';
    return await this.query(query);
  };

  async select(table: string, column: string, value: string | number) {
    var query = ' SELECT * FROM ' + table + ' WHERE ' + column + '=' + value;
    return await this.query(query);
  }
}

var connection = new Mysql();

export = connection;