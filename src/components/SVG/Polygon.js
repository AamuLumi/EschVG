import React, {PropTypes, Component} from 'react';
import Color from '~/src/tools/Color';

export default class Polygon extends Component {
    static propTypes = {
        points: PropTypes.array.isRequired,
        fillColor: PropTypes.instanceOf(Color).isRequired
    }

    constructor(props){
      super(props);

      this.state = {
        points: this.props.points,
        fillColor: this.props.fillColor
      };
    }

    setFillColor(color){
      this.setState({fillColor: color});
    }

    setPoints(points){
      this.setPoints({points: points});
    }

    componentWillReceiveProps(nextProps){
      let nextState = {};


      if (nextProps.points){
        nextState.points = nextProps.points;
      }

      if (nextProps.fillColor){
        nextState.fillColor = nextProps.fillColor;
      }

      this.props = nextProps;

      this.setState(nextState);
    }

    render() {
      const {points, fillColor} = this.state;
        let pointsMapped = points.map((e) => e[0] + ',' + e[1]).join(' ');

        return (<polygon
            points={pointsMapped}
            style={{
            fill: fillColor.toHTML(),
            stroke: fillColor.toHTML()
        }}/>);
    }
}
