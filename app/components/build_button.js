import React from 'react';
import { Component } from 'react';


class BuildButton extends Component {
    render() {
        return <button className='build-button' onClick={this.props.onClick}>➡️</button>
    }
}

export default BuildButton;