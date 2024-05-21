import jsforce from 'jsforce';
import { SinglePermission } from '../type/SinglePermission';
import { SetupEntityAccess } from '../type/SetupEntityAccess';

export default interface SinglePermissionInterface{

    getAll(
        connection: jsforce.Connection
    ): Promise<Array<SinglePermission>>;
        
    getPermissions(
        connection: jsforce.Connection, 
        listSetupEntityId: Array<string>, 
        listIdPermissionSet?: Array<string>
    ): Promise<Array<SetupEntityAccess>>;

}