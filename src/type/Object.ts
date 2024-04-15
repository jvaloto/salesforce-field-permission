export type Object = {
    Id: string;
    ParentId: string;
    SObjectType: string;
    PermissionsRead: boolean;
    PermissionsCreate: boolean;
    PermissionsEdit: boolean;
    PermissionsDelete: boolean;
    PermissionsViewAllRecords: boolean;
    PermissionsModifyAllRecords: boolean;
};