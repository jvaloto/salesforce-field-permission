import * as vscode from 'vscode';
import jsforce from 'jsforce';
import { getConnection, getOrgs } from './connection';
import * as dml from './sf/sfDML';
import { html } from './html/html';
import * as sfApexClassDAO from './sf/sfApexClassDAO';
import * as sfObjectDAO from './sf/sfObjectDAO';
import * as sfPermissionSetDAO from './sf/sfPermissionSetDAO';
import * as sfFieldDAO from './sf/sfFieldDAO';
import * as sfCustomSettingDAO from './sf/sfCustomSettingDAO';
import * as sfVisualforceDAO from './sf/sfVisualforceDAO';
import { PermissionSet } from './type/PermissionSet';
import { FieldPermission } from './type/FieldPermission';
import { Object } from './type/Object';
import { SetupEntityAccess } from './type/SetupEntityAccess';
import { SinglePermission } from './type/SinglePermission';
import { FieldPermissions } from './type/FieldPermissions';

enum MESSAGE_TYPE { ERROR, INFO, SUCCESS };
const LOCAL_STORAGE_ORG = 'defaultOrg';
const LOCAL_STORAGE_PERMISSION_SET = 'defaultPermissionSet';
const PROJECT_NAME = 'Salesforce Field Permission';
const TYPES = {
	FIELD: 'field',
	OBJECT: 'object',
	APEX_CLASS: 'apex-class',
	CUSTOM_SETTING: 'custom-setting',
	VISUALFORCE: 'visualforce'
};

export class PageView{
	public static currentPanel: PageView | undefined;

	public static readonly viewType = 'sfp';

	private readonly _panel: vscode.WebviewPanel;
	private readonly _extensionUri: vscode.Uri;
	private _disposables: vscode.Disposable[] = [];

	private connection: jsforce.Connection;
	private permissionsMap: Map<any, any>;
	private listPermissionSetBase: Array<PermissionSet>;
	private tabFocus: string;
	private subTabFocus: string;
	private isInputFieldFocus: boolean;
	
	public checkedDefaultOrg: boolean;
	public checkedDefaultPermissionSet: boolean;
	public fieldValues: Map<any, any>;
	public isConnected: boolean;
	public isLoading: boolean;
	public listFieldObject: Array<any>;
	public listObjectAll: Array<any>;
	public listObjectToSelect: Array<any>;
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
	
	public apexClassValues: Map<any, any>;
	public listApexClassBase: Array<SinglePermission>;
	public listApexClassToSelect: Array<any>;
	public listSelectedApexClass: Array<string>;
	public mapApexClass: Map<string, any>;
	
	public customSettingValues: Map<any, any>;
	public listCustomSettingBase: Array<SinglePermission>;
	public listCustomSettingToSelect: Array<any>;
	public listSelectedCustomSetting: Array<string>;
	public mapCustomSetting: Map<string, any>;
	
	public visualforceValues: Map<any, any>;
	public listVisualforceBase: Array<SinglePermission>;
	public listVisualforceToSelect: Array<any>;
	public listSelectedVisualforce: Array<string>;
	public mapVisualforce: Map<string, any>;
	
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
		this.fieldValues = new Map();
		this.isConnected = false;
		this.isLoading = true;
		this.listFieldObject = new Array();
		this.listObjectAll = new Array();
		this.listObjectToSelect = new Array();
		this.listPermissionSetBase = new Array<PermissionSet>;
		this.listSelectedObjects = new Array();
		this.objectValues = new Map();
		this.pageMessageIsActive = false;
		this.pageMessageText = new Array();
		this.pageMessageType = '';
		this.permissionsMap = new Map();
		this.permissionsToSelect = new Array();
		this.selectedFields = new Array();
		this.selectedObject = '';
		this.selectedPermissions = new Array();
		this.showModal = false;
		
		this.apexClassValues = new Map();
		this.listApexClassBase = new Array();
		this.listApexClassToSelect = new Array();
		this.listSelectedApexClass = new Array();
		this.mapApexClass = new Map();
		
		this.customSettingValues = new Map();
		this.listCustomSettingBase = new Array();
		this.listCustomSettingToSelect = new Array();
		this.listSelectedCustomSetting = new Array();
		this.mapCustomSetting = new Map();
		
