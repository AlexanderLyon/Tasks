import React from 'react';
import ReactDOM from 'react-dom';

export class Menu extends React.Component {

  render() {
    return (
      <aside>
        <h2>Color theme</h2>
        <div id="colors">
          <div data-color="teal"></div>
          <div data-color="blue"></div>
          <div data-color="lavender"></div>
          <div data-color="blush"></div>
          <div data-color="grey"></div>
        </div>
      </aside>
    );
  }

}
