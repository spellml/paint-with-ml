import React from 'react';
import { Component } from 'react';
import PureCanvas from './purecanvas';


class Canvas extends Component {
    constructor(props) {
        super(props);

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
        let segmap = this.props.segmap.slice();
        let [xmin, xmax] = [Math.max(0, cx - r), Math.min(512, cx + r)];
        let [ymin, ymax] = [Math.max(0, cy - r), Math.min(512, cy + r)];
        let color = this.props.color_key[v];

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
    //             const color = this.props.color_key[segmap[x][y]];
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

        if (this.props.tool === 'pen' || this.props.tool === 'eraser') {
            let tool_value = this.props.tool === 'pen' ? this.props.tool_value : 9;
            let segmap = this.penMatrix(x, y, this.props.tool_radius, tool_value);
            let updateSegmentationMap = this.props.updateSegmentationMap;
   
            function synchronizeUpdate() {
                return new Promise((resolve, _) => {
                    updateSegmentationMap(segmap);
                    resolve();
                });
            }
            synchronizeUpdate().then(() => {
                let img = new ImageData(this.props.segmap, 512, 512);
                this.ctx.putImageData(img, 0, 0);    
            });
        } else if (this.props.tool === 'bucket') {
            // TODO
        } else if (this.props.tool === 'reset') {
            console.log("HELLO");
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
        this.paint(e);
    }

    componentDidMount(){
        const img = new ImageData(this.props.segmap, 512, 512);
        this.ctx.putImageData(img, 0, 0);
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