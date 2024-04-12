export type FieldPermission = {
    id: string;
    field: string;
    object: string;
    name: string;
    permissionId: string;
    read: boolean;
    edit: boolean;
};