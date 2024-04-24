// @ts-nocheck
(function () {

    let listOptions = new Array();
    listOptions.push('apex-class');
    listOptions.push('custom-setting');

    window.addEventListener('message', event => {
        const message = event.data;

        switch(message.command){
          case 'JS-UPDATE-LIST-SINGLE-OPTION':
            let listValues = new Array();

            message.text.list.forEach(item =>{
                listValues.push({
                    id: item.id,
                    text: item.label
                });
            });

            updateListToSelect(`#input-${message.text.option.toLowerCase()}`, listValues);
    
            break;
        }
    });

    listOptions.forEach(option =>{
        let optionUpperCase = option.toUpperCase();

        document.querySelector(`#button-add-${option}`)?.addEventListener('click', () =>{
            let itemId = document.querySelector(`#input-${option}`).value;

            vscode.postMessage({
                command: 'ADD-SINGLE-OPTION',
                text: {
                    option: optionUpperCase,
                    id: itemId
                }
            });
        });
    
        document.querySelectorAll(`.button-remove-${option}`).forEach(item =>{
            item.addEventListener('click', (event) =>{
                let itemId = event.target.dataset.id;
    
                Array.from(document.querySelector(`#tbody-${option}`).children).forEach(line =>{
                    if(line.dataset.id === id){
                        let trLine = document.querySelector(`[data-${option}="${id}"]`);
                        trLine.classList.add('hidden');
                        trLine.dataset.id = '';
                    }
                });
    
                vscode.postMessage({
                    command: 'REMOVE-SINGLE-OPTION',
                    text: {
                        option: optionUpperCase,
                        id: itemId
                    }
                });
            });
        });

        document.querySelectorAll(`.input-checkbox-${option}`).forEach(item =>{
            item.addEventListener('change', (event) =>{
                let checked = event.target.checked;
                let permissionId = event.target.dataset.permission;
                let itemId = event.target.dataset.id;
    
                vscode.postMessage({
                    command: 'CHANGE-VALUE-SINGLE-OPTION',
                    text: {
                        option: optionUpperCase,
                        checked: checked, 
                        permissionId: permissionId,
                        id: itemId
                    }
                });
            });
        });
    
        document.querySelectorAll(`.input-checkbox-all-${option}`).forEach(item =>{
            item.addEventListener('change', (event) =>{
                let checked = event.target.checked;
                let permissionId = event.target.dataset.permission;
    
                document.querySelectorAll(`.input-checkbox-${option}[data-permission="${permissionId}"]`).forEach(line =>{
                    line.checked = checked;
                });
    
                vscode.postMessage({
                    command: 'CHANGE-VALUE-ALL-SINGLE-OPTION',
                    text: {
                        option: optionUpperCase,
                        checked: checked, 
                        permissionId: permissionId
                    }
                });
            });
        });
    
        document.querySelector(`#button-save-${option}`)?.addEventListener('click', () =>{
            vscode.postMessage({
                command: 'SAVE-SINGLE-OPTION',
                text:{
                    option: optionUpperCase
                }
            });
        });
    
        document.querySelector(`#button-clear-${option}`)?.addEventListener('click', () =>{
            vscode.postMessage({
                command: 'CLEAR-SINGLE-OPTION',
                text:{
                    option: optionUpperCase
                }
            });
        });
    });

}());