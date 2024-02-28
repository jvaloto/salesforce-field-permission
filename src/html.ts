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
                
                ${this.createHtmlTable()}
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
                                <label class="slds-form-element__label" for="text-input-id-50">
                                    Object API Name
                                </label>
                                <input 
                                    type="text" 
                                    id="input-object" 
                                    class="slds-input" 
                                    value="${this.pageView.selectedObject}"
                                />
                            </div>
                        </div>

                        <div class="slds-col">
                            <div class="slds-form-element">
                                <label class="slds-form-element__label" for="text-input-id-50">
                                    Field API Name
                                </label>
                                <input 
                                    type="text" 
                                    id="input-field" 
                                    class="slds-input" 
                                    value="${this.pageView.selectedField}"
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <footer class="slds-card__footer">
                    <button 
                        id="button-add-field-object" 
                        type="button" 
                        class="slds-button slds-button_brand"
                    >
                        Add Fields by Object
                    </button>
                    
                    <button 
                        id="button-add-field" 
                        type="button" 
                        class="slds-button slds-button_brand"
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
                    <label class="slds-form-element__label" for="select-01">
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
                                name="options" 
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
                        <label class="slds-form-element__label" for="select-01">
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
                                    name="options" 
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
                        <label class="slds-form-element__label" for="select-01">
                            Object
                        </label>
                        <div class="slds-form-element__control">
                            <div class="slds-select_container">
                                <select id="input-object-describe" class="slds-select">
            `;

                                this.pageView.listObject.forEach(object =>{
                                    toReturn += `
                                        <option 
                                            value="${object}" 
                                                ${this.pageView.objectToDescribe === object ? 'selected' : ''}
                                            >
                                            ${object}
                                        </option>
                                    `;
                                });

                                toReturn += `
                                </select>
                            </div>

                            <br/>

                            <button 
                                class="slds-button slds-button_brand" 
                                id="button-set-object"
                            >
                                Get Fields
                            </button>

                            <hr/>
                        </div>
                        <div class="slds-form-element__control">
                            <div class="slds-select_container">
                                <table class="sfp-table slds-table slds-table_cell-buffer slds-table_bordered slds-table_col-bordered">
                                    <thead>
                                        <tr>
                                            <th class="text-center th-label" scope="col">
                                                <input 
                                                    type="checkbox"
                                                    id="input-checkbox-object-field-all"
                                                />
                                            </th>
                                            <th class="text-center th-label" scope="col">Label</th>
                                            <th class="text-center th-label" scope="col">API</th>
                                        </tr>
                                    </thead>
                                    <tbody>
            `;

                                this.pageView.listFieldObject.forEach((field: any) =>{
                                    toReturn += `
                                        <tr>
                                            <td class="text-center">
                                                <input 
                                                    type="checkbox"
                                                    class="input-checkbox-object-field"
                                                    data-api="${field.api}"
                                                />
                                            </td>
                                            <td>${field.label}</td>
                                            <td>${field.api}</td>
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

    createHtmlTable(){
        let toReturn = `
        <article class="slds-card">
            <div class="slds-card__body slds-card__body_inner">
                <div class="slds-no-flex">
                    <button 
                        id="button-where-permission" 
                        class="slds-button slds-button_brand"
                    >
                        Where's the permission?
                    </button>
                </div>
        
                <table class="sfp-table slds-table slds-table_cell-buffer slds-table_bordered slds-table_col-bordered">
                    <thead>
                        <tr>
                            <th class="text-center th-label" scope="col">
                                Permission Set 
                            </th>
        `;

        let numberColor = 1;

        this.pageView.selectedPermissions.forEach(permission =>{
            toReturn += `
                <th colspan="2" class="text-center view-edit-${numberColor}" scope="col">
                    ${permission.label}
                    <br/>
                    (${permission.api})
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

            numberColor = numberColor === 1 ? 2 : 1;
        });

        toReturn += `
            </tr>
            <tr>
                <th class="text-center th-label" scope="col">
                    Object.Field
                </th>
        `;

        numberColor = 1;

        this.pageView.selectedPermissions.forEach(permission =>{
            toReturn += `
                <th class="text-center view-edit-${numberColor}" scope="col">
                    View
                    <br/>

                    <input 
                        data-permission="${permission.api}" 
                        data-type="read"
                        type="checkbox"
                        class="input-checkbox-all"
                        ${permission.read ? 'checked' : ''}
                    />
                </th>
                <th class="text-center view-edit-${numberColor}" scope="col">
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
            
            numberColor = numberColor === 1 ? 2 : 1;
        });

        toReturn += `
            </tr>
            </thead>
            <tbody>
        `;
                        
                        this.pageView.selectedFields.forEach(field =>{
                            toReturn += `
                                <tr class="slds-hint-parent" scope="row">
                                    <td class="text-left">
                                        <button 
                                            type="button"
                                            class="icon-remove button-remove-field"
                                            data-field="${field}"
                                        >
                                            x
                                        </button>

                                        ${field}
                                    </td>
                            `;
                
                            numberColor = 1;

                            for(let x in this.pageView.selectedPermissions){
                                let recordValue = this.pageView.values.get(this.pageView.selectedPermissions[x].api +'.'+ field);

                                toReturn += `
                                    <td class="center view-edit-${numberColor}">
                                        <input 
                                            data-field="${field}" 
                                            data-permission="${this.pageView.selectedPermissions[x].api}" 
                                            data-type="read" 
                                            type="checkbox" 
                                            class="input-checkbox"
                                            ${recordValue.read ? 'checked' : ''}
                                        />
                                    </td>
                                    <td class="center view-edit-${numberColor}">
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

                                numberColor = numberColor === 1 ? 2 : 1;
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
                    >
                        Save
                    </button>
                </footer>
            </article>
        `;

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

}