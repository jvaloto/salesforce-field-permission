import { PageView } from "../PageView";

var columnColor: number;

export function getContent(pageView: PageView){
    let toReturn = '';

    var listOptions = new Array();

    listOptions.push({
        identifier: 'apex-class',
        label: 'Apex Class',
        labelPlural: 'Apex Class',
        listToSelect: pageView.listApexClassToSelect,
        listSelected: pageView.listSelectedApexClass,
        mapValues: pageView.apexClassValues,
        mapRecord: pageView.mapApexClass
    });
    
    listOptions.push({
        identifier: 'custom-setting',
        label: 'Custom Setting',
        labelPlural: 'Custom Settings',
        listToSelect: pageView.listCustomSettingToSelect,
        listSelected: pageView.listSelectedCustomSetting,
        mapValues: pageView.customSettingValues,
        mapRecord: pageView.mapCustomSetting
    });

    listOptions.push({
        identifier: 'visualforce',
        label: 'Visualforce Page',
        labelPlural: 'Visualforce Pages',
        listToSelect: pageView.listVisualforceToSelect,
        listSelected: pageView.listSelectedVisualforce,
        mapValues: pageView.visualforceValues,
        mapRecord: pageView.mapVisualforce
    });

    listOptions.push({
        identifier: 'custom-metadata',
        label: 'Custom Metadata',
        labelPlural: 'Custom Metadata',
        listToSelect: pageView.listCustomMetadataToSelect,
        listSelected: pageView.listSelectedCustomMetadata,
        mapValues: pageView.customMetadataValues,
        mapRecord: pageView.mapCustomMetadata
    });

    listOptions.push({
        identifier: 'custom-permission',
        label: 'Custom Permission',
        labelPlural: 'Custom Permissions',
        listToSelect: pageView.listCustomPermissionToSelect,
        listSelected: pageView.listSelectedCustomPermission,
        mapValues: pageView.customPermissionValues,
        mapRecord: pageView.mapCustomPermission
    });

    listOptions.forEach(option =>{
        toReturn += `
        <div class="slds-tabs_default__content tab-content slds-hide" data-id="${option.identifier}">
            <article class="slds-card">
                <div class="slds-card__body slds-card__body_inner">
                    <div class="slds-grid slds-gutters">
                        <div class="slds-col">
                            <div class="slds-form-element">
                                <label class="slds-form-element__label">
                                    ${option.label}
                                </label>
                                <select 
                                    id="input-${option.identifier}" 
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
                        id="button-add-${option.identifier}" 
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
        <div class="slds-tabs_default__content tab-content slds-show" data-id="${option.identifier}">
        <article class="slds-card">
            <div class="slds-card__body slds-card__body_inner">
                <table class="sfp-table slds-table slds-table_cell-buffer slds-table_bordered slds-table_col-bordered" id="table-${option.identifier}">
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
                        class="input-checkbox-all-${option.identifier}"
                        ${permission.read ? 'checked' : ''}
                    />
                </th>
            `;
            
            setColumnColor();
        });

        toReturn += `
            </tr>
            </thead>
            <tbody id="tbody-${option.identifier}">
        `;
                    
                option.listSelected.forEach((selectedItem: any) =>{
                        let itemData = option.mapRecord.get(selectedItem);

                        toReturn += `
                            <tr class="slds-hint-parent" scope="row" data-id="${selectedItem}">
                                <td class="column-input-checkbox no-border-right">
                                    <button 
                                        type="button"
                                        class="icon-remove button-remove-${option.identifier}"
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
                            let recordValue = option.mapValues.get(permission.id).get(selectedItem);

                            toReturn += `
                                <td class="center column-input-checkbox view-edit-${getColumnColor()}">
                                    <input 
                                        data-id="${selectedItem}" 
                                        data-permission="${permission.id}" 
                                        type="checkbox" 
                                        class="input-checkbox-${option.identifier}"
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
                    id="button-clear-${option.identifier}" 
                    type="button" 
                    class="slds-button slds-button_neutral"
                >
                    Clear
                </button>
                <button 
                    id="button-save-${option.identifier}" 
                    type="button" 
                    class="slds-button slds-button_brand"
                    title="Save permissions for these ${option.labelPlural.toLowerCase()}"
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