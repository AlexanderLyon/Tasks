import React from 'react';
import ReactDOM from 'react-dom';

export class ListView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};

    this.printLists = this.printLists.bind(this);
  }

  printLists() {
    if (this.props.database != null) {
      const tableNames = this.props.database.objectStoreNames;
      const lists = Object.keys(tableNames).map(i => {
        const name = tableNames[i].charAt(0).toUpperCase() + tableNames[i].substr(1);
        return <li>{name}</li>;
      });

      // 'Add a list' button
      lists.push(
        <li onClick={this.props.addNew}>
          <img src="images/plus.svg" alt="New list"/>
        </li>
      );

      return <ul>{lists}</ul>;
    }
  }

  render() {
    return (
      <div id="list-view">
        {this.printLists()}
      </div>
    );
  }

}
