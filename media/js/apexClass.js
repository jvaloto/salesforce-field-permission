// @ts-nocheck
(function () {

    document.querySelector('#button-add-apex-class')?.addEventListener('click', () =>{
        let apexClass = document.querySelector("#input-apex-class").value;
    
        vscode.postMessage({
            command: 'ADD-APEX-CLASS',
            text: apexClass
        });
    });

    document.querySelectorAll(".button-remove-apex-class").forEach(item =>{
        item.addEventListener('click', (event) =>{
            let apexClass = event.target.dataset.apexClass;

            vscode.postMessage({
                command: 'REMOVE-APEX-CLASS',
                text: apexClass
            });
        });
    });

    document.querySelectorAll(".input-checkbox-all-apex-class").forEach(item =>{
        item.addEventListener('change', (event) =>{
            let checked = event.target.checked;
            let permissionId = event.target.dataset.permission;

            document.querySelectorAll(`.input-checkbox-apex-class[data-permission="${permissionId}"]`).forEach(line =>{
                line.checked = checked;
            });

            vscode.postMessage({
                command: 'CHANGE-VALUE-ALL-APEX-CLASS',
                text: {
                    'checked': checked, 
                    'permissionId': permissionId
                }
            });
        });
    });

    document.querySelectorAll(".input-checkbox-apex-class").forEach(item =>{
        item.addEventListener('change', (event) =>{
            let checked = event.target.checked;
            let permissionId = event.target.dataset.permission;
            let apexClassId = event.target.dataset.id;

            vscode.postMessage({
                command: 'CHANGE-VALUE-APEX-CLASS',
                text: {
                    'checked': checked, 
                    'permissionId': permissionId,
                    'apexClassId': apexClassId
                }
            });
        });
    });

    document.querySelector("#button-save-apex-class")?.addEventListener('click', () =>{
        vscode.postMessage({
            command: 'SAVE-APEX-CLASS'
        });
    });

    document.querySelector('#button-clear-apex-class')?.addEventListener('click', () =>{
        vscode.postMessage({
            command: 'CLEAR-APEX-CLASS'
        });
    });

}());