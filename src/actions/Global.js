export const SET_ACTIVE_COLOR = 'SET_ACTIVE_COLOR';
export const SET_POINTER_MODE = 'SET_POINTER_MODE';
export const SET_PICKER_COLOR = 'SET_PICKER_COLOR';

export const POINTER_MODES = {
  NORMAL : 0,
  PICKER : 1
};

export function setActiveColor(c){
  console.log("set active color");
  return {
    type : SET_ACTIVE_COLOR,
    color : c
  };
}

export function setPointerMode(m){
  return {
    type : SET_POINTER_MODE,
    mode : m
  };
}

export function setPickerColor(c){
  return {
    type : SET_PICKER_COLOR,
    color : c
  };
}
