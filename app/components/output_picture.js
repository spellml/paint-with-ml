import React from 'react';
import { Component } from 'react';


class OutputPicture extends Component {
    render() {
        return <img
            src={this.props.output_picture}
            height={512}
            width={512}
        />
    }
}

export default OutputPicture;