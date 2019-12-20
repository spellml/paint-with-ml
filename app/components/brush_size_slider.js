import React from 'react';
import { Component } from 'react';


class BrushSizeSlider extends Component {
    render() {
        return <div>
            <input type="range" id="start"
                name="brush_size" min="8" max="100"
                defaultValue={this.props.tool_radius * 2}
                onChange={e => this.props.onChange(e.target.value)}
            />
            <label htmlFor="brush_size">Brush Size</label>
        </div>
    }
}

export default BrushSizeSlider;