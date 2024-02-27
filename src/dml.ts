import jsforce from 'jsforce';

export async function create(connection: jsforce.Connection, object: string, records: Array<any>){
    // @ts-ignore
    let resultToReturn = await connection.sobject(object).create(records, function(err, ret){
        new Promise((resolve, reject) =>{
            if(err){
                reject(err);
            }else{
                resolve(ret);
            }
        });
    });

    return resultToReturn;
}

export async function update(connection: jsforce.Connection, object: string, records: Array<any>){
    // @ts-ignore
    let resultToReturn = await connection.sobject(object).update(records, function(err, ret){
        new Promise((resolve, reject) =>{
            if(err){
                reject(err);
            }else{
                resolve(ret);
            }
        });
    });

    return resultToReturn;
}