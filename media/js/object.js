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
            let mapValues = new Map();
            let listValues = new Array();

            document.querySelectorAll(`.input-checkbox-object-${object}`).forEach(item =>{
                let id = item.dataset.id === 'null' ? null : item.dataset.id;
                let permissionId = item.dataset.permission;

                if(!mapValues.has(permissionId)){
                    mapValues.set(permissionId, {});
                    mapValues.get(permissionId).id = id;
                    mapValues.get(permissionId).permissionId = permissionId;
                }

                mapValues.get(permissionId)[item.dataset.type] = item.checked;
            });

            for(let [key, value] of mapValues){
            listValues.push(value);
            }

            vscode.postMessage({
                command: 'SAVE-OBJECT',
                text: { 'object': object, 'values': JSON.stringify(listValues) }
            });
        });
    });

    document.querySelectorAll(".input-checkbox-object").forEach(item =>{
        item.addEventListener('click', (event) =>{
            let object = event.target.dataset.object;
            let permission = event.target.dataset.permission;
            let type = event.target.dataset.type;
            let isChecked = event.target.checked;

            let changeValue = function(type){
                document.querySelector(`.input-checkbox-object-${object}-${permission}-${type}`).checked = isChecked;
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
        });
    });

}());