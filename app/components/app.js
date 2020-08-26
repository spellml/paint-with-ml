import React from 'react';
import { Component } from 'react';
import Canvas from './canvas';
import Toolbox from './toolbox';
import BuildButton from './build_button';
import OutputPicture from './output_picture';
import rp from 'request-promise-native';


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
            // default output_picture is 512x512 empty
            'output_picture': `
                data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAYAAAD0eNT6AAAABHNCSVQICAgIf
                AhkiAAAAAlwSFlzAAAOxAAADsQBlSsOGwAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoA
                AAQPSURBVHic7cExAQAAAMKg9U9tB2+gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
                AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
                AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
                AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
                AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
                AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
                AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
                AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
                AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
                AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
                AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
                AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
                AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
                AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
                AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
                AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
                AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgNwLwAAHZZ/GIAAAAAElFTkS
                uQmCC
            `,
            'waiting': false  // TODO
        }

        // These event handlers are passed down to and actually called within the child components,
        // at which point 'this' is a reference to that child component class object. To retain
        // a reference to the App component object instead, so that we can update the state of
        // the App object as necessary, we bind the 'this' references to the App object here.
        this.onToolboxLabelButtonClick = this.onToolboxLabelButtonClick.bind(this);
        this.onToolboxToolButtonClick = this.onToolboxToolButtonClick.bind(this);
        this.onBrushSizeSliderChange = this.onBrushSizeSliderChange.bind(this);
        this.updateSegmentationMap = this.updateSegmentationMap.bind(this);
        this.onBuildButtonClick = this.onBuildButtonClick.bind(this);
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
        // model computations are expensive, so only allow one at a time
        if (this.state.waiting) { return; }

        // the /predict endpoint is a proxy service for the request
        this.setState(Object.assign({}, this.state, {'waiting': true}));
        let opts = {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            uri: `${window.location.href}predict`,
            json: true,
            body: {'segmap': this.canvasRef.canvas.toDataURL()}
        }
        rp(opts)
            .then(png => {
                this.setState(
                    Object.assign({}, this.state, {'output_picture': png, 'waiting': false})
                );
            })
            .catch(err => {
                // TODO: do something when an error occurs
                this.setState(Object.assign({}, this.state, {'waiting': false}));
                throw err;
            });
    }

    onBrushSizeSliderChange(v) {
        this.setState(Object.assign({}, this.state, {'tool_radius': v / 2}));
    }

    updateSegmentationMap(segmap) {
        // React state updates are asynchronous, which means they return immediately,
        // which means that any code updating the canvas that uses object props or state
        // run immediately after a state update will use stale state values. To perform
        // the repaint correctly---update state first, and then immediately repaint---
        // we have to apply the repaint as a callback on the state update.
        this.setState(Object.assign({}, this.state, {'segmap': segmap}), () => {
            this.canvasRef.ctx.putImageData(new ImageData(segmap, 512, 512), 0, 0);
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
        let classname = (this.state.waiting) ? 'app waiting' : 'app';
        return <div id='app'>
            <div id='title-frame'>
                <div id='title-text-container'>
                    Paint like Bob Ross
                </div>
                <div id='bob-container'>
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M17.3859 0.148947C14.0392 0.623126 11.0405 2.86119 9.47119 6.05689C8.60415 7.82197 8.49133 8.33324 8.50118 10.4537C8.51491 13.4185 9.50641 15.8534 11.4978 17.8123C12.2239 18.5264 12.82 19.3183 12.8227 19.572C12.8254 19.8257 13.1378 20.5718 13.5166 21.23L14.2055 22.4267L10.9002 24.0721C6.79723 26.1145 6.25164 26.787 6.25164 29.8005V31.8504H19.1257H32L31.8523 29.7805C31.6105 26.3963 30.9563 25.7115 25.7334 23.3789L23.8746 22.5487L24.4649 21.4451C24.7894 20.8381 25.055 20.1725 25.055 19.966C25.055 19.7599 25.7024 18.8744 26.4933 17.9987C28.8124 15.4319 29.3828 13.9737 29.3828 10.6096C29.3828 8.17139 29.2726 7.53357 28.6076 6.1221C27.6505 4.09076 25.8352 2.18836 23.9295 1.22056C22.6535 0.572567 21.8805 0.360757 19.5334 0.0167156C19.2051 -0.0314502 18.2386 0.028084 17.3859 0.148947ZM21.1881 9.11616C23.3779 9.5326 23.8611 10.0445 23.8611 11.949C23.8611 12.7992 23.6501 14.1155 23.3922 14.8745L22.9231 16.2543L21.557 15.5261C19.8354 14.6086 18.3765 14.6032 16.5935 15.5082C15.824 15.8986 15.1325 16.1179 15.057 15.9955C14.7722 15.5339 14.0118 12.2463 14.0118 11.4775C14.0118 9.35699 17.1036 8.33982 21.1881 9.11616ZM2.15221 9.86916C0.330074 11.1499 -0.620541 14.6974 0.448564 16.227C0.830899 16.7742 1.19771 16.8921 2.52081 16.8921C3.84391 16.8921 4.21073 16.7742 4.59306 16.227C5.43325 15.025 5.12732 13.3706 3.79288 11.9005C3.46665 11.5412 3.11387 10.8316 3.0094 10.3236C2.82644 9.43507 2.79421 9.41802 2.15221 9.86916ZM20.7448 17.6176C21.3036 18.0289 21.2943 18.0556 20.484 18.3655C19.3564 18.7969 18.1998 18.7547 17.2949 18.2488L16.5487 17.8315L17.2949 17.5302C18.3926 17.0875 20.0823 17.1302 20.7448 17.6176ZM1.07833 18.8866C0.603767 19.362 1.11444 28.8049 1.74152 31.1555C1.90896 31.7825 2.14982 32 2.67811 32C3.52366 32 3.65409 31.5204 4.13731 26.6377C4.49666 23.0094 4.54531 20.3801 4.27281 19.3602C4.1182 18.7828 3.89256 18.6871 2.68497 18.6871C1.91075 18.6871 1.18757 18.7768 1.07833 18.8866ZM20.8765 24.6594C20.8765 24.9118 20.5858 25.6975 19.323 28.8588C18.9809 29.715 19.126 29.9453 17.7712 26.3906L17.0015 24.3713H18.9391C20.0047 24.3713 20.8765 24.5008 20.8765 24.6594Z" fill="white"/>
                    </svg>
                </div>
            </div>
            <div id='side-panel-frame'>
                <div id='toolbox-container'>
                    <Toolbox
                        id='toolbox'
                        onLabelButtonClick={this.onToolboxLabelButtonClick}
                        onToolButtonClick={this.onToolboxToolButtonClick}
                        tool_radius={this.state.tool_radius}
                        waiting={this.state.waiting}
                        onBrushSizeSliderChange={this.onBrushSizeSliderChange}
                    />
                </div>
            </div>
            <div id='interior-frame' className={classname}>
                <div className='picture-header' id='canvas-header'>INPUT</div>
                <div className='picture-header' id='output-header'>OUTPUT</div>
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
                        waiting={this.state.waiting}
                        ref={(canvas) => this.canvasRef = canvas}
                    />
                </div>
                <div id='canvas-actions-container'>
                    <BuildButton
                        onClick={this.onBuildButtonClick}
                    />
                </div>
                <div id='output-container'>
                    <OutputPicture output_picture={this.state.output_picture}/>
                </div>
                <div id='output-actions-container'>
                    OUTPUT ACTIONS
                </div>
                <div id='canvas-explainer-title-container'>
                    CANVAS EXPLAINER TITLE
                </div>
                <div id='output-explainer-title-container'>
                    OUTPUT EXPLAINER TITLE
                </div>
                <div id='canvas-explainer-text-container' className='explainer-text-container'>
                    Canvas explainer text goes here
                </div>
                <div id='output-explainer-text-container' className='explainer-text-container'>
                    Output explainer text goes here
                </div>
            </div>
        </div>
    }

}

export default App;