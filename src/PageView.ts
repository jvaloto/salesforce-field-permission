// @ts-nocheck
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
const DEFAULT_FILTER_SOQL_PARENT = " AND ( NOT Parent.Name LIKE 'X00e%' ) ";
const DEFAULT_FILTER_SOQL = " AND ( NOT Name LIKE 'X00e%' ) ";

export class PageView{
	public static currentPanel: PageView | undefined;

	public static readonly viewType = 'sfp';

	private readonly _panel: vscode.WebviewPanel;
	private readonly _extensionUri: vscode.Uri;
	private _disposables: vscode.Disposable[] = [];

	private connection: jsforce.Connection;
	private permissionsMap: Map<any, any>;
	private permissionsBase: Array<any>;
	private tabFocus: string;
	private subTabFocus: string;
	private isInputFieldFocus: boolean;
	public checkedDefaultOrg: boolean;
	public checkedDefaultPermissionSet: boolean;
	public fieldValues: Map<any, any>;
	public isConnected: boolean;
	public isLoading: boolean;
	public listFieldObject: Array<any>;
	public listObject: Array<any>;
	public listOrgs: Array<string>;
	public listSelectedObjects: Array<string>;
	public loadingText: string;
	public objectToDescribe: string;
	public objectValues: Map<any, any>;
	public org: string;
	public pageMessageIsActive: boolean;
	public pageMessageText: Array<string>;
	public pageMessageType: string;
	public permissionsToSelect: Array<any>;
	public selectedField: string;
	public selectedFields: Array<any>;
	public selectedObject: string;
	public selectedPermissions: Array<any>;
	public showModal: boolean;
	
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
		this.fieldValues = new Map();
		this.objectValues = new Map();
		this.permissionsMap = new Map();
		this.isConnected = false;
		this.selectedObject = '';
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
					case 'SAVE-FIELDS':
						this.saveFields();

						return;
					case 'SAVE-OBJECT':
						this.saveObject(message.text.object, JSON.parse(message.text.values));

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
					case 'REMOVE-OBJECT':
						this.removeObject(message.text);

						return;
					case 'SET-TAB-FOCUS':
						this.setTabFocus(message.text.tab, message.text.subTab);

						break;
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
				${DEFAULT_FILTER_SOQL}
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

			if(setDefaultPermissionSet && JSON.parse(setDefaultPermissionSet).length > 0){
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

		if(object && field){
			this.isInputFieldFocus = true;

			let keyField = `${object}.${field}`;
			
			if(!this.selectedFields.filter(e => e === keyField).length){
				this.selectedFields.push(keyField);
				
				let listIdPermission = new Array();
				
				this.selectedPermissions.forEach(permission =>{
					listIdPermission.push(permission.id);
				});

				this.addMetadata([keyField], listIdPermission, true);
			}
		}
	}

	private async getListObjects(){
		this.listObject = new Array();

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

		this._update();
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
		vscode.window.withProgress({
			location: vscode.ProgressLocation.Notification,
			title: 'Adding fields...',
		}, async (progress) => {
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
		});
	}

