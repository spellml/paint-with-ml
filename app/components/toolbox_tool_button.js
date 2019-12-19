import React from 'react';
import { Component } from 'react';


class ToolboxToolButton extends Component {
    render() {
        return <button
            className='tool-selector' 
            onClick={this.props.onClick(this.props.tool)}
        >
            {this.props.toolImage}
        </button>
    }
}

export default ToolboxToolButton;