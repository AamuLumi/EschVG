/* globals paper */

import React, {Component} from 'react';
import {
    setActiveColor,
    setPointerMode,
    POINTER_MODES
} from '~/src/actions/Global';
import {connect} from 'react-redux';
import Swatch from './Swatch';
import Color, {transparent, white} from '~/src/tools/Color';

const MAX_COLOR = 255;
const ONE_BYTE = 8;
const TWO_BYTES = ONE_BYTE * 2;

class SwatchPanel extends Component {
    static propTypes = {
        setActiveColor: React.PropTypes.func.isRequired,
        activeColor: React.PropTypes.instanceOf(Color)
    }

    constructor(props) {
        super(props);

        this.state = {
            swatches: [],
            activeSwatchId: 1,
            nextSwatchId: 1
        };

        this.setActive = this.setActive.bind(this);
        this.removeSwatch = this.removeSwatch.bind(this);
    }

    init() {
        this.addSwatch(transparent, false);
        this.addSwatch(this.randomColor(), true);
        this.addSwatch(this.randomColor(), true);
        this.addSwatch(this.randomColor(), true);
    }

    loadState(state){
      this.setState(state, () => {
        this.props.setActiveColor(this.state.swatches[this.state.activeSwatchId].color);
      });
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

        this.props = nextProps;
    }

    setActive(id) {
        this.setState({
            activeSwatchId: id
        }, () => {
            this.props.setActiveColor(this.state.swatches[this.state.activeSwatchId].color);
        });
    }

    addSwatch(color, removable) {
        let {swatches} = this.state;

        swatches.unshift({color, removable, isPicker: false});

        this.setState({swatches});
    }

    removeSwatch(i) {
        let swatches = this.state.swatches;
        swatches.splice(i, 1);
        this.setState({swatches});
    }

    // Code to update and remove

    randomColor() {
        let r = ~~(Math.random() * MAX_COLOR);
        let g = ~~(Math.random() * MAX_COLOR);
        let b = ~~(Math.random() * MAX_COLOR);
        let color = new Color(r, g, b);

        return color;
    }

    setColor(i) {
        this.setState({
            activeSwatchId: i
        });
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
                            removeSwatch={this.removeSwatch}/>);
                    })}
                </div>
            </div>
        );
    }
}

// Connect to the store
const mapStateToProps = (state) => {
    return {
        activeColor: state.getActiveColor.color
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        setActiveColor: (c) => {
            dispatch(setActiveColor(c));
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps, undefined, {withRef: true})(SwatchPanel);
