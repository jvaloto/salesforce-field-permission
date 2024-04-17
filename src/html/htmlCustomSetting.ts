import { PageView } from "../PageView";

const IDENTIFIER = 'custom-setting';

var columnColor: number;

export function getContent(pageView: PageView){
    let toReturn = '';

    toReturn += `
    <div class="slds-tabs_default__content tab-content slds-hide" data-id="${IDENTIFIER}">
        <article class="slds-card">
            <div class="slds-card__body slds-card__body_inner">
                <div class="slds-grid slds-gutters">
                    <div class="slds-col">
                        <div class="slds-form-element">
                            <label class="slds-form-element__label">
                                Custom Setting
                            </label>
                            <select 
                                id="input-${IDENTIFIER}" 
                                class="slds-input" 
                            >`;

                            pageView.listCustomSettingToSelect.forEach(customSetting =>{
                                toReturn += `<option value="${customSetting.id}">${customSetting.label}</option>`;
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
                    title="Add selected custom setting to set permissions"
                >
                    Add Custom Setting
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

    if(pageView.listSelectedCustomSetting.length || pageView.selectedPermissions.length){
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
                    Custom Setting
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
                    
                    pageView.listSelectedCustomSetting.forEach(customSetting =>{
                        let customSettingData = pageView.mapCustomSetting.get(customSetting);

                        toReturn += `
                            <tr class="slds-hint-parent" scope="row" data-${IDENTIFIER}="${customSetting}">
                                <td class="column-input-checkbox no-border-right">
                                    <button 
                                        type="button"
                                        class="icon-remove button-remove-${IDENTIFIER}"
                                        data-${IDENTIFIER}="${customSetting}"
                                    >
                                        x
                                    </button>
                                </td>
                                <td class="text-left no-border-left width-100">
                                    ${customSettingData.label}
                                </td>
                        `;
            
                        resetColumnColor();

                        pageView.selectedPermissions.forEach(permission =>{
                            let recordValue = pageView.customSettingValues.get(permission.id).get(customSetting);

                            toReturn += `
                                <td class="center column-input-checkbox view-edit-${getColumnColor()}">
                                    <input 
                                        data-id="${customSetting}" 
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
                    title="Save permissions for these custom settings"
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