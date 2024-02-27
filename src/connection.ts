import jsforce from 'jsforce';
import { executeCommand } from './cmd';

export async function getOrgs(): Promise<Array<string>>{
    let listToReturn = new Array();

    let jsonResult = await executeCommand('sf org list --all --json');

    let values = JSON.parse(jsonResult.stdout).result;

    Object.keys(values).forEach((type: any) =>{
        values[type].forEach((org: any) =>{
            if(!listToReturn.includes(org.alias)){
                listToReturn.push(org.alias);
            }
        });
    });

    return listToReturn;
}

export async function getConnection(alias: string): Promise<jsforce.Connection>{
    let values = await getToken(alias);

    return new jsforce.Connection({
        instanceUrl: values.instanceUrl,
        accessToken: values.accessToken
    });
}

async function getToken(alias: string): Promise<{'accessToken': string, 'instanceUrl': string}>{
    let jsonResult = await executeCommand(`sf org display --target-org ${alias} --json`);

    let values = JSON.parse(jsonResult.stdout).result;

    return { 
        accessToken: values.accessToken, 
        instanceUrl: values.instanceUrl
    };
}