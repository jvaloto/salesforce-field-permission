import { PageView } from "../PageView";

var columnColor: number;
const IDENTIFIER = 'apex-class';

export function getContent(pageView: PageView){
    let toReturn = `
        <div class="slds-tabs_default__content tab-content slds-hide" data-id="${IDENTIFIER}">
            <article class="slds-card">
                <div class="slds-card__body slds-card__body_inner">
                    <div class="slds-grid slds-gutters">
                        <div class="slds-col">
                            <div class="slds-form-element">
                                <label class="slds-form-element__label">
                                    Apex Class
                                </label>
                                <select 
                                    id="input-${IDENTIFIER}" 
                                    class="slds-input" 
                                >`;

                                pageView.listApexClassToSelect.forEach(apexClass =>{
                                    toReturn += `<option value="${apexClass.id}">${apexClass.label}</option>`;
                                });

                                toReturn += `
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
                <footer class="slds-card__footer">
                    <button 
                        id="button-add-${IDENTIFIER}" 
                        type="button" 
                        class="slds-button slds-button_brand"
                        title="Add selected apex class to set permissions"
                    >
                        Add Apex Class
                    </button>
                </footer>
            </article>`;

        toReturn += `
            ${createTable(pageView)}

            </div>
        `;

    return toReturn;
}

function createTable(pageView: PageView){
    let toReturn = '';

    if(pageView.listSelectedApexClass.length || pageView.selectedPermissions.length){
        toReturn += `
        <div class="slds-tabs_default__content tab-content slds-show" data-id="${IDENTIFIER}">
        <article class="slds-card">
            <div class="slds-card__body slds-card__body_inner">
                <table class="sfp-table slds-table slds-table_cell-buffer slds-table_bordered slds-table_col-bordered" id="table-${IDENTIFIER}">
                    <thead>
                        <tr>
                            <th class="text-center width-100" colspan="2" scope="col">
                                Permission Set
                            </th>
        `;

        resetColumnColor();

        pageView.selectedPermissions.forEach(permission =>{
            toReturn += `
                <th class="text-center view-edit-${getColumnColor()}" scope="col">
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

            setColumnColor();
        });

        toReturn += `
            </tr>
            <tr>
                <th class="text-center width-100" colspan="2" scope="col">
                    Apex Class
                </th>
        `;

        resetColumnColor();

        pageView.selectedPermissions.forEach(permission =>{
            toReturn += `
                <th class="text-center column-input-checkbox view-edit-${getColumnColor()}" scope="col">
                    Enabled
                    <br/>
                    <input 
                        data-permission="${permission.id}" 
                        type="checkbox"
                        class="input-checkbox-all-${IDENTIFIER}"
                        ${permission.read ? 'checked' : ''}
                    />
                </th>
            `;
            
            setColumnColor();
        });

        toReturn += `
            </tr>
            </thead>
            <tbody id="tbody-${IDENTIFIER}">
        `;
                    
                    pageView.listSelectedApexClass.forEach(apexClass =>{
                        let apexClassData = pageView.mapApexClass.get(apexClass);

                        toReturn += `
                            <tr class="slds-hint-parent" scope="row" data-${IDENTIFIER}="${apexClass}">
                                <td class="column-input-checkbox no-border-right">
                                    <button 
                                        type="button"
                                        class="icon-remove button-remove-${IDENTIFIER}"
                                        data-${IDENTIFIER}="${apexClass}"
                                    >
                                        x
                                    </button>
                                </td>
                                <td class="text-left no-border-left width-100">
                                    ${apexClassData.label}
                                </td>
                        `;
            
                        resetColumnColor();

                        pageView.selectedPermissions.forEach(permission =>{
                            let recordValue = pageView.apexClassValues.get(permission.id).get(apexClass);

                            toReturn += `
                                <td class="center column-input-checkbox view-edit-${getColumnColor()}">
                                    <input 
                                        data-id="${apexClass}" 
                                        data-permission="${permission.id}" 
                                        type="checkbox" 
                                        class="input-checkbox-${IDENTIFIER}"
                                        ${recordValue.checked ? 'checked' : ''}
                                    />
                                </td>
                            `;

                            setColumnColor();
                        });
            
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
                    id="button-clear-${IDENTIFIER}" 
                    type="button" 
                    class="slds-button slds-button_neutral"
                >
                    Clear
                </button>
                <button 
                    id="button-save-${IDENTIFIER}" 
                    type="button" 
                    class="slds-button slds-button_brand"
                    title="Save permissions for these apex class"
                >
                    Save
                </button>
            </footer>
        </article>
        </div>`;
    }

    return toReturn;
}

function resetColumnColor(){
    columnColor = 1;
}

function setColumnColor(){
    columnColor = columnColor === 1 ? 2 : 1;
}

function getColumnColor(){
    return columnColor;
}