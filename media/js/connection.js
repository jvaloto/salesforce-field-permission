// @ts-nocheck
(function () {

    document.querySelector('#input-save-default-org')?.addEventListener('change', (event) =>{
        let checked = event.target.checked;

        vscode.postMessage({
            command: 'SET-DEFAULT-ORG',
            text: checked
        });
    });

    document.querySelector('#button-set-org')?.addEventListener('click', () =>{
        let org = document.querySelector("#input-org").value;

        vscode.postMessage({
            command: 'SELECT-ORG',
            text: org
        });
    });

}());