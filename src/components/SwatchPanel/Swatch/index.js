import React, {Component} from 'react';

export default class Swatch extends Component {
    static propTypes = {
        setActive: React.PropTypes.func.isRequired,
        removeSwatch: React.PropTypes.func.isRequired,
        color: React.PropTypes.oneOfType([
            React.PropTypes.string,
            React.PropTypes.instanceOf(paper.Color)
        ]),
        isPicker: React.PropTypes.bool,
        removable: React.PropTypes.bool.isRequired,
        activeId: React.PropTypes.number.isRequired,
        id: React.PropTypes.number.isRequired
    }

    constructor(props) {
        super(props);

        this.state = {
            color: props.color || 'black',
            isPicker: props.isPicker || false,
            removable: props.removable,
            activeId: props.activeId,
            id: props.id
        };
    }

    componentWillReceiveProps(nextProps) {
        let nextState = this.state;

        if (nextProps.color) {
            nextState.color = nextProps.color;
        }
        if (nextProps.isPicker !== undefined) {
            nextState.isPicker = nextProps.isPicker;
        }
        if (nextProps.removable !== undefined) {
            nextState.removable = nextProps.removable;
        }
        if (nextProps.activeId) {
            nextState.activeId = nextProps.activeId;
        }
        if (nextProps.id) {
            nextState.id = nextProps.id;
        }

        this.setState(nextState);
        this.props = nextProps;
    }

    getR(color) {
        if (typeof color === 'string') {
            return parseInt(color.substring(1, 2), 16) / 255;
        } else {
            return color.red;
        }
    }

    getG(color) {
        if (typeof color === 'string') {
            return parseInt(color.substring(3, 4), 16) / 255;
        } else {
            return color.green;
        }
    }

    getB(color) {
        if (typeof color === 'string') {
            return parseInt(color.substring(5, 6), 16) / 255;
        } else {
            return color.blue;
        }
    }

    needWhiteFont() {
        const {color} = this.state;

        let a = 1 - (0.299 * this.getR(color) + 0.587 * this.getG(color) + 0.114 * this.getB(color));

        console.log(color, this.getR(color), this.getG(color), this.getB(color), a);

        return a > 0.5;
    }

    render() {
        const {isPicker, removable, activeId, color, id} = this.state;

        let swatchColor = color;

        if (typeof color === 'object' && color.alpha === 0) {
            swatchColor = '#FFFFFF';
        } else if (typeof color === 'object') {
            swatchColor = color._canvasStyle;
        }

        let classes = ['swatch'];

        if (activeId === id) {
            classes.push('selected');
        }

        if (isPicker && this.needWhiteFont()) {
            classes.push('white-font');
        }

        return (
            <div className={classes.join(' ')}>
                <div className="swatch--selector" onClick={() => this.props.setActive(id)} style={{
                    background: swatchColor
                }}>

                    {isPicker && 'P'}

                </div>
                {removable && (
                    <div className="swatch--controls">
                        <div className="swatch--remover" onClick={this.props.removeSwatch.bind(this, id)}>
                            &times;
                        </div>
                    </div>
                )}
            </div>
        );
    }
}
