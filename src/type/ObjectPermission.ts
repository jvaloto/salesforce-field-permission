export type ObjectPermission = {
    id: string;
    permissionId: string;
    object: string;
    read: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
    viewAll: boolean;
    modifyAll: boolean;
};