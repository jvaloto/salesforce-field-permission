import jsforce from 'jsforce';
import { executeCommand } from "../cmd";

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
    let listToReturn = new Array();
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
                listToReturn.push({
                    id: record.Id,
                    parentId: record.ParentId,
                    object: record.SobjectType,
                    read: record.PermissionsRead,
                    create: record.PermissionsCreate,
                    edit: record.PermissionsEdit,
                    delete: record.PermissionsDelete,
                    viewAll: record.PermissionsViewAllRecords,
                    modifyAll: record.PermissionsModifyAllRecords
                });
            });
        });
    }

    return listToReturn;
}