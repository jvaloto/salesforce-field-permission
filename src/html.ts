import * as vscode from 'vscode';
import { PageView } from './PageView';
import { getFieldContent } from './html/htmlField';
import { getObjectContent } from './html/htmlObject';
import { getConnectionContent } from './html/htmlConnection';
import { getPermissionSetContent } from './html/htmlPermissionSet';
import { getObjectFieldModalContent } from './html/htmlObjectFieldModal';

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
                ${getObjectFieldModalContent(this.pageView)}
        `;

        if(this.pageView.isLoading){
            toReturn += `
                <article class="slds-card">
                    <div class="slds-card__body slds-card__body_inner center">
                        <img src="${this.loadingUri}" class="center" width="50" />
                    </div>
                    <footer class="slds-card__footer">
                        ${this.pageView.loadingText}
                    </footer>
                </article>
            `;
        }else{
            toReturn += `
                <div class="slds-grid slds-gutters">
                    <div class="slds-col slds-size_1-of-2"">
                        ${getConnectionContent(this.pageView)}
                    </div>
                    <div class="slds-col slds-size_1-of-2">
                        ${getPermissionSetContent(this.pageView)}
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
                ${this.createOptionsTab()}

                ${this.createHtmlMessage()}

                ${this.createTabContent()}
            `;
        }

        return toReturn;
    }

    createOptionsTab(){
        let toReturn = `
            <div class="slds-tabs_default">
                <ul class="slds-tabs_default__nav" role="tablist">
                    <li class="slds-tabs_default__item slds-is-active li-tab" data-id="FIELD">
                        <a class="slds-tabs_default__link input-tab" data-id="FIELD">
                            Fields
                        </a>
                    </li>
                    <li class="slds-tabs_default__item li-tab" data-id="OBJECT">
                        <a class="slds-tabs_default__link input-tab" data-id="OBJECT">
                            Objects
                        </a>
                    </li>
                </ul>
            </div>
        `;

        return toReturn;
    }

    createTabContent(){
        let toReturn = `
            ${getFieldContent(this.pageView)}

            ${getObjectContent(this.pageView)}
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