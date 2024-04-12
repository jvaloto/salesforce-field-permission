// @ts-nocheck
(function () {

    const IDENTIFIER = 'field';

    const addField = function(){
        let object = document.querySelector("#input-object-field").value;

        let field = document.querySelector("#input-field").value;

        vscode.postMessage({
            command: 'ADD-FIELD',
            text: { 
                object: object, 
                field: field 
            }
        });
    };

    document.querySelector('#button-add-field-object')?.addEventListener('click', () =>{
        vscode.postMessage({
            command: 'ADD-FIELD-OBJECT'
            , text: true
        });
    });

    document.querySelector('#button-add-field')?.addEventListener('click', () =>{
        addField();
    });

    document.querySelector('#input-field')?.addEventListener('keyup', (event) =>{
        if(event.keyCode === 13){
           addField();
        }
    });

    document.querySelectorAll(".button-remove-field").forEach(item =>{
        item.addEventListener('click', (event) =>{
            let field = event.target.dataset.field;
            let permissionId = event.target.dataset.permission;

            vscode.postMessage({
                command: 'REMOVE-FIELD',
                text: {
                    'permissionId': permissionId,
                    'field': field
                }
            });

            document.querySelector(`tr[data-field="tr-${field}"]`).classList.add("hidden");
        });
    });

    document.querySelector('#button-save')?.addEventListener('click', () =>{
        vscode.postMessage({
          command: 'SAVE-FIELDS'
        });
    });

    document.querySelector('#button-clear')?.addEventListener('click', () =>{
        vscode.postMessage({
            command: 'CLEAR'
        });
    });

    document.querySelectorAll(`.input-checkbox-${IDENTIFIER}-all`).forEach(item =>{
        item.addEventListener('change', (event) =>{
            let checked = event.target.checked;
            let type = event.target.dataset.type;
            let permissionId = event.target.dataset.permission;
            let mapValue = getValues(type, checked);
            let read = mapValue.get('read');
            let edit = mapValue.get('edit');

            if(type === 'read' || (type === 'edit' && checked)){
                document.querySelector(`#input-checkbox-field-all-read-${permissionId}`).checked = read;
                document.querySelector(`#input-checkbox-field-all-edit-${permissionId}`).checked = edit;

                document.querySelectorAll(`.input-checkbox-${IDENTIFIER}[data-permission="${permissionId}"][data-type="read"]`).forEach(item =>{
                    item.checked = read;
                });
            }

            document.querySelectorAll(`.input-checkbox-${IDENTIFIER}[data-permission="${permissionId}"][data-type="edit"]`).forEach(item =>{
                item.checked = edit;
            });
                
            vscode.postMessage({
                command: 'CHANGE-FIELD-VALUE-ALL',
                text: {
                    'permissionId': permissionId,
                    'read': read,
                    'edit': edit
                }
            });
        });
    });

    document.querySelectorAll(`.input-checkbox-${IDENTIFIER}`).forEach(item =>{
        item.addEventListener('change', (event) =>{
            let checked = event.target.checked;
            let type = event.target.dataset.type;
            let permissionId = event.target.dataset.permission;
            let field = event.target.dataset.field;
            let mapValue = getValues(type, checked);
            let read = mapValue.get('read');
            let edit = mapValue.get('edit');

            if(type === 'read' || (type === 'edit' && checked)){
                document.querySelector(`.input-checkbox-${IDENTIFIER}[data-permission="${permissionId}"][data-field="${field}"][data-type="read"]`).checked = read;
            }

            document.querySelector(`.input-checkbox-${IDENTIFIER}[data-permission="${permissionId}"][data-field="${field}"][data-type="edit"]`).checked = edit;

            vscode.postMessage({
                command: 'CHANGE-FIELD-VALUE',
                text: {
                    'permissionId': permissionId, 
                    'field': field,
                    'read': read,
                    'edit': edit
                }
            });
        });
    });

}());