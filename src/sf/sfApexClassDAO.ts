import jsforce from 'jsforce';
import * as util from '../util';
import * as sfSinglePermissionDAO from './sfSinglePermissionDAO';
import { SinglePermission } from '../type/SinglePermission';

export async function getAll(connection: jsforce.Connection){
    let listToReturn = new Array<SinglePermission>;

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
                id: util.getId(apexClass.Id),
                prefix: apexClass.NamespacePrefix,
                name: apexClass.Name,
                label: ( apexClass.NamespacePrefix ? apexClass.NamespacePrefix +'.' : '' ) + apexClass.Name
            });
        });
    });

    return listToReturn;
}

export async function getPermissions(connection: jsforce.Connection, listSetupEntityId: Array<string>, listIdPermissionSet?: Array<string>){
    return await sfSinglePermissionDAO.getPermissions(connection, 'ApexClass', listSetupEntityId, listIdPermissionSet);
}