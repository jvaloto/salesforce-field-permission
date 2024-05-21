import jsforce from 'jsforce';
import * as util from '../util';
import * as sfSinglePermissionDAO from './sfSinglePermissionDAO';
import { SinglePermission } from '../type/SinglePermission';
import SinglePermissionInterface from '../interface/SinglePermissionInterface';

export default class sfCustomSettingDAO implements SinglePermissionInterface{

    async getAll(connection: jsforce.Connection){
        let listToReturn = new Array<SinglePermission>;

        let soql = `
            SELECT Id
                , DurableId
                , NamespacePrefix 
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
                let newRecord: SinglePermission = {};
                newRecord.id = util.getId(record.DurableId);
                newRecord.prefix = record.NamespacePrefix;
                newRecord.name = ( newRecord.prefix ? newRecord.prefix + '.' : '' ) + record.QualifiedApiName;
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
            'CustomEntityDefinition', 
            listSetupEntityId, 
            listIdPermissionSet
        );
    }
}