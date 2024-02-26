import { exec } from 'child_process';
import * as util from 'util';

const execute = util.promisify(exec);

export async function executeCommand(command: string): Promise<any>{
    return execute(command);
}