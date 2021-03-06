function getAllTodo() {
  var todos = [];
  var todoColumns = document.querySelectorAll('.todo-column');
  for(var i=0; i<todoColumns.length-1; ++i){
    var todoItems = todoColumns[i].querySelectorAll('.todo-item');
    var todoListHeader = todoColumns[i].querySelector('.todolist-header');
    var todoListName = todoListHeader.innerText;
    for(var j=0; j<todoItems.length; ++j){
      var todoName = todoItems[j].querySelector('.todo-name');
      todos.push({id: todoItems[j].getAttribute('data-id'), name: todoName.innerText, position: j, todoListName,});
    }
  }
  return todos;
}

function getAllTodoList() {
  var todoLists = [];
  var todoColumns = document.querySelectorAll('.todo-column');
  for(var i=0; i<todoColumns.length-1; ++i){
    var todoListName = todoColumns[i].querySelector('.todolist-header').innerText;
    todoLists.push({
      id: todoColumns[i].getAttribute('data-id'),
      name: todoListName,
      position: i
    });
  }
  return todoLists;
}

function fetchData(url = '/todo', data = {}, method = 'POST') {
  return fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json'
    },
    referrer: 'no-referrer',
    body: JSON.stringify(data)
  })
  .then(response => response);
}

function appendChildInTargetNode(target, htmlText) {
  var parser = new DOMParser();
  var newDOM = parser.parseFromString(htmlText, 'text/html');
  target.appendChild(newDOM.body.firstChild);
}

function appearInputTag(hideElement, formQuery, inputQuery) {
  hideElement.classList.add('hide-element');
  var form = hideElement.parentNode.querySelector(formQuery);
  form.classList.remove('hide-element');
  form.querySelector(inputQuery).focus();
}

function hideInputTag(inputElement, btnQuery) {
  var btn = inputElement.parentNode.parentNode.querySelector(btnQuery);
  btn.classList.remove('hide-element');
  inputElement.parentNode.classList.add('hide-element');
  inputElement.value = "";
}

function onClickListenerOfAddTodoBtn(event) {
  event.preventDefault();
  appearInputTag(this, '.add-card-form', '.new-card-name');
}

function keyDownHandlerOfCardNameInput(event) {
  var key = event.which || event.keyCode;

  if(key === 13){
    if(this.value === '') return;
    var todoColumn = this.parentNode.parentNode.parentNode;
    var header = todoColumn.querySelector('.todolist-header');
    var target = todoColumn.querySelector('.collection');

    var position = target.children.length;
    var todoBody = { name: this.value , position, todolist: header.innerText };

    fetchData(`/todo`, todoBody)
    .then(response => response.json())
    .then(resBody => {
      var parser = new DOMParser();
      var newDOM = parser.parseFromString(resBody.html, 'text/html');
      var todoDeleteBtn = newDOM.querySelector('.todo-delete');
      todoDeleteBtn.addEventListener('click', onClickHandlerForTodoDeleteBtn);
      addDnDHandlersForTodoItem(newDOM.body.firstChild);
      target.appendChild(newDOM.body.firstChild);
      hideInputTag(this, '.add-card');
    })
    .catch(error => console.error('Error:', error));
  }

  if(key === 27){
    hideInputTag(this, '.add-card');
  }
}

function keyDownHandlerOfTodoNameInput(event) {
  var key = event.which || event.keyCode;

  if(key === 13){
    if(this.value === '') return;
    var target = this.parentNode.parentNode;
    var parser = new DOMParser();
    var todoListName = this.value;
    var todoContainer = document.querySelector('.todo-container');
    var position = todoContainer.children.length - 1;

    fetchData(`/todolist`, {name: todoListName , position })
    .then(response => response.json())
    .then(resBody => {
      var newDOM = parser.parseFromString(resBody.html, 'text/html');

      var newAddCardBtn = newDOM.querySelector('.add-card');
      var newCardNameInput = newDOM.querySelector('.new-card-name');
      var todoListFooter = newDOM.querySelector('.todolist-footer');
      var todoListDeleteBtn = newDOM.querySelector('.todolist-delete');
      todoListDeleteBtn.addEventListener('click', onClickHandlerForTodoListDeleteBtn);
  
      newAddCardBtn.addEventListener('click', onClickListenerOfAddTodoBtn);
      newCardNameInput.addEventListener('keydown', keyDownHandlerOfCardNameInput);
      addDnDHandlersForTodoListFooter(todoListFooter);
  
      target.insertAdjacentElement('beforebegin', newDOM.body.firstChild);
  
      hideInputTag(this, '#add-todo-btn');
    })
    .catch(error => console.error('Error:', error));
  }

  if(key === 27){
    hideInputTag(this, '#add-todo-btn');
  }
}

function onClickHandlerForTodoDeleteBtn(event) {
  var deleteTarget = this.parentNode;
  deleteTarget.parentNode.removeChild(deleteTarget);

  fetchData(`/todo`, getAllTodo(), 'DELETE')
  .then(response => response)
  .catch(error => console.error('Error:', error));
}

