import jsforce from 'jsforce';
import { PermissionSet } from '../type/PermissionSet';

export async function getAll(connection: jsforce.Connection){
    let listToReturn = new Array<PermissionSet>;

    let soql = `
        SELECT Id
            , Label 
            , Name 
        FROM PermissionSet 
        WHERE IsCustom = true 
            AND ( NOT Name LIKE 'X00e%' )
        ORDER BY Label ASC
    `;

    await connection.query(soql)
    .then(result =>{
        result.records.forEach((record: any) =>{
            listToReturn.push({ 
                id: record.Id, 
                label: record.Label, 
                api: record.Name,
                read: false,
                edit: false
            });
        });
    });

    return listToReturn;
}