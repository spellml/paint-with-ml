import React from 'react';
import { Component } from 'react';
import ToolboxLabelButton from './toolbox_label_button';
import ToolboxToolButton from './toolbox_tool_button';
import BrushSizeSlider from './brush_size_slider';


class Toolbox extends Component {
    // shouldComponentUpdate() {
    //     return false;
    // }

    render() {
        return (
            <div id='toolbox-container'>
                <div id='tool-buttons-container'>
                    <ToolboxToolButton
                            onClick={this.props.onToolButtonClick}
                            tool='pen'
                            toolImage='🖌️'
                        />
                    <ToolboxToolButton
                            onClick={this.props.onToolButtonClick}
                            tool='eraser'
                            toolImage='🚫'
                        />
                    <ToolboxToolButton
                            onClick={this.props.onToolButtonClick}
                            tool='bucket'
                            toolImage='🧺'
                        />
                    <ToolboxToolButton
                            onClick={this.props.onToolButtonClick}
                            tool='reset'
                            toolImage='🚽'
                        />
                </div>
                <div id='label-buttons-container'>
                    <ToolboxLabelButton
                        onClick={this.props.onLabelButtonClick}
                        classId={0}
                        classImage='☁️'
                    />
                    <ToolboxLabelButton
                        onClick={this.props.onLabelButtonClick}
                        classId={1}
                        classImage='🌳'
                    />
                    <ToolboxLabelButton
                        onClick={this.props.onLabelButtonClick}
                        classId={2}
                        classImage='🌱'
                    />
                    <ToolboxLabelButton
                        onClick={this.props.onLabelButtonClick}
                        classId={3}
                        classImage='🗿'
                    />
                    <ToolboxLabelButton
                        onClick={this.props.onLabelButtonClick}
                        classId={4}
                        classImage='⛰️'
                    />
                    <ToolboxLabelButton
                        onClick={this.props.onLabelButtonClick}
                        classId={5}
                        classImage='🌿'
                    />
                    <ToolboxLabelButton
                        onClick={this.props.onLabelButtonClick}
                        classId={6}
                        classImage='💧'
                    />
                    <ToolboxLabelButton
                        onClick={this.props.onLabelButtonClick}
                        classId={7}
                        classImage='🌊'
                    />
                    <ToolboxLabelButton
                        onClick={this.props.onLabelButtonClick}
                        classId={8}
                        classImage='💦'
                    />
                </div>
                <div id='brush-size-slider-container'>
                    <BrushSizeSlider
                        tool_radius={this.props.tool_radius}
                        onChange={this.props.onBrushSizeSliderChange}/>
                </div>
            </div>
        );
    }
}

export default Toolbox;