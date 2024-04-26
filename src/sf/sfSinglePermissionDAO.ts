import jsforce from 'jsforce';
import * as util from '../util';
import { SetupEntityAccess } from '../type/SetupEntityAccess';

export async function getPermissions(connection: jsforce.Connection, type: string, listSetupEntityId: Array<string>, listIdPermissionSet?: Array<string>){
    let listToReturn = new Array<SetupEntityAccess>;

    if(listSetupEntityId.length){
        let parentFilter = '';

        if(listIdPermissionSet && listIdPermissionSet.length){
            parentFilter = ` AND ParentId IN ('${listIdPermissionSet.join("','")}')`;
        }

        let soql = `
            SELECT Id
                , ParentId
                , SetupEntityId 
                , SetupEntityType
            FROM SetupEntityAccess 
            WHERE SetupEntityType = '${type}' 
                AND SetupEntityId IN ('${listSetupEntityId.join("','")}') 
                AND ( NOT Parent.Name LIKE 'X00e%' ) 
                AND Parent.IsCustom = true 
                ${parentFilter}
        `;

        await connection.query(soql)
        .then(result =>{
            result.records.forEach((record: any) =>{
                // @ts-ignore
                let newRecord: SetupEntityAccess = {};
                newRecord.Id = util.getId(record.Id);
                newRecord.ParentId = record.ParentId;
                newRecord.SetupEntityId = util.getId(record.SetupEntityId);

                listToReturn.push(newRecord);
            });
        });
    }

    return listToReturn;
}