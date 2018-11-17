import React from 'react';
import ReactDOM from 'react-dom';

export class List extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: 'New List',
      lastUpdated: null,
      taskList: [],
      removedList: [],
      taskCount: 0,
      addingTask: false
    };

    this.printTasks = this.printTasks.bind(this);
    this.addBtnClick = this.addBtnClick.bind(this);
    this.addNewTask = this.addNewTask.bind(this);
    this.getLastUpdate = this.getLastUpdate.bind(this);
    this.updateList = this.updateList.bind(this);
    this.crossOff = this.crossOff.bind(this);
    this.restoreTask = this.restoreTask.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.taskKeydown = this.taskKeydown.bind(this);
    this.taskKeyup = this.taskKeyup.bind(this);
    this.optionsClick = this.optionsClick.bind(this);
    this.deleteFromDatabase = this.deleteFromDatabase.bind(this);
  }

  addNewTask(e, text) {
    let enteredText;
    let form;

    if (e) {
      e.preventDefault();
      enteredText = e.target[0].value.charAt(0).toUpperCase() + e.target[0].value.substr(1);
      form = e.target;
    }
    else if (text) {
      enteredText = text;
    }

    if (enteredText.trim().length > 0) {
      // Add to database:
      let newNote = {body: enteredText};
      let transaction = this.props.database.transaction(['notes'], 'readwrite');
      let objectStore = transaction.objectStore('notes');
      let request = objectStore.add(newNote);

      transaction.oncomplete = () => {
        if (form) {
          form.querySelector('input').value = "";
        }
        // Added task successfully, print list again:
        this.updateList(true);
      };

      transaction.onerror = () => {
        alert("There was a problem saving this task");
      };
    }
  }


  crossOff(el) {
    /* Removes completed task from list */
    el.classList.add('removed');

    window.setTimeout(() => {
      let arr = [...this.state.removedList];
      arr.push(el.querySelector('.task-content').innerText);
      this.setState({ removedList: arr });

      this.deleteFromDatabase(Number(el.getAttribute('data-note-id')));
      el.classList.remove('removed');
    }, 1800);
  }


  restoreTask() {
    const recentlyDeleted = [...this.state.removedList];
    const restoredText = recentlyDeleted.pop();
    this.addNewTask(false, restoredText);
    this.setState({ removedList: recentlyDeleted });
  }


  optionsClick(options, taskEl, element, open) {
    // If optionsBtn
    if (options.querySelector('.optionsBtn').contains(element)) {
      if (open) {
        // Close options menu
        options.classList.remove('options-open');
      }
      else {
        // Open options menu
        options.classList.add('options-open');
      }
    }
    else if (options.querySelector('.editBtn').contains(element)) {
      // Edit clicked
      if (taskEl.classList.contains('edit-mode')) {
        // Disable editing
        taskEl.classList.remove('edit-mode');
        taskEl.querySelector('.task-content').blur();
        taskEl.querySelector('.task-content').setAttribute('contenteditable', false);
        taskEl.querySelector('.editBtn i').classList.replace('fa-save', 'fa-pencil-alt');
      }
      else {
        // Enable editing
        taskEl.classList.add('edit-mode');
        taskEl.querySelector('.task-content').setAttribute('contenteditable', true);
        taskEl.querySelector('.editBtn i').classList.replace('fa-pencil-alt', 'fa-save');
        taskEl.querySelector('.task-content').focus();

        // Move caret:
        let textNode = taskEl.querySelector('.task-content').firstChild;
        let caret = textNode.length;
        let range = document.createRange();
        range.setStart(textNode, caret);
        range.setEnd(textNode, caret);
        let sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
    else if (options.querySelector('.deleteBtn').contains(element)) {
      // Delete clicked
      let arr = [...this.state.removedList];
      arr.push(taskEl.querySelector('.task-content').innerText);
      this.setState({ removedList: arr });

      this.deleteFromDatabase(Number(taskEl.getAttribute('data-note-id')));
    }
  }


  handleClick(e) {
    e.stopPropagation();
    const element = e.currentTarget;

    if (element.classList.contains('options')) {
      const open = element.classList.contains('options-open') ? true : false;
      const taskEl = element.parentElement;
      this.optionsClick(element, taskEl, e.target, open);
    }
    else if (element.classList.contains('edit-mode')) {
      // Editable, ignore click
    }
    else if (!element.classList.contains('edit-mode')) {
      this.crossOff(element);
    }
  }


  taskKeydown(e) {
    if (e.keyCode === 13) {
      e.preventDefault();
      const el = e.currentTarget;

      // Disable editing
      el.classList.remove('edit-mode');
      el.querySelector('.task-content').blur();
      el.querySelector('.task-content').setAttribute('contenteditable', false);
      el.querySelector('.editBtn i').classList.replace('fa-save', 'fa-pencil-alt');
      el.querySelector('.optionsBtn').click();
    }
  }

  taskKeyup(e) {
    // Edit database entry
    const el = e.currentTarget;
    let newText = el.innerText;
    let key = el.getAttribute('data-note-id');
    let transaction = this.props.database.transaction(['notes'], 'readwrite');
    let objectStore = transaction.objectStore('notes');

    objectStore.openCursor().onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        if (cursor.key == key) {
          const updateData = cursor.value;
          updateData.body = newText;
          const request = cursor.update(updateData);
          request.onsuccess = function() {
            // Database updated successfully
          };
        }
        cursor.continue();
      }
    };
  }


  addBtnClick() {
    this.setState({
      addingTask: true
    });
  }


  deleteFromDatabase(noteID) {
    let transaction = this.props.database.transaction(['notes'], 'readwrite');
    let objectStore = transaction.objectStore('notes');
    let request = objectStore.delete(noteID);

    transaction.oncomplete = () => {
      // Entry successfully deleted
      this.updateList(true);
    };
  }


  printTasks() {
    const fetchedTasks = this.state.taskList.map( (entry) => (
      <li
        onClick={this.handleClick}
        onKeyDown={this.taskKeydown}
        onKeyUp={this.taskKeyup}
        data-note-id={entry.id}>
        <span className='task-content'>{entry.body}</span>
        <span className='options' onClick={this.handleClick}>
          <span className='editBtn'><i className='fas fa-pencil-alt'></i></span>
          <span className='deleteBtn'><i className='fas fa-trash'></i></span>
          <span className='optionsBtn'><i className='fas fa-ellipsis-v'></i></span>
        </span>
     </li>
    ));

    return fetchedTasks;
  }


  componentWillMount() {
    // Load saved Tasks on initial load
    this.updateList();
  }


  getLastUpdate() {
    const lastUpdated = new Date(this.state.lastUpdated);
    const now = new Date();
    const diff = Math.floor((now - lastUpdated) / (1000*60*60*24));
    let result;

    switch (diff) {
      case 0:
        result = 'today';
        break;
      case 1:
        result = '1 day ago';
        break;
      default:
        result = diff + ' days ago';
        break;
    }

    return result;
  }


  updateList(changeMade) {
    // Get up-to-date list from database
    let objectStore = this.props.database.transaction('notes').objectStore('notes');
    let allEntries = objectStore.getAll();

    allEntries.onsuccess = () => {
      let countRequest = objectStore.count();

      countRequest.onsuccess = () => {
        const taskCount = countRequest.result;

        if (changeMade) {
          localStorage.setItem('lastUpdated', new Date());
        }

        this.setState({
          taskList: allEntries.result,
          addingTask: false,
          taskCount: taskCount === 1 ? '1 task' : taskCount + ' tasks',
          lastUpdated: localStorage.getItem('lastUpdated')
        });

        this.props.updateTaskCount(this.state.taskCount);
      };
    };
  }


  render() {
    const colorTheme = 'theme-' + this.props.colorTheme;

    return (
      <div className="list">
        {this.state.taskList.length > 0 &&
          <h2 className={colorTheme}>Incomplete</h2>
        }
        {this.state.removedList.length > 0 &&
          <button id="undoBtn" className={colorTheme} onClick={this.restoreTask}>
            <i className="fas fa-undo-alt"></i> Undo
          </button>
        }
        {(this.state.taskList.length > 0 && this.state.lastUpdated) &&
          <p className="last-updated">Last updated {this.getLastUpdate()}</p>
        }
        <ul id="todo-list">
          { this.printTasks() }
        </ul>
        {this.state.addingTask &&
          <form id="add-task" onSubmit={this.addNewTask}>
            <input type="text" autoFocus name="task" autoComplete="off" placeholder="Add something to your list..."/>
            <button type="submit">Add</button>
          </form>
        }

        <button id="add-btn" className={colorTheme} onClick={this.addBtnClick}>
          <img src="images/plusWhite.svg" alt=""/>
        </button>
      </div>
    );
  }

}
