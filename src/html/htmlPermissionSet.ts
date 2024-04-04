import { PageView } from "../PageView";

export function getPermissionSetContent(pageView: PageView){
    let toReturn = ``; 

    if(pageView.isConnected){
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

        pageView.permissionsToSelect.forEach(permission =>{
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
                                ${pageView.checkedDefaultPermissionSet ? 'checked' : ''}
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
                <button 
                    class="button-where-permission slds-button slds-button_brand"
                    title="automatically add all custom permissions sets that has permission for any selected types"
                >
                    Where's the permission?
                </button>
            </footer>
        </article>
            <!-- <button type="button" id="button-refresh-permission">REFRESH</button> -->
        `;
    }

    return toReturn;
}