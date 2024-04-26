import jsforce from 'jsforce';
import * as util from '../util';
import * as sfSinglePermissionDAO from './sfSinglePermissionDAO';
import { SinglePermission } from '../type/SinglePermission';

export async function getAll(connection: jsforce.Connection){
    let listToReturn = new Array<SinglePermission>;

    let soql = `
        SELECT Id
            , DurableId
            , NamespacePrefix 
            , QualifiedApiName 
        FROM EntityDefinition 
        WHERE IsCustomizable = true 
            AND IsCustomSetting = false
            AND QualifiedApiName LIKE '%__mdt'
        ORDER BY QualifiedApiName ASC
    `;

    await connection.query(soql)
    .then(result =>{
        result.records.forEach((record: any) =>{
            // @ts-ignore
            let newRecord: SinglePermission = {};
            newRecord.id = util.getId(record.DurableId);
            newRecord.prefix = record.NamespacePrefix;
            newRecord.name = ( newRecord.prefix ? newRecord.prefix + '.' : '' ) + record.QualifiedApiName;
            newRecord.label = newRecord.name;

            listToReturn.push(newRecord);
        });
    });

    return listToReturn;
}

export async function getPermissions(connection: jsforce.Connection, listSetupEntityId: Array<string>, listIdPermissionSet?: Array<string>){
    return await sfSinglePermissionDAO.getPermissions(connection, 'CustomEntityDefinition', listSetupEntityId, listIdPermissionSet);
}