		this.visualforceValues = new Map();
		this.listVisualforceBase = new Array();
		this.listVisualforceToSelect = new Array();
		this.listSelectedVisualforce = new Array();
		this.mapVisualforce = new Map();
	}

	private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
		this._panel = panel;
		this._extensionUri = extensionUri;
		this.listOrgs = new Array();
		this.checkedDefaultOrg = false;
		this.checkedDefaultPermissionSet = false;

		this.newInstance();

		this.setLoading(true, PROJECT_NAME);

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
				this.createMessage(false);

				switch(message.command){
					case 'SELECT-ORG':
						this.setOrg(message.text);
						
						return;
					case 'ADD-PERMISSION-SET':
						this.addPermission(message.text);

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
					case 'CHANGE-FIELD-VALUE':
						this.setFieldValue(
							message.text.permissionId, 
							message.text.field, 
							message.text.read, 
							message.text.edit
						);

						return;
					case 'CHANGE-FIELD-VALUE-ALL':
						this.setFieldValueAll(message.text.permissionId, message.text.read, message.text.edit);

						return;
					case 'REMOVE-FIELD':
						this.removeField(message.text.field);

						return;
					case 'REMOVE-PERMISSION':
						this.removePermission(message.text);

						return;
					case 'SAVE-FIELDS':
						this.saveFields();

						return;
					case 'CHANGE-OBJECT-VALUE':
						this.setObjectValue(
							message.text.permissionId, 
							message.text.object, 
							message.text.read, 
							message.text.create, 
							message.text.edit, 
							message.text.del, 
							message.text.viewAll, 
							message.text.modifyAll
						);

						break;
					case 'SAVE-OBJECT':
						this.saveObject(message.text);

						return;
					case 'CLEAR':
						this.clearField();

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
					case 'ADD-SINGLE-OPTION':
						if(message.text.option === 'APEX-CLASS'){
							this.addApexClass(message.text.id);
						}else if(message.text.option === 'CUSTOM-SETTING'){
							this.addCustomSetting(message.text.id);
						}else if(message.text.option === 'VISUALFORCE'){
							this.addVisualforce(message.text.id);
						}

						break;
					case 'REMOVE-SINGLE-OPTION':
						if(message.text.option === 'APEX-CLASS'){
							this.removeApexClass(message.text.id);
						}else if(message.text.option === 'CUSTOM-SETTING'){
							this.removeCustomSetting(message.text.id);
						}else if(message.text.option === 'VISUALFORCE'){
							this.removeVisualforce(message.text.id);
						}

						break;
					case 'CHANGE-VALUE-SINGLE-OPTION':
						if(message.text.option === 'APEX-CLASS'){
							this.setApexClassValue(message.text.checked, message.text.permissionId, message.text.id);
						}else if(message.text.option === 'CUSTOM-SETTING'){
							this.setCustomSettingValue(message.text.checked, message.text.permissionId, message.text.id);
						}else if(message.text.option === 'VISUALFORCE'){
							this.setVisualforceValue(message.text.checked, message.text.permissionId, message.text.id);
						}

						break;
					case 'CHANGE-VALUE-ALL-SINGLE-OPTION':
						if(message.text.option === 'APEX-CLASS'){
							this.checkAllPermissionApexClass(message.text.checked, message.text.permissionId);
						}else if(message.text.option === 'CUSTOM-SETTING'){
							this.checkAllPermissionCustomSetting(message.text.checked, message.text.permissionId);
						}else if(message.text.option === 'VISUALFORCE'){
							this.checkAllPermissionVisualforce(message.text.checked, message.text.permissionId);
						}

						break;
					case 'SAVE-SINGLE-OPTION':
						if(message.text.option === 'APEX-CLASS'){
							this.saveApexClass();
						}else if(message.text.option === 'CUSTOM-SETTING'){
							this.saveCustomSetting();
						}else if(message.text.option === 'VISUALFORCE'){
							this.saveVisualforce();
						}

						break;
					case 'CLEAR-SINGLE-OPTION':
						if(message.text.option === 'APEX-CLASS'){
							this.clearApexClass();
						}else if(message.text.option === 'CUSTOM-SETTING'){
							this.clearCustomSetting();
						}else if(message.text.option === 'VISUALFORCE'){
							this.clearVisualforce();
						}

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

	private async setOrg(org: string){
		vscode.window.withProgress({
			location: vscode.ProgressLocation.Notification
		}, async (progress) => {
			progress.report({ message: "Loading..." });

			this.setLoading(true);

			this.createMessage(false);

			this.newInstance();

			this.org = org;

			this.connection = await getConnection(org);

			if(this.connection.accessToken){
				this.setDefaultOrg(this.checkedDefaultOrg);

				progress.report({ message: "Loading Permission Sets..." });
				
				await this.loadPermissionSet();
				
				progress.report({ message: "Loading Objects..." });
				
				await this.loadObject();
				
				progress.report({ message: "Loading Apex Class..." });
				
				await this.loadApexClass();

				progress.report({ message: "Loading Custom Settings..." });
				
				await this.loadCustomSetting();

				progress.report({ message: "Loading Visualforce Pages..." });
				
				await this.loadVisualforce();
				
				this.isConnected = true;
			}else{
				this.setDefaultOrg(false);

				this.message(MESSAGE_TYPE.ERROR, `Unable to connect to org: ${this.org}. Please review your Salesforce CLI orgs`);

				this.isConnected = false;
			}
				
			this.setLoading(false);
		});
	}

	private async loadPermissionSet(){
		this.listPermissionSetBase = await sfPermissionSetDAO.getAll(this.connection);

		this.listPermissionSetBase.forEach((permission: PermissionSet) =>{
			this.permissionsMap.set(permission.id, permission);
		});

		this.listPermissionSetBase.sort((a, b) => a.label < b.label ? -1 : a.label > a.label ? 1 : 0);

		let setDefaultPermissionSet = this.getConfig(LOCAL_STORAGE_PERMISSION_SET);

		this.permissionsToSelect = [...this.listPermissionSetBase];

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
	}

	private async loadObject(){
		this.listObjectAll = await sfObjectDAO.getAll(this.connection);
		this.listObjectToSelect = [...this.listObjectAll];
	}

	private async loadApexClass(){
		this.listApexClassBase = await sfApexClassDAO.getAll(this.connection);

		this.listApexClassToSelect = [...this.listApexClassBase];

		this.listApexClassToSelect.forEach((apexClass: any) =>{
			this.mapApexClass.set(apexClass.id, apexClass);
		});
	}

	private async loadCustomSetting(){
		this.listCustomSettingBase = 
			await sfCustomSettingDAO.getAll(this.connection);

		this.listCustomSettingToSelect = [...this.listCustomSettingBase];

		this.listCustomSettingToSelect.forEach((customSetting: any) =>{
			this.mapCustomSetting.set(customSetting.id, customSetting);
		});
	}

	private async loadVisualforce(){
		this.listVisualforceBase = 
			await sfVisualforceDAO.getAll(this.connection);

		this.listVisualforceToSelect = [...this.listVisualforceBase];

		this.listVisualforceToSelect.forEach((visualforce: any) =>{
			this.mapVisualforce.set(visualforce.id, visualforce);
		});
	}

	private async addField(object: string, field: string){
		vscode.window.withProgress({
			location: vscode.ProgressLocation.Notification,
			title: 'Adding Field...',
		}, async (progress) => {
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

					await this.addMetadata([keyField], listIdPermission, true);

					this._update();
				}
			}
		});
	}

	private clearField(){
		this.selectedFields = new Array();

		this.fieldValues = new Map();

		this.selectedPermissions.forEach(permission =>{
			permission.read = false;
			permission.edit = false;
		});

		this._update();
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
				title: 'Loading Fields...',
			}, async (progress) => {
				this.listFieldObject = await sfObjectDAO.getFields(this.org, this.objectToDescribe);

				this._update();
			});
		}
	}

	private addListFields(fields: Array<any>){
		vscode.window.withProgress({
			location: vscode.ProgressLocation.Notification,
			title: 'Adding Fields...',
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

			await this.addMetadata(listFields, []);

			this._update();
		});
	}

	private async addMetadata(fields: Array<string>, permissions: Array<string>, isSetFocus: boolean = false){
		if(fields && fields.length){
			if(!permissions.length){
				permissions = this.getValueFromList(this.selectedPermissions, 'id');
			}

			if(permissions.length){
				let listResult = 
					await sfFieldDAO.getPermissions(this.connection, fields, permissions);
				
				this.createFieldPermissions(listResult, fields);
			}

			if(isSetFocus){
				this.setTabFocus(TYPES.FIELD);
			}
		}
	}

	private removeField(field: string){
		this.selectedFields = this.selectedFields.filter(e => e !== field);

		this.selectedPermissions.forEach(permission =>{
			this.fieldValues.get(permission.id).delete(field.toUpperCase());
		});
	}

	private setFieldValue(permissionId: string, field: string, read: boolean, edit: boolean){
		this.createMessage(false);
		field = field.toUpperCase();

		this.fieldValues.get(permissionId).get(field).read = read;
		this.fieldValues.get(permissionId).get(field).edit = edit;
	}

	private setFieldValueAll(permissionId: string, read: boolean, edit: boolean){
		for(let [keyField, valueField] of this.fieldValues.get(permissionId)){
			valueField.read = read;
			valueField.edit = edit;
		}
	}

	private addPermission(permission: any, isAddMetadata:boolean = true){
		vscode.window.withProgress({
			location: vscode.ProgressLocation.Notification,
			title: 'Adding Permission Set...',
		}, async (progress) => {
			this.createMessage(false);

			if(permission){
				let permissionRecord = 
					this.listPermissionSetBase.filter((e) => e.api === permission)[0];

				this.selectedPermissions.push(permissionRecord);
				
				this.permissionsToSelect = 
					this.permissionsToSelect.filter((e) => e.api !== permission);

				this.setDefaultPermissionSets(this.checkedDefaultPermissionSet);

				await this.loadSinglePermissions();

				if(isAddMetadata){
					await this.addMetadata(this.selectedFields, [permissionRecord.id]);

					await this.getObjectPermissions();
				}
				
				this._update();
			}
		});
	}

	private removePermission(permissionId: string){
		let permissionData = this.listPermissionSetBase.filter(e => e.id === permissionId)[0];

		this.permissionsToSelect.push(permissionData);

		this.permissionsToSelect.sort((a, b) => a.label < b.label ? -1 : a.label > a.label ? 1 : 0);

		this.selectedPermissions = this.selectedPermissions.filter(e => e.id !== permissionId);

		// field
		this.fieldValues.delete(permissionId);

		// object
		this.objectValues.delete(permissionId);

		// apex class
		this.apexClassValues.delete(permissionId);

		// continue the process
		this.setDefaultPermissionSets(this.checkedDefaultPermissionSet);

		this._update();
	}

	private createFieldPermissions(listPermission: Array<FieldPermission>, listFields: Array<string>){
		if(listPermission.length){
			listPermission.forEach((permission: FieldPermission) =>{
				let key1 = permission.permissionId;
				let key2 = permission.name.toUpperCase();

				if(!this.fieldValues.has(key1)){
					this.fieldValues.set(key1, new Map());
				}

				if(!this.fieldValues.get(key1).has(key2)){
					this.fieldValues.get(key1).set(key2, permission);
				}
			});
		}

		listFields.forEach(field =>{
			this.selectedPermissions.forEach(permission =>{
				let key1 = permission.id;
				let key2 = field.toUpperCase();

				if(!this.fieldValues.has(key1)){
					this.fieldValues.set(key1, new Map());
				}

				if(!this.fieldValues.get(key1).has(key2)){
					// @ts-ignore
					let fieldPermission: FieldPermission = {};
					fieldPermission.id = null;
					fieldPermission.permissionId = permission.id;
					fieldPermission.object = field.split('.')[0];
					fieldPermission.field = field.split('.')[1];
					fieldPermission.name = field;
					fieldPermission.read = false;
					fieldPermission.edit = false;
					
					this.fieldValues.get(key1).set(key2, fieldPermission);
				}
			});
		});
	}

	private async loadSinglePermissions(){
		await this.loadApexClassPermissions(true);

		await this.loadCustomSettingPermissions(true);

		await this.loadVisualforcePermissions(true);
	}

	private creatObjectPermissions(listPermission: Array<any>, listObjects: Array<string>){
		const createDefault = function(permissionId: string){
			return {
				id: null,
				permissionId: permissionId,
				read: false,
				create: false,
				edit: false,
				delete: false,
				viewAll: false,
				modifyAll: false
			};
		};

		this.selectedPermissions.forEach(permission =>{
			listObjects.forEach(object =>{
				let key1 = permission.id;
				let key2 = object;
				
				if(!this.objectValues.has(key1)){
					this.objectValues.set(key1, new Map());
				}

				if(!this.objectValues.get(key1).has(key2)){
					this.objectValues.get(key1).set(key2, createDefault(permission.id));
				}
			});
		});

		if(listPermission && listPermission.length){
			listPermission.forEach((permission: any) =>{
				let key1 = permission.permissionId;
				let key2 = permission.object;

				if(!this.objectValues.has(key1)){
					this.objectValues.set(key1, new Map());
				}

				if(!this.objectValues.get(key1).has(key2)){
					this.objectValues.get(key1).set(key2, createDefault(permission.permissionId));
				}

				this.objectValues.get(key1).get(key2).id = permission.id;
				this.objectValues.get(key1).get(key2).permissionId = permission.permissionId;
				this.objectValues.get(key1).get(key2).read = permission.read;
				this.objectValues.get(key1).get(key2).create = permission.create;
				this.objectValues.get(key1).get(key2).edit = permission.edit;
				this.objectValues.get(key1).get(key2).delete = permission.delete;
				this.objectValues.get(key1).get(key2).viewAll = permission.viewAll;
				this.objectValues.get(key1).get(key2).modifyAll = permission.modifyAll;
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
			let listResultApexClassPermission;
			let listResultCustomSettingPermission;
			let listResultVisualforcePermission;
			this.selectedPermissions = new Array();
			this.permissionsToSelect = new Array();
			this.permissionsToSelect = [...this.listPermissionSetBase];

			const filterList = function(records: Array<any>, permissions: Array<any>){
				let listToReturn = new Array();

				if(records){
					records.forEach((permission: any) =>{
						let value;
						
						if(permission.hasOwnProperty('permissionId')){
							value = permission.permissionId;
						}else if(permission.hasOwnProperty('ParentId')){
							value = permission.ParentId;
						}

						if(!permissions.includes(value) && !listToReturn.includes(value)){
							listToReturn.push(value);
						}
					});
				}

				return listToReturn;
			};
			
			// field
			listResultFieldPermission = 
				await sfFieldDAO.getPermissions(this.connection, this.selectedFields);

			listPermissionsToFilter.concat(filterList(listResultFieldPermission, listPermissionsToFilter));
			
			// object
			listResultObjectPermission = 
				await sfObjectDAO.getPermissions(this.connection, this.listSelectedObjects);

			listPermissionsToFilter.push(...
				filterList(listResultObjectPermission, listPermissionsToFilter)
			);
			
			// apex class
			listResultApexClassPermission = 
				await sfApexClassDAO.getPermissions(this.connection, this.listSelectedApexClass);

			listPermissionsToFilter.push(...
				filterList(listResultApexClassPermission, listPermissionsToFilter)
			);

			// custom setting
			listResultCustomSettingPermission = 
				await sfCustomSettingDAO.getPermissions(this.connection, this.listSelectedCustomSetting);

			listPermissionsToFilter.push(...
				filterList(listResultCustomSettingPermission, listPermissionsToFilter)
			);

			// visualforce
			listResultVisualforcePermission = 
				await sfVisualforceDAO.getPermissions(this.connection, this.listSelectedVisualforce);

			listPermissionsToFilter.push(...
				filterList(listResultVisualforcePermission, listPermissionsToFilter)
			);

			// default process
			listPermissionsToFilter = listPermissionsToFilter.filter(e => e !== undefined);

			this.selectedPermissions = 
				this.listPermissionSetBase.filter((e) => listPermissionsToFilter.includes(e.id));

			this.selectedPermissions.sort((a,b) => a.label > b.label ? 1 : a.label < b.label ? -1 : 0);

			this.permissionsToSelect = 
				this.permissionsToSelect.filter((e) => !listPermissionsToFilter.includes(e.id));

			this.createFieldPermissions(listResultFieldPermission, this.selectedFields);

			this.creatObjectPermissions(listResultObjectPermission, this.listSelectedObjects);

			await this.loadSinglePermissions();

			if(this.selectedFields.length){
				this.setTabFocus(TYPES.FIELD);
			}else if(this.listSelectedObjects.length){
				this.setTabFocus(TYPES.OBJECT);
			}else if(this.listSelectedApexClass.length){
				this.setTabFocus(TYPES.APEX_CLASS);
			}else if(this.listSelectedVisualforce.length){
				this.setTabFocus(TYPES.VISUALFORCE);
			}else if(this.listSelectedCustomSetting.length){
				this.setTabFocus(TYPES.CUSTOM_SETTING);
			}

			this._update();
		});
	}

	private addObject(object: string){
		vscode.window.withProgress({
			location: vscode.ProgressLocation.Notification,
			title: 'Adding Object...',
		}, async (progress) => {
			this.createMessage(false);

			if(object){
				if(!this.listObjectToSelect.includes(object)){
					this.createMessage(true, MESSAGE_TYPE.INFO, `Object ${object} not found`);
				}else if(!this.listSelectedObjects.includes(object)){
					this.listSelectedObjects.push(object);

					this.listObjectToSelect = this.listObjectToSelect.filter(e => e !== object );

					await this.getObjectPermissions(object, true);
				}

				this._update();
			}
		});
	}

	private async getObjectPermissions(object?: string, isSetFocus: boolean=false){
		this.createMessage(false);

		if(this.selectedPermissions.length){
			let objects = new Array();
			
			if(object){
				objects.push(object);
			}else{
				objects = this.listSelectedObjects;
			}
			
			let listPermission = 
				await sfObjectDAO.getPermissions(this.connection, objects, this.getValueFromList(this.selectedPermissions, 'id'));
			
			this.creatObjectPermissions(listPermission, objects);
		}
		
		if(isSetFocus){
			this.setTabFocus(TYPES.OBJECT, object);
		}
	}

	private removeObject(object: string){
		if(object){
			this.listSelectedObjects = this.listSelectedObjects.filter(e => e !== object);

			this.selectedPermissions.forEach(permission =>{
				this.objectValues.get(permission.id).delete(object);
			});

			this.listObjectToSelect.push(object);

			this.listObjectToSelect.sort((a,b) => a > b ? 1 : a < b ? -1 : 0);

			this.setTabFocus(TYPES.OBJECT);
			
			this._update();
		}
	}

	private setTabFocus(tab: string, subTab?: string){
		this.tabFocus = tab || '';
		this.subTabFocus = subTab || '';
	}

	private addApexClass(apexClassId: string){
		vscode.window.withProgress({
			location: vscode.ProgressLocation.Notification,
			title: 'Adding Apex Class...',
		}, async (progress) => {
			this.createMessage(false);
			
			if(apexClassId){
				if(!this.listSelectedApexClass.includes(apexClassId)){
					this.listSelectedApexClass.push(apexClassId);
					
					this.listApexClassToSelect = this.listApexClassToSelect.filter(e => e.id !== apexClassId);
					
					await this.loadApexClassPermissions(this.selectedPermissions.length > 0);
					
					this._update();
				}
			}
		});
	}

	private removeApexClass(apexClassId: string){
		if(this.selectedPermissions.length){
			this.selectedPermissions.forEach(permission =>{
				this.apexClassValues.get(permission.id).delete(apexClassId);
			});
		}

		this.listApexClassToSelect.push(this.mapApexClass.get(apexClassId));

		this.listApexClassToSelect.sort((a,b) => a.label < b.label ? -1 : a.label > b.label ? 1 : 0);

		this.listSelectedApexClass = this.listSelectedApexClass.filter(e => e !== apexClassId);

		this._update();
	}

	private async loadApexClassPermissions(checkPermission: boolean){
		let listIdPermissionSetToFilter = this.getValueFromList(this.selectedPermissions, 'id');

		let listApexClassPermission = new Array<SetupEntityAccess>;
		
		if(checkPermission){
			listApexClassPermission = 
				await sfApexClassDAO.getPermissions(this.connection, this.listSelectedApexClass, listIdPermissionSetToFilter);
		}

		listApexClassPermission.forEach(permission =>{
			let key1 = permission.ParentId;
			let key2 = permission.SetupEntityId;

			if(!this.apexClassValues.has(key1)){
				this.apexClassValues.set(key1, new Map());
			}
	
			if(!this.apexClassValues.get(key1).has(key2)){
				this.apexClassValues.get(key1).set(key2, {
					id: permission.Id, 
					checked: true
				});
			}
		});

		listIdPermissionSetToFilter.forEach(permissionId =>{
			let key1 = permissionId;

			if(!this.apexClassValues.has(key1)){
				this.apexClassValues.set(key1, new Map());
			}
				
			this.listSelectedApexClass.forEach(apexClassId =>{
				let key2 = apexClassId;

				if(!this.apexClassValues.get(key1).has(key2)){
					this.apexClassValues.get(key1).set(key2, {
						id: null, 
						checked: false
					});
				}
			});
		});
	}

	private setApexClassValue(checked: boolean, parentId: string, apexClassId: string){
		this.apexClassValues.get(parentId).get(apexClassId).checked = checked;
	}

	private checkAllPermissionApexClass(checked: boolean, permissionId: string){
		this.listSelectedApexClass.forEach(apexClass =>{
			this.apexClassValues.get(permissionId).get(apexClass).checked = checked;
		});
	}

	private clearApexClass(){
		this.listSelectedApexClass = new Array();

		this.listApexClassToSelect = [...this.listApexClassBase];

		this.apexClassValues = new Map();

		this._update();
	}

	private saveApexClass(){
		vscode.window.withProgress({
			location: vscode.ProgressLocation.Notification,
			title: 'Saving Apex Class...',
		}, async (progress) => {
			let listRecordsToCreate = new Array<SetupEntityAccess>;
			let listRecordsToDelete = new Array<string>;
			let recordsMap = new Map();
			let listErrors = new Array();

			for(let [key, value] of this.apexClassValues){
				for(let [keyApexClass, valueApexClass] of this.apexClassValues.get(key)){
					// @ts-ignore
					let record: SetupEntityAccess = {};
					record.Id = valueApexClass.id;
					record.ParentId = key;
					record.SetupEntityId = keyApexClass;
					
					if(!record.Id && valueApexClass.checked){
						listRecordsToCreate.push(record);
					}else if(record.Id && !valueApexClass.checked){
						listRecordsToDelete.push(record.Id);
					}

					recordsMap.set(record.Id, record);
				}
			}

			if(listRecordsToCreate.length){
				let listResultCreate = 
					await dml.create(this.connection, 'SetupEntityAccess', listRecordsToCreate);

				for(let x in listResultCreate){
					// @ts-ignore
					let result = listResultCreate[x];
					// @ts-ignore
					let recordInfo = listRecordsToCreate[x];

					if(result.success){
						this.apexClassValues.get(recordInfo.ParentId).get(recordInfo.SetupEntityId).id = result.id;
					}else{
						listErrors.push(this.formatErrorMessage(result.errors, this.mapApexClass.get(recordInfo.SetupEntityId).label));
					}
				}
			}
			
			if(listRecordsToDelete.length){
				let listResultDelete = await dml.remove(this.connection, 'SetupEntityAccess', listRecordsToDelete);

				for(let x in listResultDelete){
					let result = listResultDelete[x];
					let recordInfo = recordsMap.get(listRecordsToDelete[x]);

					if(result.success){
						this.apexClassValues.get(recordInfo.ParentId).get(recordInfo.SetupEntityId).id = null;
					}else{
						listErrors.push(this.formatErrorMessage(result.errors, this.mapApexClass.get(recordInfo.SetupEntityId).label));
					}
				}
			}

			this.endDML('Apex Class', listErrors);
		});
	}

	private addCustomSetting(customSettingId: string){
		vscode.window.withProgress({
			location: vscode.ProgressLocation.Notification,
			title: 'Adding Custom Setting...',
		}, async (progress) => {
			this.createMessage(false);
			
			if(customSettingId){
				if(!this.listSelectedCustomSetting.includes(customSettingId)){
					this.listSelectedCustomSetting.push(customSettingId);
					
					this.listCustomSettingToSelect = 
						this.listCustomSettingToSelect.filter(e => e.id !== customSettingId);
					
					await this.loadCustomSettingPermissions(this.selectedPermissions.length > 0);
					
					this._update();
				}
			}
		});
	}

	private removeCustomSetting(customSettingId: string){
		if(this.selectedPermissions.length){
			this.selectedPermissions.forEach(permission =>{
				this.customSettingValues.get(permission.id).delete(customSettingId);
			});
		}

		this.listCustomSettingToSelect.push(this.mapCustomSetting.get(customSettingId));

		this.listCustomSettingToSelect.sort((a,b) => a.label < b.label ? -1 : a.label > b.label ? 1 : 0);

		this.listSelectedCustomSetting = this.listSelectedCustomSetting.filter(e => e !== customSettingId);

		this._update();
	}

	private async loadCustomSettingPermissions(checkPermission: boolean){
		let listIdPermissionSetToFilter = this.getValueFromList(this.selectedPermissions, 'id');

		let listCustomSettingPermission = new Array<SetupEntityAccess>;
		
		if(checkPermission){
			listCustomSettingPermission = 
				await sfCustomSettingDAO.getPermissions(this.connection, this.listSelectedCustomSetting, listIdPermissionSetToFilter);
		}

		listCustomSettingPermission.forEach(permission =>{
			let key1 = permission.ParentId;
			let key2 = permission.SetupEntityId;

			if(!this.customSettingValues.has(key1)){
				this.customSettingValues.set(key1, new Map());
			}
	
			if(!this.customSettingValues.get(key1).has(key2)){
				this.customSettingValues.get(key1).set(key2, {
					id: permission.Id, 
					checked: true
				});
			}
		});

		listIdPermissionSetToFilter.forEach(permissionId =>{
			let key1 = permissionId;

			if(!this.customSettingValues.has(key1)){
				this.customSettingValues.set(key1, new Map());
			}
				
			this.listSelectedCustomSetting.forEach(customSettingId =>{
				let key2 = customSettingId;

				if(!this.customSettingValues.get(key1).has(key2)){
					this.customSettingValues.get(key1).set(key2, {
						id: null, 
						checked: false
					});
				}
			});
		});
	}

	private setCustomSettingValue(checked: boolean, permissionId: string, customSettingId: string){
		this.customSettingValues.get(permissionId).get(customSettingId).checked = checked;
	}

	private checkAllPermissionCustomSetting(checked: boolean, permissionId: string){
		this.listSelectedCustomSetting.forEach(customSettingId =>{
			this.customSettingValues.get(permissionId).get(customSettingId).checked = checked;
		});
	}

	private clearCustomSetting(){
		this.listSelectedCustomSetting = new Array();

		this.listCustomSettingToSelect = [...this.listCustomSettingBase];

		this.customSettingValues = new Map();

		this._update();
	}

	private saveCustomSetting(){
		vscode.window.withProgress({
			location: vscode.ProgressLocation.Notification,
			title: 'Saving Custom Settings...',
		}, async (progress) => {
			let listRecordsToCreate = new Array<SetupEntityAccess>;
			let listRecordsToDelete = new Array<string>;
			let recordsMap = new Map();
			let listErrors = new Array();

			for(let [key, value] of this.customSettingValues){
				for(let [keyRecord, valueRecord] of this.customSettingValues.get(key)){
					// @ts-ignore
					let record: SetupEntityAccess = {};
					record.Id = valueRecord.id;
					record.ParentId = key;
					record.SetupEntityId = keyRecord;
					
					if(!record.Id && valueRecord.checked){
						listRecordsToCreate.push(record);
					}else if(record.Id && !valueRecord.checked){
						listRecordsToDelete.push(record.Id);
					}

					recordsMap.set(record.Id, record);
				}
			}

			if(listRecordsToCreate.length){
				let listResultCreate = await dml.create(this.connection, 'SetupEntityAccess', listRecordsToCreate);

				for(let x in listResultCreate){
					// @ts-ignore
					let result = listResultCreate[x];
					// @ts-ignore
					let recordInfo = listRecordsToCreate[x];

					if(result.success){
						this.customSettingValues.get(recordInfo.ParentId).get(recordInfo.SetupEntityId).id = result.id;
					}else{
						listErrors.push(this.formatErrorMessage(result.errors, this.mapCustomSetting.get(recordInfo.SetupEntityId).label));
					}
				}
			}
			
			if(listRecordsToDelete.length){
				let listResultDelete = await dml.remove(this.connection, 'SetupEntityAccess', listRecordsToDelete);

				for(let x in listResultDelete){
					let result = listResultDelete[x];
					let recordInfo = recordsMap.get(listRecordsToDelete[x]);

					if(result.success){
						this.customSettingValues.get(recordInfo.ParentId).get(recordInfo.SetupEntityId).id = null;
					}else{
						listErrors.push(this.formatErrorMessage(result.errors, this.mapCustomSetting.get(recordInfo.SetupEntityId).label));
					}
				}
			}

			this.endDML('Custom Settings', listErrors);
		});
	}

	private addVisualforce(id: string){
		vscode.window.withProgress({
			location: vscode.ProgressLocation.Notification,
			title: 'Adding Visualforce...',
		}, async (progress) => {
			this.createMessage(false);
			
			if(id){
				if(!this.listSelectedVisualforce.includes(id)){
					this.listSelectedVisualforce.push(id);
					
					this.listVisualforceToSelect = 
						this.listVisualforceToSelect.filter(e => e.id !== id);
					
					await this.loadVisualforcePermissions(this.selectedPermissions.length > 0);

					this._update();
				}
			}
		});
	}

	private removeVisualforce(id: string){
		if(this.selectedPermissions.length){
			this.selectedPermissions.forEach(permission =>{
				this.visualforceValues.get(permission.id).delete(id);
			});
		}

		this.listVisualforceToSelect.push(this.mapVisualforce.get(id));

		this.listVisualforceToSelect.sort((a,b) => a.label < b.label ? -1 : a.label > b.label ? 1 : 0);

		this.listSelectedVisualforce = this.listSelectedVisualforce.filter(e => e !== id);

		this._update();
	}

	private async loadVisualforcePermissions(checkPermission: boolean){
		let listIdPermissionSetToFilter = this.getValueFromList(this.selectedPermissions, 'id');

		let listVisualforcePermission = new Array<SetupEntityAccess>;
		
		if(checkPermission){
			listVisualforcePermission = 
				await sfVisualforceDAO.getPermissions(this.connection, this.listSelectedVisualforce, listIdPermissionSetToFilter);
		}

		listVisualforcePermission.forEach(permission =>{
			let key1 = permission.ParentId;
			let key2 = permission.SetupEntityId;

			if(!this.visualforceValues.has(key1)){
				this.visualforceValues.set(key1, new Map());
			}
	
			if(!this.visualforceValues.get(key1).has(key2)){
				this.visualforceValues.get(key1).set(key2, {
					id: permission.Id, 
					checked: true
				});
			}
		});

		listIdPermissionSetToFilter.forEach(permissionId =>{
			let key1 = permissionId;

			if(!this.visualforceValues.has(key1)){
				this.visualforceValues.set(key1, new Map());
			}
				
			this.listSelectedVisualforce.forEach(visualforceId =>{
				let key2 = visualforceId;

				if(!this.visualforceValues.get(key1).has(key2)){
					this.visualforceValues.get(key1).set(key2, {
						id: null, 
						checked: false
					});
				}
			});
		});
	}

	private setVisualforceValue(checked: boolean, permissionId: string, id: string){
		this.visualforceValues.get(permissionId).get(id).checked = checked;
	}

	private checkAllPermissionVisualforce(checked: boolean, permissionId: string){
		this.listSelectedVisualforce.forEach(id =>{
			this.visualforceValues.get(permissionId).get(id).checked = checked;
		});
	}

	private clearVisualforce(){
		this.listSelectedVisualforce = new Array();

		this.listVisualforceToSelect = [...this.listVisualforceBase];

		this.visualforceValues = new Map();

		this._update();
	}

	private saveVisualforce(){
		vscode.window.withProgress({
			location: vscode.ProgressLocation.Notification,
			title: 'Saving Visualforce Pages...',
		}, async (progress) => {
			let listRecordsToCreate = new Array<SetupEntityAccess>;
			let listRecordsToDelete = new Array<string>;
			let recordsMap = new Map();
			let listErrors = new Array();

			for(let [key, value] of this.visualforceValues){
				for(let [keyRecord, valueRecord] of this.visualforceValues.get(key)){
					// @ts-ignore
					let record: SetupEntityAccess = {};
					record.Id = valueRecord.id;
					record.ParentId = key;
					record.SetupEntityId = keyRecord;
					
					if(!record.Id && valueRecord.checked){
						listRecordsToCreate.push(record);
					}else if(record.Id && !valueRecord.checked){
						listRecordsToDelete.push(record.Id);
					}

					recordsMap.set(record.Id, record);
				}
			}

			if(listRecordsToCreate.length){
				let listResultCreate = await dml.create(this.connection, 'SetupEntityAccess', listRecordsToCreate);

				for(let x in listResultCreate){
					// @ts-ignore
					let result = listResultCreate[x];
					// @ts-ignore
					let recordInfo = listRecordsToCreate[x];

					if(result.success){
						this.visualforceValues.get(recordInfo.ParentId).get(recordInfo.SetupEntityId).id = result.id;
					}else{
						listErrors.push(this.formatErrorMessage(result.errors, this.mapVisualforce.get(recordInfo.SetupEntityId).label));
					}
				}
			}
			
			if(listRecordsToDelete.length){
				let listResultDelete = await dml.remove(this.connection, 'SetupEntityAccess', listRecordsToDelete);

				for(let x in listResultDelete){
					let result = listResultDelete[x];
					let recordInfo = recordsMap.get(listRecordsToDelete[x]);

					if(result.success){
						this.visualforceValues.get(recordInfo.ParentId).get(recordInfo.SetupEntityId).id = null;
					}else{
						listErrors.push(this.formatErrorMessage(result.errors, this.mapVisualforce.get(recordInfo.SetupEntityId).label));
					}
				}
			}

			this.endDML('Visualforce Pages', listErrors);
		});
	}

	private endDML(type: string, listErrors: Array<string>){
		if(listErrors.length){
			this.finallyDML(listErrors);
		}else{
			this.successMessage(type);

			this._update();
		}
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
		vscode.window.withProgress({
			location: vscode.ProgressLocation.Notification,
			title: 'Saving Fields...',
		}, async (progress) => {
			this.createMessage(false);

			this.setDefaultPermissionSets(this.checkedDefaultPermissionSet);

			let listErrors = new Array();
			let listRecordsToCreate = new Array<FieldPermissions>;
			let listRecordsToUpdate = new Array<FieldPermissions>;

			for(let [key, value] of this.fieldValues){
				for(let [keyField, valueField] of value){
					// @ts-ignore
					let record: FieldPermissions = {};
					record.Id = valueField.id;
					record.ParentId = valueField.permissionId;
					record.Field = valueField.name;
					record.PermissionsRead = valueField.read;
					record.PermissionsEdit = valueField.edit;
					record.SObjectType = valueField.object;

					if(valueField.id){
						listRecordsToUpdate.push(record);
					}else{
						if(valueField.read){
							listRecordsToCreate.push(record);
						}
					}
				}
			}

			if(listRecordsToCreate.length){
				let listResult = 
					await dml.create(this.connection, 'FieldPermissions', listRecordsToCreate);
				
				for(let x in listResult){
					// @ts-ignore
					let result = listResult[x];
					// @ts-ignore
					let recordInfo = listRecordsToCreate[x];
					let key1 = recordInfo.ParentId;
					let key2 = recordInfo.Field.toUpperCase();
					
					if(result.success){
						this.fieldValues.get(key1).get(key2).id = result.id;
					}else{
						listErrors.push(this.formatErrorMessage(result.errors, recordInfo.Field));
					}
				}
			}

			if(listRecordsToUpdate.length){
				let listResult = 
					await dml.update(this.connection, 'FieldPermissions', listRecordsToUpdate);
				
				for(let x in listResult){
					// @ts-ignore
					let result = listResult[x];
					// @ts-ignore
					let recordInfo = listRecordsToUpdate[x];
					let key1 = recordInfo.ParentId;
					let key2 = recordInfo.Field.toUpperCase();

					if(!recordInfo.PermissionsRead && !recordInfo.PermissionsEdit){
						this.fieldValues.get(key1).get(key2).id = null;
					}else if(!result.success){
						listErrors.push(this.formatErrorMessage(result.errors, recordInfo.Field));
					}
				}
			}
		
			this.endDML('Fields', listErrors);
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

	private successMessage(type: string){
		this.createMessage(true, MESSAGE_TYPE.SUCCESS, `${type}: Your changes are saved`);
	}

	private setObjectValue(permissionId: string, object: string, read: boolean, create: boolean, edit: boolean, del: boolean, viewAll: boolean, modifyAll: boolean){
		let record = this.objectValues.get(permissionId).get(object);
		record.read = read;
		record.create = create;
		record.edit = edit;
		record.delete = del;
		record.viewAll = viewAll;
		record.modifyAll = modifyAll;

		this.objectValues.get(permissionId).set(object, record);
	}

	private saveObject(object: string){
		vscode.window.withProgress({
			location: vscode.ProgressLocation.Notification,
			title: `Saving ${object} Object...`,
		}, async (progress) => {
			let listErrors = new Array();
			let listRecordsToCreate = new Array();
			let listRecordsToUpdate = new Array();

			this.selectedPermissions.forEach(permission =>{
				let valueObject = this.objectValues.get(permission.id).get(object);

				// @ts-ignore
				let record: Object = {};
				record.Id = valueObject.id;
				record.ParentId = valueObject.permissionId;
				record.SObjectType = object;
				record.PermissionsRead = valueObject.read;
				record.PermissionsCreate = valueObject.create;
				record.PermissionsEdit = valueObject.edit;
				record.PermissionsDelete = valueObject.delete;
				record.PermissionsViewAllRecords = valueObject.viewAll;
				record.PermissionsModifyAllRecords = valueObject.modifyAll;

				if(record.Id){
					listRecordsToUpdate.push(record);
				}else{
					let allFalse = true;

					new Array('read', 'create', 'edit', 'delete', 'viewAll', 'modifyAll')
					.forEach(field =>{
						if(valueObject[field]){
							allFalse = false;
						}
					});

					if(!allFalse){
						listRecordsToCreate.push(record);
					}
				}
			});

			if(listRecordsToCreate.length){
				let listResult = 
					await dml.create(this.connection, 'ObjectPermissions', listRecordsToCreate);
				
				for(let x in listResult){
					// @ts-ignore
					let result = listResult[x];
					// @ts-ignore
					let recordInfo = listRecordsToCreate[x];
					
					if(result.success){
						this.objectValues.get(recordInfo.ParentId).get(object).id = result.id;
					}else{
						listErrors.push(this.formatErrorMessage(result.errors, object, this.permissionsMap.get(recordInfo.ParentId).Name));
					}
				}
			}

			if(listRecordsToUpdate.length){
				let listResult = 
					await dml.update(this.connection, 'ObjectPermissions', listRecordsToUpdate);
				
				for(let x in listResult){
					// @ts-ignore
					let result = listResult[x];
					
					if(!result.success){
						listErrors.push(this.formatErrorMessage(result.errors, object));
					}
				}
			}

			this.endDML(object, listErrors);
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

			listScripts.push(webview.asWebviewUri(
				vscode.Uri.joinPath(this._extensionUri, 'media/js/', 'singlePermission.js')
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
			, text: this.listObjectToSelect
		});

		let tab = this.tabFocus || TYPES.FIELD;
		let subTab = this.subTabFocus || '';

		if(tab === TYPES.OBJECT && subTab === '' && this.listSelectedObjects.length){
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