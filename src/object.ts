import { executeCommand } from "./cmd";

export async function getObjects(org: string): Promise<Array<string>>{
    let listToReturn = new Array();

    let jsonResult = await executeCommand(`sf data query --query "SELECT QualifiedApiName FROM EntityDefinition WHERE IsCustomizable = true AND IsCustomSetting = false ORDER BY QualifiedApiName ASC" -o ${org} --json`);

    JSON.parse(jsonResult.stdout).result.records.forEach((object: any) =>{
        listToReturn.push(object.QualifiedApiName);
    });

    return listToReturn;
}

export async function getFields(org: string, object: string): Promise<any>{
    let listToReturn = new Array();
    
    let jsonResult = await executeCommand(`sf sobject describe -o ${org} --sobject ${object} --json`);

    JSON.parse(jsonResult.stdout).result.fields.forEach((field: any) =>{
        listToReturn.push({
            label: field.label,
            api: field.name
        });
    });

    listToReturn.sort((a,b) => a.label > b.label ? 1 : a.label < b.label ? -1 : 0);

    return listToReturn;
}