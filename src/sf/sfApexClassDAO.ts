import jsforce from 'jsforce';

export async function getAll(connection: jsforce.Connection){
    let listToReturn = new Array();

    let soql = `
        SELECT Id
            , Name
            , NamespacePrefix 
        FROM ApexClass 
        WHERE Status = 'Active' 
        ORDER BY Name ASC
    `;

    await connection.query(soql)
    .then(result =>{
        result.records.forEach((apexClass: any) =>{
            listToReturn.push({
                id: apexClass.Id,
                prefix: apexClass.NamespacePrefix,
                name: apexClass.Name,
                label: ( apexClass.NamespacePrefix ? apexClass.NamespacePrefix +'.' : '' ) + apexClass.Name
            });
        });
    });

    return listToReturn;
}

export async function getPermissions(connection: jsforce.Connection, listIdApexClass: Array<string>, listIdPermissionSet: Array<string>){
    let listToReturn = new Array();

    if(listIdApexClass.length){
        let parentFilter = '';

        if(listIdPermissionSet.length){
            parentFilter = ` AND ParentId IN ('${listIdPermissionSet.join("','")}')`;
        }

        let soql = `
            SELECT Id
                , ParentId
                , SetupEntityId 
            FROM SetupEntityAccess 
            WHERE SetupEntityType = 'ApexClass' 
                AND SetupEntityId IN ('${listIdApexClass.join("','")}') 
                AND ( NOT Parent.Name LIKE 'X00e%' ) 
                AND Parent.IsCustom = true 
                ${parentFilter}
        `;

        await connection.query(soql)
        .then(result =>{
            result.records.forEach((record: any) =>{
                listToReturn.push({
                    id: record.Id,
                    parentId: record.ParentId,
                    apexClassId: record.SetupEntityId
                });
            });
        });
    }

    return listToReturn;
}