import jsforce from 'jsforce';
import * as util from '../util';
import { Visualforce } from '../type/Visualforce';
import { VisualforcePermission } from '../type/VisualforcePermission';

export async function getAll(connection: jsforce.Connection){
    let listToReturn = new Array<Visualforce>;

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

export async function getPermissions(connection: jsforce.Connection, listIdCustomSetting: Array<string>, listIdPermissionSet?: Array<string>){
    let listToReturn = new Array<VisualforcePermission>;

    if(listIdCustomSetting.length){
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
            WHERE SetupEntityType = 'ApexPage' 
                AND SetupEntityId IN ('${listIdCustomSetting.join("','")}') 
                AND ( NOT Parent.Name LIKE 'X00e%' ) 
                AND Parent.IsCustom = true 
                ${parentFilter}
        `;

        await connection.query(soql)
        .then(result =>{
            result.records.forEach((record: any) =>{
                // @ts-ignore
                let newRecord: VisualforcePermission = {};
                newRecord.id = util.getId(record.Id);
                newRecord.permissionId = record.ParentId;
                newRecord.visualforceId = util.getId(record.SetupEntityId);

                listToReturn.push(newRecord);
            });
        });
    }

    return listToReturn;
}