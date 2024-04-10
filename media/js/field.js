// @ts-nocheck
(function () {

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

            vscode.postMessage({
                command: 'REMOVE-FIELD',
                text: field
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

    document.querySelectorAll(".input-checkbox-all").forEach(item =>{
        item.addEventListener('change', (event) =>{
            let checked = event.target.checked;
            let type = event.target.dataset.type;
            let permission = event.target.dataset.permission;

            vscode.postMessage({
                command: 'CHANGE-VALUE-ALL',
                text: {
                    'checked': checked, 
                    'type': type, 
                    'permission': permission
                }
            });
        });
    });

    document.querySelectorAll(".input-checkbox-field").forEach(item =>{
        item.addEventListener('change', (event) =>{
            let checked = event.target.checked;
            let type = event.target.dataset.type;
            let permission = event.target.dataset.permission;
            let field = event.target.dataset.field;

            vscode.postMessage({
                command: 'CHANGE-VALUE',
                text: {
                    'checked': checked, 
                    'type': type, 
                    'permission': permission, 
                    'field': field
                }
            });
        });
    });

}());