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
    const colorTheme = 'theme-' + this.props.colorTheme;

    return (
      <aside id="menu" className={colorTheme}>
      <div id="menu-overlay" onClick={this.props.closeMenu}></div>
        <h2>Color theme</h2>
        <div id="colors">
          <div onClick={this.handleColorClick} data-color="teal"></div>
          <div onClick={this.handleColorClick} data-color="blue"></div>
          <div onClick={this.handleColorClick} data-color="lavender"></div>
          <div onClick={this.handleColorClick} data-color="blush"></div>
          <div onClick={this.handleColorClick} data-color="grey"></div>
        </div>
        <div id="settings">
          <button id="backup-btn" onClick={this.props.toggleBackup}>
            {!this.props.syncing &&
              <span><i className="fas fa-cloud"></i> Back Up Lists</span>
            }
            {this.props.syncing &&
              <span><i className="fas fa-cloud"></i> Disable Syncing</span>
            }
          </button>
          <button id="delete-list" onClick={this.props.deleteList}>
            <i className="fas fa-trash"></i> Delete this list
          </button>
        </div>
      </aside>
    );
  }

}
