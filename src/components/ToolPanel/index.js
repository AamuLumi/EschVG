import React, {PropTypes} from 'react';
import {connect} from 'react-redux';

import Tool from './Tool';
import Color, {white} from '~/src/tools/Color';
import {POINTER_MODES, setPointerMode} from '~/src/actions/Global';

const PICKER = 'picker';
const LINER = 'liner';

class ToolPanel extends React.Component {
    static propTypes = {
        pickerColor: PropTypes.instanceOf(Color).isRequired,
        setPointerMode: PropTypes.func.isRequired
    }

    constructor(props) {
        super(props);

        let tools = [];

        tools.push(this.getPicker());
        tools.push(this.getLiner());

        this.state = {
            activeTool: 'picker',
            tools: tools
        };
    }

    componentWillReceiveProps(newProps) {
        if (newProps.pickerColor !== this.props.pickerColor) {
            let newTools = this.state.tools;

            newTools.find((e) => e.name === PICKER).color = newProps.pickerColor;

            this.setState({tools: newTools});
        }

        this.props = newProps;
    }

    getPicker() {
        const {pickerColor} = this.props;

        return {
            name: PICKER,
            color: pickerColor,
            icon: 'P',
            onEnabled: () => {
                this.props.setPointerMode(POINTER_MODES.PICKER);
            }
        };
    }

    getLiner() {
        return {
            name: LINER,
            color: white,
            icon: 'L',
            onEnabled: () => {
                this.props.setPointerMode(POINTER_MODES.LINER);
            }
        };
    }

    render() {
        const {tools} = this.state;

        return (
            <div id="c-tool-panel">
                {tools.map((e, i) => <Tool key={i} {...e}/>)}
            </div>
        );
    }
}

// Connect to the store
const mapStateToProps = (state) => {
    return {pickerColor: state.getPickerColor.color};
};

const mapDispatchToProps = (dispatch) => {
    return {
        setPointerMode: (m) => {
            dispatch(setPointerMode(m));
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps, undefined, {withRef: true})(ToolPanel);
