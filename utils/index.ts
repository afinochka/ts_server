export function parseBodyToWhere(body: any): { params: Array<any>, whereString: string } {
    var delimiter = ' WHERE ', whereString = '',
        params = [];
    for (let prop in body) {
        whereString += delimiter;
        whereString += prop + '=?';
        params.push(body[prop])
        delimiter = ' and ';
    }
    return {params, whereString};
}

