// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.

(function () {
  // @ts-ignore
  const vscode = acquireVsCodeApi();

  document.querySelector('#input-save-default-org')?.addEventListener('change', (event) =>{
    // @ts-ignore
    let checked = event.target.checked;

    vscode.postMessage({
      command: 'SET-DEFAULT-ORG',
      text: checked
    });
  });

  document.querySelector('#input-save-default-permission-set')?.addEventListener('change', (event) =>{
    // @ts-ignore
    let checked = event.target.checked;

    vscode.postMessage({
      command: 'SET-DEFAULT-PERMISSION-SETS',
      text: checked
    });
  });

  document.querySelector('#button-set-org')?.addEventListener('click', () =>{
    // @ts-ignore
    let org = document.querySelector("#input-org").value;

    vscode.postMessage({
      command: 'SELECT-ORG',
      text: org
    });
  });

  document.querySelector('#button-add-permission-set')?.addEventListener('click', () =>{
    // @ts-ignore
    let permissionSet = document.querySelector("#input-permission-set").value;

    vscode.postMessage({
      command: 'ADD-PERMISSION-SET',
      text: permissionSet
    });
  });

  document.querySelectorAll(".button-remove-permission").forEach(item =>{
    item.addEventListener('click', (event) =>{
      // @ts-ignore
      let permissionSet = event.target.dataset.permission;

      vscode.postMessage({
        command: 'REMOVE-PERMISSION',
        text: permissionSet
      });
    });
  });


  document.querySelectorAll(".button-remove-field").forEach(item =>{
    item.addEventListener('click', (event) =>{
      // @ts-ignore
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
    // @ts-ignore
    let object = document.querySelector("#input-object").value;

    // @ts-ignore
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
    // @ts-ignore
    let object = document.querySelector("#input-object-describe").value;

    vscode.postMessage({
      command: 'DESCRIBE-FIELDS'
      , text: object
    });
  });

  document.querySelectorAll(".input-checkbox").forEach(item =>{
    item.addEventListener('change', (event) =>{
      // @ts-ignore
      let checked = event.target.checked;
      // @ts-ignore
      let type = event.target.dataset.type;
      // @ts-ignore
      let permission = event.target.dataset.permission;
      // @ts-ignore
      let field = event.target.dataset.field;

      // @ts-ignore
      vscode.postMessage({
        command: 'CHANGE-VALUE',
        text: {'checked': checked, 'type': type, 'permission': permission, 'field': field }
      });
    });
  });

  document.querySelectorAll(".input-checkbox-all").forEach(item =>{
    item.addEventListener('change', (event) =>{
      // @ts-ignore
      let checked = event.target.checked;
      // @ts-ignore
      let type = event.target.dataset.type;
      // @ts-ignore
      let permission = event.target.dataset.permission;

      // @ts-ignore
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
      // @ts-ignore
      listFields.push(item.dataset.api);
    });

    // @ts-ignore
    vscode.postMessage({
      command: 'ADD-LIST-FIELDS',
      text: listFields
    });
  });

  document.querySelector('#input-checkbox-object-field-all')?.addEventListener('click', () =>{
    document.querySelectorAll(".input-checkbox-object-field").forEach(item =>{
      // @ts-ignore
      item.checked = document.querySelector('#input-checkbox-object-field-all').checked;
    });
  });

  document.querySelector('#button-where-permission')?.addEventListener('click', () =>{
    vscode.postMessage({
      command: 'WHERE-IS-PERMISSION'
    });
  });

}());