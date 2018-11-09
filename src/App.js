import React from 'react';
import ReactDOM from 'react-dom';
import { Menu } from './Menu';
import { List } from './List';

export class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      database: null,
      taskCount: 0,
      colorTheme: 'teal'
    };

    this.loadDatabase = this.loadDatabase.bind(this);
    this.setTheme = this.setTheme.bind(this);
  }

  loadDatabase() {
    let request = window.indexedDB.open('notes', 1);

    request.onerror = () => {
      console.error('Database failed to open');
    };

    request.onsuccess = () => {
      this.setState({ database: request.result }, () => {
        console.log('Database loaded successfully');
      });
    };

    request.onupgradeneeded = (e) => {
      this.setState({ database: request.result });
      let objectStore = this.state.database.createObjectStore('notes', {keyPath: 'id', autoIncrement: true});
      objectStore.createIndex('body', 'body', {unique: false});
    };

  }

  setTheme(color) {
    color = color.toLowerCase();
    localStorage.setItem('colorTheme', color);

    const elements = [
      document.querySelector('body'),
      document.querySelector('header'),
      document.querySelector('aside'),
      //document.querySelectorAll('.list h2')
    ];

    elements.forEach((el) => {
      if (el.length > 0) {
        el.forEach((child) => {
          if (child.classList.length) {
            child.className = child.className.replace(/^theme-.*/g, 'theme-' + color);
          }
          else {
            child.classList.add('theme-' + color);
          }
        });
      }
      else {
        if (el.classList.length) {
          el.className = el.className.replace(/^theme-.*/g, 'theme-' + color);
        }
        else {
          el.classList.add('theme-' + color);
        }
      }
    });
  }

  menuBtnClick(e) {
    if (e.target.classList.contains('open')) {
      // Close settings
      document.querySelector('main').style.right = '0px';
      document.querySelector('aside').style.marginRight = '-250px';
      e.target.classList.remove('open');
    }
    else {
      // Open settings
      document.querySelector('main').style.right = '250px';
      document.querySelector('aside').style.margin = '0px';
      e.target.classList.add('open');
    }
  }


  componentDidMount() {
    this.loadDatabase();

    // Settings
    this.setState({
      colorTheme: localStorage.getItem('colorTheme') ? localStorage.getItem('colorTheme') : 'teal',
      listTitle: localStorage.getItem('listTitle') ? localStorage.getItem('listTitle') : 'To Do List'
    }, () => {
      // Set color theme:
      this.setTheme(this.state.colorTheme);
    });
  }

  render() {
    return (
      <div>
        <header>
          <h1 contentEditable id="list-title">To-Do List</h1>
          <p id="task-count">{this.state.taskCount}</p>
          <div id="controls">
            <button id="menuBtn" onClick={this.menuBtnClick}><i className="fas fa-cog"></i></button>
            <button id="undoBtn"><i className="fas fa-undo-alt"></i> Undo</button>
          </div>
        </header>

        <section id="content">
          { this.state.database &&
            <List title={this.state.listTitle} database={this.state.database}/>
          }
        </section>

        <Menu setTheme={this.setTheme}/>
      </div>
    );
  }

}


ReactDOM.render(<App/>, document.getElementById('app'));
