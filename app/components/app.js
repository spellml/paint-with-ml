import React from 'react';
import { Component } from 'react';
import Canvas from './canvas';


class App extends Component {

    constructor() {
        super();

        // React wants to be the authority on all state and rendering, and to arbitrate when
        // a change in state requires a rerender. The Canvas API, used for the draw space, is
        // incompatible with this: all work is done by calling methods on the canvas object.
        //
        // React refs, used here, are the escape hatch specifically designed for cases like this.
        // cf. https://philna.sh/blog/2018/09/27/techniques-for-animating-on-the-canvas-in-react/
        this.canvasRef = React.createRef();
        this.state = {
            'tool': 'pen',
            'tool_radius': 10,
            'tool_value': 2
            // current tool (brush, bucket, eraser)
            // current brush size
            // 512x512 pixel state array
        }
    }

    render() {
        return <Canvas
            id="draw_space"
            width="512"
            height="512"
            tool={this.state.tool}
            tool_radius={this.state.tool_radius}
            tool_value={this.state.tool_value}
            ref={this.canvasRef}
        />
    }

}

export default App;