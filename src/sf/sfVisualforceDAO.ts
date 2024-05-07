import jsforce from 'jsforce';
import * as util from '../util';
import * as sfSinglePermissionDAO from './sfSinglePermissionDAO';
import { SinglePermission } from '../type/SinglePermission';
import SinglePermissionInterface from '../interface/SinglePermissionInterface';

export default class sfVisualforceDAO implements SinglePermissionInterface{

    async getAll(connection: jsforce.Connection){
        let listToReturn = new Array<SinglePermission>;

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
                let newRecord: SinglePermission = {};
                newRecord.id = util.getId(record.Id);
                newRecord.prefix = record.NamespacePrefix;
                newRecord.name = ( newRecord.prefix ? newRecord.prefix + '.' : '' ) + record.Name;
                newRecord.label = newRecord.name;

                listToReturn.push(newRecord);
            });
        });

        return listToReturn;
    }

    async getPermissions(
        connection: jsforce.Connection, 
        listSetupEntityId: Array<string>, 
        listIdPermissionSet?: Array<string>
    ){
        return await sfSinglePermissionDAO.getPermissions(
            connection, 
            'ApexPage', 
            listSetupEntityId, 
            listIdPermissionSet
        );
    }

}