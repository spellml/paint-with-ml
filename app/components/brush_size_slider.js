import React from 'react';
import { Component } from 'react';


class BrushSizeSlider extends Component {
    render() {
        return <div id="slider-container">
            <input type="range" id="start"
                name="brush_size" min="8" max="100" step="2"
                defaultValue={this.props.toolRadius * 2}
                onChange={e => this.props.onChange(e.target.value)}
            />
        </div>
    }
}

export default BrushSizeSlider;