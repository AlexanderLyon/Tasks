import React from 'react';
import ReactDOM from 'react-dom';
import { Menu } from './Menu';
import { ListView } from './ListView';
import { List } from './List';

export class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      database: null,
      listTitle: "To-Do List",
      taskCount: 0,
      colorTheme: 'teal'
    };

    this.loadDatabase = this.loadDatabase.bind(this);
    this.updateTaskCount = this.updateTaskCount.bind(this);
    this.updateListName = this.updateListName.bind(this);
    this.setTheme = this.setTheme.bind(this);
    this.addNewList = this.addNewList.bind(this);
  }

  loadDatabase() {
    let request = window.indexedDB.open('NotesData', 1);

    request.onerror = () => {
      console.error('Database failed to open');
    };

    request.onsuccess = () => {
      this.setState({ database: request.result }, () => {
        console.log('Database loaded successfully');
      });
    };

    request.onupgradeneeded = (e) => {
      let db = e.target.result;

      if (!db.objectStoreNames.contains('notes')) {
        let objectStore = db.createObjectStore('notes', {keyPath: 'id', autoIncrement: true});
        objectStore.createIndex('body', 'body', {unique: false});
      }

      setTimeout(() => {
        this.setState({ database: db }, () => {
          console.log('Database created');
        });
      }, 3000);

    };
  }


  addNewList() {
    let request = window.indexedDB.open('NotesData', 1);

    request.onsuccess = (event) => {
      let db = request.result;

      request.onupgradeneeded = (e) => {
        if (!db.objectStoreNames.contains('New List')) {
          let objectStore = db.createObjectStore('New List', {keyPath: 'id', autoIncrement: true});
          objectStore.createIndex('body', 'body', {unique: false});
        }
        else {
          console.error('List with that name already exists');
        }

        setTimeout(() => {
          this.setState({ database: db }, () => {
            console.log('New table created');
          });
        }, 3000);
      }
    };
  }


  setTheme(color) {
    color = color.toLowerCase();
    localStorage.setItem('colorTheme', color);

    const body = document.querySelector('body');

    if (body.classList.length) {
      body.className = body.className.replace(/^theme-.*/g, 'theme-' + color);
    }
    else {
      body.classList.add('theme-' + color);
    }

    this.setState({colorTheme: color});
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


  updateListName(e) {
    if (e.target.innerText.trim().length > 0) {
      const newTitle = e.target.innerText.charAt(0).toUpperCase() + e.target.innerText.substr(1);
      localStorage.setItem('listTitle', newTitle);
    }
    else {
      // Empty field
      localStorage.setItem('listTitle', 'New List');
    }
  }


  updateTaskCount(val) {
    this.setState({
      taskCount: val
    });
  }


  componentWillMount() {
    // Initial load, select first list
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
    const colorTheme = 'theme-' + this.state.colorTheme;

    return (
      <div>
        <div id="buffer" className={colorTheme}></div>
        <header className={colorTheme}>
          <h1 contentEditable id="list-title" onKeyUp={this.updateListName}>{this.state.listTitle}</h1>
          <p id="task-count">{this.state.taskCount}</p>
          <div id="controls">
            <button id="menuBtn" onClick={this.menuBtnClick}>
              <img src="images/menuIcon.svg" alt=""/>
            </button>
          </div>
        </header>

        <section id="content">
          <ListView database={this.state.database} addNew={this.addNewList}/>
          { this.state.database &&
            <List
              updateTaskCount={this.updateTaskCount}
              colorTheme={this.state.colorTheme}
              listTitle={'New List'}
              database={this.state.database}
            />
          }
        </section>

        <Menu colorTheme={this.state.colorTheme} setTheme={this.setTheme}/>
      </div>
    );
  }

}


ReactDOM.render(<App/>, document.getElementById('app'));
