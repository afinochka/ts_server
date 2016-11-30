export default function thunk(target:any, args:any, context:any): Promise<{}> {
    return new Promise((resolve, reject) => {
        target.apply(context.connection, Array.prototype.slice.call(args).concat([(err, result) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(result);
                }
            }]));
    });
}