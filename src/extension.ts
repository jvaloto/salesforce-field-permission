import * as vscode from 'vscode';
import { PageView } from './PageView';

export function activate(context: vscode.ExtensionContext){
	context.subscriptions.push(
		vscode.commands.registerCommand('sfp.open', () =>{
			PageView.createOrShow(context.extensionUri);
		})
	);
}

export function deactivate(){ }