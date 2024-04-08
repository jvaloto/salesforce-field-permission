import jsforce from 'jsforce';

export async function create(connection: jsforce.Connection, object: string, records: Array<any>){
    return await connection.sobject(object).create(records);
}

export async function update(connection: jsforce.Connection, object: string, records: Array<any>){
    return await connection.sobject(object).update(records);
}

export async function remove(connection: jsforce.Connection, object: string, ids: Array<string>){
    return await connection.sobject(object).del(ids);
}