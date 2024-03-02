import * as vscode from 'vscode';
import { query } from './soql';
import { getConnection, getOrgs } from './connection';
import { create, update } from './dml';
import jsforce from 'jsforce';
import { getFields, getObjects } from './object';
import { html } from './html';

enum MESSAGE_TYPE { ERROR, INFO, SUCCESS };
const LOCAL_STORAGE_ORG = 'defaultOrg';
const LOCAL_STORAGE_PERMISSION_SET = 'defaultPermissionSet';
const PROJECT_NAME = 'Salesforce Field Permission';

export class PageView{
	public static currentPanel: PageView | undefined;

	public static readonly viewType = 'sfp';

	private readonly _panel: vscode.WebviewPanel;
	private readonly _extensionUri: vscode.Uri;
	private _disposables: vscode.Disposable[] = [];

	private connection: jsforce.Connection;
	private permissionsMap: Map<any, any>;
	private permissionsBase: Array<any>;
	public permissionsToSelect: Array<any>;
	public selectedPermissions: Array<any>;
	public selectedFields: Array<any>;
	public values: Map<any, any>;
	public listOrgs: Array<string>;
	public isConnected: boolean;
	public org: string;
	public checkedDefaultOrg: boolean;
	public checkedDefaultPermissionSet: boolean;
	public selectedObject: string;
	public selectedField: string;
	public isLoading: boolean;
	public loadingText: string;
	public pageMessageIsActive: boolean;
	public pageMessageType: string;
	public pageMessageText: Array<string>;
	public showModal: boolean;
	public listObject: Array<any>;
	public objectToDescribe: string;
	public listFieldObject: Array<any>;
	public listSelectedObjects: Array<string>;
	
	public static createOrShow(extensionUri: vscode.Uri){
		const column = vscode.window.activeTextEditor
			? vscode.window.activeTextEditor.viewColumn
			: undefined;

		// If we already have a panel, show it.
		if (PageView.currentPanel) {
			PageView.currentPanel._panel.reveal(column);
			return;
		}

		// Otherwise, create a new panel.
		const panel = vscode.window.createWebviewPanel(
			PageView.viewType,
			PROJECT_NAME,
			column || vscode.ViewColumn.One,
			getWebviewOptions(extensionUri),
		);

		PageView.currentPanel = new PageView(panel, extensionUri);
	}

