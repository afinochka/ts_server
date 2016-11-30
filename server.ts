import * as http from 'http';

export default function (callback) {
    return http.createServer(callback);
}