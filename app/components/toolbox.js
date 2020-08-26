import React from 'react';
import { Component } from 'react';
import ToolboxLabelButton from './toolbox_label_button';
import ToolboxToolButton from './toolbox_tool_button';
import BrushSizeSlider from './brush_size_slider';


class Toolbox extends Component {
    render() {
        return (
            <div id='toolbox-container'>
                <div className='toolbox-section-label'>Tools</div>
                <div id='tool-buttons-container'>
                    <ToolboxToolButton
                            onClick={this.props.onToolButtonClick}
                            tool='pen'
                            activeTool={this.props.activeTool}
                    />
                    <ToolboxToolButton
                            onClick={this.props.onToolButtonClick}
                            tool='eraser'
                            activeTool={this.props.activeTool}
                    />
                    <ToolboxToolButton
                            onClick={this.props.onToolButtonClick}
                            tool='bucket'
                            activeTool={this.props.activeTool}
                    />
                </div>
                <div id='brush-size-slider-container'>
                    <div className='toolbox-section-label'>
                        Brush Size: {this.props.tool_radius}px
                    </div>
                    <BrushSizeSlider
                        tool_radius={this.props.tool_radius}
                        onChange={this.props.onBrushSizeSliderChange}
                    />
                </div>
                <div className='toolbox-section-label'>Elements</div>
                <div id='label-buttons-container'>
                    <ToolboxLabelButton
                        onClick={this.props.onLabelButtonClick}
                        classId={0}
                        toolValue={this.props.tool_value}
                    />
                    <ToolboxLabelButton
                        onClick={this.props.onLabelButtonClick}
                        classId={1}
                        toolValue={this.props.tool_value}
                    />
                    <ToolboxLabelButton
                        onClick={this.props.onLabelButtonClick}
                        classId={2}
                        toolValue={this.props.tool_value}
                    />
                    <ToolboxLabelButton
                        onClick={this.props.onLabelButtonClick}
                        classId={3}
                        toolValue={this.props.tool_value}
                    />
                    <ToolboxLabelButton
                        onClick={this.props.onLabelButtonClick}
                        classId={4}
                        toolValue={this.props.tool_value}
                    />
                    <ToolboxLabelButton
                        onClick={this.props.onLabelButtonClick}
                        classId={5}
                        toolValue={this.props.tool_value}
                    />
                    <ToolboxLabelButton
                        onClick={this.props.onLabelButtonClick}
                        classId={6}
                        toolValue={this.props.tool_value}
                    />
                    <ToolboxLabelButton
                        onClick={this.props.onLabelButtonClick}
                        classId={7}
                        toolValue={this.props.tool_value}
                    />
                    <ToolboxLabelButton
                        onClick={this.props.onLabelButtonClick}
                        classId={8}
                        toolValue={this.props.tool_value}
                    />
                </div>
                <div id='reset-button-container'>
                    <ToolboxToolButton
                                onClick={this.props.onToolButtonClick}
                                tool='reset'
                        />
                </div>
                <div id='logo'>
                    <svg width="80" height="33" viewBox="0 0 80 33" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M32.6765 19.7065C33.0738 20.134 33.5426 20.4778 34.0821 20.7378C34.6213 20.9977 35.1807 21.1277 35.7599 21.1277C36.4982 21.1277 37.0717 20.9573 37.4809 20.6164C37.8895 20.2759 38.0942 19.8278 38.0942 19.2732C38.0942 18.9846 38.0457 18.7388 37.9491 18.5366C37.8526 18.3347 37.7222 18.1611 37.5573 18.0166C37.3926 17.8722 37.1967 17.7422 36.9698 17.6267C36.7423 17.5111 36.4982 17.3898 36.2372 17.2627L34.6355 16.5521C34.3742 16.4368 34.1076 16.2982 33.835 16.1361C33.5624 15.9744 33.318 15.7779 33.1025 15.5468C32.8864 15.316 32.7106 15.0416 32.5743 14.7236C32.438 14.4058 32.3699 14.039 32.3699 13.623C32.3699 13.1958 32.4576 12.7971 32.6339 12.4271C32.81 12.0576 33.0539 11.7367 33.3665 11.4652C33.6786 11.1936 34.048 10.9831 34.4739 10.8326C34.8998 10.6826 35.3681 10.6072 35.8792 10.6072C36.5495 10.6072 37.1683 10.7372 37.7362 10.9972C38.304 11.2572 38.787 11.5952 39.1846 12.0111L38.4179 12.947C38.0772 12.612 37.6992 12.3491 37.2847 12.1584C36.8704 11.9678 36.4016 11.8725 35.8792 11.8725C35.2545 11.8725 34.7522 12.0198 34.3717 12.3144C33.9909 12.6091 33.801 13.0164 33.801 13.5363C33.801 13.8136 33.8546 14.0476 33.9625 14.2383C34.0704 14.4289 34.2152 14.5968 34.3972 14.7412C34.5787 14.8856 34.7774 15.0124 34.9935 15.1222C35.209 15.2323 35.4305 15.3331 35.658 15.4255L37.2424 16.1188C37.5601 16.2577 37.8614 16.4163 38.1453 16.5954C38.429 16.7748 38.6735 16.9825 38.8779 17.2194C39.0823 17.4562 39.2442 17.7336 39.3634 18.0516C39.4827 18.3693 39.5423 18.7359 39.5423 19.1519C39.5423 19.6025 39.454 20.0245 39.2783 20.4171C39.1019 20.81 38.8492 21.1537 38.5201 21.4484C38.1905 21.743 37.7932 21.9744 37.3276 22.1416C36.8616 22.3092 36.3335 22.393 35.7431 22.393C34.9595 22.393 34.2323 22.2425 33.5624 21.9423C32.8921 21.6419 32.3128 21.2317 31.8247 20.7118L32.6765 19.7065ZM45.9264 16.4407C46.8942 16.4407 47.6119 16.2529 48.079 15.8774C48.5465 15.5018 48.7801 14.9096 48.7801 14.1005C48.7801 13.2804 48.5437 12.7113 48.0709 12.3932C47.5978 12.0758 46.883 11.9169 45.9264 11.9169H44.1027V16.4407H45.9264ZM42.6995 10.7263H46.1481C46.7658 10.7263 47.332 10.785 47.8467 10.9008C48.3614 11.017 48.7989 11.2057 49.1592 11.467C49.5195 11.7284 49.7995 12.0739 49.9999 12.5033C50.2001 12.9333 50.3002 13.4615 50.3002 14.0886C50.3002 14.6929 50.2001 15.2155 49.9999 15.6568C49.7995 16.0982 49.5167 16.464 49.1506 16.7544C48.7843 17.0447 48.3468 17.2625 47.8381 17.4077C47.3288 17.5528 46.7658 17.6254 46.1481 17.6254H44.1236V22.1549H42.6995V10.7263ZM59.8342 10.7262H53.3404V22.1548H60.0057V20.9182H54.7663V16.7715H59.0437V15.5349H54.7663V11.9457H59.8342V10.7262ZM63.2798 10.7262H64.696V20.9182H69.5943V22.1548H63.2798V10.7262ZM73.934 10.7262H72.5175V22.1548H78.832V20.9182H73.934V10.7262Z" fill="url(#paint0_linear)"/>
                        <path fillRule="evenodd" clipRule="evenodd" d="M2.58916 2.78776C0.686239 4.71763 -0.217262 7.3115 0.0447961 10.0926C0.283446 12.6255 1.48926 15.1619 3.3525 17.0519L12.6932 26.5247C11.0961 27.6626 9.00616 27.2439 7.98048 26.6524C6.42497 25.7541 5.16207 24.4374 4.69276 23.7713C4.47609 23.4642 4.05446 23.3922 3.75129 23.6127C3.4487 23.8317 3.37847 24.2597 3.59486 24.5671C4.05845 25.2247 5.43212 26.7559 7.31306 27.8412C8.05327 28.2685 9.1606 28.6173 10.353 28.6173C11.5925 28.6173 12.9239 28.2408 14.0318 27.185C15.086 26.1806 15.6247 24.8737 15.5902 23.4058C15.5413 21.3485 14.3664 19.1771 12.3661 17.4495C10.9764 16.2489 7.2848 13.0618 6.29223 11.3102C5.83149 10.4966 5.24457 8.9533 6.13123 7.35513L15.5319 16.8886C18.7209 20.1228 19.8884 25.6293 16.3224 29.2463C14.6807 30.9115 12.4475 31.7555 10.0301 31.6174C7.72556 31.4871 5.4718 30.4677 3.84749 28.8192C3.66594 28.6352 3.46611 28.4422 3.25001 28.2335C2.6414 27.6455 1.95257 26.9792 1.19237 26.0569C0.953436 25.7674 0.528376 25.7278 0.242053 25.9702C-0.0436985 26.2124 -0.081951 26.6438 0.156699 26.9339C0.966282 27.9166 1.7162 28.6415 2.31911 29.224C2.52664 29.4246 2.71876 29.6101 2.89318 29.7869C4.74957 31.6694 7.32333 32.8347 9.95505 32.9835C10.1509 32.9948 10.3447 33 10.5377 33C13.1177 33 15.4931 32.0228 17.2767 30.2137C19.1788 28.2847 20.0774 25.685 19.8068 22.8927C19.5616 20.3537 18.3509 17.8127 16.4857 15.921L6.98334 6.2843C8.38384 5.03316 10.2996 5.13891 11.311 5.57233C12.474 6.07192 13.0518 6.65762 13.5168 7.12802L13.5171 7.12947C13.7814 7.39645 14.2079 7.39587 14.4711 7.12802C14.7346 6.86103 14.7335 6.42733 14.47 6.16063C13.9519 5.63503 13.2413 4.91556 11.8366 4.3131C10.2885 3.64766 7.14149 3.56011 5.28796 6.15283C4.05817 7.87668 3.99765 10.0045 5.12296 11.9919C6.10068 13.7172 8.8914 16.2454 11.4914 18.4906C13.1994 19.9665 14.2016 21.7704 14.2413 23.4391C14.2602 24.2331 14.0583 24.9404 13.6441 25.5539L4.30652 16.0842C2.6611 14.415 1.59716 12.1837 1.38792 9.9623C1.23034 8.28814 1.47584 5.85174 3.54347 3.75544C5.18405 2.09111 7.41896 1.2442 9.83401 1.38116C12.1349 1.5083 14.3789 2.51875 15.9909 4.15332C16.6444 4.81616 16.8028 4.98779 17.1993 5.46571C17.4397 5.75437 17.865 5.79193 18.1499 5.54864C18.4348 5.30535 18.4719 4.87366 18.2319 4.58471C17.8074 4.0727 17.6267 3.87651 16.945 3.18592C15.1017 1.31586 12.5359 0.160076 9.90766 0.0150252C9.72039 0.00491209 9.53399 0 9.34843 0C6.75754 0 4.37646 0.975194 2.58916 2.78776Z" fill="url(#paint1_linear)"/>
                        <defs>
                        <linearGradient id="paint0_linear" x1="58.2537" y1="5.84678" x2="52.1617" y2="27.0034" gradientUnits="userSpaceOnUse">
                        <stop stopColor="white"/>
                        <stop offset="1" stopColor="white"/>
                        </linearGradient>
                        <linearGradient id="paint1_linear" x1="11.1626" y1="-13.3293" x2="-15.2066" y2="0.484334" gradientUnits="userSpaceOnUse">
                        <stop stopColor="white"/>
                        <stop offset="1" stopColor="white"/>
                        </linearGradient>
                        </defs>
                    </svg>
                </div>
            </div>
        );
    }
}

export default Toolbox;