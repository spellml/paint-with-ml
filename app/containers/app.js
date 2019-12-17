import React from 'react';
import { Component } from 'react';


class App extends Component {

    constructor() {
        super();

        // React wants to be the authority on all state and rendering, and to arbitrate when
        // a change in state requires a rerender. The Canvas API, unlike the SVG API, is
        // incompatible with this: all work is done by calling methods on the canvas object.
        //
        // React refs, as here, is the escape hatch specifically designed for cases like this.
        // cf. https://philna.sh/blog/2018/09/27/techniques-for-animating-on-the-canvas-in-react/
        this.canvasRef = React.createRef();
        this.state = {
            // current tool (brush, bucket, eraser)
            // current brush size
            // 512x512 pixel state array
        }
    }

    componentDidMount(){
        document.addEventListener("mousedown", (event) => {
            x = event.layerX;
            y = event.layerY;
            console.log(event.layerX);
            console.log(event.layerY);
        }, false);
    }

    render() {
        return <canvas id="draw_space" width="512" height="512" ref={this.canvasRef}></canvas>
    }

}

export default App;