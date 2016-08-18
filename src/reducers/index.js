import {
    createStore,
    combineReducers
} from 'redux';

import {
    SET_PICKER_COLOR,
    SET_POINTER_MODE,
    SET_ACTIVE_COLOR,
    POINTER_MODES
} from '~/src/actions/Global';

function getPickerColor(state = {
    color: undefined
}, action) {
    switch (action.type) {
        case SET_PICKER_COLOR:
            return {
                color: action.color
            };
        default:
            return state;
    }
}

function getPointerMode(state = {
    mode: POINTER_MODES.NORMAL
}, action) {
    switch (action.type) {
        case SET_POINTER_MODE:
            return {
                mode: action.mode
            };
        default:
            return state;
    }
}

function getActiveColor(state = {
    color: undefined
}, action) {
    switch (action.type) {
        case SET_ACTIVE_COLOR:
            return {
                color: action.color
            };
        default:
            return state;
    }
}

export default createStore(combineReducers({
    getPickerColor,
    getPointerMode,
    getActiveColor
}));
