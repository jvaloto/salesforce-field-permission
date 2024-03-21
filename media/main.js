// @ts-nocheck
(function () {
  const vscode = acquireVsCodeApi();

  var listObject;
  var lastValue = "";
  var idTimeout;

  window.addEventListener('message', event => {
    const message = event.data;

    switch(message.command) {
      case 'JS-UPDATE-OBJECT-LIST':
        listObject = message.text;

        break;
      case 'SET-TAB-FOCUS':
        setTabFocus(message.text);

        break;
    }
  });

  const clearTime = function(){
    if(idTimeout){
      clearTimeout(idTimeout);
    }
  };

  const addObject = function(){
    let object = document.querySelector("#input-object").value;
    
    vscode.postMessage({
      command: 'ADD-OBJECT',
      text: object
    });
  };

  const addField = function(){
    let object = document.querySelector("#input-object").value;

    let field = document.querySelector("#input-field").value;

    vscode.postMessage({
      command: 'ADD-FIELD',
      text: { 
        object: object, 
        field: field 
      }
    });
  };

  const autocompleteObject = function(event){
    if(event.keyCode === 13){
      addObject();
    }else if(listObject && event.keyCode >= 65 && event.keyCode <= 122){
        lastValue = event.target.value;

        if(lastValue.length >= 1){
          clearTime();
            
          idTimeout = setTimeout(() =>{
            listObject.forEach(object =>{
                  if(object.toUpperCase().startsWith(lastValue.toUpperCase())){
                      event.target.value = object;
                      event.target.setSelectionRange(lastValue.length, object.length);
                      
                      lastValue = lastValue.substring(0, lastValue.length);
                  }
              });
          }, 500);
        }
      }
  };

  document.querySelector('#input-object')?.addEventListener('focusout', (event) =>{
    clearTime();
  });

  document.querySelector('#input-object')?.addEventListener('keyup', autocompleteObject, event);
  
  document.querySelector('#input-object-describe')?.addEventListener('keyup', autocompleteObject, event);

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
    addField();
  });

  document.querySelector('#input-field')?.addEventListener('keyup', (event) =>{
    if(event.keyCode === 13){
      addField();
    }
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
      command: 'SAVE-FIELDS'
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
      let object = event.target.dataset.id;

      setTabFocus(object);
      
      vscode.postMessage({
        command: 'SET-TAB-FOCUS',
        text: object
      });
    });
  });

  function setTabFocus(id){
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

    if(id === 'Field'){
      document.querySelector('#input-field').focus();
    }
  }
  
  document.querySelector('#button-add-object')?.addEventListener('click', () =>{
    addObject();
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