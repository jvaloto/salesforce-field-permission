import { PageView } from "../PageView";

export function getContent(pageView: PageView){
    let toReturn = '';

    toReturn += `
    <article class="slds-card">
        <div class="slds-card__body slds-card__body_inner">
            <div class="form-element">
                <label class="slds-form-element__label">
                    Orgs
                </label>
                <div class="slds-form-element__control">
                    <div class="slds-select_container">
                        <select id="input-org" class="slds-select">
    `;

    pageView.listOrgs.forEach(org =>{
        toReturn += `<option value="${org}" ${pageView.org === org ? 'selected' : ''}>${org}</option>`;
    });

    toReturn += `
                    </select>
                </div>
            </div>
        </div>
    `;

    if(pageView.isConnected){
        toReturn += `
        <div class="slds-form-element">
                <div class="slds-form-element__control">
                    <div class="slds-checkbox">
                        <input 
                            type="checkbox" 
                            id="input-save-default-org" 
                            ${pageView.checkedDefaultOrg ? 'checked' : ''}
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
                Use this Org
            </button>
        </footer>
    </article>
    `;

    return toReturn;
}