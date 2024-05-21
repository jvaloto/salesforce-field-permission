import * as vscode from 'vscode';
import jsforce from 'jsforce';
import SinglePermissionInterface from "../interface/SinglePermissionInterface";
import { SinglePermission } from "../type/SinglePermission";
import { SetupEntityAccess } from '../type/SetupEntityAccess';
import { PermissionSet } from '../type/PermissionSet';
import * as dml from '../sf/sfDML';

export default class SinglePermissionClass{
	type: string;
    label: string;
    pluralLabel: string;
    values: Map<any, any>;
	listBase: Array<SinglePermission>;
	listToSelect: Array<any>;
	listSelected: Array<string>;
	mapRecord: Map<string, any>;
    daoClass: SinglePermissionInterface;
    
    constructor(type: string, label: string, pluralLabel: string, daoClass: SinglePermissionInterface){
		this.type = type;
        this.label = label;
        this.pluralLabel = pluralLabel;
        this.values = new Map<any, any>;
        this.listBase = new Array<SinglePermission>;
        this.listToSelect = new Array<any>;
        this.listSelected = new Array<string>;
        this.mapRecord = new Map<string, any>;
        this.daoClass = daoClass;
    }

    async load(connection: jsforce.Connection){
        this.listBase = 
            await this.daoClass.getAll(connection);

        this.listToSelect = [...this.listBase];

        this.listToSelect.forEach((option: any) =>{
            this.mapRecord.set(option.id, option);
        });
    }

    async add(connection: jsforce.Connection, id: string, listSelectedPermission: Array<PermissionSet>){
		if(id){
			if(!this.listSelected.includes(id)){
				this.listSelected.push(id);
				
				this.listToSelect = this.listToSelect.filter(e => e.id !== id);
				
				await this.loadPermissions(connection, listSelectedPermission.length > 0, listSelectedPermission);
			}
		}
	}

	remove(id: string, listSelectedPermission: Array<PermissionSet>){
		if(listSelectedPermission.length){
			listSelectedPermission.forEach(permission =>{
				this.values.get(permission.id).delete(id);
			});
		}

		this.listToSelect.push(this.mapRecord.get(id));

		this.listToSelect.sort((a,b) => a.label < b.label ? -1 : a.label > b.label ? 1 : 0);

		this.listSelected = this.listSelected.filter(e => e !== id);
	}

	setValue(id: string, parentId: string, checked: boolean){
		this.values.get(parentId).get(id).checked = checked;
	}

	setValueAll(parentId: string, checked: boolean){
		this.listSelected.forEach(option =>{
			this.values.get(parentId).get(option).checked = checked;
		});
	}

	clear(){
		this.listSelected = new Array();

		this.listToSelect = [...this.listBase];

		this.values = new Map();
	}

	removePermission(parentId: string){
		this.values.delete(parentId);
	}

	async getPermissions(connection: jsforce.Connection, listIdPermissionSet?: Array<string>){
		return await this.daoClass.getPermissions(
			connection, 
			this.listSelected, 
			listIdPermissionSet
		);
	}

    async loadPermissions(connection: jsforce.Connection, checkPermission: boolean, listIdPermissionSet?: Array<PermissionSet>){
		let listIdPermissionSetToFilter = new Array();
		
		if(listIdPermissionSet && listIdPermissionSet.length){
			listIdPermissionSetToFilter = this.getValueFromList(listIdPermissionSet, 'id');
		}

		let listPermissionResult = new Array<SetupEntityAccess>;
		
		if(checkPermission){
			listPermissionResult = await this.getPermissions(connection, listIdPermissionSetToFilter);
		}

		listPermissionResult.forEach(permission =>{
			let key1 = permission.ParentId;
			let key2 = permission.SetupEntityId;

			if(!this.values.has(key1)){
				this.values.set(key1, new Map());
			}
	
			if(!this.values.get(key1).has(key2)){
				this.values.get(key1).set(key2, {
					id: permission.Id, 
					checked: true
				});
			}
		});

		listIdPermissionSetToFilter.forEach(permissionId =>{
			let key1 = permissionId;

			if(!this.values.has(key1)){
				this.values.set(key1, new Map());
			}
				
			this.listSelected.forEach(optionId =>{
				let key2 = optionId;

				if(!this.values.get(key1).has(key2)){
					this.values.get(key1).set(key2, {
						id: null, 
						checked: false
					});
				}
			});
		});
	}

	async save(connection: jsforce.Connection, functionFormatError: Function){
		let listErrorsToReturn = new Array();
		let listRecordsToCreate = new Array<SetupEntityAccess>;
		let listRecordsToDelete = new Array<string>;
		let recordsMap = new Map();

		for(let [key, value] of this.values){
			for(let [keyApexClass, valueApexClass] of this.values.get(key)){
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
				await dml.create(connection, 'SetupEntityAccess', listRecordsToCreate);

			for(let x in listResultCreate){
				// @ts-ignore
				let result = listResultCreate[x];
				// @ts-ignore
				let recordInfo = listRecordsToCreate[x];

				if(result.success){
					this.values.get(recordInfo.ParentId).get(recordInfo.SetupEntityId).id = result.id;
				}else{
					listErrorsToReturn.push(functionFormatError(result.errors, this.mapRecord.get(recordInfo.SetupEntityId).label));
				}
			}
		}
		
		if(listRecordsToDelete.length){
			let listResultDelete = await dml.remove(connection, 'SetupEntityAccess', listRecordsToDelete);

			for(let x in listResultDelete){
				let result = listResultDelete[x];
				let recordInfo = recordsMap.get(listRecordsToDelete[x]);

				if(result.success){
					this.values.get(recordInfo.ParentId).get(recordInfo.SetupEntityId).id = null;
				}else{
					listErrorsToReturn.push(functionFormatError(result.errors, this.mapRecord.get(recordInfo.SetupEntityId).label));
				}
			}
		}

		return listErrorsToReturn;
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

}