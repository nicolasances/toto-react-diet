import React, {Component} from 'react';
import {Animated, Easing, View, Text, ART, Dimensions, StyleSheet} from 'react-native';
import * as scale from 'd3-scale';
import * as shape from 'd3-shape';
import * as array from 'd3-array';
import * as path from 'd3-path';
import * as theme from '../styles/ThemeColors';
import moment from 'moment';

const {Group, Shape, Surface} = ART;
const d3 = {scale, shape, array, path};
const window = Dimensions.get('window');

/**
 * Creates a bar chart
 * Requires the following:
 * - data                : the data to create the chart in the following form:
 *                         [ { x: numeric, x value,
 *                            y: numeric, y value,
 *                            temporary: boolean, optional, if true will highlight this element as a temporary one
 *                          }, {...} ]
 * - valueLabelTransform : a function, optional, (value) => {transforms the value to be displayed on the bar (top part)}
 * - xAxisTransform      : a function to be called with the x axis value to generate a label to put on the bar (bottom part)
 * - xLabelMode          : (optional) specifies the mode in which the x labels are shown:
 *                           - if 'when-changed' the x label is shown only when the value changes
 * - xLabelWidth         : (optional) specified is the label width has to be set or should be unlimited
 *                         default: limited to the bar width
 *                           - if 'unlimited' it won't be limited to the bar width
 * - barSpacing          : (optional) the spacing between bars. Default 2
 * - yLines              : (optioanl) the y values for which to draw a horizontal line (to show the scale)
 *                         if passed, it's an [y1, y2, y3, ...]
 *                         each value will correspond to a horizontal line
 * - minY                : (optional) the minimum y value to consider as the "lowest" value, when defining the SCALE
 * - overlayLineData     : (optipnal) the data to draw a line chart on top of the bar chart
 *                         it's an [{x, y}, {x, y}, ...]
 *                         note that the x axis is the same as the one used for the barchart, so it follows the same scale
 * - overlayMinY         : (optional) the minimum y value to consider as the "lowest" value of the overlay line, when defining the SCALE
 */
class TotoBarChart extends Component {

  /**
   * Constructor
   */
  constructor(props) {
    super(props);

    // Init the state!
    this.state = {
      data: null,
      yLines: [],
      overlayLineData: null
    }
  }

  /**
   * Mount the component
   */
  componentDidMount() {
    this.mounted = true;
  }

  /**
  * Unmount the component
  */
  componentWillUnmount() {
    this.mounted = false;
  }

  /**
   * Receives updated properties
   */
  componentWillReceiveProps(props) {

    // Set height
    this.height = props.height == null ? 250 : props.height;

    this.barSpacing = props.barSpacing == null ? 2 : props.barSpacing;

    // Set the barWidth
    this.barWidth = props.data != null ? (window.width / props.data.length - this.barSpacing * 2) : 0;

    if (!this.mounted) return;

    // Define the min and max x values
    let xMin = d3.array.min(props.data, (d) => {return d.x});
    let xMax = d3.array.max(props.data, (d) => {return d.x});

    // Define the min and max y values
    let yMin = props.minY == null ? 0 : props.minY;
    let yMax = d3.array.max(props.data, (d) => {return d.y});

    // Update the scales
    this.x = d3.scale.scaleLinear().range([this.barSpacing, window.width - this.barWidth - this.barSpacing]).domain([xMin, xMax]);
    this.y = d3.scale.scaleLinear().range([0, this.height]).domain([yMin, yMax]);

    // Define the min and max value of the Y scale for the overalay line chart, if any
    let yOverlayMin = props.overlayMinY ? props.overlayMinY : 0;
    let yOverlayMax = props.overlayLineData ? d3.array.max(props.overlayLineData, (d) => {return d.y}) : 0;

    // Define the y scale for the overlay line, if any
    this.yOverlay = props.overlayLineData ? d3.scale.scaleLinear().range([0, this.height]).domain([yOverlayMin, yOverlayMax]) : null;

    // Update the state with the new data
    this.setState({data: [], yLines: [], overlayLineData: []}, () => {
      this.setState({
        data: props.data,
        yLines: props.yLines,
        overlayLineData: props.overlayLineData
      })
    });
  }

  /**
   * Returns a shape drawing the provided path
   */
  createShape(path, color, fillColor, strokeWidth) {

    if (strokeWidth == null) strokeWidth = 0;

    let key = 'TotoBarChartShape-' + Math.random();

    return (
      <Shape key={key} d={path} strokeWidth={strokeWidth} stroke={color} fill={fillColor} />
    )
  }

  /**
   * Create the labels with the values
   */
  createValueLabels(data) {

    if (this.props.valueLabelTransform == null) return;

    if (data == null) return;

    // The labels
    let labels = [];

    // For each point, create a bar
    for (var i = 0; i < data.length; i++) {

      // The single datum
      let value = data[i].y;

      // Transform the value if necessary
      if (this.props.valueLabelTransform) value = this.props.valueLabelTransform(value);

      // Positioning of the text
      let x = this.x(data[i].x);
      let y = this.y(data[i].y);
      let key = 'Label-' + Math.random();

      // Create the text element
      let element = (
        <View key={key} style={{position: 'absolute', left: x, top: this.height - y + 6, width: this.barWidth, alignItems: 'center'}}>
          <Text style={styles.valueLabel}>{value}</Text>
        </View>
      );

      labels.push(element);
    }

    return labels;
  }

