import { PageView } from "../PageView";

var columnColor: number;

export function getContent(pageView: PageView){
    let toReturn = '';

    pageView.listVariableSinglePermission.forEach(option =>{
        toReturn += `
        <div class="slds-tabs_default__content tab-content slds-hide" data-id="${option.type}">
            <article class="slds-card">
                <div class="slds-card__body slds-card__body_inner">
                    <div class="slds-grid slds-gutters">
                        <div class="slds-col">
                            <div class="slds-form-element">
                                <label class="slds-form-element__label">
                                    ${option.label}
                                </label>
                                <select 
                                    id="input-${option.type}" 
                                    class="slds-input" 
                                >`;

                                option.listToSelect.forEach((toSelect: any) =>{
                                    toReturn += `<option value="${toSelect.id}">${toSelect.label}</option>`;
                                });

                                toReturn += `
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
                <footer class="slds-card__footer">
                    <button 
                        id="button-add-${option.type}" 
                        type="button" 
                        class="slds-button slds-button_brand"
                        title="Add selected ${option.label.toLowerCase()} to set permissions"
                    >
                        Add ${option.label}
                    </button>
                </footer>
            </article>`;

        toReturn += `
            ${createTable(pageView, option)}

            </div>
        `;
    });

    return toReturn;
}

function createTable(pageView: PageView, option: any){
    let toReturn = '';

    if(option.listSelected.length || pageView.selectedPermissions.length){
        toReturn += `
        <div class="slds-tabs_default__content tab-content slds-show" data-id="${option.type}">
        <article class="slds-card">
            <div class="slds-card__body slds-card__body_inner">
                <table class="sfp-table slds-table slds-table_cell-buffer slds-table_bordered slds-table_col-bordered" id="table-${option.type}">
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
                        data-permission="${permission.id}"
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
                    ${option.label}
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
                        class="input-checkbox-all-${option.type}"
                        ${permission.read ? 'checked' : ''}
                    />
                </th>
            `;
            
            setColumnColor();
        });

        toReturn += `
            </tr>
            </thead>
            <tbody id="tbody-${option.type}">
        `;
                    
                option.listSelected.forEach((selectedItem: any) =>{
                        let itemData = option.mapRecord.get(selectedItem);

                        toReturn += `
                            <tr class="slds-hint-parent" scope="row" data-id="${selectedItem}">
                                <td class="column-input-checkbox no-border-right">
                                    <button 
                                        type="button"
                                        class="icon-remove button-remove-${option.type}"
                                        data-remove-id="${selectedItem}"
                                    >
                                        x
                                    </button>
                                </td>
                                <td class="text-left no-border-left width-100">
                                    ${itemData.label}
                                </td>
                        `;
            
                        resetColumnColor();

                        pageView.selectedPermissions.forEach(permission =>{
                            let recordValue = option.values.get(permission.id).get(selectedItem);

                            toReturn += `
                                <td class="center column-input-checkbox view-edit-${getColumnColor()}">
                                    <input 
                                        data-id="${selectedItem}" 
                                        data-permission="${permission.id}" 
                                        type="checkbox" 
                                        class="input-checkbox-${option.type}"
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
                    id="button-clear-${option.type}" 
                    type="button" 
                    class="slds-button slds-button_neutral"
                >
                    Clear
                </button>
                <button 
                    id="button-save-${option.type}" 
                    type="button" 
                    class="slds-button slds-button_brand"
                    title="Save permissions for these ${option.pluralLabel.toLowerCase()}"
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