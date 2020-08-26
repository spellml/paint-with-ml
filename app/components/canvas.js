import React from 'react';
import { Component } from 'react';
import PureCanvas from './purecanvas';


class Canvas extends Component {
    constructor(props) {
        super(props);

        this.saveContext = this.saveContext.bind(this);
        this.onClick = this.onClick.bind(this);
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseOut = this.onMouseOut.bind(this);
    }

    saveContext(canvas) {
        // This method is called a define time to pull a reference to the underlying canvas
        // object up React's object stack (via 'ref'). We need both the canvas DOM node and
        // the canvas context object because while most canvas objects hang off of the context,
        // the toDataURI() method, which we need, hangs off of the canvas DOM node itself.
        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d');
        this.width = this.ctx.canvas.width;
        this.height = this.ctx.canvas.height;
    }

    penMatrix(cx, cy, r, v) {
        let segmap = this.props.segmap.slice();
        let [xmin, xmax] = [Math.max(0, cx - r), Math.min(512, cx + r)];
        let [ymin, ymax] = [Math.max(0, cy - r), Math.min(512, cy + r)];
        let color = this.props.colorKey[v];
        const dist = (cx, x, cy, y) => {
            return (Math.abs(cx - x)**2 + Math.abs(cy - y)**2)**(1/2)
        }
        for (let x of [...Array(xmax - xmin).keys()].map(v => v + xmin)) {
            for (let y of [...Array(ymax - ymin).keys()].map(v => v + ymin)) {
                if (dist(cx, x, cy, y) <= r) {
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

    bucketMatrix(cx, cy, v) {
        const newColor = this.props.colorKey[v];
        const getPixel = (x, y, segmap) => {
            let pos = (y * 512 * 4) + (x * 4);
            return segmap.slice(pos, pos + 4);                        
        }
        const paintPixel = (x, y, segmap) => {
            let pos = (y * 512 * 4) + (x * 4);
            [segmap[pos], segmap[pos + 1], segmap[pos + 2], segmap[pos + 3]] =
                [newColor[0], newColor[1], newColor[2], newColor[3]];
        }

        // used for value-based comparisons
        const actualColor = JSON.stringify(getPixel(cx, cy, this.props.segmap));
        let segmap = this.props.segmap.slice();

        // If the color of the current pixel is equivalent to the color of the bucket, do nothing.
        const actual = JSON.stringify([...getPixel(cx, cy, this.props.segmap).values()]);
        const target = JSON.stringify(this.props.colorKey[v])
        if (actual === target) { return segmap; }

        // TODO: using a list as a queue is slow because dequeue is O(N), improve implementation.
        let queue = [[cx, cy]];

        paintPixel(cx, cy, segmap);

        const dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]];
        while (queue.length > 0) {
            let [cx, cy] = queue.shift();
            for (let dir of dirs) {
                let [c_cx, c_cy] = [cx + dir[0], cy + dir[1]];
                if ((c_cx < 0) || (c_cx >= 512) || (c_cy < 0) || (c_cy >= 512)) {
                    continue;
                }
                const candidatePixelLocation = [cx + dir[0], cy + dir[1]];
                const candidateColor = JSON.stringify(
                    getPixel(candidatePixelLocation[0], candidatePixelLocation[1], segmap)
                )
                if (candidateColor === actualColor) {
                    paintPixel(candidatePixelLocation[0], candidatePixelLocation[1], segmap);
                    queue.push(candidatePixelLocation);
                }
            }
        }

        return segmap;
    }

    paint(e) {
        let x = e.pageX - e.target.offsetLeft;
        let y = e.pageY - e.target.offsetTop;

        if (this.props.tool === 'pen' || this.props.tool === 'eraser') {
            let toolValue = this.props.tool === 'pen' ? this.props.toolValue : 9;
            let segmap = this.penMatrix(x, y, this.props.toolRadius, toolValue);
            this.props.updateSegmentationMap(segmap);
        }
        // no need to handle 'reset', this is handled at the App level
        // no need to handle 'bucket', this is only performed on mouseup
    }

    onMouseDown() { this.mouse_down = true; }
    onMouseMove(e) { if (this.mouse_down) { if (!this.props.waiting) this.paint(e); }}
    onMouseOut() { this.mouse_down = false; }
    onClick(e) { if (!this.props.waiting) this.paint(e); }
    onMouseUp(e) {
        if (this.props.waiting) return;

        this.mouse_down = false;
        if (this.props.tool === 'bucket') {
            let x = e.pageX - e.target.offsetLeft;
            let y = e.pageY - e.target.offsetTop;
            let v = this.props.toolValue;
            this.props.updateSegmentationMap(this.bucketMatrix(x, y, v));
        }
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
            onMouseOut={this.onMouseOut}
        />;
    }
}

export default Canvas;