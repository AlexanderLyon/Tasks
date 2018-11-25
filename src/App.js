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
      dbVersion: null,
      currentList: null,
      taskCount: 0,
      colorTheme: 'teal'
    };

    this.loadDatabase = this.loadDatabase.bind(this);
    this.updateTaskCount = this.updateTaskCount.bind(this);
    this.updateListName = this.updateListName.bind(this);
    this.switchList = this.switchList.bind(this);
    this.setTheme = this.setTheme.bind(this);
    this.addNewList = this.addNewList.bind(this);
  }


  loadDatabase() {
    let request = window.indexedDB.open('NotesData');

    request.onerror = () => {
      console.error('Database failed to open');
    };

    request.onsuccess = () => {
      this.setState({
        database: request.result,
        dbVersion: request.result.version,
        currentList: request.result.objectStoreNames[0]
      }, () => {
        console.log('Database loaded successfully');
      });
    };

    request.onupgradeneeded = (e) => {
      let db = e.target.result;

      if (!db.objectStoreNames.contains('New List')) {
        let objectStore = db.createObjectStore('New List', {keyPath: 'id', autoIncrement: true});
        objectStore.createIndex('body', 'body', {unique: false});
      }

      setTimeout(() => {
        this.setState({
          database: db,
          dbVersion: db.version,
          currentList: db.objectStoreNames[0]
        }, () => {
          console.log('Database created');
        });
      }, 3000);

    };
  }


  addNewList() {
    this.state.database.close();
    let request = window.indexedDB.open('NotesData', this.state.dbVersion+1);

    request.onsuccess = (e) => {
      const db = e.target.result;
      this.setState({
        database: db,
        dbVersion: this.state.dbVersion+1,
        currentList: 'New List'
      }, () => {
        console.log('New table created');
      });
    };

    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('New List')) {
        let objectStore = db.createObjectStore('New List', {keyPath: 'id', autoIncrement: true});
        objectStore.createIndex('body', 'body', {unique: false});
      }
      else {
        console.error('List with that name already exists');
      }
    };
  }


  switchList(e) {
    this.setState({
      currentList: e.currentTarget.innerText
    });
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
    let newTitle;
    if (e.target.innerText.trim().length > 0) {
      newTitle = e.target.innerText.charAt(0).toUpperCase() + e.target.innerText.substr(1);
    }
    else {
      // Empty field
      newTitle = 'New List';
    }

    // Rename object store in database
    this.state.database.close();
    let request = window.indexedDB.open('NotesData', this.state.dbVersion+1);

    request.onsuccess = (event) => {
      const db = event.target.result;
      this.setState({
        database: db,
        dbVersion: this.state.dbVersion+1
      });
    };

    request.onupgradeneeded = (e) => {
      const db = event.target.result;
      const transaction = event.target.transaction;
      transaction.objectStore(this.state.currentList).name = newTitle;
    };

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
      colorTheme: localStorage.getItem('colorTheme') ? localStorage.getItem('colorTheme') : 'teal'
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
          <h1 contentEditable id="list-title" onBlur={this.updateListName}>{this.state.currentList}</h1>
          <p id="task-count">{this.state.taskCount}</p>
          <div id="controls">
            <button id="menuBtn" onClick={this.menuBtnClick}>
              <img src="images/menuIcon.svg" alt=""/>
            </button>
          </div>
        </header>

        <section id="content">
          <ListView database={this.state.database} addNew={this.addNewList} switchList={this.switchList}/>
          { this.state.database &&
            <List
              updateTaskCount={this.updateTaskCount}
              colorTheme={this.state.colorTheme}
              listTitle={this.state.currentList}
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
