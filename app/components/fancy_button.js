import React from 'react';
import { Component } from 'react';


class FancyButton extends Component {
    getButtonImage(buttonFunction) {
        switch (this.props.buttonFunction) {
            case 'run':
                return <svg class="fancyButtonImage" width="20" height="20" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2.00391C6.486 2.00391 2 6.48991 2 12.0039C2 17.5179 6.486 22.0039 12 22.0039C17.514 22.0039 22 17.5179 22 12.0039C22 6.48991 17.514 2.00391 12 2.00391ZM12 20.0039C7.589 20.0039 4 16.4149 4 12.0039C4 7.59291 7.589 4.00391 12 4.00391C16.411 4.00391 20 7.59291 20 12.0039C20 16.4149 16.411 20.0039 12 20.0039Z" fill="white"/>
                    <path d="M9 17.0039L17 12.0039L9 7.00391V17.0039Z" fill="white"/>
                </svg>;
            case 'reset':
                return <svg class="fancyButtonImage" width="20" height="14" viewBox="0 0 20 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 6.00023H5.101L5.102 5.99123C5.23257 5.35186 5.48813 4.74458 5.854 4.20423C6.39845 3.40205 7.16215 2.77339 8.054 2.39323C8.356 2.26523 8.671 2.16723 8.992 2.10223C9.65789 1.96722 10.3441 1.96722 11.01 2.10223C11.967 2.29832 12.8451 2.77164 13.535 3.46323L14.951 2.05123C14.3128 1.41287 13.5578 0.903272 12.727 0.55023C12.3033 0.370859 11.8628 0.234183 11.412 0.14223C10.4818 -0.046759 9.52316 -0.046759 8.593 0.14223C8.14185 0.234564 7.70101 0.371573 7.277 0.55123C6.02753 1.08133 4.95793 1.96132 4.197 3.08523C3.68489 3.84308 3.32676 4.69422 3.143 5.59023C3.115 5.72523 3.1 5.86323 3.08 6.00023H0L4 10.0002L8 6.00023ZM12 8.00023H14.899L14.898 8.00823C14.6367 9.28999 13.8812 10.4173 12.795 11.1462C12.2548 11.5124 11.6475 11.768 11.008 11.8982C10.3424 12.0332 9.65656 12.0332 8.991 11.8982C8.35163 11.7677 7.74435 11.5121 7.204 11.1462C6.93862 10.9667 6.69085 10.7625 6.464 10.5362L5.05 11.9502C5.68851 12.5884 6.44392 13.0977 7.275 13.4502C7.699 13.6302 8.142 13.7672 8.59 13.8582C9.51982 14.0473 10.4782 14.0473 11.408 13.8582C13.2005 13.4862 14.7773 12.4296 15.803 10.9132C16.3146 10.156 16.6724 9.3055 16.856 8.41023C16.883 8.27523 16.899 8.13723 16.919 8.00023H20L16 4.00023L12 8.00023Z" fill="white"/>
                </svg>;
        }
    }

    render() {
        const classNames = `fancy-button ${this.props.visualType}`;
        return <div className={classNames} onClick={this.props.onClick}>
            <div className='fancy-button-image-container'>
                {this.getButtonImage(this.props.visualType)}
            </div>
            <div className='fancy-button-label-container'>
                {this.props.buttonFunction}
            </div>
        </div>;
    }
}

export default FancyButton;