/* globals paper */

import React, {Component} from 'react';
import {
    setActiveColor,
    setPointerMode,
    POINTER_MODES
} from '~/src/actions/Global';
import {connect} from 'react-redux';
import Swatch from './Swatch';

const MAX_COLOR = 255;
const ONE_BYTE = 8;
const TWO_BYTES = ONE_BYTE * 2;
const transparent = new paper.Color(0, 0, 0, 0);

class SwatchPanel extends Component {
    static propTypes = {
        setActiveColor: React.PropTypes.func.isRequired,
        setPointerMode: React.PropTypes.func.isRequired,
        activeColor: React.PropTypes.oneOfType([
            React.PropTypes.string,
            React.PropTypes.instanceOf(paper.Color)
        ]),
        pickerColor: React.PropTypes.oneOfType([
            React.PropTypes.string,
            React.PropTypes.instanceOf(paper.Color)
        ])
    }

    constructor(props) {
        super(props);

        this.state = {
            swatches: [],
            activeSwatchId: 0,
            nextSwatchId: 0
        };

        this.setActive = this.setActive.bind(this);
        this.removeSwatch = this.removeSwatch.bind(this);
    }

    init() {
        this.addSwatch(transparent, false);
        this.addSwatch(this.randomColor(), true);
        this.addSwatch(this.randomColor(), true);
        this.addSwatch(this.randomColor(), true);
        this.addPicker();
    }

    componentWillMount() {
        this.init();
        this.props.setActiveColor(this.state.swatches[this.state.activeSwatchId].color);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.activeColor !== this.props.activeColor) {
            let swatches = this.state.swatches;

            swatches[this.state.activeSwatchId].color = nextProps.activeColor;
            this.setState({swatches});
        }

        if (nextProps.pickerColor !== this.props.pickerColor) {
            let swatches = this.state.swatches;
            let i = swatches.length - 1;

            for (; i >= 0; i--) {
                if (swatches[i].isPicker) {
                    swatches[i].color = nextProps.pickerColor;
                    break;
                }
            }

            this.setState({
                swatches
            }, () => {
                this.props.setActiveColor(this.state.swatches[this.state.activeSwatchId].color);
            });
        }

        this.props = nextProps;
    }

    setActive(id) {
        this.setState({
            activeSwatchId: id
        }, () => {
            this.props.setActiveColor(this.state.swatches[this.state.activeSwatchId].color);

            if (this.state.swatches[id].isPicker) {
                this.props.setPointerMode(POINTER_MODES.PICKER);
            }
        });
    }

    addSwatch(color, removable) {
        let {swatches} = this.state;

        swatches.unshift({color, removable, isPicker: false});

        this.setState({swatches});
    }

    addPicker() {
        let {swatches} = this.state;
        swatches.push({color: 'white', removable: false, isPicker: true});
        this.setState({swatches});
    }

    removeSwatch(i) {
        let swatches = this.state.swatches;
        swatches.splice(i, 1);
        this.setState({swatches});
    }

    // Code to update and remove

    RGBToHex(r, g, b) {
        let bin = r << TWO_BYTES | g << ONE_BYTE | b;
        return (function (h) {
            return new Array(7 - h.length).join('0') + h
        })(bin.toString(16).toUpperCase())
    }

    randomColor() {
        let r = ~~(Math.random() * MAX_COLOR);
        let g = ~~(Math.random() * MAX_COLOR);
        let b = ~~(Math.random() * MAX_COLOR);
        let color = `#${this.RGBToHex(r, g, b)}`;

        return color;
    }

    setColor(color) {
        const {swatches} = this.state;
        let nextState = {
            color
        };

        if (color === swatches.length - 1) {
            nextState.pickerMode = true;
        }

        this.setState(nextState);
    }

    render() {
        const {activeSwatchId} = this.state;

        return (
            <div id="c-swatchPanel">
                <div className="buttons">
                    <button
                        className="swatch-adder"
                        onClick={this.addSwatch.bind(this, this.randomColor(), true)}>
                        +
                    </button>
                </div>
                <div className="swatches">
                    {this.state.swatches.map((e, i) => {
                        return (<Swatch
                            {...e}
                            id={i}
                            key={i}
                            activeId={activeSwatchId}
                            setActive={this.setActive}
                            removeSwatch={this.removeSwatch}/>)
                    })}
                </div>
            </div>
        );
    }
}

// Connect to the store
const mapStateToProps = (state) => {
    return {
        activeColor: state.getActiveColor.color,
        pickerColor: state.getPickerColor.color
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        setActiveColor: (c) => {
            dispatch(setActiveColor(c));
        },
        setPointerMode: (m) => {
            dispatch(setPointerMode(m));
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps, undefined, {withRef: true})(SwatchPanel);
