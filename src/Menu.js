import React from 'react';
import ReactDOM from 'react-dom';

export class Menu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};

    this.handleColorClick = this.handleColorClick.bind(this);
  }

  handleColorClick(e) {
    const color = e.target.getAttribute('data-color');
    this.props.setTheme(color);
  }

  render() {
    return (
      <aside id="menu">
        <h2>Color theme</h2>
        <div id="colors">
          <div onClick={this.handleColorClick} data-color="teal"></div>
          <div onClick={this.handleColorClick} data-color="blue"></div>
          <div onClick={this.handleColorClick} data-color="lavender"></div>
          <div onClick={this.handleColorClick} data-color="blush"></div>
          <div onClick={this.handleColorClick} data-color="grey"></div>
        </div>
      </aside>
    );
  }

}
