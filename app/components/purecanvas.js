import React from 'react';
import { Component } from 'react';


class PureCanvas extends Component {
    shouldComponentUpdate() {
        return false;
    }

    render() {
        return (
            <canvas
                // See Canvas.render for a detailed explanation of what this line of code does.
                ref={ node => node ? this.props.contextRef(node.getContext('2d')) : null }
                width="512"
                height="512"
                onClick={this.props.onClick}
                onMouseDown={this.props.onMouseDown}
                onMouseUp={this.props.onMouseUp}
                onMouseMove={this.props.onMouseMove}
            />
        );
    }
}

export default PureCanvas;