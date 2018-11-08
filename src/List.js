import React from 'react';
import ReactDOM from 'react-dom';

export class List extends React.Component {

  render() {
    return (
      <div className="list">
        <h2>Incomplete</h2>
        <ul id="todo-list"></ul>
        <form id="add-task">
          <input type="text" name="task" autocomplete="off" placeholder="Add something to your list..."/>
          <button type="submit">Add</button>
        </form>
      </div>
    );
  }

}
