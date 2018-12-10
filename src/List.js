import React from 'react';
import ReactDOM from 'react-dom';
import { Task } from './Task';

export class List extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      lastUpdated: null,
      taskList: [],
      removedItems: 0,
      taskCount: 0,
      addingTask: false
    };

    this.printTasks = this.printTasks.bind(this);
    this.addBtnClick = this.addBtnClick.bind(this);
    this.addNewTask = this.addNewTask.bind(this);
    this.formBlur = this.formBlur.bind(this);
    this.getLastUpdate = this.getLastUpdate.bind(this);
    this.updateList = this.updateList.bind(this);
    this.addToUndoList = this.addToUndoList.bind(this);
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
    if (sessionStorage.getItem('undoHistory')) {
      let history = JSON.parse(sessionStorage.getItem('undoHistory'));
      let restoredText = history[this.props.listTitle].pop();
      sessionStorage.setItem('undoHistory', JSON.stringify(history));
      this.addNewTask(false, restoredText);
      const newCount = history[this.props.listTitle].length;
      this.setState({ removedItems: newCount });
    }
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
    this.addToUndoList(this.props.listTitle, el.querySelector('.task-content').innerText);

    const noteID = Number(el.getAttribute('data-note-id'));
    let transaction = this.props.database.transaction([this.props.listTitle], 'readwrite');
    let objectStore = transaction.objectStore(this.props.listTitle);
    let request = objectStore.delete(noteID);

    transaction.oncomplete = () => {
      // Entry successfully deleted
      this.updateList(true);
    };
  }


  addToUndoList(list, text) {
    /* Updates undo history */

    // Make sure undoHistory exists, otherwise create it:
    if (!sessionStorage.getItem('undoHistory')) {
      sessionStorage.setItem('undoHistory', '{}');
    }

    let history = JSON.parse(sessionStorage.getItem('undoHistory'))

    // Make sure an entry for this list exists, otherwise create one:
    if (!history[list]) {
      history[list] = [];
    }

    // Push task to history:
    history[list].push(text);
    sessionStorage.setItem('undoHistory', JSON.stringify(history));
    this.setState({ removedItems: history[list].length });
  }


  printTasks() {
    const fetchedTasks = this.state.taskList.map( (entry) => {
      const key = this.props.listTitle + entry.id;
      return (
        <Task entryID={entry.id} entryBody={entry.body} key={key}
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
          let lastUpdatedData;

          if (localStorage.getItem('lastUpdated') != null) {
            lastUpdatedData = JSON.parse(localStorage.getItem('lastUpdated'));
          }
          else {
            lastUpdatedData = {};
            lastUpdatedData[this.props.listTitle];
          }

          if (changeMade) {
            // Change 'lastUpdated' to now
            lastUpdatedData[this.props.listTitle] = new Date();
            localStorage.setItem('lastUpdated', JSON.stringify(lastUpdatedData));
          }

          this.setState({
            taskList: allEntries.result,
            addingTask: false,
            taskCount: taskCount === 1 ? '1 task' : taskCount + ' tasks',
            lastUpdated: lastUpdatedData[this.props.listTitle]
          });

          this.props.updateTaskCount(this.state.taskCount);

          // Show / hide 'undo' button
          let undoHistory = JSON.parse(sessionStorage.getItem('undoHistory'));
          if (undoHistory && undoHistory[this.props.listTitle] && undoHistory[this.props.listTitle].length > 0) {
            this.setState({ removedItems: undoHistory[this.props.listTitle].length });
          }
          else {
            this.setState({ removedItems: 0 });
          }
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
        {this.state.removedItems > 0 &&
          <button id="undoBtn" className={colorTheme} onClick={this.restoreTask}>
            <i className="fas fa-undo-alt"></i> Undo
          </button>
        }
        {(this.state.taskList.length > 0 && this.state.lastUpdated) &&
          <p className="last-updated">Last updated {this.getLastUpdate()}</p>
        }
        <ul>
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
