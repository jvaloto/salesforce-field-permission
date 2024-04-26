export type FieldPermissions = {
    Id: string | null;
    ParentId: string;
    Field: string;
    PermissionsRead: boolean;
    PermissionsEdit: boolean;
    SObjectType: string;
};