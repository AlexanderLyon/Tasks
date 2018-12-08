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
    this.titleKeydown = this.titleKeydown.bind(this);
    this.switchList = this.switchList.bind(this);
    this.deleteList = this.deleteList.bind(this);
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
    let newName = 'New List';

    request.onsuccess = (e) => {
      const db = e.target.result;
      this.setState({
        database: db,
        dbVersion: this.state.dbVersion+1,
        currentList: newName
      }, () => {
        console.log('New table created');
      });
    };

    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      let nameDecided = false;
      let count = 0;

      // Find a unique new name for list:
      do {
        if (count > 0) {
          name = 'New List ' + count;
        }
        else {
          name = 'New List';
        }
        if (!db.objectStoreNames.contains(name)) {
          newName = name;
          nameDecided = true;
          let objectStore = db.createObjectStore(name, {keyPath: 'id', autoIncrement: true});
          objectStore.createIndex('body', 'body', {unique: false});

          // Create 'lastUpdated' entry:
          let lastUpdatedData;
          if (localStorage.getItem('lastUpdated') != null) {
            lastUpdatedData = JSON.parse(localStorage.getItem('lastUpdated'));
          }
          else {
            lastUpdatedData = {};
          }
          lastUpdatedData[newName] = new Date();
          localStorage.setItem('lastUpdated', JSON.stringify(lastUpdatedData));
        }
        else {
          count++;
        }
      } while (nameDecided == false && count < 100);

    };
  }


  switchList(e) {
    this.setState({
      currentList: e.currentTarget.innerText
    });
  }


  deleteList() {
    let confirmation = confirm('Are you sure you want to delete list "' + this.state.currentList + '"?');

    if (confirmation) {
      this.state.database.close();
      let request = window.indexedDB.open('NotesData', this.state.dbVersion+1);

      request.onsuccess = (e) => {
        const db = e.target.result;
        this.setState({
          database: db,
          dbVersion: this.state.dbVersion+1,
          currentList: db.objectStoreNames[0]
        }, () => {
          console.log('List successfully deleted');
        });
      };

      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        db.deleteObjectStore(this.state.currentList);

        // Now delete 'lastUpdated' entry for this list:
        let lastUpdatedData = JSON.parse(localStorage.getItem('lastUpdated'));
        if (lastUpdatedData) {
          delete lastUpdatedData[this.state.currentList];
          localStorage.setItem('lastUpdated', JSON.stringify(lastUpdatedData));
        }
      };
    }

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
    const menuBtn = document.querySelector('#menuBtn');
    const menuOverlay = document.querySelector('#menu-overlay');
    if (menuBtn.classList.contains('open')) {
      // Close settings
      menuBtn.classList.remove('open');
      document.querySelector('main').style.right = '0px';
      document.querySelector('aside').style.marginRight = '-250px';
      document.querySelector('#menu-overlay').style.animation = 'fade-out 150ms linear';
      window.setTimeout(() => {
        // reset inline styles after animation
        menuOverlay.style.display = null;
        menuOverlay.style.animation = null;
      }, 150);
    }
    else {
      // Open settings
      menuBtn.classList.add('open');
      document.querySelector('main').style.right = '250px';
      document.querySelector('aside').style.margin = '0px';
      menuOverlay.style.display = 'block';
    }
  }


  titleKeydown(e) {
    if (e.keyCode === 13) {
      e.preventDefault();
      e.currentTarget.blur();
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
        dbVersion: this.state.dbVersion+1,
        currentList: newTitle
      });
    };

    request.onupgradeneeded = (e) => {
      const db = event.target.result;
      const transaction = event.target.transaction;
      transaction.objectStore(this.state.currentList).name = newTitle;

      // Update 'lastUpdated' property name:
      let lastUpdatedData = JSON.parse(localStorage.getItem('lastUpdated'));
      const oldData = lastUpdatedData[this.state.currentList];
      delete lastUpdatedData[this.state.currentList];
      lastUpdatedData[newTitle] = oldData;
      localStorage.setItem('lastUpdated', JSON.stringify(lastUpdatedData));
    };

  }


  updateTaskCount(val) {
    this.setState({
      taskCount: val
    });
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
          <h1 contentEditable id="list-title"
            onKeyDown={this.titleKeydown}
            onBlur={this.updateListName}>
              {this.state.currentList}
          </h1>
          <p id="task-count">{this.state.taskCount}</p>
          <div id="controls">
            <button id="menuBtn" onClick={this.menuBtnClick}></button>
          </div>
        </header>

        <section id="content">
          <ListView database={this.state.database}
            colorTheme={colorTheme}
            currentList={this.state.currentList}
            addNew={this.addNewList}
            switchList={this.switchList}
          />
          { this.state.database &&
            <List
              addNewList={this.addNewList}
              updateTaskCount={this.updateTaskCount}
              colorTheme={this.state.colorTheme}
              listTitle={this.state.currentList}
              database={this.state.database}
            />
          }
        </section>

        <Menu colorTheme={this.state.colorTheme}
          deleteList={this.deleteList}
          setTheme={this.setTheme}
          closeMenu={this.menuBtnClick}
        />
      </div>
    );
  }

}


ReactDOM.render(<App/>, document.getElementById('app'));
