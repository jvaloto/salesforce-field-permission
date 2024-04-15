// @ts-nocheck
(function () {
    
    const IDENTIFIER = 'object';
    
    var listObject;

    window.addEventListener('message', event => {
        const message = event.data;
    
        switch(message.command) {
          case 'JS-UPDATE-OBJECT-LIST':
            listObject = message.text;
    
            break;
        }
    });

    document.querySelector('#button-add-object')?.addEventListener('click', () =>{
        let object = document.querySelector("#input-object").value;
    
        vscode.postMessage({
            command: 'ADD-OBJECT',
            text: object
        });
    });

    document.querySelectorAll(".button-remove-object").forEach(item =>{
        item.addEventListener('click', (event) =>{
            let object = event.target.dataset.object;

            vscode.postMessage({
                command: 'REMOVE-OBJECT',
                text: object
            });
        });
    });

    document.querySelectorAll(".button-save-object").forEach(item =>{
        item.addEventListener('click', (event) =>{
            let object = event.target.dataset.object;

            vscode.postMessage({
                command: 'SAVE-OBJECT',
                text: object
            });
        });
    });

    document.querySelectorAll(".input-checkbox-object").forEach(item =>{
        item.addEventListener('click', (event) =>{
            let object = event.target.dataset.object;
            let permissionId = event.target.dataset.permission;
            let type = event.target.dataset.type;
            let isChecked = event.target.checked;

            let changeValue = function(type){
                document.querySelector(`.input-checkbox-object-${object}-${permissionId}-${type}`).checked = isChecked;
            };

            if(isChecked){
                switch(type){
                    case 'create':
                        changeValue('read');
                        break;
                    case 'edit':
                        changeValue('read');
                        break;
                    case 'delete':
                        changeValue('read');
                        changeValue('edit');
                        break;
                    case  'viewAll':
                        changeValue('read');
                        break;
                    case 'modifyAll':
                        changeValue('read');
                        changeValue('edit');
                        changeValue('delete');
                        changeValue('viewAll');
                        break;
                    default:
                        break;
                }
            }else{
                switch(type){
                    case 'read':
                        changeValue('create');
                        changeValue('edit');
                        changeValue('delete');
                        changeValue('viewAll');
                        changeValue('modifyAll');
                        break;
                    case 'edit':
                        changeValue('delete');
                        changeValue('modifyAll');
                        break;
                    case 'delete':
                        changeValue('modifyAll');
                        break;
                    case 'viewAll':
                        changeValue('modifyAll');
                        break;
                    default:
                        break;
                }
            }

            vscode.postMessage({
                command: 'CHANGE-OBJECT-VALUE',
                text: { 
                    'permissionId': permissionId,
                    'object': object,
                    'read': document.querySelector(`.input-checkbox-object-${object}-${permissionId}-read`).checked,
                    'create': document.querySelector(`.input-checkbox-object-${object}-${permissionId}-create`).checked,
                    'edit': document.querySelector(`.input-checkbox-object-${object}-${permissionId}-edit`).checked,
                    'del': document.querySelector(`.input-checkbox-object-${object}-${permissionId}-delete`).checked,
                    'viewAll': document.querySelector(`.input-checkbox-object-${object}-${permissionId}-viewAll`).checked,
                    'modifyAll': document.querySelector(`.input-checkbox-object-${object}-${permissionId}-modifyAll`).checked
                }
            });
        });
    });

}());