import React, {PropTypes, Component} from 'react';
import Polygon from './Polygon';
import Line from './Line';
import SVGGroup from './SVGGroup';

class SVG extends Component {
    static propTypes = {
        height: PropTypes.number.isRequired,
        width: PropTypes.number.isRequired,
        onMouseDown: PropTypes.func,
        onMouseMove: PropTypes.func,
        onMouseUp: PropTypes.func,
        onMouseLeave: PropTypes.func,
        children: PropTypes.any
    }

    constructor(props) {
        super(props);

        this.state = {
            height: this.props.height,
            width: this.props.width,
            children: this.props.children
        };
    }

    componentWillReceiveProps(nextProps) {
        this.props = nextProps;

        if (nextProps.children){
          this.setState({children: nextProps.children});
        }

        if (nextProps.height || nextProps.width){
          this.setState({
            width: nextProps.width,
            height: nextProps.height
          });
        }
    }

    render() {
        const {height, width, children} = this.state;
        const {onMouseDown, onMouseMove, onMouseUp, onMouseLeave} = this.props;

        return (
            <svg
                height={height}
                width={width}
                onMouseDown={onMouseDown}
                onMouseUp={onMouseUp}
                onMouseMove={onMouseMove}
                onMouseLeave={onMouseLeave}>
                {children}
            </svg>
        );
    }
}

export {SVG as default, Polygon, Line, SVGGroup};
