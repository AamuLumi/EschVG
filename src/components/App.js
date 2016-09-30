import React from 'react';
import Paper from './Paper';
import fs from 'fs';
import {connect} from 'react-redux';
import {nativeImage, ipcRenderer} from 'electron';
const {dialog} = require('electron').remote;
import {SketchPicker} from 'react-color';
import Immutable from 'immutable';

import {setActiveColor, setNotification} from '~/src/actions/Global';
import SwatchPanel from './SwatchPanel';
import ToolPanel from './ToolPanel';
import Color, {transparent, black} from '~/src/tools/Color';
import Notifier from './Notifier';

import './App.scss';

const DATA_FOLDER = './data/';
const PNG_FOLDER = DATA_FOLDER + 'png/';
const SVG_FOLDER = DATA_FOLDER + 'svg/';
const SAVE_FOLDER = DATA_FOLDER + 'save/';

const HALF_TRIANGLE_FACTOR = .5;
const HALF_FACTOR = 2;

const DEFAULT_COLS = 50;
const DEFAULT_ROWS = 50;
const DEFAULT_SIZE = 20;

class App extends React.Component {
    static propTypes = {
        // Redux props
        setActiveColor: React.PropTypes.func.isRequired,
        setNotification: React.PropTypes.func.isRequired,
        activeColor: React.PropTypes.instanceOf(Color)
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

            itemsObject: [],

            filePath: undefined
        };

        // Bind methods
        this.doGrid = this.doGrid.bind(this);
        this.doFill = this.doFill.bind(this);
        this.doResize = this.doResize.bind(this);
        this.doSave = this.doSave.bind(this);
        this.doSaveAs = this.doSaveAs.bind(this);
        this.doExport = this.doExport.bind(this);
        this.doLoad = this.doLoad.bind(this);
        this.doLoadAs = this.doLoadAs.bind(this);

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

        let colorMap = Immutable.List();
        let currentCol = undefined;
        let i = 0,
            j = 0;

        if (!basicColor) {
            basicColor = transparent;
        }

        // Fill the array with basic values
        for (; i < cols; i++) {
            currentCol = Immutable.List();
            j = 0;

            for (; j <= rows + 1; j += HALF_TRIANGLE_FACTOR) {
                currentCol = currentCol.push(basicColor);
            }
            colorMap = colorMap.push(currentCol);
        }