	private addMetadata(fields: Array<string>, permissions: Array<string>, isSetFocus: boolean = false){
		if(fields && fields.length){
			if(!permissions.length){
				permissions = this.getValueFromList(this.selectedPermissions, 'id');
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
					${DEFAULT_FILTER_SOQL_PARENT}
			`)
			.then(resultFields =>{
				this.createFieldPermissions(resultFields.records, fields);

				if(isSetFocus){
					this.setTabFocus('FIELD');
				}

				this._update();
			})
			.catch(errorFields =>{
				this.setError(errorFields);
			});
		}
	}

	private removeField(field: string){
		this.selectedFields = this.selectedFields.filter(e => e !== field);

		this.selectedPermissions.forEach(permission =>{
			this.fieldValues.delete(permission.api +'.'+ field);
		});
	}

	private setValue(checked: boolean, type: string, permission: string, field: string){
		this.createMessage(false);

		let key = permission +'.'+ field;

		let value = this.fieldValues.get(key);

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
		
		this.fieldValues.set(key, value);

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

		for(let [key, value] of this.fieldValues){
			if(key.startsWith(permission + '.')){
				this.fieldValues.get(key).read = read;
				this.fieldValues.get(key).edit = edit;
			}
		}

		this._update();
	}

	private addPermission(permission: any, isAddMetadata:boolean = true){
		vscode.window.withProgress({
			location: vscode.ProgressLocation.Notification,
			title: 'Adding permission set...',
		}, async (progress) => {
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

					this.getObjectPermissions();
				}else{
					this._update();
				}
			}
		});
	}

	private removePermission(permission: string){
		this.permissionsToSelect.push(this.permissionsBase.filter(e => e.api === permission)[0]);

		this.permissionsToSelect.sort((a, b) => a.label < b.label ? -1 : a.label > a.label ? 1 : 0);

		this.selectedPermissions = this.selectedPermissions.filter(e => e.api !== permission);

		for(let [key] of this.fieldValues){
			if(key.startsWith(permission +'.')){
				this.fieldValues.delete(key);
			}
		}

		this.setDefaultPermissionSets(this.checkedDefaultPermissionSet);

		this._update();
	}

	private createFieldPermissions(listPermission: Array<any>, listFields: Array<string>){
		if(listPermission){
			listPermission.forEach((permission: any) =>{
				this.fieldValues.set(permission.Parent.Name +'.'+ permission.Field, { 
					id: permission.Id, 
					permission: permission.Parent.Name,
					permissionId: permission.ParentId,
					field: permission.Field, 
					read: permission.PermissionsRead, 
					edit: permission.PermissionsEdit
				});
			});

			listFields.forEach(field =>{
				this.selectedPermissions.forEach(permission =>{
					let keyValue = permission.api +'.'+ field;

					if(!this.fieldValues.has(keyValue)){
						this.fieldValues.set(keyValue, {
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
		}
	}

	private creatObjectPermissions(listPermission: Array<any>, listObjects: Array<string>){
		if(listPermission){
			this.selectedPermissions.forEach(permission =>{
				listObjects.forEach(object =>{
					let key1 = object;
					let key2 = permission.id;
					
					if(!this.objectValues.has(key1)){
						this.objectValues.set(key1, new Map());
					}
					
					this.objectValues.get(key1).set(key2, {
						id: null,
						permissionId: permission.id,
						read: false,
						create: false,
						edit: false,
						delete: false,
						viewAll: false,
						modifyAll: false
					});
				});
			});

			listPermission.forEach((permission: any) =>{
				let key1 = permission.SobjectType;
				let key2 = permission.ParentId;

				this.objectValues.get(key1).get(key2).id = permission.Id;
				this.objectValues.get(key1).get(key2).permissionId = permission.ParentId;
				this.objectValues.get(key1).get(key2).read = permission.PermissionsRead;
				this.objectValues.get(key1).get(key2).create = permission.PermissionsCreate;
				this.objectValues.get(key1).get(key2).edit = permission.PermissionsEdit;
				this.objectValues.get(key1).get(key2).delete = permission.PermissionsDelete;
				this.objectValues.get(key1).get(key2).viewAll = permission.PermissionsViewAllRecords;
				this.objectValues.get(key1).get(key2).modifyAll = permission.PermissionsModifyAllRecords;
			});
		}
	}

	private whereIsPermission(){
		vscode.window.withProgress({
			location: vscode.ProgressLocation.Notification,
			title: 'Searching permissions...',
		}, async (progress) => {
			this.createMessage(false);

			let listPermissionsToFilter = new Array();
			let listResultFieldPermission;
			let listResultObjectPermission;
			this.selectedPermissions = new Array();
			this.permissionsToSelect = new Array();
			this.permissionsToSelect = [...this.permissionsBase];

			await query(this.connection, `
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
				${DEFAULT_FILTER_SOQL_PARENT}
			`)
			.then(result =>{
				listResultFieldPermission = result.records;
			});
			
			await query(this.connection, 
				`SELECT Id
					, Parent.Label
					, Parent.Name
					, ParentId
					, PermissionsCreate
					, PermissionsDelete
					, PermissionsEdit
					, PermissionsModifyAllRecords
					, PermissionsRead
					, PermissionsViewAllRecords
					, SobjectType
				FROM ObjectPermissions 
				WHERE SobjectType IN ('${this.listSelectedObjects.join("','")}')
					AND Parent.IsCustom = true 
					${DEFAULT_FILTER_SOQL_PARENT}
			`)
			.then(result =>{
				listResultObjectPermission = result.records;
			});

			const filterList = function(records, permissions){
				if(records){
					records.forEach((permission: any) =>{
						if(!permissions.includes(permission.ParentId)){
							permissions.push(permission.ParentId);
						}
					});
				}
			};

			listPermissionsToFilter.push(filterList(listResultFieldPermission, listPermissionsToFilter));
			listPermissionsToFilter.push(filterList(listResultObjectPermission, listPermissionsToFilter));

			listPermissionsToFilter = listPermissionsToFilter.filter(e => e !== undefined);

			this.selectedPermissions = 
				this.permissionsBase.filter((e) => listPermissionsToFilter.includes(e.id));

			this.selectedPermissions.sort((a,b) => a.label > b.label ? 1 : a.label < b.label ? -1 : 0);

			this.permissionsToSelect = 
				this.permissionsToSelect.filter((e) => !listPermissionsToFilter.includes(e.id));

			this.createFieldPermissions(listResultFieldPermission, this.selectedFields);
			this.creatObjectPermissions(listResultObjectPermission, this.listSelectedObjects);

			this._update();
		});
	}

	private addObject(object: string){
		vscode.window.withProgress({
			location: vscode.ProgressLocation.Notification,
			title: 'Adding object...',
		}, async (progress) => {
			this.createMessage(false);

			if(object){
				if(!this.listObject.includes(object)){
					this.createMessage(true, MESSAGE_TYPE.INFO, `Object ${object} not found`);
					
					this._update();
				}else if(!this.listSelectedObjects.includes(object)){
					this.listSelectedObjects.push(object);
					
					this.getObjectPermissions(object, true);
				}
			}
		});
	}

	private getObjectPermissions(object?: string, isSetFocus: boolean=false){
		this.createMessage(false);

		let objects = new Array();

		if(object){
			objects.push(object);
		}else{
			objects = this.listSelectedObjects;
		}

		query(this.connection, 
			`SELECT Id
				, Parent.Label
				, Parent.Name
				, ParentId
				, PermissionsCreate
				, PermissionsDelete
				, PermissionsEdit
				, PermissionsModifyAllRecords
				, PermissionsRead
				, PermissionsViewAllRecords
				, SobjectType
			FROM ObjectPermissions 
			WHERE SobjectType IN ('${objects.join("','")}')
				AND Parent.IsCustom = true
				AND ParentId IN ('${this.getValueFromList(this.selectedPermissions, 'id').join("','")}')
		`)
		.then(result =>{
			this.creatObjectPermissions(result.records, objects);
			
			if(isSetFocus){
				this.setTabFocus('OBJECT', object);
			}

			this._update();
		})
		.catch(error =>{
			console.log('ERROR ', error);
		});
	}

	private removeObject(object: string){
		if(object){
			this.listSelectedObjects = this.listSelectedObjects.filter(e => e !== object);

			this.setTabFocus('OBJECT');
			
			this._update();
		}
	}

	private setTabFocus(tab: string, subTab?: string){
		this.tabFocus = tab || '';
		this.subTabFocus = subTab || '';
	}

	private async createRecords(records: Array<any>, object: string): Promise<any>{
		if(records){
			return await create(this.connection, object, records);
		}else{
			return null;
		}
	}

	private async updateRecords(records: Array<any>, object: string): Promise<any>{
		if(records){
			return await update(this.connection, object, records);
		}else{
			return null;
		}
	}

	private clear(){
		this.selectedFields = new Array();

		this.fieldValues = new Map();

		this.selectedPermissions.forEach(permission =>{
			permission.read = false;
			permission.edit = false;
		});

		this._update();
	}

	private formatErrorMessage(error: any, name: string, additionalText?: string){
		let messageToReturn = '';

		if(error[0].statusCode === 'INVALID_OR_NULL_FOR_RESTRICTED_PICKLIST'){
			messageToReturn = `Object / Field (${name}) is invalid or is not updatable`;
		}else{
			if(additionalText){
				additionalText = additionalText + ': ';
			}else{
				additionalText = '';
			}

			messageToReturn = `${additionalText} ${error[0].message}`;
		}

		return messageToReturn;
	};

	private saveFields(){
		this.createMessage(false);

		vscode.window.withProgress({
			location: vscode.ProgressLocation.Notification,
			title: 'Saving...',
		}, async (progress) => {
			this.setDefaultPermissionSets(this.checkedDefaultPermissionSet);

			let listRecordsToCreate = new Array();
			let listRecordsToUpdate = new Array();

			for(let [key, value] of this.fieldValues){
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

			let errorList = new Array();

			await this.createRecords(listRecordsToCreate, 'FieldPermissions')
			.then((result: any) =>{
				if(result){
					let index = 0;
					
					result.forEach((item: any) =>{
						let record = listRecordsToCreate[index];

						if(item.success){
							let key = this.permissionsMap.get(record.ParentId).Name +'.'+ record.Field;

							this.fieldValues.get(key).id = item.id;
						}else{
							errorList.push(this.formatErrorMessage(item.errors, record.Field));
						}

						index ++;
					});
				}
			})
			.catch(error =>{
				errorList.push(error);
			})
			.finally(() =>{
				this.updateRecords(listRecordsToUpdate, 'FieldPermissions')
				.then((result: any) =>{
					if(result){
						let index = 0;
		
						result.forEach((item: any) =>{
							let record = listRecordsToUpdate[index];

							if(item.success){
								if(!record.read && !record.edit){
									let key = this.permissionsMap.get(record.ParentId).Name +'.'+ record.Field;

									if(!record.PermissionsRead){
										this.fieldValues.get(key).id = null;
									}
								}
							}else{
								errorList.push(this.formatErrorMessage(item.errors, record.Field));
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
						this.finallyDML(errorList);
					}else{
						this.successMessage();

						this._update();
					}
				});
			});
		});
	}

	private finallyDML(errorList: Array<string>){
		if(errorList.length){
			let newErrorList = new Array();

			errorList.forEach(error =>{
				if(!newErrorList.includes(error)){
					newErrorList.push(error);
				}
			});

			this.createMessage(true, MESSAGE_TYPE.ERROR, newErrorList);

			this._update();
		}
	}

	private successMessage(){
		this.createMessage(true, MESSAGE_TYPE.SUCCESS, 'Your changes are saved');
	}

	private saveObject(object: string, values: Array<any>){
		let listToCreate = new Array();
		let listToUpdate = new Array();

		values.forEach(value =>{
			let record = {};
			record.Id = value.id;
			record.ParentId = value.permissionId;
			record.SObjectType = object;
			record.PermissionsRead = value.read;
			record.PermissionsCreate = value.create;
			record.PermissionsEdit = value.edit;
			record.PermissionsDelete = value.delete;
			record.PermissionsViewAllRecords = value.viewAll;
			record.PermissionsModifyAllRecords = value.modifyAll;

			if(record.Id){
				listToUpdate.push(record);
			}else{
				let allFalse = true;

				new Array('read', 'create', 'edit', 'delete', 'viewAll', 'modifyAll')
				.forEach(field =>{
					if(value[field]){
						allFalse = false;
					}
				});

				if(!allFalse){
					listToCreate.push(record);
				}
			}
		});

		let errorList = new Array();

		vscode.window.withProgress({
			location: vscode.ProgressLocation.Notification,
			title: 'Saving...',
		}, async (progress) => {
			await this.createRecords(listToCreate, 'ObjectPermissions')
			.then((resultCreate: any) =>{
				if(resultCreate){
					let index = 0;
					
					resultCreate.forEach((item: any) =>{
						let record = listToCreate[index];
						
						if(item.success){
							this.objectValues.get(object).get(record.ParentId).id = item.id;
						}else{
							errorList.push(this.formatErrorMessage(item.errors, object, this.permissionsMap.get(record.ParentId).Name));
						}

						index ++;
					});
				}
			})
			.catch(errorCreate =>{
				errorList.push(errorCreate);
			})
			.finally(() =>{
				this.updateRecords(listToUpdate, 'ObjectPermissions')
				.then((resultUpdate: any) =>{
					if(resultUpdate){
						let index = 0;
						
						resultUpdate.forEach((item: any) =>{
							if(!item.success){
								errorList.push(this.formatErrorMessage(item.errors, object));
							}

							index ++;
						});
					}
				})
				.catch(errorUpdate =>{
					errorList.push(errorUpdate);
				})
				.finally(() =>{
					if(errorList.length){
						this.finallyDML(errorList);
					}else{
						this.getObjectPermissions(object, true);
						
						this.successMessage();
					}
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
			let listScripts = new Array();
			let listStyles = new Array();

			listScripts.push(webview.asWebviewUri(
				vscode.Uri.joinPath(this._extensionUri, 'media/js/', 'main.js')
			));

			listScripts.push(webview.asWebviewUri(
				vscode.Uri.joinPath(this._extensionUri, 'media/js/', 'field.js')
			));

			listScripts.push(webview.asWebviewUri(
				vscode.Uri.joinPath(this._extensionUri, 'media/js/', 'object.js')
			));

			listScripts.push(webview.asWebviewUri(
				vscode.Uri.joinPath(this._extensionUri, 'media/js/', 'connection.js')
			));

			listScripts.push(webview.asWebviewUri(
				vscode.Uri.joinPath(this._extensionUri, 'media/js/', 'permissionSet.js')
			));

			listScripts.push(webview.asWebviewUri(
				vscode.Uri.joinPath(this._extensionUri, 'media/js/', 'objectFieldModal.js')
			));

			listStyles.push(webview.asWebviewUri(
				vscode.Uri.joinPath(this._extensionUri, 'media/css/', 'style.css')
			));

			listStyles.push(webview.asWebviewUri(
				vscode.Uri.joinPath(this._extensionUri, 'media/slds/styles/', 'salesforce-lightning-design-system.css')
			));

			const loadingUri = webview.asWebviewUri(
				vscode.Uri.joinPath(this._extensionUri, 'media/slds/images/spinners/', 'slds_spinner_brand.gif')
			);

			let htmlClass = new html(
				PageView.currentPanel, 
				webview, 
				listScripts, 
				listStyles, 
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

	private getValueFromList(listRecords: Array<any>, field: string){
		let listToReturn = new Array();

		if(listRecords.length){
			listRecords.forEach(record =>{
				listToReturn.push(record[field]);
			});
		}

		return listToReturn;
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

		this._panel.webview.postMessage({
			command: 'JS-UPDATE-OBJECT-LIST'
			, text: this.listObject
		});

		let tab = this.tabFocus || 'FIELD';
		let subTab = this.subTabFocus || '';

		if(tab === 'OBJECT' && subTab === '' && this.listSelectedObjects.length){
			subTab = this.listSelectedObjects[0];
		}

		this._panel.webview.postMessage({
			command: 'SET-TAB-FOCUS'
			, text: {
				tab: tab,
				subTab: subTab
			}
		});

		this._panel.webview.postMessage({
			command: 'SET-INPUT-FIELD-FOCUS'
			, text: this.isInputFieldFocus
		});

		this._panel.webview.postMessage({
			command: 'LAST-SEARCH-OBJECT'
			, text: this.objectToDescribe
		});

		this.isInputFieldFocus = false;
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