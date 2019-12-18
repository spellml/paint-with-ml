import React from 'react';
import { Component } from 'react';
import PureCanvas from './purecanvas';


class Canvas extends Component {
    constructor(props) {
        super(props);

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
        this.state = {'segmap': segmap};

        // TODO: recall (and write here) why this bind operation is necessary.
        this.saveContext = this.saveContext.bind(this);
        this.onClick = this.onClick.bind(this);
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
    }
    
    saveContext(ctx) {
        this.ctx = ctx;
        this.width = this.ctx.canvas.width;
        this.height = this.ctx.canvas.height;
    }

    penMatrix(cx, cy, r, v) {
        let segmap = this.state.segmap.slice();
        let [xmin, xmax] = [Math.max(0, cx - r), Math.min(512, cx + r)];
        let [ymin, ymax] = [Math.max(0, cy - r), Math.min(512, cy + r)];
        let color = this.color_key[v];

        for (let x of [...Array(xmax - xmin).keys()].map(v => v + xmin)) {
            for (let y of [...Array(ymax - ymin).keys()].map(v => v + ymin)) {
                if (Math.abs(cx - x) + Math.abs(cy - y) <= r + 5) {
                    const pos = (y * 512 * 4) + (x * 4);
                    segmap[pos] = color[0];
                    segmap[pos + 1] = color[1];
                    segmap[pos + 2] = color[2];
                    segmap[pos + 3] = color[3];
                }
            }
        }
        return segmap;
    }

    // segmentationMapToArray(segmap) {
    //     let out = new Uint8ClampedArray(512 * 512 * 4);
    //     for (let x of [...Array(512).keys()]) {
    //         for (let y of [...Array(512).keys()]) {
    //             const pos = (x * 512 * 4) + (y * 4);
    //             const color = this.color_key[segmap[x][y]];
    //             out[pos] = color[0];
    //             out[pos + 1] = color[1];
    //             out[pos + 2] = color[2];
    //             out[pos + 3] = color[3];
    //         }
    //     }
    //     return out;
    // }

    paint(e) {
        let x = e.pageX - e.target.offsetLeft;
        let y = e.pageY - e.target.offsetTop;

        if (this.props.tool === 'pen') {
            // TODO
            let segmap = this.penMatrix(x, y, this.props.tool_radius, this.props.tool_value);
            this.setState(
                Object.assign({}, this.state, {'segmap': segmap})
            );
            let img = new ImageData(this.state.segmap, 512, 512);
            this.ctx.putImageData(img, 0, 0);
        } else if (this.props.tool === 'eraser') {
            let segmap = this.penMatrix(x, y, this.props.tool_radius, 9);
            this.setState(Object.assign({}, this.state, {'segmap': segmap}));
            let img = new ImageData(this.state.segmap, 512, 512);
            this.ctx.putImageData(img, 0, 0);
            // TODO
        } else if (this.props.tool === 'bucket') {
            // TODO
        }
    }

    onMouseDown() {
        this.mouse_down = true;
    }

    onMouseUp() {
        this.mouse_down = false;
    }

    onMouseMove(e) {
        if (this.mouse_down) {
            this.paint(e);
        }
    }

    onClick(e) {
        // TODO
        // this.paint(e);
    }

    componentDidMount(){
        const img = new ImageData(this.state.segmap, 512, 512);
        this.ctx.putImageData(img, 0, 0);
    }

    componentDidUpdate() {
        // const { angle } = this.props;
        // this.ctx.save();
        // this.ctx.beginPath();
        // this.ctx.clearRect(0, 0, this.width, this.height);
        // this.ctx.translate(this.width / 2, this.height / 2);
        // this.ctx.rotate((angle * Math.PI) / 180);
        // this.ctx.fillStyle = '#4397AC';
        // this.ctx.fillRect(
        // -this.width / 4,
        // -this.height / 4,
        // this.width / 2,
        // this.height / 2
        // );
        // this.ctx.restore();
    }

    render() {
        // Component state updates trigger component rerenders, subject to shouldComponentUpdate
        // rules. We do not want to have React ever rerender the canvas object after initial
        // creation, as doing so will clear the canvas (e.g. the <canvas> tag is not idempotent).
        // But we cannot simply have shouldComponentUpdate always return false because we still
        // need to be able to trigger updates in the content of the canvas itself.
        //e
        // To allow for this, we bury the canvas HTML tag in a PureCanvas subcomponent that is set
        // to never update after creation. This subcomponent has the follow attribute:
        //
        //     ref={ node => node ? this.props.contextRef(node.getContext('2d')) : null }
        //
        // contextRef is a prop alias of the saveContext method defined in the Canvas parent class.
        // node is the pure DOM node passed to ref by React, and node.getContext('2d') is a context
        // declaration from the Canvas API that returns a canvas context object with attached
        // methods we are supposed to call for plotting.
        //
        // Thus what this arrangement does is as follows. At render time, if the DOM node is
        // defined, nothing happens. If the DOM node is not defined, saveContext (above) is called
        // on the context object returned by the Canvas API call. All saveContext does is save that
        // raw context object as a prop on the object.
        //
        // This allows us to have a reference to the Canvas context, with all of its attached
        // update methods, whilst retaining a <canvas> that is never updated using React.
        return <PureCanvas
            contextRef={this.saveContext}
            onClick={this.onClick}
            onMouseDown={this.onMouseDown}
            onMouseUp={this.onMouseUp}
            onMouseMove={this.onMouseMove}
        />;
    }
}

export default Canvas;