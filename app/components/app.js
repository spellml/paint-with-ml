import React from 'react';
import { Component } from 'react';
import Canvas from './canvas';
import Toolbox from './toolbox';
import FancyButton from './fancy_button';
import OutputPicture from './output_picture';
import DownloadButton from './download_button';
import TweetButton from './tweet_button';

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
        this.colorKey = {
            sky: [245, 216, 122, 255],
            grass: [210, 250, 255, 255],
            tree: [36, 207, 156, 255],
            plant: [236, 118, 142, 255],
            rock: [174, 162, 177, 255],
            mountain: [245, 147, 34, 255],
            river: [68, 202, 218, 255],
            lake: [176, 50, 235, 255],
            ocean: [138, 115, 227, 255],
            unset: [255, 255, 255, 255]
        }
        let segmap = this.getDefaultCanvas();
        this.state = {
            'segmap': segmap,
            'tool': 'brush',
            'toolRadius': 10,
            'toolValue': 'sky',
            // default output_picture is 512x512 empty
            'outputPicture': `
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
            'waiting': false,
            'showPlaceholderOutputImage': true
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
        this.onResetButtonClick = this.onResetButtonClick.bind(this);
    }

    onToolboxLabelButtonClick(toolValue) {
        return () => {
            let tool = this.state.tool === 'eraser' ? 'brush' : this.state.tool;
            this.setState(Object.assign({}, this.state, {'tool': tool, 'toolValue': toolValue}));
        }
    }

    onToolboxToolButtonClick(tool) {
        return () => {
            this.setState(Object.assign({}, this.state, {'tool': tool}));
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
                    Object.assign(
                        {}, this.state, {'outputPicture': png, 'waiting': false, 'showPlaceholderOutputImage': false}
                    )
                );
            })
            .catch(err => {
                // TODO: do something when an error occurs
                this.setState(Object.assign({}, this.state, {'waiting': false}));
                throw err;
            });
    }

    onBrushSizeSliderChange(v) {
        this.setState(Object.assign({}, this.state, {'toolRadius': v / 2}));
    }

    onResetButtonClick() {
        this.updateSegmentationMap(this.getDefaultCanvas());
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
        for (let x of [...Array(512).keys()]) {
            for (let y of [...Array(512).keys()]) {
                const color = y <= 256 ? this.colorKey['sky'] : this.colorKey['grass'];
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
                    Paint with Machine Learning
                </div>
                <div id='logo-container'>
                    <svg width="35" height="34" viewBox="0 0 35 34" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M11.8568 3.98763C11.8972 4.11414 11.9862 4.2194 12.1043 4.28017L29.2208 13.0903C29.3389 13.1511 29.4763 13.1624 29.6027 13.1217L29.8538 13.041C30.5147 12.829 31.0769 12.3513 31.3951 11.7331C31.7738 10.9973 31.7846 10.1143 31.4248 9.37078L31.1482 8.79865C29.9921 6.41137 28.2214 4.34331 26.0585 2.82156C25.7418 2.59873 25.7697 2.12099 26.1453 2.02683C26.7055 1.8864 27.2988 1.87685 27.8837 2.01344L28.1285 2.07079C28.3974 2.13377 28.6664 1.96692 28.7294 1.6981L28.8583 1.14818C28.9214 0.87924 28.7544 0.61013 28.4854 0.547197L28.2416 0.490145C26.7576 0.143085 25.2313 0.453084 24.01 1.31275C23.8545 1.42222 23.6528 1.44682 23.4792 1.36921C20.6737 0.115173 17.5122 -0.300403 14.4769 0.217704L13.8509 0.324342C13.0368 0.463597 12.3241 0.986177 11.9457 1.72134C11.6271 2.34024 11.5654 3.07463 11.7766 3.73636L11.8568 3.98763ZM28.1611 15.051C28.3305 15.1357 28.4375 15.3088 28.4375 15.4982V15.621C28.4375 18.8939 26.4335 21.1176 23.6057 21.9853C22.9081 22.1518 21.9786 22.2829 20.7811 22.2829C20.1193 22.2829 19.5241 22.2429 18.9958 22.1789C15.6325 21.3603 13.125 18.2821 13.125 14.621V8.34194C13.125 7.97025 13.5162 7.7285 13.8486 7.89473L28.1611 15.051ZM16.6261 22.6618C16.2733 22.7226 15.9111 22.7886 15.5372 22.859L11.9221 24.6586C7.43447 26.8925 6.83773 27.6281 6.83773 30.9241V33.1662H20.9187H35L34.8384 30.9022C34.574 27.2008 33.8584 26.4518 28.1459 23.9005L26.1128 22.9925C25.603 22.8473 25.1147 22.725 24.6424 22.6235L20.9517 29.7206C20.8784 29.8616 20.6778 29.8649 20.5999 29.7264L16.6261 22.6618ZM0.490617 16.0781C-0.678716 14.4051 0.361018 10.525 2.35398 9.12419C3.05617 8.63075 3.09142 8.6494 3.29154 9.62122C3.40579 10.1768 3.79165 10.953 4.14846 11.346C5.608 12.9539 5.94261 14.7634 5.02366 16.0781C4.60548 16.6766 4.20428 16.8055 2.75714 16.8055C1.31 16.8055 0.908796 16.6766 0.490617 16.0781ZM1.90479 32.4061C1.21892 29.8352 0.66037 19.507 1.17942 18.9871C1.2989 18.867 2.08988 18.7688 2.93669 18.7688C4.25749 18.7688 4.50429 18.8735 4.67339 19.505C4.97143 20.6205 4.91822 23.4964 4.52518 27.4648C3.99666 32.8053 3.854 33.3298 2.92918 33.3298C2.35137 33.3298 2.08792 33.0919 1.90479 32.4061Z" fill="white"/>
                    </svg>
                </div>
            </div>
            <div id='side-panel-frame'>
                <div id='toolbox-container'>
                    <Toolbox
                        id='toolbox'
                        onLabelButtonClick={this.onToolboxLabelButtonClick}
                        onToolButtonClick={this.onToolboxToolButtonClick}
                        activeTool={this.state.tool}
                        toolRadius={this.state.toolRadius}
                        toolValue={this.state.toolValue}
                        colorKey={this.colorKey}
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
                        toolRadius={this.state.toolRadius}
                        toolValue={this.state.toolValue}
                        segmap={this.state.segmap}
                        updateSegmentationMap={this.updateSegmentationMap}
                        colorKey={this.colorKey}
                        waiting={this.state.waiting}
                        ref={(canvas) => this.canvasRef = canvas}
                    />
                </div>
                <div id='canvas-actions-container'>
                    <FancyButton onClick={this.onResetButtonClick} visualType="unfilled" buttonFunction="reset" />
                    <FancyButton onClick={this.onBuildButtonClick} visualType="filled" buttonFunction="run" />
                </div>
                <div id='output-container'>
                    { this.state.showPlaceholderOutputImage ? 
                        <div id='placeholder-picture'/> : 
                        <OutputPicture outputPicture={this.state.outputPicture}/> 
                    }
                </div>
                <div id='output-actions-container'>
                    <DownloadButton
                        placeHolderImageActive={this.state.showPlaceholderOutputImage}
                        outputPicture={this.state.outputPicture}
                    />
                    <TweetButton/>
                </div>
                <div id='canvas-explainer-title-container'>
                    About the Model
                </div>
                <div id='output-explainer-title-container'>
                    About Spell
                </div>
                <div id='canvas-explainer-text-container' className='explainer-text-container'>
                    <p>
                        This app uses a version of the GauGAN deep learning model to transform an input segmentation masks into a landscape painting.
                    </p>
                    <p>
                        <a href="https://github.com/NVlabs/SPADE" style={{color: 'white'}}>GauGAN</a>, released in 2019, is the most powerful image-to-image translation algorithm currently known. This version of the model has been trained on the popular ADE20K dataset, then fine-tuned on a dataset of 250 paintings from Bob Ross's beloved PBS series, <a href="https://www.youtube.com/user/BobRossInc" style={{color: 'white'}}>"The Joy of Painting"</a>.
                    </p>
                    <p>
                        Choose from nine different semantic brushes to craft your painting. Then click on the "Run" button to generate a result!
                    </p>
                    <p>
                        The <a href="https://www.kaggle.com/residentmario/segmented-bob-ross-images" style={{color: 'white'}}>dataset</a> and <a href="https://github.com/ResidentMario/paint-with-ml" style={{color: 'white'}}>code</a> are publicly available. To learn more, check out our blog post: $LINK.
                    </p>
                </div>
                <div id='output-explainer-text-container' className='explainer-text-container'>
                    <p>
                        <a href="https://spell.ml/" style={{color: 'white'}}>Spell</a> is a powerful end-to-end machine learning model training and deployment platform. The model powering this application was trained in Spell runs and workspaces and then deployed into production using a Spell model server.
                    </p>
                    <p>
                        We provide an easy-to-use API for deploying your model server publicly or privately. And because we serve models using Kubernetes, the service automatically scales up and down based on demand.
                    </p>
                    <p>
                        $CTA
                    </p>
                </div>
            </div>
        </div>
    }

}

export default App;