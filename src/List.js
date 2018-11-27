import React from 'react';
import ReactDOM from 'react-dom';
import { Task } from './Task';

export class List extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      lastUpdated: null,
      taskList: [],
      removedList: [],
      taskCount: 0,
      addingTask: false
    };

    this.printTasks = this.printTasks.bind(this);
    this.addBtnClick = this.addBtnClick.bind(this);
    this.addNewTask = this.addNewTask.bind(this);
    this.formBlur = this.formBlur.bind(this);
    this.getLastUpdate = this.getLastUpdate.bind(this);
    this.updateList = this.updateList.bind(this);
    this.restoreTask = this.restoreTask.bind(this);
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
      let transaction = this.props.database.transaction([this.props.listTitle], 'readwrite');
      let objectStore = transaction.objectStore(this.props.listTitle);
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


  restoreTask() {
    const recentlyDeleted = [...this.state.removedList];
    const restoredText = recentlyDeleted.pop();
    this.addNewTask(false, restoredText);
    this.setState({ removedList: recentlyDeleted });
  }


  addBtnClick() {
    this.setState({
      addingTask: true
    });
  }


  formBlur(e) {
    if (this.state.taskList.length > 0 && e.currentTarget.value.length === 0) {
      this.setState({ addingTask: false });
    }
  }


  deleteFromDatabase(el) {
    const arr = [...this.state.removedList];
    arr.push(el.querySelector('.task-content').innerText);
    this.setState({ removedList: arr });

    const noteID = Number(el.getAttribute('data-note-id'));
    let transaction = this.props.database.transaction([this.props.listTitle], 'readwrite');
    let objectStore = transaction.objectStore(this.props.listTitle);
    let request = objectStore.delete(noteID);

    transaction.oncomplete = () => {
      // Entry successfully deleted
      this.updateList(true);
    };
  }


  printTasks() {
    const fetchedTasks = this.state.taskList.map( (entry) => {
      return (
        <Task entryID={entry.id} entryBody={entry.body} key={entry.id}
          database={this.props.database}
          listTitle={this.props.listTitle}
          removeTask={this.deleteFromDatabase}
        />
      );
    });

    return fetchedTasks;
  }


  componentWillMount() {
    // Load saved Tasks on initial load
    this.updateList();
  }


  componentDidUpdate(prevProps, prevState) {
    if (this.props.listTitle != prevProps.listTitle) {
      this.updateList();
    }
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

    if (this.props.database.objectStoreNames[0]) {
      let objectStore = this.props.database.transaction(this.props.listTitle).objectStore(this.props.listTitle);
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
    else {
      // No lists found, create a 'New List'
      this.props.addNewList();
    }

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
        {(this.state.addingTask || !this.state.taskList.length) &&
          <form id="add-task" onSubmit={this.addNewTask}>
            <input type="text" name="task" autoComplete="off"
              autoFocus
              onBlur={this.formBlur}
              placeholder="Add something to your list..."/>
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