	public static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
		PageView.currentPanel = new PageView(panel, extensionUri);
	}

	private newInstance(){
		this.permissionsBase = new Array();
		this.permissionsToSelect = new Array();
		this.selectedPermissions = new Array();
		this.selectedFields = new Array();
		this.values = new Map();
		this.permissionsMap = new Map();
		this.isConnected = false;
		this.selectedObject = '';
		this.selectedField = '';
		this.isLoading = true;
		this.pageMessageIsActive = false;
		this.pageMessageType = '';
		this.pageMessageText = new Array();
		this.showModal = false;
		this.listObject = new Array();
		this.listFieldObject = new Array();
		this.listSelectedObjects = new Array();
	}

	private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
		this._panel = panel;
		this._extensionUri = extensionUri;
		this.listOrgs = new Array();
		this.checkedDefaultOrg = false;
		this.checkedDefaultPermissionSet = false;

		this.newInstance();

		this.setLoading(true, 'Getting authenticated orgs...');

		getOrgs()
		.then(result =>{
			this.listOrgs = result;

			let defaultOrg = this.getConfig(LOCAL_STORAGE_ORG);

			if(defaultOrg){
				this.checkedDefaultOrg = true;

				this.setOrg(defaultOrg);
			}else{
				this.setLoading(false);
			}
		})
		.catch(error =>{
			this.setError(error);
		});
		
		// Listen for when the panel is disposed
		// This happens when the user closes the panel or when the panel is closed programmatically
		this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

		// Update the content based on view changes
		this._panel.onDidChangeViewState(
			e => {
				if (this._panel.visible) {
					this._update();
				}
			},
			null,
			this._disposables
		);

		// Handle messages from the webview
		this._panel.webview.onDidReceiveMessage(
			message => {
				switch(message.command){
					case 'SELECT-ORG':
						this.setOrg(message.text);
						
						return;
					case 'ADD-PERMISSION-SET':
						this.addPermission(message.text);

						return;
					case 'REFRESH-PERMISSION-SET':
						this.getPermissionSet();

						return;
					case 'ADD-FIELD':
						this.addField(message.text.object, message.text.field);
						
						return;
					case 'ADD-FIELD-OBJECT':
						this.showFielsObject(message.text);

						return;
					case 'DESCRIBE-FIELDS':
						this.getFieldsFromObject(message.text);

						return;
					case 'ADD-LIST-FIELDS':
						this.addListFields(message.text);

						return;
					case 'CHANGE-VALUE':
						this.setValue(message.text.checked, message.text.type, message.text.permission, message.text.field);

						return;
					case 'CHANGE-VALUE-ALL':
						this.setValueAll(message.text.checked, message.text.type, message.text.permission);

						return;
					case 'REMOVE-FIELD':
						this.removeField(message.text);

						return;
					case 'REMOVE-PERMISSION':
						this.removePermission(message.text);

						return;
					case 'SAVE':
						this.save();

						return;
					case 'CLEAR':
						this.clear();

						return;
					case 'SET-DEFAULT-ORG':
						this.setDefaultOrg(message.text);

						return;
					case 'SET-DEFAULT-PERMISSION-SETS':
						this.setDefaultPermissionSets(message.text);

						return;
					case 'WHERE-IS-PERMISSION':
						this.whereIsPermission();

						return;
					case 'ADD-OBJECT':
						this.addObject(message.text);

						return;
				}
			},
			null,
			this._disposables
		);	
	}

	private setLoading(isActive: boolean, text?: string){
		this.isLoading = isActive;
		this.loadingText = text || '';
		
		this._update();
	}

	private setConfig(key: string, value: string){
		vscode.workspace.getConfiguration(PageView.viewType).update(key, value, 1);
	}

	private getConfig(key: string){
		return vscode.workspace.getConfiguration(PageView.viewType)[key];
	}
	
	private removeConfig(key: string){
		vscode.workspace.getConfiguration(PageView.viewType).update(key, '', 1);
	}

	private setDefaultOrg(set: boolean){
		this.checkedDefaultOrg = set;

		if(this.checkedDefaultOrg){
			this.setConfig(LOCAL_STORAGE_ORG, this.org);
		}else{
			this.removeConfig(LOCAL_STORAGE_ORG);
		}
	}
	
	private setDefaultPermissionSets(set: boolean){
		this.checkedDefaultPermissionSet = set;

		if(this.checkedDefaultPermissionSet){
			this.setConfig(
				LOCAL_STORAGE_PERMISSION_SET,
				JSON.stringify(this.selectedPermissions)
			);
		}else{
			this.removeConfig(LOCAL_STORAGE_PERMISSION_SET);
		}
	}

	private setOrg(org: string){
		this.createMessage(false);

		this.org = org;

		this.setLoading(true, 'Validating token...');

		getConnection(org)
		.then(result =>{
			if(result.accessToken){
				this.setDefaultOrg(this.checkedDefaultOrg);

				this.newInstance();

				this.isConnected = true;
				
				this.connection = result;
				
				this.getPermissionSet();
			}else{
				this.isConnected = false;

				let errorMessage = `
					Error on trying to connect to ${org} org.
					Please re-authenticate and try again.
				`;

				this.message(MESSAGE_TYPE.ERROR, errorMessage);

				this.setError(errorMessage);
			}
		})
		.catch(error =>{
			this.isConnected = false;

			this.setError(error);
		});
	}

	private getPermissionSet(){
		this.setLoading(true, 'Creating list of permission sets...');

		query(this.connection, `
			SELECT Id
				, Label 
				, Name 
			FROM PermissionSet 
			WHERE IsCustom = true 
				AND ( NOT Name LIKE 'X00e%' )
			ORDER BY Label ASC
		`)
		.then(resultPermissions =>{
			resultPermissions.records.forEach((permission: any) =>{
				this.permissionsMap.set(permission.Id, permission);

				this.permissionsBase.push({ 
					id: permission.Id, 
					label: permission.Label, 
					api: permission.Name,
					read: false,
					edit: false
				});
			});

			this.permissionsBase.sort((a, b) => a.label < b.label ? -1 : a.label > a.label ? 1 : 0);

			let setDefaultPermissionSet = this.getConfig(LOCAL_STORAGE_PERMISSION_SET);

			this.permissionsToSelect = [...this.permissionsBase];

			if(setDefaultPermissionSet && setDefaultPermissionSet.length){
				this.checkedDefaultPermissionSet = true;
				
				JSON.parse(setDefaultPermissionSet).forEach((permission: any) =>{
					if(this.permissionsToSelect.filter(e => e.id === permission.id)?.length){
						this.addPermission(permission.api, false);
					}
				});
			}else{
				this.checkedDefaultPermissionSet = false;
			}

			this.getListObjects()
			.then(result =>{
				this.setLoading(false);
	
				this._update();
			});
		})
		.catch(error =>{
			this.setError(error);
		});
	}

	private addField(object: string, field: string){
		this.createMessage(false);

		this.selectedObject = object;
		this.selectedField = field;

		if(object && field){
			let keyField = `${object}.${field}`;
			
			if(!this.selectedFields.filter(e => e === keyField).length){
				this.selectedFields.push(keyField);
				
				let listIdPermission = new Array();
				
				this.selectedPermissions.forEach(permission =>{
					listIdPermission.push(permission.id);
				});

				this.selectedField = '';
				
				this.addMetadata([keyField], listIdPermission);
			}
		}
	}

	private async getListObjects(){
		await getObjects(this.org)
		.then(result =>{
			this.listObject = result;
		})
		.catch(error =>{
			this.setError(error);
		});
	}

	private showFielsObject(show: boolean){
		this.showModal = show;

		this.createMessage(false);

		if(this.showModal){
			if(this.listObject.length){
				this._update();
			}else{
				vscode.window.withProgress({
					location: vscode.ProgressLocation.Notification,
					title: 'Loading objects...',
				}, async (progress) => {
					await this.getListObjects();

					this._update();
				});
			}
		}else{
			this._update();
		}
	}

	private getFieldsFromObject(object: string){
		this.objectToDescribe = object;

		if(this.objectToDescribe){
			vscode.window.withProgress({
				location: vscode.ProgressLocation.Notification,
				title: 'Loading fields...',
			}, async (progress) => {
				await getFields(this.org, this.objectToDescribe)
				.then(result =>{
					this.listFieldObject = result;

					this._update();
				})
				.catch(error =>{
					this.setError(error);
				});
			});
		}
	}

	private addListFields(fields: Array<any>){
		let listFields = new Array();

		fields.forEach(field =>{
			let newField = this.objectToDescribe +'.'+ field;

			if(!this.selectedFields.includes(newField)){
				listFields.push(newField);

				this.selectedFields.push(newField);
			}
		});

		this.showModal = false;

		this.addMetadata(listFields, []);
	}

	private addMetadata(fields: Array<string>, permissions: Array<string>){
		if(!permissions.length){
			permissions = new Array();

			this.selectedPermissions.forEach(permission =>{
				permissions.push(permission.id);
			});
		}

		query(this.connection, `
			SELECT Id
				, Field
				, Parent.Name
				, ParentId
				, PermissionsEdit 
				, PermissionsRead
				, SobjectType
			FROM FieldPermissions 
			WHERE Parent.IsCustom = true
				AND ParentId IN ('${permissions.join("','")}') 
				AND Field IN ('${fields.join("','")}')
				AND ( NOT Parent.Name LIKE 'X00e%' )
		`)
		.then(resultFields =>{
			resultFields.records.forEach((fieldPermission: any) =>{
				this.values.set(fieldPermission.Parent.Name +'.'+ fieldPermission.Field, { 
					id: fieldPermission.Id, 
					permission: fieldPermission.Parent.Name,
					permissionId: fieldPermission.ParentId,
					field: fieldPermission.Field, 
					read: fieldPermission.PermissionsRead, 
					edit: fieldPermission.PermissionsEdit
				});
			});

			fields.forEach(field =>{
				this.selectedPermissions.forEach(permission =>{
					let keyValue = permission.api +'.'+ field;

					if(!this.values.has(keyValue)){
						this.values.set(keyValue, {
							id: null, 
							permission: permission.api, 
							permissionId: permission.id,
							field: field, 
							read: false, 
							edit: false
						});
					}
				});
			});

			this.selectedPermissions.sort((a,b) => a.label > b.label ? 1 : a.label < b.label ? -1 : 0);
			this.selectedFields.sort((a,b) => a > b ? 1 : a < b ? -1 : 0);

			this._update();
		})
		.catch(errorFields =>{
			this.setError(errorFields);
		});
	}

	private removeField(field: string){
		this.selectedFields = this.selectedFields.filter(e => e !== field);

		this.selectedPermissions.forEach(permission =>{
			this.values.delete(permission.api +'.'+ field);
		});

		this._update();
	}

	private setValue(checked: boolean, type: string, permission: string, field: string){
		this.createMessage(false);

		let key = permission +'.'+ field;

		let value = this.values.get(key);

		if(type === 'edit'){
			value.edit = checked;
			
			if(checked){
				value.read = checked;
			}
		}else{ // read
			if(!checked){
				value.edit = checked;
			}

			value.read = checked;
		}
		
		this.values.set(key, value);

		this._update();
	}

	private setValueAll(checked: boolean, type: string, permission: string){
		this.createMessage(false);

		let read = false;
		let edit = false;

		if(type === 'edit'){
			edit = checked;
			
			if(checked){
				read = checked;
			}
		}else{ // read
			if(!checked){
				edit = checked;
			}
			
			read = checked;
		}
		
		this.selectedPermissions.filter(e => e.api === permission)[0].read = read;
		this.selectedPermissions.filter(e => e.api === permission)[0].edit = edit;

		for(let [key, value] of this.values){
			if(key.startsWith(permission + '.')){
				this.values.get(key).read = read;
				this.values.get(key).edit = edit;
			}
		}

		this._update();
	}

	private addPermission(permission: any, isAddMetadata:boolean = true){
		this.createMessage(false);

		if(permission){
			let permissionRecord = this.permissionsBase.filter((e) => e.api === permission)[0];

			this.selectedPermissions.push(permissionRecord);
			
			this.permissionsToSelect = 
				this.permissionsToSelect.filter((e) => e.api !== permission);

			this.setDefaultPermissionSets(this.checkedDefaultPermissionSet);

			if(isAddMetadata){
				let listFields = new Array();
				
				this.selectedFields.forEach(field =>{
					listFields.push(field);
				});
				
				this.addMetadata(listFields, [permissionRecord.id]);
			}else{
				this._update();
			}
		}
	}

	private removePermission(permission: string){
		this.permissionsToSelect.push(this.permissionsBase.filter(e => e.api === permission)[0]);

		this.permissionsToSelect.sort((a, b) => a.label < b.label ? -1 : a.label > a.label ? 1 : 0);

		this.selectedPermissions = this.selectedPermissions.filter(e => e.api !== permission);

		for(let [key] of this.values){
			if(key.startsWith(permission +'.')){
				this.values.delete(key);
			}
		}

		this.setDefaultPermissionSets(this.checkedDefaultPermissionSet);

		this._update();
	}

	private whereIsPermission(){
		this.createMessage(false);

		this.values = new Map();
		let listPermissionsToFilter = new Array();
		this.selectedPermissions = new Array();
		this.permissionsToSelect = new Array();
		this.permissionsToSelect = [...this.permissionsBase];

		query(this.connection, `
			SELECT Id
				, Field
				, Parent.Label
				, Parent.Name
				, ParentId
				, PermissionsEdit 
				, PermissionsRead
				, SobjectType
			FROM FieldPermissions 
			WHERE Parent.IsCustom = true
				AND Field IN ('${this.selectedFields.join("','")}')
				AND ( NOT Parent.Name LIKE 'X00e%' )
		`)
		.then(resultFields =>{
			resultFields.records.forEach((fieldPermission: any) =>{
				if(!listPermissionsToFilter.includes(fieldPermission.Parent.Name)){
					listPermissionsToFilter.push(fieldPermission.ParentId);
				}

				this.values.set(fieldPermission.Parent.Name +'.'+ fieldPermission.Field, { 
					id: fieldPermission.Id, 
					permission: fieldPermission.Parent.Name,
					permissionId: fieldPermission.ParentId,
					field: fieldPermission.Field, 
					read: fieldPermission.PermissionsRead, 
					edit: fieldPermission.PermissionsEdit
				});
			});

			this.selectedPermissions = 
				this.permissionsBase.filter((e) => listPermissionsToFilter.includes(e.id));

			this.permissionsToSelect = 
				this.permissionsToSelect.filter((e) => !listPermissionsToFilter.includes(e.id));

			this.selectedFields.forEach(field =>{
				this.selectedPermissions.forEach(permission =>{
					let keyValue = permission.api +'.'+ field;

					if(!this.values.has(keyValue)){
						this.values.set(keyValue, {
							id: null, 
							permission: permission.api, 
							permissionId: permission.id,
							field: field, 
							read: false, 
							edit: false
						});
					}
				});
			});

			this.selectedPermissions.sort((a,b) => a.label > b.label ? 1 : a.label < b.label ? -1 : 0);
			this.selectedFields.sort((a,b) => a > b ? 1 : a < b ? -1 : 0);

			this._update();
		});
	}

	private addObject(object: string){
		if(object && !this.listSelectedObjects.includes(object)){
			this.listSelectedObjects.push(object);
			
			this._update();
		}
	}

	private async createRecords(records: Array<any>): Promise<any>{
		if(records){
			return await create(this.connection, 'FieldPermissions', records);
		}else{
			return null;
		}
	}

	private async updateRecords(records: Array<any>): Promise<any>{
		if(records){
			return await update(this.connection, 'FieldPermissions', records);
		}else{
			return null;
		}
	}

	private clear(){
		this.selectedFields = new Array();

		this.values = new Map();

		this.selectedPermissions.forEach(permission =>{
			permission.read = false;
			permission.edit = false;
		});

		this._update();
	}

	private save(){
		this.createMessage(false);

		this._update();

		vscode.window.withProgress({
			location: vscode.ProgressLocation.Notification,
			title: 'Saving...',
		}, async (progress) => {
			this.setDefaultPermissionSets(this.checkedDefaultPermissionSet);

			let listRecordsToCreate = new Array();
			let listRecordsToUpdate = new Array();

			for(let [key, value] of this.values){
				let record = {
					Id: value.id,
					ParentId: value.permissionId,
					Field: value.field,
					PermissionsRead: value.read,
					PermissionsEdit: value.edit,
					SObjectType: value.field.split('.')[0]
				};

				if(value.id){
					listRecordsToUpdate.push(record);
				}else{
					if(value.read){
						listRecordsToCreate.push(record);
					}
				}
			}

			const formatErrorMessage = function(record: any, error: any){
				let messageToReturn = record.Field +': ';

				if(error[0].statusCode === 'INVALID_OR_NULL_FOR_RESTRICTED_PICKLIST'){
					messageToReturn += 'Invalid field or is not updatable';
				}else{
					messageToReturn += error[0].message;
				}

				return messageToReturn;
			};

			let errorList = new Array();

			await this.createRecords(listRecordsToCreate)
			.then((result: any) =>{
				if(result){
					let index = 0;
					
					result.forEach((item: any) =>{
						let record = listRecordsToCreate[index];

						if(item.success){
							let key = this.permissionsMap.get(record.ParentId).Name +'.'+ record.Field;

							this.values.get(key).id = item.id;
						}else{
							errorList.push(formatErrorMessage(record, item.errors));
						}

						index ++;
					});
				}
			})
			.catch(error =>{
				errorList.push(error);
			})
			.finally(() =>{
				this.updateRecords(listRecordsToUpdate)
				.then((result: any) =>{
					if(result){
						let index = 0;
		
						result.forEach((item: any) =>{
							let record = listRecordsToUpdate[index];

							if(item.success){
								if(!record.read && !record.edit){
									let key = this.permissionsMap.get(record.ParentId).Name +'.'+ record.Field;

									if(!record.PermissionsRead){
										this.values.get(key).id = null;
									}
								}
							}else{
								errorList.push(formatErrorMessage(record, item.errors));
							}
		
							index ++;
						});
					}
				})
				.catch(error =>{
					errorList.push(error);
				})
				.finally(() =>{
					if(errorList.length){
						let newErrorList = new Array();

						errorList.forEach(error =>{
							if(!newErrorList.includes(error)){
								newErrorList.push(error);
							}
						});

						this.createMessage(true, MESSAGE_TYPE.ERROR, newErrorList);
					}else{
						this.createMessage(true, MESSAGE_TYPE.SUCCESS, 'Your changes are saved');
					}

					this._update();
				});
			});
		});
	}

	private createMessage(isActive: boolean, type: MESSAGE_TYPE = MESSAGE_TYPE.INFO, message?: any){
		this.pageMessageIsActive = isActive;
		this.pageMessageType = type === MESSAGE_TYPE.ERROR ? 'error' : type === MESSAGE_TYPE.SUCCESS ? 'success' : 'info';
		this.pageMessageText = new Array();

		if(message){
			if(Array.isArray(message)){
				this.pageMessageText = message;
			}else{
				this.pageMessageText.push(message);
			}
		}
	}

	private _getHtmlForWebview(webview: vscode.Webview){
		if(PageView.currentPanel !== undefined){
			const scriptUri = webview.asWebviewUri(
				vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js')
			);

			const styleUri = webview.asWebviewUri(
				vscode.Uri.joinPath(this._extensionUri, 'media/css/', 'style.css')
			);

			const sldsUri = webview.asWebviewUri(
				vscode.Uri.joinPath(this._extensionUri, 'media/slds/styles/', 'salesforce-lightning-design-system.css')
			);

			const loadingUri = webview.asWebviewUri(
				vscode.Uri.joinPath(this._extensionUri, 'media/slds/images/spinners/', 'slds_spinner_brand.gif')
			);

			let htmlClass = new html(
				PageView.currentPanel, 
				webview, 
				scriptUri, 
				styleUri, 
				sldsUri, 
				loadingUri, 
				PROJECT_NAME
			);
			
			return htmlClass.getHtml();
		}else{
			return '';
		}
	}

	private setError(error: any, text?: string){
		console.error(text, error);

		this.setLoading(false);

		this.message(MESSAGE_TYPE.ERROR, error);

		this._update();
	}
	
	private message(type: MESSAGE_TYPE, message: any){
		if(type === MESSAGE_TYPE.ERROR){
			vscode.window.showErrorMessage(message);
		}else if(type === MESSAGE_TYPE.INFO){
			vscode.window.showInformationMessage(message);
		}
	}

	public dispose() {
		PageView.currentPanel = undefined;

		// Clean up our resources
		this._panel.dispose();

		while (this._disposables.length) {
			const x = this._disposables.pop();
			if (x) {
				x.dispose();
			}
		}
	}

	private _update() {
		this._panel.webview.html = this._getHtmlForWebview(this._panel.webview);
	}
}

function getWebviewOptions(extensionUri: vscode.Uri): vscode.WebviewOptions {
	return {
		// Enable javascript in the webview
		enableScripts: true,

		// And restrict the webview to only loading content from our extension's `media` directory.
		localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')]
	};
}