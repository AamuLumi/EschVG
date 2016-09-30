import React from 'react';
import {connect} from 'react-redux';
import {setActiveColor, setPickerColor, setPointerMode, POINTER_MODES} from '~/src/actions/Global';
import SVG, {Polygon, Line, SVGGroup} from '~/src/components/SVG';
import Color, {transparent, lightGrey} from '~/src/tools/Color';
import Immutable from 'immutable';

const PI = Math.PI;
const MPIBY6 = -PI / 6;
const PIBY6 = PI / 6;
const TAN_PIBY6 = Math.tan(PIBY6);
const TAN_MPIBY6 = Math.tan(MPIBY6);
const sqrt = Math.sqrt;

const sqrt3 = sqrt(3);

const GRID_COLOR = lightGrey;
const REDRAW_ITEMS = true;

class Paper extends React.Component {
    static propTypes = {
        cols: React.PropTypes.number,
        rows: React.PropTypes.number,
        size: React.PropTypes.number,
        colorMap: React.PropTypes.instanceOf(Immutable.List),
        activeColor: React.PropTypes.instanceOf(Color),
        mapLastUpdated: React.PropTypes.number,
        itemsObject: React.PropTypes.array,
        pointerMode: React.PropTypes.number.isRequired
    }

    constructor(props) {
        super(props);

        this.state = {
            cols: this.props.cols,
            rows: this.props.rows,
            height: this.props.size,
            width: this.props.size / 2 * sqrt3,
            colorMap: this.props.colorMap,
            currentKey: 0,
            points: [this.props.cols][this.props.rows],
            gridShown: true,
            grid: Immutable.List(),
            selection: {},
            itemsObject: Immutable.List(),
            selectedPoint: undefined
        };

        this.createItems = this.createItems.bind(this);
    }

    reinit(redrawItems) {
        this.createBackground();
        if (redrawItems) {
            this.createItems();
        }
    }

    init() {
        this.createBackground();
        this.createItems();
    }

    // Background methods

    showGrid() {
        this.setState({gridShown: true});
    }

    hideGrid() {
        this.setState({gridShown: false});
    }

    getLineFor(key, width, color, points) {
        return {key: key, width: width, color: color, points: points};
    }

    renderLine(item) {
        return <Line
            key={item.key}
            points={item.points}
            width={item.width}
            color={item.color}/>;
    }

    createBackground() {
        let {rows, cols, height, width} = this.state;

        const canvasHeight = rows * height;
        const canvasWidth = cols * width;
        let currentX = 0,
            currentY = 0;
        let dy = 0;

        let grid = Immutable.List();
        let currentKey = 0;

        for (let i = 0; i <= this.state.cols; i++) {
            currentX = i * width;
            grid = grid.push(this.getLineFor(currentKey++, 1, GRID_COLOR, [
                [
                    currentX, 0
                ],
                [currentX, canvasHeight]
            ]));

            if (i % 2 === 0 && i !== 0) {
                // Trigonometry to calculate opposite point
                dy = (canvasWidth - currentX) * TAN_PIBY6;
                grid = grid.push(this.getLineFor(currentKey++, 1, GRID_COLOR, [
                    [
                        currentX, 0
                    ],
                    [canvasWidth, dy]
                ]));

                // Trigonometry to calculate opposite point
                dy = (canvasWidth - currentX) * TAN_PIBY6;
                grid = grid.push(this.getLineFor(currentKey++, 1, GRID_COLOR, [
                    [
                        currentX, canvasHeight
                    ],
                    [
                        canvasWidth, canvasHeight - dy
                    ]
                ]));
            }
        }

        for (let i = 0; i <= this.state.rows; i++) {
            currentY = i * height;
            // Trigonometry to calculate opposite point
            dy = canvasWidth * TAN_PIBY6;
            grid = grid.push(this.getLineFor(currentKey++, 1, GRID_COLOR, [
                [
                    0, currentY
                ],
                [
                    canvasWidth, currentY + dy
                ]
            ]));

            // Trigonometry to calculate opposite point
            dy = canvasWidth * TAN_MPIBY6;
            grid = grid.push(this.getLineFor(currentKey++, 1, GRID_COLOR, [
                [
                    0, currentY
                ],
                [
                    canvasWidth, currentY + dy
                ]
            ]));
        }

        this.setState({grid: grid});
    }

