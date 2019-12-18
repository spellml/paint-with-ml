import React from 'react';
import { Component } from 'react';
import ToolboxButton from './toolbox_button';


class Toolbox extends Component {
    // shouldComponentUpdate() {
    //     return false;
    // }

    // TODO: convert below to using ToolboxButton.
    render() {
        return (
            <div id='buttons-container'>
                <ToolboxButton
                    onClick={this.props.onButtonClick}
                    classId={0}
                    classImage='☁️'
                />
                <ToolboxButton
                    onClick={this.props.onButtonClick}
                    classId={1}
                    classImage='🌳'
                />
                <ToolboxButton
                    onClick={this.props.onButtonClick}
                    classId={2}
                    classImage='🌱'
                />
                <ToolboxButton
                    onClick={this.props.onButtonClick}
                    classId={3}
                    classImage='🗿'
                />
                <ToolboxButton
                    onClick={this.props.onButtonClick}
                    classId={4}
                    classImage='⛰️'
                />
                <ToolboxButton
                    onClick={this.props.onButtonClick}
                    classId={5}
                    classImage='🌿'
                />
                <ToolboxButton
                    onClick={this.props.onButtonClick}
                    classId={6}
                    classImage='💧'
                />
                <ToolboxButton
                    onClick={this.props.onButtonClick}
                    classId={7}
                    classImage='🌊'
                />
                <ToolboxButton
                    onClick={this.props.onButtonClick}
                    classId={8}
                    classImage='💦'
                />
            </div>
        );
    }
}

export default Toolbox;