import jsforce from 'jsforce';
import * as util from '../util';
import * as sfSinglePermissionDAO from './sfSinglePermissionDAO';
import { SinglePermission } from '../type/SinglePermission';

export async function getAll(connection: jsforce.Connection){
    let listToReturn = new Array<SinglePermission>;

    let soql = `
        SELECT 
            DurableId
            , QualifiedApiName 
        FROM EntityDefinition 
        WHERE IsCustomizable = true 
            AND IsCustomSetting = true 
        ORDER BY QualifiedApiName ASC
    `;

    await connection.query(soql)
    .then(result =>{
        result.records.forEach((record: any) =>{
            // @ts-ignore
            let newRecord: CustomSetting = {};
            newRecord.id = util.getId(record.DurableId);
            newRecord.name = record.QualifiedApiName;
            newRecord.label = record.QualifiedApiName;

            listToReturn.push(newRecord);
        });
    });

    return listToReturn;
}

export async function getPermissions(connection: jsforce.Connection, listSetupEntityId: Array<string>, listIdPermissionSet?: Array<string>){
    return await sfSinglePermissionDAO.getPermissions(connection, 'CustomEntityDefinition', listSetupEntityId, listIdPermissionSet);
}