    // Draw methods

    renderTriangle(item) {
        if (!item || !item.points || !item.fillColor) {
            return undefined;
        }

        return <Polygon key={item.key} points={item.points} fillColor={item.fillColor}/>;
    }

    createItem(i, j, points, fillColor) {
        return {
            key: i + ',' + j,
            points: points,
            fillColor: fillColor
        };
    }

    createTriangle(x, y, i, j, fillColor) {
        return this.createItem(i, j, this.getTriangleFor(x, y), fillColor);
    }

    createInversedTriangle(x, y, i, j, fillColor) {
        return this.createItem(i, j, this.getInversedTriangleFor(x, y), fillColor);
    }

    getTriangleFor(x, y) {
        const {height, width} = this.state;
        const midHeight = height / 2;

        return [
            [
                x, y
            ],
            [
                x + width,
                y + midHeight
            ],
            [
                x, y + height
            ]
        ];
    }

    getInversedTriangleFor(x, y) {
        const {height, width} = this.state;
        const midHeight = height / 2;

        return [
            [
                x, y
            ],
            [
                x + width,
                y - midHeight
            ],
            [
                x + width,
                y + midHeight
            ]
        ];
    }

    createItems() {
        let {cols, rows, width, height, colorMap} = this.state;

        let midHeight = height / 2;

        let itemsObject = Immutable.List();
        let currentX = 0,
            currentY = 0;
        let currentRow = undefined;

        for (let i = 0; i < cols; i++) {
            currentX = i * width;
            currentRow = Immutable.List();
            for (let j = 0; j <= rows; j++) {
                if (i % 2 === 0) {
                    currentY = j * height;
                    currentRow = currentRow.push(this.createInversedTriangle(currentX, currentY, i, j * 2, colorMap.getIn([
                        i, j * 2
                    ])));
                    currentRow = currentRow.push(this.createTriangle(currentX, currentY, i, j * 2 + 1, colorMap.getIn([
                        i, j * 2 + 1
                    ])));
                } else {
                    currentY = j * height - midHeight;
                    currentRow = currentRow.push(this.createTriangle(currentX, currentY, i, j * 2, colorMap.getIn([
                        i, j * 2
                    ])));
                    currentRow = currentRow.push(this.createInversedTriangle(currentX, currentY + height, i, j * 2 + 1, colorMap.getIn([
                        i, j * 2 + 1
                    ])));
                }
            }

            itemsObject = itemsObject.push(currentRow);
        }

        this.setState({itemsObject: itemsObject});
    }

