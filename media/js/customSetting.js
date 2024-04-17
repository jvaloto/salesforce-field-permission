// @ts-nocheck
(function () {

    const IDENTIFIER = 'custom-setting';

    window.addEventListener('message', event => {
        const message = event.data;

        switch(message.command) {
          case 'JS-UPDATE-LIST-CUSTOM-SETTING':
            let listValues = new Array();

            message.text.forEach(item =>{
                listValues.push({
                    id: item.id,
                    text: item.label
                });
            });

            updateListToSelect(`#input-${IDENTIFIER}`, listValues);
    
            break;
        }
    });

    document.querySelector(`#button-add-${IDENTIFIER}`)?.addEventListener('click', () =>{
        let customSetting = document.querySelector(`#input-${IDENTIFIER}`).value;

        vscode.postMessage({
            command: 'ADD-CUSTOM-SETTING',
            text: customSetting
        });
    });

    document.querySelectorAll(`.button-remove-${IDENTIFIER}`).forEach(item =>{
        item.addEventListener('click', (event) =>{
            let customSetting = event.target.dataset.customSetting;

            Array.from(document.querySelector(`#tbody-${IDENTIFIER}`).children).forEach(line =>{
                if(line.dataset.customSetting === customSetting){
                    let trLine = document.querySelector(`[data-${IDENTIFIER}="${customSetting}"]`);
                    trLine.classList.add('hidden');
                    trLine.dataset.customSetting = '';
                }
            });

            vscode.postMessage({
                command: 'REMOVE-CUSTOM-SETTING',
                text: customSetting
            });
        });
    });

    document.querySelectorAll(`.input-checkbox-all-${IDENTIFIER}`).forEach(item =>{
        item.addEventListener('change', (event) =>{
            let checked = event.target.checked;
            let permissionId = event.target.dataset.permission;

            document.querySelectorAll(`.input-checkbox-${IDENTIFIER}[data-permission="${permissionId}"]`).forEach(line =>{
                line.checked = checked;
            });

            vscode.postMessage({
                command: 'CHANGE-VALUE-ALL-CUSTOM-SETTING',
                text: {
                    'checked': checked, 
                    'permissionId': permissionId
                }
            });
        });
    });

    document.querySelectorAll(`.input-checkbox-${IDENTIFIER}`).forEach(item =>{
        item.addEventListener('change', (event) =>{
            let checked = event.target.checked;
            let permissionId = event.target.dataset.permission;
            let customSettingId = event.target.dataset.id;

            vscode.postMessage({
                command: 'CHANGE-VALUE-CUSTOM-SETTING',
                text: {
                    'checked': checked, 
                    'permissionId': permissionId,
                    'customSettingId': customSettingId
                }
            });
        });
    });

    document.querySelector(`#button-save-${IDENTIFIER}`)?.addEventListener('click', () =>{
        vscode.postMessage({
            command: 'SAVE-CUSTOM-SETTING'
        });
    });

    document.querySelector(`#button-clear-${IDENTIFIER}`)?.addEventListener('click', () =>{
        vscode.postMessage({
            command: 'CLEAR-CUSTOM-SETTING'
        });
    });

}());