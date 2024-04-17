import jsforce from 'jsforce';
import { CustomSettingPermission } from '../type/CustomSettingPermission';
import { CustomSetting } from '../type/CustomSetting';
import * as util from '../util';

export async function getAll(connection: jsforce.Connection){
    let listToReturn = new Array<CustomSetting>;

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
            newRecord.label = record.QualifiedApiName;

            listToReturn.push(newRecord);
        });
    });

    return listToReturn;
}

export async function getPermissions(connection: jsforce.Connection, listIdCustomSetting: Array<string>, listIdPermissionSet?: Array<string>){
    let listToReturn = new Array<CustomSettingPermission>;

    if(listIdCustomSetting.length){
        let parentFilter = '';

        if(listIdPermissionSet && listIdPermissionSet.length){
            parentFilter = ` AND ParentId IN ('${listIdPermissionSet.join("','")}')`;
        }

        let soql = `
            SELECT Id
                , ParentId
                , SetupEntityId 
            FROM SetupEntityAccess 
            WHERE SetupEntityType = 'CustomEntityDefinition' 
                AND SetupEntityId IN ('${listIdCustomSetting.join("','")}') 
                AND ( NOT Parent.Name LIKE 'X00e%' ) 
                AND Parent.IsCustom = true 
                ${parentFilter}
        `;

        await connection.query(soql)
        .then(result =>{
            result.records.forEach((record: any) =>{
                // @ts-ignore
                let newRecord: CustomSettingPermission = {};
                newRecord.id = util.getId(record.Id);
                newRecord.permissionId = record.ParentId;
                newRecord.customSettingId = util.getId(record.SetupEntityId);

                listToReturn.push(newRecord);
            });
        });
    }

    return listToReturn;
}