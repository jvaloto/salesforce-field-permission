import { PageView } from "../PageView";

export function getObjectFieldModalContent(pageView: PageView){
    let toReturn = ``;

    if(pageView.showModal){
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

                            pageView.listObject.forEach(object =>{
                                toReturn += `<option value="${object}" ${object === pageView.objectToDescribe ? 'selected' : ''}>${object}</option>`;
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

                            pageView.listFieldObject.forEach((field: any) =>{
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