import {
    createStore,
    combineReducers
} from 'redux';

import {white} from '~/src/tools/Color';

import * as Actions from '~/src/actions/Global';

function getPickerColor(state = {
    color: white
}, action) {
    switch (action.type) {
        case Actions.SET_PICKER_COLOR:
            return {
                color: action.color
            };
        default:
            return state;
    }
}

function getPointerMode(state = {
    mode: Actions.POINTER_MODES.NORMAL
}, action) {
    switch (action.type) {
        case Actions.SET_POINTER_MODE:
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
        case Actions.SET_ACTIVE_COLOR:
            return {
                color: action.color
            };
        default:
            return state;
    }
}

function getNotification(state = {
    notification : {}
}, action) {
    switch (action.type) {
        case Actions.SET_NOTIFICATION:
            return {
              notification: action.notification
            };
        default:
            return state;
    }
}

export default createStore(combineReducers({
    getPickerColor,
    getPointerMode,
    getActiveColor,
    getNotification
}));
