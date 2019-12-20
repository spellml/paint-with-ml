import React from 'react';
import { Component } from 'react';
import Canvas from './canvas';
import Toolbox from './toolbox';
import BuildButton from './build_button';
import OutputPicture from './output_picture';


class App extends Component {

    constructor() {
        super();

        // React wants to be the authority on all state and rendering, and to arbitrate when
        // a change in state requires a rerender. The Canvas API, used for the draw space, is
        // incompatible with this: all work is done by calling methods on the canvas object.
        //
        // React refs, used here, are the escape hatch specifically designed for cases like this.
        // cf. https://philna.sh/blog/2018/09/27/techniques-for-animating-on-the-canvas-in-react/
        //
        // Note: this code attaches a reference to the canvas object in the frame object using
        // the following code:
        //
        //     ref={this.canvasRef}
        //
        // I found that this works...only some of the time? App needs a reference to the
        // Canvas.ctx property in order to be able to reset the canvas to the default value when
        // the reset button is clicked, but at that time this value is set to null. The following
        // code works as expected:
        //
        //     ref={(canvas) => this.canvasRef = canvas}
        //
        // I am not sure whether or not this is an error in the original blog post.
        this.color_key = {
            0: [241, 159, 240, 255],
            1: [154, 153,  64, 255],
            2: [255, 253,  57, 255],
            3: [50, 0, 50, 255],
            4: [249,  40,  55, 255],
            5: [50, 0, 0, 255],
            6: [45, 255, 254, 255],
            7: [62, 110, 122, 255],
            8: [0, 50, 50, 255],
            9: [255, 255, 255, 255],  // unset
        }
        this.color_key_r = {};
        Object.keys(this.color_key).forEach(v => this.color_key_r[this.color_key[v]] = v);

        // this.label_key = {
        //     0: 'sky',
        //     1: 'tree',
        //     2: 'grass',
        //     3: 'earth',
        //     4: 'mountain',
        //     5: 'plant',
        //     6: 'water',
        //     7: 'sea',
        //     8: 'river'
        // }
        let segmap = this.getDefaultCanvas();
        this.state = {
            'segmap': segmap,
            'tool': 'pen',
            'tool_radius': 10,
            'tool_value': 2,
            'data_url': null,
            'waiting': false
        }

        // These event handlers are passed down to and actually called within the child components,
        // at which point 'this' is a reference to that child component class object. To retain
        // a reference to the App component object instead, so that we can update the state of
        // the App object as necessary, we bind the 'this' references to the App object here.
        this.onToolboxLabelButtonClick = this.onToolboxLabelButtonClick.bind(this);
        this.onToolboxToolButtonClick = this.onToolboxToolButtonClick.bind(this);
        this.onBrushSizeSliderChange = this.onBrushSizeSliderChange.bind(this);
        this.updateSegmentationMap = this.updateSegmentationMap.bind(this);
    }

    onToolboxLabelButtonClick(n) {
        return () => {
            let tool = this.state.tool === 'eraser' ? 'pen' : this.state.tool;
            this.setState(Object.assign({}, this.state, {'tool': tool, 'tool_value': n}));
        }
    }

    onToolboxToolButtonClick(t) {
        return () => {
            if (t === 'reset') {
                this.updateSegmentationMap(this.getDefaultCanvas());
            } else {
                this.setState(Object.assign({}, this.state, {'tool': t}));
            }
        }
    }

    onBuildButtonClick() {
        // TODO: implement this logic.
        console.log('Clicked!');
    }

    onBrushSizeSliderChange(v) {
        this.setState(Object.assign({}, this.state, {'tool_radius': v / 2}));
    }

    canvasToDataURL() {
        let rle = [];
        let curr_n = 1;
        let i = 4;
        let curr_v = this.color_key_r[this.state.segmap.slice(0, 4).join()];
        
        while (i < this.state.segmap.length) {
            let next_v = this.color_key_r[this.state.segmap.slice(i, i + 4).join()];
            if (next_v === curr_v) {
                curr_n += 1;
            } else {
                rle.push(`${curr_v}r${curr_n}`);
                curr_n = 0;
            }
            curr_v = next_v;
            i += 4;
        }

        if (curr_n > 0) {
            rle.push(`${curr_v}r${curr_n}`);
        }
        rle = rle.join();
        return rle;
        // return btoa(rle);
    }

    updateSegmentationMap(segmap) {
        // React state updates are asynchronous, which means they return immediately,
        // which means that any code updating the canvas that uses object props or state
        // run immediately after a state update will use stale state values. To perform
        // the repaint correctly---update state first, and then immediately repaint---
        // we have to apply the repaint as a callback on the state update.
        this.setState(Object.assign({}, this.state, {'segmap': segmap}), () => {
            this.canvasRef.ctx.putImageData(new ImageData(segmap, 512, 512), 0, 0);
            this.setState(Object.assign({}, this.state, {'data_url': url}));
        });
    }

    getDefaultCanvas() {
        let segmap = new Uint8ClampedArray(512 * 512 * 4);
        let default_skybox_top_color = this.color_key[0];
        let default_skybox_bottom_color = this.color_key[2];
        for (let x of [...Array(512).keys()]) {
            for (let y of [...Array(512).keys()]) {
                const color = y <= 256 ? default_skybox_top_color : default_skybox_bottom_color;
                const pos = (y * 512 * 4) + (x * 4);
                segmap[pos] = color[0];
                segmap[pos + 1] = color[1];
                segmap[pos + 2] = color[2];
                segmap[pos + 3] = color[3];
            }
        }
        return segmap;
    }

    render() {
        return <div id='frame'>
            <div id='canvas-container'>
                <Canvas
                    id='canvas'
                    width="512"
                    height="512"
                    tool={this.state.tool}
                    tool_radius={this.state.tool_radius}
                    tool_value={this.state.tool_value}
                    segmap={this.state.segmap}
                    updateSegmentationMap={this.updateSegmentationMap}
                    color_key={this.color_key}
                    ref={(canvas) => this.canvasRef = canvas}
                />
            </div>
            <div id='build-button-container'>
                <BuildButton
                    onClick={this.onBuildButtonClick}
                />
            </div>
            <div id='output-container'>
                <OutputPicture/>
            </div>
            <div id='toolbox-container'>
                <Toolbox
                    id='toolbox'
                    onLabelButtonClick={this.onToolboxLabelButtonClick}
                    onToolButtonClick={this.onToolboxToolButtonClick}
                    tool_radius={this.state.tool_radius}
                    onBrushSizeSliderChange={this.onBrushSizeSliderChange}
                />
            </div>
            <div id='spacer'/>
            <div id='socal-sharer-container'>social_shrarer</div>
        </div>
    }

}

export default App;