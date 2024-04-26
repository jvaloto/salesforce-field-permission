import jsforce from 'jsforce';
import * as util from '../util';
import * as sfSinglePermissionDAO from './sfSinglePermissionDAO';
import { SinglePermission } from '../type/SinglePermission';

export async function getAll(connection: jsforce.Connection){
    let listToReturn = new Array<SinglePermission>;

    let soql = `
        SELECT Id
            , DeveloperName
            , NamespacePrefix
        FROM CustomPermission 
        ORDER BY DeveloperName ASC
    `;

    await connection.query(soql)
    .then(result =>{
        result.records.forEach((record: any) =>{
            // @ts-ignore
            let newRecord: SinglePermission = {};
            newRecord.id = util.getId(record.Id);
            newRecord.prefix = record.NamespacePrefix;
            newRecord.name = ( newRecord.prefix ? newRecord.prefix + '.' : '' ) + record.DeveloperName;
            newRecord.label = newRecord.name;

            listToReturn.push(newRecord);
        });
    });

    return listToReturn;
}

export async function getPermissions(connection: jsforce.Connection, listSetupEntityId: Array<string>, listIdPermissionSet?: Array<string>){
    return await sfSinglePermissionDAO.getPermissions(connection, 'CustomPermission', listSetupEntityId, listIdPermissionSet);
}