import * as vscode from 'vscode';
import { PageView } from '../PageView';
import * as htmlField from './htmlField';
import * as htmlObject from './htmlObject';
import * as htmlConnection from './htmlConnection';
import * as htmlPermissionSet from './htmlPermissionSet';
import * as htmlObjectFieldModal from './htmlObjectFieldModal';
import * as htmlSinglePermission from './htmlSinglePermission';

export class html{
    pageView: PageView;
    webview: vscode.Webview;
    listScripts: Array<vscode.Uri>;
    listStyles: Array<vscode.Uri>;
    sldsUri: vscode.Uri;
    loadingUri: vscode.Uri;
    projectName: string;
    columnColor: number;

    constructor(
        pageView: PageView, 
        webview: vscode.Webview, 
        listScripts: Array<vscode.Uri>, 
        listStyles: Array<vscode.Uri>, 
        loadingUri: vscode.Uri, 
        projectName: string
    ){
        this.pageView = pageView;
        this.webview = webview;
        this.listScripts = listScripts;
        this.listStyles = listStyles;
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
                <meta name="viewport" content="width=device-width, initial-scale=1.0">`; 

            this.listStyles.forEach(style =>{
                toReturn += `<link href="${style}" rel="stylesheet">`;
            });

            toReturn += `
                <title>${this.projectName}</title>
            </head>
            <body>
                ${htmlObjectFieldModal.getContent(this.pageView)}
        `;

        if(this.pageView.isLoading){
            toReturn += `
                <article class="slds-card">
                    <div class="slds-card__body slds-card__body_inner center">
                        <img src="${this.loadingUri}" class="center" width="50" />
                    </div>`;
                
            if(this.pageView.loadingText){
                toReturn += `
                    <footer class="slds-card__footer">
                        ${this.pageView.loadingText}
                    </footer>
                `;
            }

            toReturn += `
                </article>
            `;
        }else{
            toReturn += `
                <div class="slds-grid slds-gutters">
                    <div class="slds-col slds-size_1-of-2"">
                        ${htmlConnection.getContent(this.pageView)}
                    </div>
                    <div class="slds-col slds-size_1-of-2">
                        ${htmlPermissionSet.getContent(this.pageView)}
                    </div>
                </div>

                ${this.createHtmlContent()}

                <script>
                    var vscode = acquireVsCodeApi();
                </script>
            `;
        }

        this.listScripts.forEach(script =>{
            toReturn += `<script src="${script}"></script>`;
        });

        toReturn += `
            </body>
        </html>`;

        return toReturn;
    }

    createHtmlContent(){
        let toReturn = '';

        if(this.pageView.isConnected){
            toReturn = `
                ${this.createHtmlMessage()}

                ${this.createOptionsTab()}

                ${this.createTabContent()}
            `;
        }

        return toReturn;
    }

    createOptionsTab(){
        let listTabs = new Array();
        listTabs.push({id: 'field', label: "Fields"});
        listTabs.push({id: 'object', label: "Objects"});
        listTabs.push({id: 'apex-class', label: "Apex Class"});
        listTabs.push({id: 'custom-setting', label: "Custom Settings"});

        let toReturn = `
            <div class="slds-tabs_default">
                <ul class="slds-tabs_default__nav" role="tablist">
        `;

        listTabs.forEach((tab: any) =>{
            toReturn += `
                <li class="slds-tabs_default__item slds-is-active li-tab" data-id="${tab.id}">
                    <a class="slds-tabs_default__link input-tab" data-id="${tab.id}">
                        ${tab.label}
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

    createTabContent(){
        let toReturn = `
            ${htmlField.getContent(this.pageView)}

            ${htmlObject.getContent(this.pageView)}

            ${htmlSinglePermission.getContent(this.pageView)}
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