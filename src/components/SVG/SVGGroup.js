import React, {PropTypes, Component} from 'react';
import Immutable from 'immutable';

export default class SVGGroup extends Component {
    static propTypes = {
        children: PropTypes.any,
        elements: PropTypes.instanceOf(Immutable.List).isRequired,
        renderElement: PropTypes.func.isRequired,
        visible: PropTypes.bool
    }

    shouldComponentUpdate(nextProps){
      if (this.props.elements !== nextProps.elements){
        return true;
      }

      if (this.props.visible !== nextProps.visible){
        return true;
      }

      return false;
    }

    render() {
        const {renderElement, elements, visible} = this.props;

        let reactElements = elements.map((el, i) => {
          if (el instanceof Immutable.List){
            return <SVGGroup key={i} elements={el} renderElement={renderElement}/>;
          } else {
            return renderElement(el);
          }
        });

        return (
            <g opacity={visible ? 1 : visible === undefined ? 1 : 0}>
                {reactElements}
            </g>
        );
    }
}
