import React from 'react';
import { Component } from 'react';


class OutputPicture extends Component {
    render() {
        return <img
            src={this.props.outputPicture}
            height={512}
            width={512}
        />
    }
}

export default OutputPicture;