import jsforce from 'jsforce';

export async function query(connection: jsforce.Connection, queryString: string): Promise<any>{
  return await connection.query(queryString);
}