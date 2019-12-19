import React from 'react';
import { Component } from 'react';


class ToolboxLabelButton extends Component {
    render() {
        return <button
            className='class-selector'
            onClick={this.props.onClick(this.props.classId)}
        >
            {this.props.classImage}
        </button>
    }
}

export default ToolboxLabelButton;