  /**
   * Create the x axis labels
   */
  createXAxisLabels(data) {

    if (data == null) return;
    if (this.props.xAxisTransform == null) return;

    // The labels
    let labels = [];

    // Value of the last x label
    let lastValue = null;

    // For each point, create a bar
    for (var i = 0; i < data.length; i++) {

      // The single datum
      let value = data[i].x;

      // Transform the value if necessary
      value = this.props.xAxisTransform(value);

      // If the label needs to be shown only when it changes value:
      if (this.props.xLabelMode == 'when-changed') {
        // if it equals the last value, continue
        if (value == lastValue) continue;

      }

      // Update the last label value
      lastValue = value;

      // Define the width of the label
      let labelWidth = this.props.xLabelWidth == 'unlimited' ? null : this.barWidth;

      // Define the x position
      // Equals to the start of the bar, unless the xLabelWidth is 'unlimited', in that case a padding is added
      let x = this.x(data[i].x);

      if (this.props.xLabelWidth == 'unlimited') x += 3;

      // Define the key
      let key = 'Label-X-' + Math.random();

      // Create the text element
      let element = (
        <View key={key} style={{position: 'absolute', left: x, top: this.height - 40, width: labelWidth, alignItems: 'center'}}>
          <Text style={styles.xAxisLabel}>{value}</Text>
        </View>
      );

      labels.push(element);
    }

    return labels;
  }

  /**
   * Creates the bars
   */
  createBars(data) {

    // Don't draw if there's no data
    if (data == null) return;

    // Bars definition
    let bars = [];

    // For each point, create a bar
    for (var i = 0; i < data.length; i++) {

      // The single datum
      let datum = data[i];

      // Create the rectangle
      let p = d3.path.path();
      p.rect(this.x(datum.x), this.height, this.barWidth, -this.y(datum.y));

      // Define the color of the bar
      // If the datum is indicated as temporary, then color it differently
      let color = (datum.temporary) ? theme.color().COLOR_THEME_DARK + '80' : theme.color().COLOR_THEME_DARK;

      // Push the Shape object
      bars.push(this.createShape(p.toString(), color, color));
    }

    // Return the bars
    return bars;

  }

  /**
   * Creates the horizontal y scale lines as requested in the property yLines
   */
  createYLines(ylines) {

    if (ylines == null) return;

    let shapes = [];

    for (var i = 0; i < ylines.length; i++) {

      let line = d3.shape.line()
          .x((d) => {return d.x})
          .y((d) => {return d.y});

      let path = line([{x: 0, y: this.height - this.y(ylines[i])}, {x: window.width, y: this.height - this.y(ylines[i])}]);

      shapes.push(this.createShape(path, theme.color().COLOR_THEME_LIGHT + 50, null, 1));
    }

    return shapes;

  }

  /**
   * Creates the labels to put on the ylines, if any
   */
  createYLinesLabels(ylines) {

    if (ylines == null) return;

    let shapes = [];

    for (var i = 0; i < ylines.length; i++) {

      let key = 'Label-YLine-' + Math.random();

      // Create the text element
      let element = (
        <View key={key} style={{position: 'absolute', left: 6, top: this.height + 3 - this.y(ylines[i])}}>
          <Text style={styles.yAxisLabel}>{ylines[i]}</Text>
        </View>
      );

      shapes.push(element);
    }

    return shapes;

  }

  /**
   * Creates an overlay line chart on top of the bar chart
   */
  createOverlayLineChart(data) {

    if (data == null) return;

    let line = d3.shape.line()
                  .x((d) => {return this.x(d.x)})
                  .y((d) => {return this.height - this.yOverlay(d.y)})

    let path = line(data);

    let shape = this.createShape(path, theme.color().COLOR_THEME_LIGHT, null, 2);

    return shape;

  }

  /**
   * Renders the component
   */
  render() {

    let bars = this.createBars(this.state.data);
    let labels = this.createValueLabels(this.state.data);
    let xLabels = this.createXAxisLabels(this.state.data);
    let ylines = this.createYLines(this.state.yLines);
    let ylinesLabels = this.createYLinesLabels(this.state.yLines);
    let overlayLineChart = this.createOverlayLineChart(this.state.overlayLineData)

    return (
      <View style={styles.container}>
        <Surface height={this.props.height} width={window.width}>
          {bars}
          {ylines}
          {overlayLineChart}
        </Surface>
        {labels}
        {xLabels}
        {ylinesLabels}
      </View>
    )
  }

}

/**
 * Exports the animated component
 */
export default Animated.createAnimatedComponent(TotoBarChart);

/**
 * Stylesheets
 */
const styles = StyleSheet.create({
  container: {
  },
  valueLabel: {
    color: theme.color().COLOR_ACCENT,
    fontSize: 14,
  },
  xAxisLabel: {
    color: theme.color().COLOR_THEME_LIGHT,
    fontSize: 12,
  },
  yAxisLabel: {
    color: theme.color().COLOR_THEME_LIGHT,
    fontSize: 10,
  },
});
