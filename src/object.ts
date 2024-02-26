import { executeCommand } from "./cmd";

export async function getObjects(): Promise<Array<string>>{
    let jsonResult = await executeCommand('sf sobject list --sobject all --json');

    return JSON.parse(jsonResult.stdout).result;
}

export async function getFields(object: string): Promise<any>{
    let listToReturn = new Array();
    
    let jsonResult = await executeCommand(`sf sobject describe --sobject ${object} --json`);

    JSON.parse(jsonResult.stdout).result.fields.forEach((field: any) =>{
        if(field.createable || field.updatable){
            listToReturn.push({
                label: field.label,
                api: field.name
            });
        }

        // createable
        // updateable
    });

    listToReturn.sort((a,b) => a.label > b.label ? 1 : a.label < b.label ? -1 : 0);

    return listToReturn;
}