        this.setState({
            colorMap
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
        const {rows, cols, middleLines} = this.state;
        let {colorMap} = this.state;
        const {activeColor} = this.props;

        // If there's nothing to draw, stop the function
        if (!drawFromChangingMiddleLinesState && !middleLines) {
            return;
        }

        // The color of middle lines
        let basicColor = black;

        // If we must remove middle lines, draw middle lines with active color
        if (!middleLines) {
            basicColor = activeColor;
        }

        // Constants to situate the middle column and the middle row
        const midCols = cols / HALF_FACTOR,
            midRows = rows / HALF_FACTOR;
        // Constants to situate cols and rows around the middle columns and row
        const beforeMidCols = midCols - HALF_TRIANGLE_FACTOR,
            afterMidCols = midCols + HALF_TRIANGLE_FACTOR;

        for (let i = 0; i < cols; i++) {
            // Middle cell
            if (i > beforeMidCols - 1 && i < afterMidCols) {
                for (let j = 0; j <= rows * HALF_FACTOR; j++) {
                    colorMap = colorMap.setIn([
                        i, j
                    ], basicColor);
                }

                colorMap = colorMap.setIn([
                    i, rows * HALF_FACTOR
                ], basicColor);
            } else {
                colorMap = colorMap.setIn([
                    i, midRows * HALF_FACTOR
                ], basicColor);
            }
        }

        this.setState({
            colorMap
        }, () => {
            this.render();
        });
    }

    setupListeners() {
        ipcRenderer.on('save', this.doSave);
        ipcRenderer.on('saveAs', this.doSaveAs);
        ipcRenderer.on('load', this.doLoad);
        ipcRenderer.on('loadAs', this.doLoadAs);
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

    getStateForSave() {
        return JSON.stringify({state: this.state, swatchPanel: this.refs.swatchPanel.getWrappedInstance().state, itemsObject: this.refs.paper.getWrappedInstance().state.itemsObject});
    }

    doSave() {
        if (this.state.filePath) {
            this.saveFile(this.getStateForSave(), this.state.filePath);
        } else {
            this.doSaveAs();
        }
    }

    doSaveAs() {
        dialog.showSaveDialog([], (path) => {
            this.saveFile(this.getStateForSave(), path);
        });
    }

    doLoad() {
        if (this.state.filePath) {
            this.loadFile(this.state.filePath);
        } else {
            this.doLoadAs();
        }
    }

    doLoadAs() {
        dialog.showOpenDialog({
            filters: [
                {
                    name: 'EschVG Save',
                    extensions: ['save.json']
                }
            ],
            properties: ['openFile']
        }, (path) => {
            if (path && path[0]) {
                this.loadFile(path[0]);
            }
        });
    }

    doExport() {
        let exportImage = (path) => {
            let svg = document.querySelector('svg'), // Inline SVG element
                can = document.createElement('canvas'), // Not shown on page
                ctx = can.getContext('2d'),
                loader = new Image(); // Not shown on page

            let svgAsXML = (new XMLSerializer()).serializeToString(svg);
            let DOMURL = window.URL || window.webkitURL || window;
            let svgBlob = new Blob([svgAsXML], {type: 'image/svg+xml;charset=utf-8'});
            let url = DOMURL.createObjectURL(svgBlob);

            loader.width = can.width = svg.width.baseVal.value;
            loader.height = can.height = svg.height.baseVal.value;
            loader.onload = () => {
                ctx.drawImage(loader, 0, 0);

                let dataURL = can.toDataURL('image/png');
                let img = nativeImage.createFromDataURL(dataURL);

                this.saveImage(img.toPng(), path);
                this.saveVect(svgAsXML, path);
            };
            loader.src = url;
        };

        if (this.state.filePath) {
            exportImage(this.state.filePath);
        } else {
            dialog.showSaveDialog([], exportImage);
        }
    }

    getFilename() {
        return document.getElementById('inputFilename').value;
    }

    loadFile(path) {
        fs.readFile(path, (err, data) => {
            if (err) {
                console.error(err);
            } else {
                let save = JSON.parse(data);

                // Reload current component

                save.state.colorMap = undefined;

                this.setState(save.state, () => {
                    document.getElementById('cols').value = this.state.cols;
                    document.getElementById('rows').value = this.state.rows;

                    // Reload Paper component

                    let itemsObject = Immutable.List();

                    save.itemsObject.forEach((item) => {
                        let currentColumn = Immutable.List();

                        for (let el of item) {
                            el.fillColor = new Color().fromObject(el.fillColor);
                            currentColumn = currentColumn.push(el);
                        }

                        itemsObject = itemsObject.push(currentColumn);
                    });

                    this.refs.paper.getWrappedInstance().loadState({itemsObject: itemsObject});

                    // Reload SwatchPanel component

                    save.swatchPanel.swatches = save.swatchPanel.swatches.map((e) => {
                        e.color = new Color().fromObject(e.color);
                        return e;
                    });

                    this.refs.swatchPanel.getWrappedInstance().loadState(save.swatchPanel);

                    this.props.setNotification({
                        message: 'Loaded ' + path
                    });

                    this.setState({filePath: path});
                });
            }
        });
    }

    saveFile(data, path) {
        if (path.indexOf('.save.json') === -1) {
            path += '.save.json';
        }

        fs.writeFile(path, data, () => {
            this.props.setNotification({
                message: 'Saved ' + path
            });

            this.setState({filePath: path});
        });
    }

    saveImage(data, path) {
        if (path.indexOf('.png') === -1) {
            path += '.png';
        }

        fs.writeFile(path, data);
    }

    saveVect(data, path) {
        if (path.indexOf('.svg') === -1) {
            path += '.svg';
        }

        fs.writeFile(path, data, () => {
            this.props.setNotification({
                message: 'Saved ' + path
            });
        });
    }

    changeSize(e) {
        this.setState({size: e.target.value});
    }

    createAndActiveColor(c) {
        let color = new Color(c.rgb.r, c.rgb.g, c.rgb.b, c.rgb.a);

        this.props.setActiveColor(color);
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
                    <SwatchPanel ref="swatchPanel"/>
                    <ToolPanel ref="toolPanel"/>
                </div>
                <Paper
                    ref="paper"
                    cols={this.state.cols}
                    rows={this.state.rows}
                    size={this.state.size}
                    colorMap={this.state.colorMap}
                    gridShown={this.state.gridShown}
                    simple={this.state.simple}/>
                <div className="saves">
                    <div className="buttons">
                        <button className="do-grid" onClick={this.doGrid}>grid on/off</button>
                        <button className="do-resize" onClick={this.doResize}>clear/resize</button>
                        <button className="do-fill" onClick={this.doFill}>fill</button>
                    </div>
                    <div id="config-panel">
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
                    <div className="picker">
                        <SketchPicker
                            color={this.props.activeColor && this.props.activeColor.rgb()}
                            onChangeComplete={(c) => this.createAndActiveColor(c)}/>
                    </div>
                </div>
                <Notifier/>
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
        },
        setNotification: (n) => {
            dispatch(setNotification(n));
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