    drawTriangleForMousePoint(mouseX, mouseY, color, itemsObject) {
        let itemsFromState = false;
        let {width, height} = this.state;

        if (!itemsObject){
          itemsObject = this.state.itemsObject;
          itemsFromState = true;
        }

        // i = column, j = row
        let i = mouseX / width,
            j = mouseY / height;

        // x = beginning of the column, y = beginning of the row
        let x = parseInt(i) * width,
            y = parseInt(j) * height;

        // Coordonates centerd on the beginning of current cell
        let iCentered = i - parseInt(i),
            jCentered = j - parseInt(j);

        let col = parseInt(i);

        // If is even
        if (parseInt(i) % 2 === 0) {
            // Search the triangles who must be drawn
            if (2 * jCentered - iCentered < 0) {
                itemsObject = itemsObject.setIn([
                    col, parseInt(j) * 2
                ], this.createInversedTriangle(x, y, i, j, color));
            } else if (2 * jCentered + iCentered > 2) {
                itemsObject = itemsObject.setIn([
                    col, parseInt(j) * 2 + 2
                ], this.createInversedTriangle(x, y + height, i, j, color));
            } else {
                itemsObject = itemsObject.setIn([
                    col, parseInt(j) * 2 + 1
                ], this.createTriangle(x, y, i, j, color)) // Else if odd;
            }
        } else {
            if (2 * jCentered - iCentered > 1) {
                itemsObject = itemsObject.setIn([
                    col, parseInt(j) * 2 + 2
                ], this.createTriangle(x, y + height / 2, i, j, color));
            } else if (2 * jCentered + iCentered < 1) {
                itemsObject = itemsObject.setIn([
                    col, parseInt(j) * 2
                ], this.createTriangle(x, y - height / 2, i, j, color));
            } else {
                itemsObject = itemsObject.setIn([
                    col, parseInt(j) * 2 + 1
                ], this.createInversedTriangle(x, y + height / 2, i, j, color));
            }
        }

        if (itemsFromState) {
          this.setState({itemsObject: itemsObject});
        }

        return itemsObject;
    }

    drawTrianglesForLine(p1, p2) {
        const deltaX = p1[0] > p2[0]
            ? p1[0] - p2[0]
            : p2[0] - p1[0];
        const deltaY = p1[1] > p2[1]
            ? p1[1] - p2[1]
            : p2[1] - p1[1];

        const directionX = p1[0] > p2[0]
            ? -1
            : 1;
        const directionY = p1[1] > p2[1]
            ? -1
            : 1;

        const nbPoints = deltaX > deltaY
            ? deltaX
            : deltaY;

        let currentX = 0,
            currentY = 0;

        let itemsObject = undefined;

        for (let i = 0; i < nbPoints; i++) {
            currentX = p1[0] + directionX * deltaX * i / nbPoints;
            currentY = p1[1] + directionY * deltaY * i / nbPoints;
            itemsObject = this.drawTriangleForMousePoint(currentX, currentY, this.props.activeColor, itemsObject);
        }

        this.setState({itemsObject});
    }

    // Selection methods

    getTriangleForPoint(mouseX, mouseY) {
        // Same as drawTriangleForMousePoint)
        const {width, height, itemsObject} = this.state;

        let i = mouseX / width,
            j = mouseY / height;

        let iCentered = i - parseInt(i),
            jCentered = j - parseInt(j);

        let col = parseInt(i);

        // If is even
        if (parseInt(i) % 2 === 0) {
            // Search the triangles who must be drawn
            if (2 * jCentered - iCentered < 0) {
                return itemsObject.getIn([
                    col, parseInt(j) * 2
                ]);
            } else if (2 * jCentered + iCentered > 2) {
                return itemsObject.getIn([
                    col, parseInt(j) * 2 + 2
                ]);
            } else {
                return itemsObject.getIn([
                    col, parseInt(j) * 2 + 1
                ]); // Else if odd;
            }
        } else {
            if (2 * jCentered - iCentered > 1) {
                return itemsObject.getIn([
                    col, parseInt(j) * 2 + 2
                ]);
            } else if (2 * jCentered + iCentered < 1) {
                return itemsObject.getIn([
                    col, parseInt(j) * 2
                ]);
            } else {
                return itemsObject.getIn([
                    col, parseInt(j) * 2 + 1
                ]);
            }
        }
    }

    drawSelectionForMousePoint(mouseX, mouseY, color) {
        // Same as drawTriangleForMousePoint)
        const {width, height} = this.state;

        let i = mouseX / width,
            j = mouseY / height;

        let x = parseInt(i) * width,
            y = parseInt(j) * height;

        let iCentered = i - parseInt(i),
            jCentered = j - parseInt(j);

        let selection = {};

        if (parseInt(i) % 2 === 0) {
            if (2 * jCentered - iCentered < 0) {
                selection = this.createInversedTriangle(x, y, 's', 0, color);
            } else if (2 * jCentered + iCentered > 2) {
                selection = this.createInversedTriangle(x, y + height, 's', 0, color);
            } else {
                selection = this.createTriangle(x, y, 's', 0, color);
            }
        } else {
            if (2 * jCentered - iCentered > 1) {
                selection = this.createTriangle(x, y + height / 2, 's', 0, color);
            } else if (2 * jCentered + iCentered < 1) {
                selection = this.createTriangle(x, y - height / 2, 's', 0, color);
            } else {
                selection = this.createInversedTriangle(x, y + height / 2, 's', 0, color);
            }
        }

        this.setState({selection: selection});
    }

