import React, {PropTypes, Component} from 'react';
import {connect} from 'react-redux';
import Color from '~/src/tools/Color';

class Notifier extends Component {
    static propTypes = {
        notification: PropTypes.object
    }

    constructor(props){
      super(props);

      this.state = {
        notification: {},
        visible: false,
        displayTime: 3000
      };

      this.hideNotifier = this.hideNotifier.bind(this);
    }

    componentWillReceiveProps(nextProps){
      if (this.props.notification !== nextProps.notification){
        this.setState({
          notification: nextProps.notification,
          visible: true
        }, () => {
          setTimeout(() => {
            this.setState({visible: false});
          }, this.state.displayTime);
        });
      }

      this.props = nextProps;
    }

    hideNotifier() {
      this.setState({
        visible: false
      });
    }

    render() {
        const {visible, notification} = this.state;

        return (
          <div id="notifier" className={visible ? 'visible' : 'invisible'}>
            <div id="notifier--container">
              <span className="notifier--message">
                {notification.message}
              </span>
              <span id="notifier--closer" onClick={this.hideNotifier}>
                x
              </span>
            </div>
          </div>
      );
    }
}

// Connect to the store
const mapStateToProps = (state) => {
    return {notification: state.getNotification.notification};
};

export default connect(mapStateToProps)(Notifier);
