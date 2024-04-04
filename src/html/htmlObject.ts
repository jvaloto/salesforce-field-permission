import { PageView } from "../PageView";

var columnColor: number;

export function getObjectContent(pageView: PageView){
    let toReturn = `
            <div class="slds-tabs_default__content tab-content slds-hide" data-id="OBJECT">
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
                                        value="${pageView.selectedObject}"
                                    />`;
    
                                    pageView.listObject.forEach(object =>{
                                        toReturn += `<option value="${object}">${object}</option>`;
                                    });
    
                                    toReturn += `
                                    </select>
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
                    </footer>
                </article>`;

            toReturn += `
                ${createTabs(pageView)}

                ${createTabContent(pageView)}

                </div>
            `;

        return toReturn;
}

function createTabs(pageView: PageView){
    let toReturn = `
        <div class="slds-tabs_default">
            <ul class="slds-tabs_default__nav" role="tablist">
    `;

    pageView.listSelectedObjects.forEach((object: string) =>{
        toReturn += `
            <li class="slds-tabs_default__item li-sub-tab" data-id="${object}" data-parent-id="OBJECT">
                <a class="slds-tabs_default__link input-sub-tab" data-id="${object}" data-parent-id="OBJECT">
                    ${object}
                </a>
            </li>
        `;
    });

    toReturn += `
        </ul>
    </div>
    `;

    return toReturn;
}

function createTabContent(pageView: PageView){
    let toReturn = '';

    pageView.listSelectedObjects.forEach((object: string) =>{
        toReturn += `
            <div class="slds-tabs_default__content tab-content-sub slds-hide" data-id="${object}">
                <article class="slds-card">
                    <div class="slds-card__body slds-card__body_inner">
                        <table class="sfp-table slds-table slds-table_cell-buffer slds-table_bordered slds-table_col-bordered">
                            <thead>
                                <tr>
                                    <th class="text-center width-100" scope="col">
                                        Permission 
                                    </th>`;

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

                            resetColumnColor();

                            for(let [key, value] of mapOptions){
                                toReturn += 
                                    `<td class="width-100">
                                        ${value}
                                    </td>`;

                                    if(pageView.objectValues.size){
                                        pageView.selectedPermissions.forEach(permission =>{
                                            toReturn += `
                                                <td class="center column-input-checkbox view-edit-${getColumnColor()}">
                                                    <input 
                                                        data-permission="${permission.id}" 
                                                        data-id="${pageView.objectValues.get(object).get(permission.id).id}"
                                                        data-type="${key}"
                                                        data-object="${object}"
                                                        type="checkbox"
                                                        class="input-checkbox-object input-checkbox-object-${object} input-checkbox-object-${object}-${permission.id}-${key}"
                                                        ${pageView.objectValues.get(object).get(permission.id)[key] ? 'checked' : ''}
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
        </div>`;
    });

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