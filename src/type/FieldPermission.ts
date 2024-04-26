export type FieldPermission = {
    id: string | null;
    field: string;
    object: string;
    name: string;
    permissionId: string;
    read: boolean;
    edit: boolean;
};