    removeSelection() {
        this.setState({selection: {}});
    }

    // Mouse methods

    onMouseDown(e) {
        const {pointerMode} = this.props;

        if (pointerMode === POINTER_MODES.PICKER) {
            this.props.setActiveColor(this.getTriangleForPoint(e.nativeEvent.offsetX, e.nativeEvent.offsetY).fillColor);
            this.props.setPointerMode(POINTER_MODES.NORMAL);
        } else if (pointerMode === POINTER_MODES.LINER) {
            this.setState({
                selectedPoint: [e.nativeEvent.offsetX, e.nativeEvent.offsetY]
            });
        } else {
            this.setState({down: true});
            this.drawTriangleForMousePoint(e.nativeEvent.offsetX, e.nativeEvent.offsetY, this.props.activeColor);
        }
    }

    onMouseUp(e) {
        const {pointerMode} = this.props;
        const {selectedPoint} = this.state;

        if (pointerMode === POINTER_MODES.LINER) {
            this.drawTrianglesForLine(selectedPoint, [e.nativeEvent.offsetX, e.nativeEvent.offsetY]);
            this.props.setPointerMode(POINTER_MODES.NORMAL);
            this.setState({down: false});
        } else {
            this.setState({down: false});
        }
    }

    onMouseMove(e) {
        const {pointerMode} = this.props;

        this.drawSelectionForMousePoint(e.nativeEvent.offsetX, e.nativeEvent.offsetY, this.props.activeColor);

        if (this.state.down && pointerMode === POINTER_MODES.NORMAL) {
            this.drawTriangleForMousePoint(e.nativeEvent.offsetX, e.nativeEvent.offsetY, this.props.activeColor);
        }
    }

    // Save loads methods

    loadState(state) {
        this.removeSelection();
        this.setState(state);
    }

    // Lifecycle methods

    componentWillMount() {
        this.init();
    }

    componentWillReceiveProps(newProps) {
        if (newProps.colorMap && newProps.colorMap !== this.props.colorMap) {
            this.setState({
                colorMap: newProps.colorMap
            }, () => {
                this.reinit(REDRAW_ITEMS);
            });
        }

        if (newProps.cols !== this.props.cols || newProps.rows !== this.props.rows) {
            this.setState({
                cols: newProps.cols,
                rows: newProps.rows
            }, () => {
                this.reinit(REDRAW_ITEMS);
            });
        }

        if (newProps.gridShown) {
            this.showGrid();
        } else {
            this.hideGrid();
        }

        this.props = newProps;
    }

    render() {
        const {grid, selection, itemsObject, gridShown} = this.state;

        return (
            <div className="paper">
                <SVG
                    onMouseDown={(e) => this.onMouseDown(e)}
                    onMouseMove={(e) => this.onMouseMove(e)}
                    onMouseUp={(e) => this.onMouseUp(e)}
                    onMouseLeave={() => this.removeSelection()}
                    width={this.state.cols * this.state.width}
                    height={this.state.rows * this.state.height}>
                    <SVGGroup elements={itemsObject} renderElement={this.renderTriangle}/> {this.renderTriangle(selection)}
                    <SVGGroup elements={grid} renderElement={this.renderLine} visible={gridShown}/>
                </SVG>
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
        },
        setActiveColor: (c) => {
            dispatch(setActiveColor(c));
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps, undefined, {withRef: true})(Paper);
