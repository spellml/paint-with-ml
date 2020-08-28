import React from 'react';
import { Component } from 'react';


class DownloadButton extends Component {
    render() {
        return <a href={this.props.outputPicture} target="_blank">
            <svg width="16" height="14" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M11.1978 6.59805L7.99779 10.598L4.79779 6.59805H7.19779V0.998047H8.79779V6.59805H11.1978ZM1.6 12.1978H14.4V6.59777H16V12.1978C16 13.0802 15.2824 13.7978 14.4 13.7978H1.6C0.7176 13.7978 0 13.0802 0 12.1978V6.59777H1.6V12.1978Z" fill="white"/>
            </svg>
        </a>
    }
}

export default DownloadButton;