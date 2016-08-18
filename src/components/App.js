import React from 'react';
import Paper from './Paper';
import fs from 'fs';
import {connect} from 'react-redux';
import {nativeImage, ipcRenderer} from 'electron';
import {SketchPicker} from 'react-color';
import {setActiveColor} from '~/src/actions/Global';
import SwatchPanel from './SwatchPanel';
import './App.scss';

const DATA_FOLDER = './data/';
const PNG_FOLDER = DATA_FOLDER + '/png/';
const SVG_FOLDER = DATA_FOLDER + '/svg/';
const SAVE_FOLDER = DATA_FOLDER + '/save/';

const transparent = new paper.Color(1, 1, 1, 0);
const HALF_TRIANGLE_FACTOR = .5;
const HALF_FACTOR = 2;

const DEFAULT_COLS = 50;
const DEFAULT_ROWS = 50;
const DEFAULT_SIZE = 20;

class App extends React.Component {
  static propTypes = {
    // Redux props
    setActiveColor: React.PropTypes.func.isRequired,
    activeColor: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.instanceOf(paper.Color)
    ])
  }

  /**
   * Constructor of class App
   */
  constructor(props) {
    super(props);

    this.state = {
      // Size of triangle pixel
      size: DEFAULT_SIZE,
      // Number of cols and rows of pixels
      cols: DEFAULT_COLS,
      rows: DEFAULT_ROWS,
      // Boolean true to show the grid
      gridShown: true,
      // Boolean to draw the middle lines in black
      middleLines: true,
      // Time of last updated of the map
      mapLastUpdated: new Date().getTime()
    };

    // Bind methods
    this.doGrid = this.doGrid.bind(this);
    this.doFill = this.doFill.bind(this);
    this.doResize = this.doResize.bind(this);
    this.doSave = this.doSave.bind(this);
    this.doExport = this.doExport.bind(this);
    this.doLoad = this.doLoad.bind(this);

    // Setup listeners to communicate with Electron main process
    this.setupListeners();
  }

  // Component Lifecycle Methods //

  componentWillMount() {
    // Initialize color map
    this.setupColorMap();
  }

  // Setup Methods //

  /**
   * Setup the color map
   * @param  {String|paper.Color} basicColor the background color
   */
  setupColorMap(basicColor) {
    const {rows, cols} = this.state;

    let colorMap = [];
    let currentCol = [];
    let i = 0,
      j = 0;

    if (!basicColor) {
      basicColor = transparent;
    }

    // Fill the array with basic values
    for (; i < cols; i++) {
      currentCol = [];
      j = 0;

      for (; j <= rows; j += HALF_TRIANGLE_FACTOR) {
        currentCol.push(basicColor);
      }
      colorMap.push(currentCol);
    }

    this.setState({
      colorMap,
      mapLastUpdated: new Date().getTime()
    }, () => {
      this.drawMiddleLines(false);
    });
  }

  /**
   * Draw middle lines in the color map
   * @param  {Boolean} drawFromChangingMiddleLinesState true if the method
   *                                                    is called after setting
   *                                                    new state of middleLines
   */
  drawMiddleLines(drawFromChangingMiddleLinesState) {
    const {rows, cols, middleLines, colorMap} = this.state;
    const {activeColor} = this.props;

    // If there's nothing to draw, stop the function
    if (!drawFromChangingMiddleLinesState && !middleLines) {
      return;
    }

    // The color of middle lines
    let basicColor = 'black';

    // If we must remove middle lines, draw middle lines with
    // active color
    if (!middleLines) {
      basicColor = activeColor;
    }

    // Constants to situate the middle column and the middle row
    const midCols = cols / HALF_FACTOR,
      midRows = rows / HALF_FACTOR;
    // Constants to situate cols and rows around the middle
    // columns and row
    const beforeMidCols = midCols - HALF_TRIANGLE_FACTOR,
      afterMidCols = midCols + HALF_TRIANGLE_FACTOR;

    let currentCol = undefined;

    for (let i = 0; i < cols; i++) {
      currentCol = colorMap[i];

      // Middle cell
      if (i >= beforeMidCols && i <= afterMidCols) {
        for (let j = 0; j <= rows * HALF_FACTOR; j++) {
          currentCol[j] = basicColor;
        }
      } else {
        currentCol[midRows * HALF_FACTOR] = basicColor;
      }
    }

    this.setState({
      colorMap,
      mapLastUpdated: new Date().getTime()
    }, () => {
      this.render();
    });
  }

  setupListeners() {
    ipcRenderer.on('save', this.doSave);
    ipcRenderer.on('load', this.doLoad);
    ipcRenderer.on('export', this.doExport);
    ipcRenderer.on('middleLines', (e, newState) => {
      this.setState({
        middleLines: newState
      }, () => {
        this.drawMiddleLines(true);
      });
    });
  }

  // Action Methods //

  doGrid() {
    this.setState({
      gridShown: !this.state.gridShown
    });
  }

  doFill() {
    this.setupColorMap(this.props.activeColor);
  }

  doResize() {
    let cols = parseInt(document.getElementById('cols').value);
    let rows = parseInt(document.getElementById('rows').value);

    this.setState({
      cols,
      rows
    }, () => {
      this.setupColorMap();
    });
  }

  doSave() {
    let save = {
      state : this.state,
      swatchPanel : this.refs.swatchPanel.getWrappedInstance().state
    };
    let data = JSON.stringify(save);
    this.saveFile(data);
  }

  doLoad() {
    let filename = SAVE_FOLDER + this.getFilename() + '.save.json';
    fs.readFile(filename, (err, data) => {
      if (err) {
        console.log(err);
      } else {
        let save = JSON.parse(data);
        this.refs.swatchPanel.getWrappedInstance().setState(save.swatchPanel);
        this.setState(save.state, () => {
          document.getElementById('cols').value = this.state.cols;
          document.getElementById('rows').value = this.state.rows;
        });
      }
    });
  }

  doExport() {
    let dataURL = this.refs.paper.getWrappedInstance().refs.canvas.toDataURL('image/png', 1);
    let img = nativeImage.createFromDataURL(dataURL);
    this.saveImage(img.toPng());

    this.saveVect(paper.project.exportSVG({asString: true}));
  }

  getFilename() {
    return document.getElementById('inputFilename').value;
  }

  saveFile(data) {
    let filename = SAVE_FOLDER + this.getFilename() + '.save.json';
    fs.writeFile(filename, data);
  }

  saveImage(data) {
    let filename = PNG_FOLDER + this.getFilename() + '.png';
    fs.writeFile(filename, data);
  }

  saveVect(data) {
    let filename = SVG_FOLDER + this.getFilename() + '.svg';
    fs.writeFile(filename, data);
  }

  changeSize(e) {
    this.setState({size: e.target.value});
  }

  render() {
    let {cols, rows} = this.state;

    return (
      <div className="app-inner">
        <div className="controls">
          <div className="size-changer">
            <input
              type="range"
              defaultValue={this.state.size}
              onChange={this.changeSize.bind(this)}
              min="10"
              max="30"/>
          </div>
          <SwatchPanel
            ref="swatchPanel"/>
        </div>
        <Paper
          ref="paper"
          cols={this.state.cols}
          rows={this.state.rows}
          size={this.state.size}
          colorMap={this.state.colorMap}
          mapLastUpdated={this.state.mapLastUpdated}
          gridShown={this.state.gridShown}
          simple={this.state.simple}/>
        <div className="saves">
          <div className="buttons">
            <button className="do-grid" onClick={this.doGrid}>grid on/off</button>
            <button className="do-resize" onClick={this.doResize}>clear/resize</button>
            <button className="do-fill" onClick={this.doFill}>fill</button>
          </div>
          <div className="configPanel">
            <input
              className="configField"
              placeholder="Filename (without extension)"
              id="inputFilename"
              type="text"/>
            <input
              className="configField"
              placeholder="Number of cols"
              id="cols"
              type="number"
              defaultValue={cols}/>
            <input
              className="configField"
              placeholder="Number of rows"
              id="rows"
              type="number"
              defaultValue={rows}/>
          </div>
          <SketchPicker
            color={this.props.activeColor}
            onChangeComplete={(c) => this.props.setActiveColor(c.hex)}/>
        </div>
      </div>
    );
  }
}

// Connect to the store
const mapStateToProps = (state) => {
  return {activeColor: state.getActiveColor.color};
};

const mapDispatchToProps = (dispatch) => {
  return {
    setActiveColor: (c) => {
      dispatch(setActiveColor(c));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
