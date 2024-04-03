import * as vscode from 'vscode';
import { PageView } from './PageView';

export class html{
    pageView: PageView;
    webview: vscode.Webview;
    scriptUri: vscode.Uri;
    styleUri: vscode.Uri;
    sldsUri: vscode.Uri;
    loadingUri: vscode.Uri;
    projectName: string;
    columnColor: number;

    constructor(
        pageView: PageView, 
        webview: vscode.Webview, 
        scriptUri: vscode.Uri, 
        styleUri: vscode.Uri, 
        sldsUri: vscode.Uri, 
        loadingUri: vscode.Uri, 
        projectName: string
    ){
        this.pageView = pageView;
        this.webview = webview;
        this.scriptUri = scriptUri;
        this.styleUri = styleUri;
        this.sldsUri = sldsUri;
        this.loadingUri = loadingUri;
        this.projectName = projectName;
    }

    getHtml(){
        let toReturn = ``;

        toReturn = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">

                <link href="${this.styleUri}" rel="stylesheet">
                <link href="${this.sldsUri}" rel="stylesheet">

                <title>${this.projectName}</title>
            </head>
            <body>
                ${this.createHtmlModal()}
        `;

        if(this.pageView.isLoading){
            toReturn += `
                <article class="slds-card">
                    <div class="slds-card__body slds-card__body_inner center">
                        <img src="${this.loadingUri}" class="center" width="50" />
                    </div>
                    <footer class="slds-card__footer">
                        ${this.pageView.loadingText}
                    </footer>
                </article>
            `;
        }else{
            toReturn += `
                <div class="slds-grid slds-gutters">
                    <div class="slds-col slds-size_1-of-2"">
                        ${this.createHtmlConnection()}
                    </div>
                    <div class="slds-col slds-size_1-of-2">
                        ${this.createHtmlPermissionSet()}
                    </div>
                </div>

                ${this.createHtmlContent()}

                <script src="${this.scriptUri}"></script>
            `;
        }

        toReturn += `
            </body>
        </html>`;

        return toReturn;
    }

    createHtmlContent(){
        let toReturn = '';

        if(this.pageView.isConnected){
            toReturn = `
                ${this.createHtmlField()}
                
                ${this.createHtmlMessage()}

                <div class="slds-tabs_default">
                    ${this.createHtmlTabs()}
                
                    ${this.createHtmlTable()}

                    ${this.createHtmlTabContent()}
                </div>
            `;
        }

        return toReturn;
    }

    createHtmlField(){
        let toReturn = `
            <article class="slds-card">
                <div class="slds-card__body slds-card__body_inner">
                    <div class="slds-grid slds-gutters">
                        <div class="slds-col">
                            <div class="slds-form-element">
                                <label class="slds-form-element__label">
                                    Object API Name
                                </label>
                                <select 
                                    id="input-object" 
                                    class="slds-input" 
                                    value="${this.pageView.selectedObject}"
                                />`;

                                this.pageView.listObject.forEach(object =>{
                                    toReturn += `<option value="${object}">${object}</option>`;
                                });

                                toReturn += `
                                </select>
                            </div>
                        </div>

                        <div class="slds-col">
                            <div class="slds-form-element">
                                <label class="slds-form-element__label">
                                    Field API Name
                                </label>
                                <input 
                                    type="text" 
                                    id="input-field" 
                                    class="slds-input" 
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <footer class="slds-card__footer">
                    <button 
                        id="button-add-object" 
                        type="button" 
                        class="slds-button slds-button_brand"
                        title="Add selected object to set permissions"
                    >
                        Add Object
                    </button>
                    <button 
                        id="button-add-field-object" 
                        type="button" 
                        class="slds-button slds-button_brand"
                        title="Select mass fields by object to set permissions"
                    >
                        Add Fields by Object
                    </button>
                    
                    <button 
                        id="button-add-field" 
                        type="button" 
                        class="slds-button slds-button_brand"
                        title="Add selected field to set permissions"
                    >
                        Add Field
                    </button>
                </footer>
            </article>
        `;

        return toReturn;
    }

    createHtmlConnection(){
        let toReturn = `
        <article class="slds-card">
            <div class="slds-card__body slds-card__body_inner">
                <div class="form-element">
                    <label class="slds-form-element__label">
                        Org list
                    </label>
                    <div class="slds-form-element__control">
                        <div class="slds-select_container">
                            <select id="input-org" class="slds-select">
        `;

        this.pageView.listOrgs.forEach(org =>{
            toReturn += `<option value="${org}" ${this.pageView.org === org ? 'selected' : ''}>${org}</option>`;
        });

        toReturn += `
                        </select>
                    </div>
                </div>
            </div>
        `;

        if(this.pageView.isConnected){
            toReturn += `
            <div class="slds-form-element">
                    <div class="slds-form-element__control">
                        <div class="slds-checkbox">
                            <input 
                                type="checkbox" 
                                id="input-save-default-org" 
                                ${this.pageView.checkedDefaultOrg ? 'checked' : ''}
                            />
                            <label class="slds-checkbox__label" for="input-save-default-org">
                                <span class="slds-checkbox_faux"></span>
                                <span class="slds-form-element__label">Set this org as default for next use</span>
                            </label>
                        </div>
                    </div>
                </div>`;
        }

        toReturn += `
            </div>
            <footer class="slds-card__footer">
                <button 
                    id="button-set-org" 
                    type="button" 
                    class="slds-button slds-button_brand"
                    title="Use selected org to retrieve and set permissions" 
                >
                    Set Org
                </button>
            </footer>
        </article>
        `;

        return toReturn;
    }

    createHtmlPermissionSet(){
        let toReturn = ``; 

        if(this.pageView.isConnected){
            toReturn += `
            <article class="slds-card">
                <div class="slds-card__body slds-card__body_inner">
                    <div class="slds-form-element">
                        <label class="slds-form-element__label">
                            Permission Set
                        </label>
                        <div class="slds-form-element__control">
                            <div class="slds-select_container">
                                <select 
                                    id="input-permission-set" 
                                    class="slds-select"
                                >
            `;

            this.pageView.permissionsToSelect.forEach(permission =>{
                toReturn += `<option value="${permission.api}">${permission.label} (${permission.api})</option>`;
            });

            toReturn += `
                                </select>
                            </div>
                        </div>
                    </div>

                    <div class="slds-form-element">
                        <div class="slds-form-element__control">
                            <div class="slds-checkbox">
                                <input 
                                    type="checkbox" 
                                    id="input-save-default-permission-set" 
                                    ${this.pageView.checkedDefaultPermissionSet ? 'checked' : ''}
                                />
                                <label class="slds-checkbox__label" for="input-save-default-permission-set">
                                    <span class="slds-checkbox_faux"></span>
                                    <span class="slds-form-element__label">
                                        Set used permissions as default for next use
                                    </span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
                <footer class="slds-card__footer slds-card__footer-action">
                    <button 
                        id="button-add-permission-set" 
                        type="button" 
                        class="slds-button slds-button_brand"
                        title="Add selected permission to set permissions"
                    >
                        Add Permission
                    </button>
                </footer>
            </article>
                <!-- <button type="button" id="button-refresh-permission">REFRESH</button> -->
            `;
        }

        return toReturn;
    }

    createHtmlModal(){
        let toReturn = ``;

        if(this.pageView.showModal){
            toReturn = `
                <section role="dialog" tabindex="-1" aria-modal="true" class="slds-modal slds-fade-in-open">
                <div class="slds-modal__container">
                <div class="slds-modal__content slds-p-around_medium">
                    <p>
                        <div class="slds-form-element">
                            <div class="slds-form-element">
                                <label class="slds-form-element__label">
                                    Object API Name
                                </label>
                                <select 
                                    id="input-object-describe" 
                                    class="slds-input" 
                                >`; 

                                this.pageView.listObject.forEach(object =>{
                                    toReturn += `<option value="${object}" ${object === this.pageView.objectToDescribe ? 'selected' : ''}>${object}</option>`;
                                });

                                toReturn += `
                                </select>
                            </div>

                            <br/>

                            <button 
                                class="slds-button slds-button_brand" 
                                id="button-set-object"
                                title="Get all fields from selected object"
                            >
                                Get Fields
                            </button>

                            <hr/>
                        </div>
                        <div class="slds-form-element">
                            <label class="slds-form-element__label">
                                Filter
                            </label>
                            <input 
                                type="text" 
                                id="input-filter-field" 
                                class="slds-input"
                            />
                        </div>

                        <br/>

                        <div class="slds-form-element__control">
                            <div class="slds-select_container">
                                <table class="sfp-table slds-table slds-table_cell-buffer slds-table_bordered slds-table_col-bordered spf-table-field">
                                    <thead>
                                        <tr>
                                            <th class="text-center th-label column-input-checkbox" scope="col">
                                                <input 
                                                    type="checkbox"
                                                    id="input-checkbox-object-field-all"
                                                />
                                            </th>
                                            <th class="text-center th-label th-size-2" scope="col">
                                                Label
                                            </th>
                                            <th class="text-center th-label th-size-2" scope="col">
                                                API
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
            `;

                                this.pageView.listFieldObject.forEach((field: any) =>{
                                    toReturn += `
                                        <tr class="field-row">
                                            <td class="text-center column-input-checkbox">
                                                <input 
                                                    type="checkbox"
                                                    class="input-checkbox-object-field"
                                                    data-api="${field.api}"
                                                />
                                            </td>
                                            <td class="td-data th-size-2">${field.label}</td>
                                            <td class="td-data th-size-2">${field.api}</td>
                                        </tr>
                                    `;
                                });

                                toReturn += `
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </p>
                    </div>
                    <div class="slds-modal__footer">
                        <button 
                            id="button-close-modal" 
                            class="slds-button slds-button_neutral"
                        >
                            Cancel
                        </button>
                        <button 
                            id="button-add-object-fields" 
                            class="slds-button slds-button_brand"
                            title="Add selected fields to set permissions"
                        >
                            Add Fields
                        </button>
                    </div>
                </div>
                </section>
                <div class="slds-backdrop slds-backdrop_open" role="presentation"></div>
            `;
        }

        return toReturn;
    }

    createHtmlTabs(){
        let toReturn = `
            <ul class="slds-tabs_default__nav" role="tablist">
                <li class="slds-tabs_default__item slds-is-active li-tab" data-id="Field">
                    <a class="slds-tabs_default__link input-tab" data-id="Field">
                        Fields
                    </a>
                </li>
        `;
        
        this.pageView.listSelectedObjects.forEach(object =>{
            toReturn += `
                    <li class="slds-tabs_default__item li-tab" data-id="${object}">
                        <a class="slds-tabs_default__link input-tab" data-id="${object}">
                            ${object}
                        </a>
                    </li>
            `;
        });

        toReturn += `
            </ul>
        `;

        return toReturn;
    }

    createHtmlTable(){
        let toReturn = `
        <div class="slds-tabs_default__content tab-content slds-show" data-id="Field">
        <article class="slds-card">
            <div class="slds-card__body slds-card__body_inner">
                ${this.createWhereIsPermissionButton()}

                <table class="sfp-table slds-table slds-table_cell-buffer slds-table_bordered slds-table_col-bordered">
                    <thead>
                        <tr>
                            <th class="text-center width-100" colspan="2" scope="col">
                                Permission Set 
                            </th>
        `;

        this.resetColumnColor();

        this.pageView.selectedPermissions.forEach(permission =>{
            toReturn += `
                <th colspan="2" class="text-center view-edit-${this.getColumnColor()}" scope="col">
                    ${permission.label}
                    <br/>
                    ${permission.api}
                    <br/>
                    <button
                        type="button" 
                        class="icon-remove button-remove-permission"
                        data-permission="${permission.api}"
                    >
                        x
                    </button>
                </th>
            `;

            this.setColumnColor();
        });

        toReturn += `
            </tr>
            <tr>
                <th class="text-center width-100" colspan="2" scope="col">
                    Object.Field
                </th>
        `;

        this.resetColumnColor();

        this.pageView.selectedPermissions.forEach(permission =>{
            toReturn += `
                <th class="text-center column-input-checkbox view-edit-${this.getColumnColor()}" scope="col">
                    Read
                    <br/>
                    <input 
                        data-permission="${permission.api}" 
                        data-type="read"
                        type="checkbox"
                        class="input-checkbox-all"
                        ${permission.read ? 'checked' : ''}
                    />
                </th>
                <th class="text-center column-input-checkbox view-edit-${this.getColumnColor()}" scope="col">
                    Edit
                    <br/>
                    <input 
                        data-permission="${permission.api}" 
                        data-type="edit"
                        type="checkbox"
                        class="input-checkbox-all"
                        ${permission.edit ? 'checked' : ''}
                    />
                </th>
            `;
            
            this.setColumnColor();
        });

        toReturn += `
            </tr>
            </thead>
            <tbody>
        `;
                        
                        this.pageView.selectedFields.forEach(field =>{
                            toReturn += `
                                <tr class="slds-hint-parent" scope="row" data-field="tr-${field}">
                                    <td class="column-input-checkbox no-border-right">
                                        <button 
                                            type="button"
                                            class="icon-remove button-remove-field"
                                            data-field="${field}"
                                        >
                                            x
                                        </button>
                                    </td>
                                    <td class="text-left no-border-left width-100">
                                        ${field}
                                    </td>
                            `;
                
                            this.resetColumnColor();

                            for(let x in this.pageView.selectedPermissions){
                                let recordValue = this.pageView.fieldValues.get(this.pageView.selectedPermissions[x].api +'.'+ field);

                                if(recordValue){
                                    toReturn += `
                                        <td class="center column-input-checkbox view-edit-${this.getColumnColor()}">
                                            <input 
                                                data-field="${field}" 
                                                data-permission="${this.pageView.selectedPermissions[x].api}" 
                                                data-type="read" 
                                                type="checkbox" 
                                                class="input-checkbox"
                                                ${recordValue.read ? 'checked' : ''}
                                            />
                                        </td>
                                        <td class="center column-input-checkbox view-edit-${this.getColumnColor()}">
                                            <input 
                                                data-field="${field}" 
                                                data-permission="${this.pageView.selectedPermissions[x].api}" 
                                                data-type="edit" 
                                                type="checkbox" 
                                                class="input-checkbox"
                                                ${recordValue.edit ? 'checked' : ''}
                                            />
                                        </td>
                                    `;

                                    this.setColumnColor();
                                }
                            }
                
                            toReturn += `
                                </tr>
                            `; 
                        });

                toReturn += `
                        </tbody>
                    </table>
                </div>
                <footer class="slds-card__footer">
                    <button 
                        id="button-clear" 
                        type="button" 
                        class="slds-button slds-button_neutral"
                    >
                        Clear
                    </button>
                    <button 
                        id="button-save" 
                        type="button" 
                        class="slds-button slds-button_brand"
                        title="Save permissions for these fields"
                    >
                        Save
                    </button>
                </footer>
            </article>
            </div>
        `;

        return toReturn;
    }

    createHtmlTabContent(){
        let toReturn = '';

        this.pageView.listSelectedObjects.forEach(object =>{
            toReturn += `
                <div class="slds-tabs_default__content tab-content slds-hide" data-id="${object}">
                    <article class="slds-card">
                        <div class="slds-card__body slds-card__body_inner">
                            ${this.createWhereIsPermissionButton()}

                            <table class="sfp-table slds-table slds-table_cell-buffer slds-table_bordered slds-table_col-bordered">
                                <thead>
                                    <tr>
                                        <th class="text-center width-100" scope="col">
                                            Permission 
                                        </th>`;

                                        this.resetColumnColor();

                                        this.pageView.selectedPermissions.forEach(permission =>{
                                            toReturn += `
                                                <th class="text-center view-edit-${this.getColumnColor()}" scope="col">
                                                    ${permission.label}
                                                    <br/>
                                                    ${permission.api}
                                                    <br/>
                                                    <button
                                                        type="button" 
                                                        class="icon-remove button-remove-permission"
                                                        data-permission="${permission.api}"
                                                    >
                                                        x
                                                    </button>
                                                </th>
                                            `;

                                            this.setColumnColor();
                                        });

                                        let mapOptions = new Map();
                                        mapOptions.set('read', 'Read');
                                        mapOptions.set('create', 'Create');
                                        mapOptions.set('edit', 'Edit');
                                        mapOptions.set('delete', 'Delete');
                                        mapOptions.set('viewAll', 'View All');
                                        mapOptions.set('modifyAll', 'Modify All');
                                        
                                    toReturn += `</tr>
                            </thead>
                            <tbody>
                                <tr class="slds-hint-parent" scope="row">`;

                                this.resetColumnColor();

                                for(let [key, value] of mapOptions){
                                    toReturn += 
                                        `<td class="width-100">
                                            ${value}
                                        </td>`;

                                        if(this.pageView.objectValues.size){
                                            this.pageView.selectedPermissions.forEach(permission =>{
                                                toReturn += `
                                                    <td class="center column-input-checkbox view-edit-${this.getColumnColor()}">
                                                        <input 
                                                            data-permission="${permission.id}" 
                                                            data-id="${this.pageView.objectValues.get(object).get(permission.id).id}"
                                                            data-type="${key}"
                                                            data-object="${object}"
                                                            type="checkbox"
                                                            class="input-checkbox-object input-checkbox-object-${object} input-checkbox-object-${object}-${permission.id}-${key}"
                                                            ${this.pageView.objectValues.get(object).get(permission.id)[key] ? 'checked' : ''}
                                                        />
                                                    </td>`;
                                            });
                                        }

                                    toReturn += `</tr>`;
                                }

                                toReturn += `
                            </tbody>
                        </table>
                    </div>
                    <footer class="slds-card__footer">
                        <button 
                            data-object="${object}"
                            type="button" 
                            class="slds-button slds-button_neutral button-remove-object"
                        >
                            Remove
                        </button>
                        <button 
                            data-object="${object}"
                            type="button" 
                            class="slds-button slds-button_brand button-save-object"
                            title="Save permissions for this object"
                        >
                            Save
                        </button>
                    </footer>
                </article>
            </div>
            `;
        });

        return toReturn;
    }

    createHtmlMessage(){
        let toReturn = ``;

        if(this.pageView.pageMessageIsActive){
            toReturn = `
                <div class="slds-notify_container slds-is-relative">
                    <div class="slds-notify slds-notify_toast slds-theme_${this.pageView.pageMessageType}" role="status">
                        <div class="slds-notify__content">
                            <h2 class="slds-text-heading_small ">`;

                                this.pageView.pageMessageText.forEach(msg =>{
                                    toReturn += `${msg}<br/>`;
                                });
                                
                            toReturn += `</h2>
                        </div>
                    </div>
                </div>
            `;
        }

        return toReturn;
    }

    resetColumnColor(){
        this.columnColor = 1;
    }

    setColumnColor(){
        this.columnColor = this.columnColor === 1 ? 2 : 1;
    }

    getColumnColor(){
        return this.columnColor;
    }

    createWhereIsPermissionButton(){
        return `
            <div class="slds-no-flex">
                <button 
                    class="button-where-permission slds-button slds-button_brand"
                    title="Search in all custom permissions set for fields and objects that were added"
                >
                    Where's the permission?
                </button>
            </div>
        `;
    }

}