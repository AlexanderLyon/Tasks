import React from 'react';
import ReactDOM from 'react-dom';
import { CSSTransitionGroup } from 'react-transition-group';

export class Task extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};

    this.handleClick = this.handleClick.bind(this);
    this.taskKeydown = this.taskKeydown.bind(this);
    this.taskKeyup = this.taskKeyup.bind(this);
    this.optionsClick = this.optionsClick.bind(this);
    this.crossOff = this.crossOff.bind(this);
  }


  handleClick(e) {
    e.stopPropagation();
    const element = e.currentTarget;

    if (element.classList.contains('options')) {
      const taskEl = element.parentElement;
      const open = taskEl.classList.contains('options-open') ? true : false;
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


  optionsClick(options, taskEl, element, open) {
    // If optionsBtn
    if (options.querySelector('.optionsBtn').contains(element)) {
      if (open) {
        // Close options menu
        taskEl.classList.remove('options-open');
      }
      else {
        // Open options menu
        taskEl.classList.add('options-open');
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
      this.props.removeTask(taskEl);
    }
  }


  crossOff(el) {
    /* Removes completed task from list */
    el.classList.add('removed');

    window.setTimeout(() => {
      this.props.removeTask(el);
      el.classList.remove('removed');
    }, 1800);
  }


  render() {
    return (
      <CSSTransitionGroup transitionName="slideDown"
      transitionEnterTimeout={500}
      transitionLeaveTimeout={500}>
        <li data-note-id={this.props.entryID}
          onClick={this.handleClick}
          onKeyDown={this.taskKeydown}
          onKeyUp={this.taskKeyup} >
          <span className='task-content'>{this.props.entryBody}</span>
          <span className='options' onClick={this.handleClick}>
            <span className='editBtn'><i className='fas fa-pencil-alt'></i></span>
            <span className='deleteBtn'><i className='fas fa-trash'></i></span>
            <span className='optionsBtn'><i className='fas fa-ellipsis-v'></i></span>
          </span>
        </li>
      </CSSTransitionGroup>
    );
  }

}