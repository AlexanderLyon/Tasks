import React from 'react';
import ReactDOM from 'react-dom';

export class List extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: 'New List',
      tasks: null,
      taskList: []
    };

    this.printTasks = this.printTasks.bind(this);
    this.addNewTask = this.addNewTask.bind(this);
    this.crossOff = this.crossOff.bind(this);
    //this.restoreTask = this.restoreTask.bind(this);
    this.deleteFromDatabase = this.deleteFromDatabase.bind(this);
  }

  addNewTask(e) {
    e.preventDefault();
    const enteredText = e.target[0].value;
    const form = e.target;

    // Add to database:
    let newNote = {body: enteredText};
    let transaction = this.props.database.transaction(['notes'], 'readwrite');
    let objectStore = transaction.objectStore('notes');
    let request = objectStore.add(newNote);

    transaction.oncomplete = () => {
      form.querySelector('input').value = "";
      // Added task successfully, print list again:
      this.forceUpdate();
    };

    transaction.onerror = () => {
      alert("There was a problem saving this task");
    };
  }


  optionsClick(e) {
    // Options button
    if (e.target.matches('.optionsBtn') || e.target.parentElement.matches('.optionsBtn')) {
      if (element.classList.contains('options-open')) {
        // Close options
        element.classList.remove('options-open');
      }
      else {
        // Open options
        element.classList.add('options-open');
      }
    }

    // Delete button
    else if (e.target.matches('.deleteBtn') || e.target.parentElement.matches('.deleteBtn')) {
      removedTasks.push(element.querySelector('.task-content').innerText);
      deleteFromDatabase(Number(element.getAttribute('data-note-id')));
      document.getElementById('undoBtn').style.display = (removedTasks.length == 0) ? 'none' : 'block';
    }

    // Edit button
    else if (e.target.matches('.editBtn') || e.target.parentElement.matches('.editBtn')) {
      if (element.classList.contains('edit-mode')) {
        // Disable editing
        element.classList.remove('edit-mode');
        element.querySelector('.task-content').blur();
        element.querySelector('.task-content').setAttribute('contenteditable', false);
        element.querySelector('.editBtn i').classList.replace('fa-save', 'fa-pencil-alt');
      }
      else {
        // Enable editing
        element.classList.add('edit-mode');
        element.querySelector('.task-content').setAttribute('contenteditable', true);
        element.querySelector('.editBtn i').classList.replace('fa-pencil-alt', 'fa-save');
        element.querySelector('.task-content').focus();

        // Move caret:
        let textNode = element.querySelector('.task-content').firstChild;
        let caret = textNode.length;
        let range = document.createRange();
        range.setStart(textNode, caret);
        range.setEnd(textNode, caret);
        let sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
  }

  crossOff(e) {
    e.stopPropagation();
    const el = e.target;
    if (el.classList.contains('edit-mode')) {
      /* Editable, ignore */
    }
    else if (!el.querySelector('.options').contains(e.target)) {
      /* Removes completed task from list */
      el.classList.add('removed');

      window.setTimeout(() => {
        //removedTasks.push(el.querySelector('.task-content').innerText);
        this.deleteFromDatabase(Number(el.getAttribute('data-note-id')));
        document.getElementById('undoBtn').style.display = (removedTasks.length == 0) ? 'none' : 'block';
      }, 1800);
    }
  }

/*
  restoreTask() {
    if (removedTasks.length > 0) {
      const restoredText = removedTasks.pop();
      addNewTask(restoredText);
      document.getElementById('undoBtn').style.display = (removedTasks.length == 0) ? 'none' : 'block';
    }
  }
  */


  deleteFromDatabase(noteID) {
    let transaction = this.props.database.transaction(['notes'], 'readwrite');
    let objectStore = transaction.objectStore('notes');
    let request = objectStore.delete(noteID);

    transaction.oncomplete = () => {
      // Entry successfully deleted
      this.render();
    };
  }


  printTasks() {
    const fetchedTasks = this.state.taskList.map( (entry) => (
      <li onClick={this.crossOff} data-note-id={entry.id}>
        <span className='task-content'>{entry.body}</span>
        <span className='options'>
          <span className='editBtn'><i className='fas fa-pencil-alt'></i></span>
          <span className='deleteBtn'><i className='fas fa-trash'></i></span>
          <span className='optionsBtn'><i className='fas fa-ellipsis-v'></i></span>
        </span>
     </li>
    ));

    return fetchedTasks;
  }

  componentWillMount() {
    // Load saved Tasks
    let objectStore = this.props.database.transaction('notes').objectStore('notes');
    let allEntries = objectStore.getAll();

    allEntries.onsuccess = () => {
      this.setState({ taskList: allEntries.result });
    };
  }


  render() {
    return (
      <div className="list">
        <h2>{this.state.title}</h2>
        <ul id="todo-list">
          { this.printTasks() }
        </ul>
        <form id="add-task" onSubmit={this.addNewTask}>
          <input type="text" name="task" autoComplete="off" placeholder="Add something to your list..."/>
          <button type="submit">Add</button>
        </form>
      </div>
    );
  }

}
