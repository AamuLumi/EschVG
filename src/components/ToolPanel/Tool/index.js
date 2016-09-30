import React, {PropTypes} from 'react';
import Color from '~/src/tools/Color';

class Tool extends React.Component {
    static propTypes = {
        icon: PropTypes.string.isRequired,
        color: PropTypes.instanceOf(Color).isRequired,
        onEnabled: PropTypes.func.isRequired
    }

    constructor(props) {
        super(props);

        this.state = {
            color: this.props.color
        };
    }

    componentWillReceiveProps(newProps) {
        if (newProps.color !== this.props.color) {
            this.setState({color: newProps.color});
        }

        this.props = newProps;
    }

    render() {
        const {onEnabled, icon} = this.props;
        const {color} = this.state;

        return (
            <div className="tool">
                <div
                    className="tool--selector"
                    onClick={onEnabled}
                    style={{
                    background: color.toHTML()
                }}>
                    {icon}
                </div>
            </div>
        );
    }
}

export default Tool;
