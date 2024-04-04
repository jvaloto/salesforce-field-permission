// @ts-nocheck
(function () {

    document.querySelector('#button-set-object')?.addEventListener('click', () =>{
        let object = document.querySelector("#input-object-describe").value;

        vscode.postMessage({
            command: 'DESCRIBE-FIELDS',
            text: object
        });
    });

    document.querySelector('#button-close-modal')?.addEventListener('click', () =>{
        vscode.postMessage({
            command: 'ADD-FIELD-OBJECT',
            text: false
        });
    });

    document.querySelector('#button-add-object-fields')?.addEventListener('click', () =>{
        let listFields = new Array();

        document.querySelectorAll(".input-checkbox-object-field:checked").forEach(item =>{
            listFields.push(item.dataset.api);
        });

        vscode.postMessage({
            command: 'ADD-LIST-FIELDS',
            text: listFields
        });
    });

    document.querySelector('#input-checkbox-object-field-all')?.addEventListener('click', () =>{
        document.querySelectorAll(".input-checkbox-object-field").forEach(item =>{
            if(![...item.parentElement.parentElement.classList].includes("hidden")){
                item.checked = document.querySelector('#input-checkbox-object-field-all').checked;
            }
        });
    });

    document.querySelector('#input-object-describe')?.addEventListener('change', () =>{
        document.querySelector('.spf-table-field tbody').innerHTML = '';
    });

    document.querySelector('#input-filter-field')?.addEventListener('keyup', () =>{
        Array.from(document.querySelectorAll('.field-row')).forEach(row =>{
            let isHidden = true;

            Array.from(row.querySelectorAll('.td-data')).forEach(column =>{
                if(column.innerHTML.toUpperCase().includes(
                    document.querySelector('#input-filter-field').value.toUpperCase()
                )){
                    isHidden = false;
                }
            });

            if(isHidden){
                row.classList.add("hidden");
            }else{
                row.classList.remove("hidden");
            }
        });
    });

}());