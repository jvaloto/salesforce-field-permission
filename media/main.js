// @ts-nocheck
(function () {
  const vscode = acquireVsCodeApi();

  document.querySelector('#input-save-default-org')?.addEventListener('change', (event) =>{
    let checked = event.target.checked;

    vscode.postMessage({
      command: 'SET-DEFAULT-ORG',
      text: checked
    });
  });

  document.querySelector('#input-save-default-permission-set')?.addEventListener('change', (event) =>{
    let checked = event.target.checked;

    vscode.postMessage({
      command: 'SET-DEFAULT-PERMISSION-SETS',
      text: checked
    });
  });

  document.querySelector('#button-set-org')?.addEventListener('click', () =>{
    let org = document.querySelector("#input-org").value;

    vscode.postMessage({
      command: 'SELECT-ORG',
      text: org
    });
  });

  document.querySelector('#button-add-permission-set')?.addEventListener('click', () =>{
    let permissionSet = document.querySelector("#input-permission-set").value;

    vscode.postMessage({
      command: 'ADD-PERMISSION-SET',
      text: permissionSet
    });
  });

  document.querySelectorAll(".button-remove-permission").forEach(item =>{
    item.addEventListener('click', (event) =>{
      let permissionSet = event.target.dataset.permission;

      vscode.postMessage({
        command: 'REMOVE-PERMISSION',
        text: permissionSet
      });
    });
  });


  document.querySelectorAll(".button-remove-field").forEach(item =>{
    item.addEventListener('click', (event) =>{
      let field = event.target.dataset.field;

      vscode.postMessage({
        command: 'REMOVE-FIELD',
        text: field
      });
    });
  });

  document.querySelector('#button-refresh-permission-set')?.addEventListener('click', () =>{
    vscode.postMessage({
      command: 'REFRESH-PERMISSION-SET'
    });
  });

  document.querySelector('#button-add-field')?.addEventListener('click', () =>{
    let object = document.querySelector("#input-object").value;

    let field = document.querySelector("#input-field").value;

    vscode.postMessage({
      command: 'ADD-FIELD',
      text: { 
        object: object, 
        field: field 
      }
    });
  });

  document.querySelector('#button-add-field-object')?.addEventListener('click', () =>{
    vscode.postMessage({
      command: 'ADD-FIELD-OBJECT'
      , text: true
    });
  });

  document.querySelector('#button-close-modal')?.addEventListener('click', () =>{
    vscode.postMessage({
      command: 'ADD-FIELD-OBJECT'
      , text: false
    });
  });

  document.querySelector('#button-set-object')?.addEventListener('click', () =>{
    let object = document.querySelector("#input-object-describe").value;

    vscode.postMessage({
      command: 'DESCRIBE-FIELDS'
      , text: object
    });
  });

  document.querySelectorAll(".input-checkbox").forEach(item =>{
    item.addEventListener('change', (event) =>{
      let checked = event.target.checked;
      let type = event.target.dataset.type;
      let permission = event.target.dataset.permission;
      let field = event.target.dataset.field;

      vscode.postMessage({
        command: 'CHANGE-VALUE',
        text: {'checked': checked, 'type': type, 'permission': permission, 'field': field }
      });
    });
  });

  document.querySelectorAll(".input-checkbox-all").forEach(item =>{
    item.addEventListener('change', (event) =>{
      let checked = event.target.checked;
      let type = event.target.dataset.type;
      let permission = event.target.dataset.permission;

      vscode.postMessage({
        command: 'CHANGE-VALUE-ALL',
        text: {'checked': checked, 'type': type, 'permission': permission }
      });
    });
  });

  document.querySelector('#button-save')?.addEventListener('click', () =>{
    vscode.postMessage({
      command: 'SAVE'
    });
  });

  document.querySelector('#button-clear')?.addEventListener('click', () =>{
    vscode.postMessage({
      command: 'CLEAR'
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

  document.querySelector('#button-where-permission')?.addEventListener('click', () =>{
    vscode.postMessage({
      command: 'WHERE-IS-PERMISSION'
    });
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
  
  document.querySelectorAll(".input-tab").forEach(item =>{
    item.addEventListener('click', (event) =>{
        let id = event.target.dataset.id;
        
        Array.from(document.querySelectorAll('.li-tab')).forEach(li =>{
            if(li.dataset.id === id){
                li.classList.add('slds-is-active');
            }else{
              li.classList.remove('slds-is-active');
            }
        });
        
        Array.from(document.querySelectorAll('.tab-content')).forEach(content =>{
          if(content.dataset.id === id){
                content.classList.remove('slds-hide');
                content.classList.add('slds-show');
            }else{
              content.classList.remove('slds-show');
                content.classList.add('slds-hide');
              }
            });
    });
  });
  
  document.querySelector('#button-add-object')?.addEventListener('click', () =>{
    let object = document.querySelector("#input-object").value;

    vscode.postMessage({
      command: 'ADD-OBJECT',
      text: object
    });
  });

}());