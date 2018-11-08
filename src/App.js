import React from 'react';
import ReactDOM from 'react-dom';
import { Menu } from './Menu';
import { List } from './List';

export class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      taskCount: 0
    };
  }

  render() {
    return (
      <div>
        <header>
          <h1 contenteditable id="list-title">To-Do List</h1>
          <p id="task-count">{this.state.taskCount}</p>
          <div id="controls">
            <button id="menuBtn"><i className="fas fa-cog"></i></button>
            <button id="undoBtn"><i className="fas fa-undo-alt"></i> Undo</button>
          </div>
        </header>

        <section id="content">
          <List/>
        </section>

        <Menu/>
      </div>
    );
  }

}


ReactDOM.render(<App/>, document.getElementById('app'));
