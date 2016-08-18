import React from 'react';
import {connect} from 'react-redux';
import {setPickerColor, setPointerMode, POINTER_MODES} from '~/src/actions/Global';

const PI = Math.PI;
const MPIBY6 = -PI / 6;
const PIBY6 = PI / 6;
const TAN_PIBY6 = Math.tan(PIBY6);
const TAN_MPIBY6 = Math.tan(MPIBY6);
const transparent = new paper.Color(0, 0, 0, 0);
const sqrt = Math.sqrt;

const sqrt3 = sqrt(3);

const GRID_COLOR = 'grey';

// Constants
const BACKGROUND_LAYER = 0;
const DRAW_LAYER = 1;
const SELECTION_LAYER = 2;

export default class Paper extends React.Component {
  static propTypes = {
    cols: React.PropTypes.number,
    rows: React.PropTypes.number,
    size: React.PropTypes.number,
    colorMap: React.PropTypes.array.isRequired,
    activeColor: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.instanceOf(paper.Color)
    ]),
    mapLastUpdated: React.PropTypes.number
  }

  constructor(props) {
    super(props);

    this.state = {
      cols: this.props.cols,
      rows: this.props.rows,
      height: this.props.size,
      width: this.props.size / 2 * sqrt3,
      colorMap: this.props.colorMap,
      currentKey: 0
    };

    this.onUp = this.onUp.bind(this);
    this.onDown = this.onDown.bind(this);
    this.createItems = this.createItems.bind(this);
  }

  /**
   * Change the current working layer
   * @param  {Integer} n the id of new layer
   */
  changeCurrentLayer(n) {
    // If layer doesn't exist
    if (!paper.project.layers[n]) {
      // Create layers until we reached the good id
      while (!paper.project.layers[n]) {
        new paper.Layer();
      }
    } else { // If exists, activate it
      paper.project.layers[n].activate;
    }
  }

  removeSelection() {
    if (this.lastSelection !== undefined) {
      this.lastSelection.emit('mouseleave');
      paper.view.update(true);
    }
  }

  reinit() {
    paper.project.clear();
    this.removeSelection();
    this.init();
  }

  init() {
    let canvas = document.getElementById('drawCanvas');
    paper.setup(canvas);

    this.setupMouse();
    this.createBackground();
    this.createItems();

    paper.view.update(true);
  }

  componentWillReceiveProps(newProps) {
    if (newProps.mapLastUpdated !== this.props.mapLastUpdated || newProps.colorMap !== this.props.colorMap) {
      this.setState({
        colorMap: newProps.colorMap
      }, () => {
        this.reinit();
      });
    }
    if (newProps.cols !== this.props.cols || newProps.rows !== this.props.rows) {
      this.setState({
        cols: newProps.cols,
        rows: newProps.rows
      }, () => {
        this.reinit();
      });
    }
    if (newProps.gridShown) {
      this.showGrid();
    } else {
      this.hideGrid();
    }

    this.props = newProps;
  }

  showGrid() {
    paper.project.layers[BACKGROUND_LAYER].opacity = 1;
    paper.view.update(true);
  }

  hideGrid() {
    paper.project.layers[BACKGROUND_LAYER].opacity = 0;
    paper.view.update(true);
  }

  shapeOnMouseEnter(reactObject, i, j) {
    this._previousFillColor = this.fillColor;
    this.fillColor = reactObject.props.activeColor;
    this.mouseHasLeaved = false;

    reactObject.lastSelection = this;

    if (reactObject.state.down) {
      this._previousFillColor = this.fillColor;
      reactObject.colorMap[i][j] = this.fillColor;
    }
  }

  shapeOnMouseLeave() {
    if (!this.mouseHasLeaved) {
      this.fillColor = this._previousFillColor;
      this._previousFillColor = transparent;
      this.mouseHasLeaved = true;
    }
  }

  shapeSetColor(reactObject, i, j) {
    if (reactObject.props.pointerMode === POINTER_MODES.PICKER) {
      reactObject.props.setPickerColor(this._previousFillColor);
      reactObject.props.setPointerMode(POINTER_MODES.NORMAL);
    } else {
      this._previousFillColor = this.fillColor;
      reactObject.colorMap[i][j] = this.fillColor;
    }
  }

  createItem(i, j, p1, p2, p3, fillColor) {
    let currentPath = new paper.Path([p1, p2, p3]);
    currentPath.closed = true;
    currentPath.fillColor = fillColor;
    currentPath._previousFillColor = fillColor;
    currentPath.onMouseEnter = this.shapeOnMouseEnter.bind(currentPath, this, i, j);
    currentPath.onMouseLeave = this.shapeOnMouseLeave.bind(currentPath);
    currentPath.onMouseDown = this.shapeSetColor.bind(currentPath, this, i, j);
    currentPath.mouseHasLeaved = true;
  } //colorMap[i][j * 2];

  createTriangle(x, y, i, j, fillColor) {
    const {height, width} = this.state;
    const midHeight = height / 2;

    this.createItem(i, j, new paper.Point(x, y), new paper.Point(x + width, y + midHeight), new paper.Point(x, y + height), fillColor);
  }

  createInversedTriangle(x, y, i, j, fillColor) {
    const {height, width} = this.state;
    const midHeight = height / 2;

    this.createItem(i, j, new paper.Point(x, y), new paper.Point(x + width, y - midHeight), new paper.Point(x + width, y + midHeight), fillColor);
  }

  createItems() {
    let {cols, rows, width, height} = this.state;

    let midHeight = height / 2;

    let itemsObject = [];
    let coordonates = [];
    let currentX = 0,
      currentY = 0;

    let {colorMap} = this.state;

    this.changeCurrentLayer(DRAW_LAYER);

    for (let i = 0; i < cols; i++) {
      coordonates = [];
      currentX = i * width;
      for (let j = 0; j <= rows; j++) {
        if (i % 2 === 0) {
          currentY = j * height;
          this.createInversedTriangle(currentX, currentY, i, j * 2, colorMap[i][j * 2]);
          this.createTriangle(currentX, currentY, i, j * 2 + 1, colorMap[i][j * 2 + 1]);
        } else {
          currentY = j * height - midHeight;
          this.createTriangle(currentX, currentY, i, j * 2, colorMap[i][j * 2]);
          this.createInversedTriangle(currentX, currentY + height, i, j * 2 + 1, colorMap[i][j * 2 + 1]);
        }
      }

      itemsObject.push(coordonates);
    }
    this.colorMap = colorMap;
  }

  createBackground() {
    this.changeCurrentLayer(BACKGROUND_LAYER);

    let {rows, cols, height, width} = this.state;

    const canvasHeight = rows * height;
    const canvasWidth = cols * width;
    let currentPath = undefined;
    let currentX = 0,
      currentY = 0;
    let dy = 0;

    for (let i = 0; i <= this.state.cols; i++) {
      currentX = i * width;
      currentPath = new paper.Path();
      currentPath.strokeColor = GRID_COLOR;
      currentPath.add(new paper.Point(currentX, 0));
      currentPath.add(new paper.Point(currentX, canvasHeight));

      if (i % 2 === 0 && i !== 0) {
        currentPath = new paper.Path();
        // Trigonometry to calculate opposite point
        dy = (canvasWidth - currentX) * TAN_PIBY6;
        currentPath.strokeColor = GRID_COLOR;
        currentPath.add(new paper.Point(currentX, 0));
        currentPath.add(new paper.Point(canvasWidth, dy));

        currentPath = new paper.Path();
        // Trigonometry to calculate opposite point
        dy = (canvasWidth - currentX) * TAN_PIBY6;
        currentPath.strokeColor = GRID_COLOR;
        currentPath.add(new paper.Point(currentX, canvasHeight));
        currentPath.add(new paper.Point(canvasWidth, canvasHeight - dy));
      }
    }

    for (let i = 0; i <= this.state.rows; i++) {
      currentY = i * height;
      currentPath = new paper.Path();
      // Trigonometry to calculate opposite point
      dy = canvasWidth * TAN_PIBY6;
      currentPath.strokeColor = GRID_COLOR;
      currentPath.add(new paper.Point(0, currentY));
      currentPath.add(new paper.Point(canvasWidth, currentY + dy));

      currentPath = new paper.Path();
      // Trigonometry to calculate opposite point
      dy = canvasWidth * TAN_MPIBY6;
      currentPath.strokeColor = GRID_COLOR;
      currentPath.add(new paper.Point(0, currentY));
      currentPath.add(new paper.Point(canvasWidth, currentY + dy));
    }
  }

  /**
 * Setup mouse interactions with canvas
 */
  setupMouse() {
    // Create a new paper.Tool which will contain interactions
    let tool = new paper.Tool();

    tool.onMouseDown = this.onDown;
    tool.onMouseUp = this.onUp;

    // Activate the tool
    tool.activate();
  }

  componentDidMount() {
    this.init();
  }

  onDown() {
    this.setState({down: true});
  }

  onUp() {
    this.setState({down: false});
  }

  render() {
    return (
      <div className="paper">
        <canvas
          id="drawCanvas"
          ref="canvas"
          onMouseOut={() => this.removeSelection()}
          data-paper-resize
          width={this.state.cols * this.state.width}
          height={this.state.rows * this.state.height}
          style={{
          width: this.state.cols * this.state.width,
          height: this.state.rows * this.state.height
        }}/>
      </div>
    );
  }
}

// Connect to the store
const mapStateToProps = (state) => {
  return {activeColor: state.getActiveColor.color, pointerMode: state.getPointerMode.mode};
};

const mapDispatchToProps = (dispatch) => {
  return {
    setPickerColor: (c) => {
      dispatch(setPickerColor(c));
    },
    setPointerMode: (m) => {
      dispatch(setPointerMode(m));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps, undefined, {withRef: true})(Paper);
