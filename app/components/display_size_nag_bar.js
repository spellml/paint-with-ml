import React from 'react';
import { Component } from 'react';


class DisplaySizeNagBar extends Component {
    render() {
        return <div className='display-size-nag-bar'>
            <div className='display-size-nag-message'>
                This app is optimized for large screens and may not work in your current browser!
            </div>
        </div>
    }
}

export default DisplaySizeNagBar;
