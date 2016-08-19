import React, {PropTypes, Component} from 'react';
import Color from '~/src/tools/Color';

export default class Line extends Component {
    static propTypes = {
        points: PropTypes.array.isRequired,
        color: PropTypes.instanceOf(Color).isRequired,
        width: PropTypes.number.isRequired
    }

    render() {
        const {points, color, width} = this.props;

        return (<line
            x1={points[0][0]}
            y1={points[0][1]}
            x2={points[1][0]}
            y2={points[1][1]}
            style={{
            'stroke': color.toHTML(),
            'strokeWidth': width
        }}/>);
    }
}
