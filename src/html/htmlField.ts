import { PageView } from "../PageView";

var columnColor: number;

export function getContent(pageView: PageView){
    let toReturn = `
            <div class="slds-tabs_default__content tab-content" data-id="field">
                <article class="slds-card">
                    <div class="slds-card__body slds-card__body_inner">
                        <div class="slds-grid slds-gutters">
                            <div class="slds-col">
                                <div class="slds-form-element">
                                    <label class="slds-form-element__label">
                                        Object API Name
                                    </label>
                                    <select 
                                        id="input-object-field" 
                                        class="slds-input" 
                                        value="${pageView.selectedObject}"
                                    />`;
    
                                    pageView.listObjectAll.forEach((object: string) =>{
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
                ${createTable(pageView)}
            </div>
        `;

        return toReturn;
}

function createTable(pageView: PageView){
    let toReturn = '';

    if(pageView.selectedFields.length || pageView.selectedPermissions.length){
        toReturn += `
        <div class="slds-tabs_default__content tab-content slds-show" data-id="field">
        <article class="slds-card">
            <div class="slds-card__body slds-card__body_inner">
                <table class="sfp-table slds-table slds-table_cell-buffer slds-table_bordered slds-table_col-bordered">
                    <thead>
                        <tr>
                            <th class="text-center width-100" colspan="2" scope="col">
                                Permission Set 
                            </th>
        `;

        resetColumnColor();

        pageView.selectedPermissions.forEach(permission =>{
            toReturn += `
                <th colspan="2" class="text-center view-edit-${getColumnColor()}" scope="col">
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
                    Object.Field
                </th>
        `;

        resetColumnColor();

        pageView.selectedPermissions.forEach(permission =>{
            toReturn += `
                <th class="text-center column-input-checkbox view-edit-${getColumnColor()}" scope="col">
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
                <th class="text-center column-input-checkbox view-edit-${getColumnColor()}" scope="col">
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
            
            setColumnColor();
        });

        toReturn += `
            </tr>
            </thead>
            <tbody>
        `;
                    
                    pageView.selectedFields.forEach(field =>{
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
            
                        resetColumnColor();

                        for(let x in pageView.selectedPermissions){
                            let recordValue = pageView.fieldValues.get(pageView.selectedPermissions[x].api +'.'+ field);

                            if(recordValue){
                                toReturn += `
                                    <td class="center column-input-checkbox view-edit-${getColumnColor()}">
                                        <input 
                                            data-field="${field}" 
                                            data-permission="${pageView.selectedPermissions[x].api}" 
                                            data-type="read" 
                                            type="checkbox" 
                                            class="input-checkbox-field"
                                            ${recordValue.read ? 'checked' : ''}
                                        />
                                    </td>
                                    <td class="center column-input-checkbox view-edit-${getColumnColor()}">
                                        <input 
                                            data-field="${field}" 
                                            data-permission="${pageView.selectedPermissions[x].api}" 
                                            data-type="edit" 
                                            type="checkbox" 
                                            class="input-checkbox-field"
                                            ${recordValue.edit ? 'checked' : ''}
                                        />
                                    </td>
                                `;

                                setColumnColor();
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