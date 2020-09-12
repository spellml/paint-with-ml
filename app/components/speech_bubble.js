import React from 'react';
import { Component } from 'react';


class SpeechBubble extends Component {
    render() {
        return <div style={{'display': 'flex', 'alignItems': 'center'}}>
            <div className={`speech-bubble ${this.props.type}`}>
                {this.props.message}
            </div>
            <div className={`speech-bubble-connector ${this.props.type}`}/>
        </div>;
    }
}

export default SpeechBubble;