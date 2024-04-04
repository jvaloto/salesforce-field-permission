// @ts-nocheck
(function () {

    document.querySelector('#input-save-default-permission-set')?.addEventListener('change', (event) =>{
        let checked = event.target.checked;

        vscode.postMessage({
            command: 'SET-DEFAULT-PERMISSION-SETS',
            text: checked
        });
    });

    document.querySelector('#button-add-permission-set')?.addEventListener('click', () =>{
        let permissionSet = document.querySelector("#input-permission-set").value;

        vscode.postMessage({
            command: 'ADD-PERMISSION-SET',
            text: permissionSet
        });
    });

    document.querySelectorAll(".button-where-permission").forEach(item =>{
        item.addEventListener('click', (event) =>{
            vscode.postMessage({
                command: 'WHERE-IS-PERMISSION'
            });
        });
    });

}());