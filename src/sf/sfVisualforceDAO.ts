import jsforce from 'jsforce';
import * as util from '../util';
import * as sfSinglePermissionDAO from './sfSinglePermissionDAO';
import { SinglePermission } from '../type/SinglePermission';

export async function getAll(connection: jsforce.Connection){
    let listToReturn = new Array<SinglePermission>;

    let soql = `
        SELECT Id
            , Name
            , NamespacePrefix
        FROM ApexPage
        ORDER BY NamespacePrefix
            , Name
    `;

    await connection.query(soql)
    .then(result =>{
        result.records.forEach((record: any) =>{
            // @ts-ignore
            let newRecord: Visualforce = {};
            newRecord.id = util.getId(record.Id);
            newRecord.label = ( record.NamespacePrefix ? record.NamespacePrefix + '.' : '' ) + record.Name;

            listToReturn.push(newRecord);
        });
    });

    return listToReturn;
}

export async function getPermissions(connection: jsforce.Connection, listSetupEntityId: Array<string>, listIdPermissionSet?: Array<string>){
    return await sfSinglePermissionDAO.getPermissions(connection, 'ApexPage', listSetupEntityId, listIdPermissionSet);
}