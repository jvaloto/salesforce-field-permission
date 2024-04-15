import jsforce from 'jsforce';
import { FieldPermission } from '../type/FieldPermission';

export async function getPermissions(connection: jsforce.Connection, listField: Array<string>, listIdPermissionSet?: Array<string>){
    let listToReturn = new Array<FieldPermission>;
    let parentFilter = '';

    if(listField.length){
        if(listIdPermissionSet && listIdPermissionSet.length){
            parentFilter = ` AND ParentId IN ('${listIdPermissionSet.join("','")}')`;
        }

        let soql = `
            SELECT Id
                , Field
                , Parent.Name
                , ParentId
                , PermissionsEdit 
                , PermissionsRead
                , SobjectType
            FROM FieldPermissions 
            WHERE Parent.IsCustom = true
                AND Field IN ('${listField.join("','")}')
                AND ( NOT Parent.Name LIKE 'X00e%' ) 
                ${parentFilter}
        `;

        await connection.query(soql)
        .then(result =>{
            result.records.forEach((record: any) =>{
                // @ts-ignore
                let newRecord: FieldPermission = {};
                newRecord.id = record.Id;
                newRecord.field = record.Field.split('.')[1];
                newRecord.object = record.SobjectType;
                newRecord.name = record.Field;
                newRecord.permissionId = record.ParentId;
                newRecord.read = record.PermissionsRead;
                newRecord.edit = record.PermissionsEdit;

                listToReturn.push(newRecord);
            });
        });
    }

    return listToReturn;
}