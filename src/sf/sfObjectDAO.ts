import jsforce from 'jsforce';
import { executeCommand } from "../cmd";
import { ObjectPermission } from '../type/ObjectPermission';

export async function getAll(connection: jsforce.Connection){
    let listToReturn = new Array();

    let soql = `
        SELECT QualifiedApiName 
        FROM EntityDefinition 
        WHERE IsCustomizable = true 
            AND IsCustomSetting = false 
        ORDER BY QualifiedApiName ASC
    `;

    await connection.query(soql)
    .then(result =>{
        result.records.forEach((record: any) =>{
            listToReturn.push(record.QualifiedApiName);
        });
    });

    return listToReturn;
}

export async function getFields(org: string, object: string){
    let listToReturn = new Array();
    
    let jsonResult = await executeCommand(`sf sobject describe -o ${org} --sobject ${object} --json`);

    JSON.parse(jsonResult.stdout).result.fields.forEach((field: any) =>{
        listToReturn.push({
            label: field.label,
            api: field.name
        });
    });

    listToReturn.sort((a,b) => a.label > b.label ? 1 : a.label < b.label ? -1 : 0);

    return listToReturn;
}

export async function getPermissions(connection: jsforce.Connection, listObject: Array<string>, listIdPermissionSet?: Array<string>){
    let listToReturn = new Array<ObjectPermission>;
    let parentFilter = '';

    if(listObject.length){
        if(listIdPermissionSet && listIdPermissionSet.length){
            parentFilter = ` AND ParentId IN ('${listIdPermissionSet.join("','")}')`;
        }

        let soql = `
            SELECT Id
                , ParentId
                , PermissionsCreate
                , PermissionsDelete
                , PermissionsEdit
                , PermissionsModifyAllRecords
                , PermissionsRead
                , PermissionsViewAllRecords
                , SobjectType
            FROM ObjectPermissions 
            WHERE SobjectType IN ('${listObject.join("','")}')
                AND Parent.IsCustom = true 
                AND ( NOT Parent.Name LIKE 'X00e%' ) 
                ${parentFilter}
        `;

        await connection.query(soql)
        .then(result =>{
            result.records.forEach((record: any) =>{
                // @ts-ignore
                let newRecord: ObjectPermission = {};
                newRecord.id = record.Id;
                newRecord.permissionId = record.ParentId;
                newRecord.object = record.SobjectType;
                newRecord.read = record.PermissionsRead;
                newRecord.create = record.PermissionsCreate;
                newRecord.edit = record.PermissionsEdit;
                newRecord.delete = record.PermissionsDelete;
                newRecord.viewAll = record.PermissionsViewAllRecords;
                newRecord.modifyAll = record.PermissionsModifyAllRecord;

                listToReturn.push(newRecord);
            });
        });
    }

    return listToReturn;
}