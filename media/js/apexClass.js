// @ts-nocheck
(function () {

    const IDENTIFIER = 'apex-class';

    var listApexClass;

    window.addEventListener('message', event => {
        const message = event.data;

        switch(message.command) {
          case 'JS-UPDATE-LIST-APEX-CLASS':
            listApexClass = message.text;

            createApexList();
    
            break;
        }
    });

    const createApexList = function(){
        let inputSelect = document.querySelector(`#input-${IDENTIFIER}`);

        inputSelect.innerHTML = '';
        inputSelect.value = '';

        if(listApexClass.length){
            listApexClass.forEach(apexClass =>{
                let newOption = document.createElement('option');
                newOption.value = apexClass.id;
                newOption.innerHTML = apexClass.label;
                
                inputSelect.appendChild(newOption);
            });
            
            inputSelect.value = listApexClass[0].id;
        }
    };

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

            Array.from(document.querySelector(`#tbody-${IDENTIFIER}`).children).forEach(line =>{
                if(line.dataset.apexClass === apexClass){
                    let trLine = document.querySelector(`[data-${IDENTIFIER}="${apexClass}"]`);
                    trLine.classList.add('hidden');
                    trLine.dataset.apexClass = '';
                }
            });

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