function onClickHandlerForTodoListDeleteBtn (event) {
  var deleteTarget = this.parentNode.parentNode;
  deleteTarget.parentNode.removeChild(deleteTarget);

  fetchData(`/todolist`, {todos: getAllTodo(), todolists: getAllTodoList()}, 'DELETE')
  .then(response => response)
  .catch(error => console.error('Error:', error));
}

function handleDragStart(event) {
  dragSrcEl = this;

  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('text/html', this.outerHTML);

  this.classList.add('drag-element');
}

function handleDragOver(event) {
  if (event.preventDefault) {
    event.preventDefault(); 
  }
  this.classList.add('over');

  event.dataTransfer.dropEffect = 'move';  

  return false;
}

function handleDragEnter(event) {
  this.classList.add('over');
}

function handleDragLeave(event) {
  this.classList.remove('over');  
}

function handleDropForTodoItem(event) {
  if (event.stopPropagation) {
    event.stopPropagation(); 
  }

  if (dragSrcEl != this) {
    dragSrcEl.parentNode.removeChild(dragSrcEl);
    var dropHTML = event.dataTransfer.getData('text/html');
    dropHTML = dropHTML.replace(/<\s*meta[^>]*>/, '');
    this.insertAdjacentHTML('beforebegin',dropHTML);
    var dropElem = this.previousSibling;
    addDnDHandlersForTodoItem(dropElem);

    fetchData(`/todo`, getAllTodo(), 'PUT')
    .then(response => console.log('Success:', response === undefined && response === '' ? response : JSON.stringify(response)))
    .catch(error => console.error('Error:', error));
  }
  this.classList.remove('over');
  return false;
}

function handleDropForTodolistFooter(event) {
  if (event.stopPropagation) {
    event.stopPropagation(); 
  }

  if (dragSrcEl != this) {
    dragSrcEl.parentNode.removeChild(dragSrcEl);
    var dropHTML = event.dataTransfer.getData('text/html');
    dropHTML = dropHTML.replace(/<\s*meta[^>]*>/, '');
    var target = this.parentNode.querySelector('.collection');
    target.insertAdjacentHTML('beforeend', dropHTML);
    var dropElem = target.lastChild;
    addDnDHandlersForTodoItem(dropElem);

    var todoDeleteBtn = dropElem.querySelector('.todo-delete');
    todoDeleteBtn.addEventListener('click', onClickHandlerForTodoDeleteBtn);

    fetchData(`/todo`, getAllTodo(), 'PUT')
    .then(response => console.log('Success:', response === undefined && response === '' ? response : JSON.stringify(response)))
    .catch(error => console.error('Error:', error));
  }
  this.classList.remove('over');
  return false;
}

function handleDragEnd(e) {
  this.classList.remove('over');
  this.classList.remove('drag-element');
}

function addDnDHandlersForTodoItem(todoItem){ 
  todoItem.addEventListener('dragstart', handleDragStart, false);
  todoItem.addEventListener('dragenter', handleDragEnter, false)
  todoItem.addEventListener('dragover', handleDragOver, false);
  todoItem.addEventListener('dragleave', handleDragLeave, false);
  todoItem.addEventListener('drop', handleDropForTodoItem, false);
  todoItem.addEventListener('dragend', handleDragEnd, false);
}

function addDnDHandlersForTodoListFooter(todolistFooter) {
  todolistFooter.addEventListener('dragenter', handleDragEnter, false);
  todolistFooter.addEventListener('dragover', handleDragOver, false);
  todolistFooter.addEventListener('dragleave', handleDragLeave, false);
  todolistFooter.addEventListener('drop', handleDropForTodolistFooter, false);
}

function init() {
  var addTodoListBtn = document.getElementById('add-todo-btn');
  var todoListInput = document.querySelector('.new-list-name');
  addTodoListBtn.addEventListener('click', function(event) {
    event.preventDefault();
    appearInputTag(this, '.add-list-form', '.new-list-name');
  });
  todoListInput.addEventListener('keydown', keyDownHandlerOfTodoNameInput);

  var addTodoBtn = document.getElementsByClassName('add-card');
  var cardNameInput = document.getElementsByClassName('new-card-name');
  var todoListFooters = document.getElementsByClassName('todolist-footer');
  var todoItems = document.getElementsByClassName('todo-item');
  for(var i=0; i<addTodoBtn.length; ++i){
    addTodoBtn[i].addEventListener('click', onClickListenerOfAddTodoBtn);
  }
  for(var i=0; i<cardNameInput.length; ++i){
    cardNameInput[i].addEventListener('keydown', keyDownHandlerOfCardNameInput);
  }
  for(var i=0; i<todoListFooters.length; ++i){
    addDnDHandlersForTodoListFooter(todoListFooters[i]);
  }
  for(var i=0; i<todoItems.length; ++i){
    addDnDHandlersForTodoItem(todoItems[i]);
  }

  var todolistDeleteBtn = document.getElementsByClassName('todolist-delete');
  var todoDeleteBtn = document.getElementsByClassName('todo-delete');

  for(var i=0; i<todolistDeleteBtn.length; ++i) {
    todolistDeleteBtn[i].addEventListener('click', onClickHandlerForTodoListDeleteBtn);
  }

  for(var i=0; i<todoDeleteBtn.length; ++i) {
    todoDeleteBtn[i].addEventListener('click', onClickHandlerForTodoDeleteBtn);
  }
}

init();