// @ts-nocheck
(function () {

  var isSetInputFieldFocus = false;

  window.addEventListener('message', event => {
    const message = event.data;

    switch(message.command) {
      case 'SET-TAB-FOCUS':
        setTabFocus(message.text.tab, message.text.subTab);

        break;
      case 'SET-INPUT-FIELD-FOCUS':
        isSetInputFieldFocus = message.text;

        break;
    }
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

  document.querySelectorAll(".input-tab").forEach(item =>{
    item.addEventListener('click', (event) =>{
      let tab = event.target.dataset.id;

      setTabFocus(tab);
      
      vscode.postMessage({
        command: 'SET-TAB-FOCUS',
        text: {
          tab: tab,
          subTab: ''
        }
      });
    });
  });

  document.querySelectorAll(".li-sub-tab").forEach(item =>{
    item.addEventListener('click', (event) =>{
      let tab = event.target.dataset.parentId;
      let subTab = event.target.dataset.id;

      setTabFocus(tab, subTab);
      
      vscode.postMessage({
        command: 'SET-TAB-FOCUS',
        text: {
          tab: tab,
          subTab: subTab
        }
      });
    });
  });

  function setTabFocus(tab, subTab){
    const showContent = function(cssClass, tab){
      Array.from(document.querySelectorAll(`.${cssClass}`)).forEach(content =>{
        if(content.dataset.id === tab){
            content.classList.remove('slds-hide');
            content.classList.add('slds-show');
        }else{
          content.classList.remove('slds-show');
          content.classList.add('slds-hide');
        }
      });
    };

    Array.from(document.querySelectorAll('.li-tab')).forEach(li =>{
      if(li.dataset.id === tab){
          li.classList.add('slds-is-active');
      }else{
        li.classList.remove('slds-is-active');
      }
    });

    showContent('tab-content', tab);

    let inputObjectFieldDescribe = document.getElementById("input-object-describe");

    if(inputObjectFieldDescribe){
      inputObjectFieldDescribe.focus();
    }else if(isSetInputFieldFocus && tab === 'field'){
      document.querySelector('#input-field').focus();
    }

    if(subTab){
      Array.from(document.querySelectorAll('.li-sub-tab')).forEach(li =>{
        if(li.dataset.id === subTab){
            li.classList.add('slds-is-active');
        }else{
          li.classList.remove('slds-is-active');
        }
      });

      showContent('tab-content-sub', subTab);
    }
  }
  
}());