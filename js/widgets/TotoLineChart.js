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
 * - data               : the data to create the chart in the following form:
 *                        [ { x: numeric, x value,
 *                            y: numeric, y value,
 *                            temporary: boolean, optional, if true will highlight this element as a temporary one
 *                          }, {...} ]
 * - valueLabelTransform : a function, optional, (value) => {transforms the value to be displayed on the bar (top part)}
 * - xAxisTransform      : a function to be called with the x axis value to generate a label to put on the bar (bottom part)
 */
class TotoLineChart extends Component {

  /**
   * Constructor
   */
  constructor(props) {
    super(props);

    // Init the state!
    this.state = {
      data: null,
      // Graph settings
      settings: {
        lineColor: theme.color().COLOR_THEME_LIGHT,
        valueLabelColor: theme.color().COLOR_TEXT,
        valueCircleColor: theme.color().COLOR_THEME_LIGHT,
        spotRadius: 6,
        graphMarginH: 24,
      }
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

    // Set the barWidth
    if (!this.mounted) return;

    // Update the state with the new data
    this.setState({data: []}, () => {this.setState({data: props.data})});

    // Define the min and max x values
    let xMin = d3.array.min(props.data, (d) => {return d.x});
    let xMax = d3.array.max(props.data, (d) => {return d.x});

    // Define the min and max y values
    let yMin = d3.array.min(props.data, (d) => {return d.y});
    let yMax = d3.array.max(props.data, (d) => {return d.y});

    // Update the scales
    this.x = d3.scale.scaleLinear().range([this.state.settings.graphMarginH, window.width - this.state.settings.graphMarginH]).domain([xMin, xMax]);
    this.y = d3.scale.scaleLinear().range([0, this.height - this.state.settings.spotRadius - 2]).domain([0, yMax]);

  }

  /**
   * Transforms cartesian coord in polar coordinates
   */
  polarCoord(centerX, centerY, radius, angleInDegrees) {

    var angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;

    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    }
  }

  /**
   * Creates a circle path
   */
  circlePath(cx, cy, radius) {

    let startAngle = 0;
    let endAngle = 360;

    var start = this.polarCoord(cx, cy, radius, endAngle * 0.9999);
    var end = this.polarCoord(cx, cy, radius, startAngle);
    var largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    var d = [
      'M', start.x, start.y,
      'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ]

    return d.join();

  }

  /**
   * Returns a shape drawing the provided path
   */
  createShape(path, color, fillColor) {

    let key = 'TotoLineChartShape-' + Math.random();

    return (
      <Shape key={key} d={path} strokeWidth={2} stroke={color} fill={fillColor} />
    )
  }

  /**
   * Create the labels with the values
   */
  createValueLabels(data) {

    if (data == null) return;

    // The labels
    let labels = [];

    // For each point, create a bar
    for (var i = 0; i < data.length; i++) {

      if (data[i].y == 0) continue;

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
        <View key={key} style={{position: 'absolute', left: x - 8, top: this.height - y - 28, alignItems: 'center'}}>
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

    // For each point, create a bar
    for (var i = 0; i < data.length; i++) {

      // The single datum
      let value = data[i].x;

      // Transform the value if necessary
      value = this.props.xAxisTransform(value);

      // Positioning of the text
      let x = this.x(data[i].x) - 10;
      let key = 'Label-X-' + Math.random();

      // Create the text element
      let element = (
        <View key={key} style={{position: 'absolute', left: x, top: this.height - 40, width: 20, alignItems: 'center'}}>
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
  createLine(data) {

    // Don't draw if there's no data
    if (data == null) return;

    var line = d3.shape.line()
                  .x((d) => {return this.x(d.x)})
                  .y((d) => {return this.height - this.y(d.y)})
                  .curve(d3.shape.curveCardinal);

    var path = line([...data]);

    // Return the shape
    return this.createShape(path, this.state.settings.lineColor);

  }

  /**
   * Creates the circles for every value
   */
  createCircles(data) {

    if (data == null) return;

    let circles = [];

    for (var i = 0; i < data.length; i++) {

      let datum = data[i];

      let circle = this.circlePath(this.x(datum.x), this.height-this.y(datum.y), this.state.settings.spotRadius);

      circles.push(this.createShape(circle, this.state.settings.valueCircleColor, theme.color().COLOR_THEME));
    }

    return circles;

  }

  /**
   * Renders the component
   */
  render() {

    let line = this.createLine(this.state.data);
    let circles = this.createCircles(this.state.data);
    let labels = this.createValueLabels(this.state.data);
    let xLabels = this.createXAxisLabels(this.state.data);

    return (
      <View style={styles.container}>
        <Surface height={this.props.height} width={window.width}>
          {line}
          {circles}
        </Surface>
        {labels}
        {xLabels}
      </View>
    )
  }

}

/**
 * Exports the animated component
 */
export default Animated.createAnimatedComponent(TotoLineChart);

/**
 * Stylesheets
 */
const styles = StyleSheet.create({
  container: {
  },
  valueLabel: {
    color: theme.color().COLOR_TEXT,
    fontSize: 10,
  },
  xAxisLabel: {
    color: theme.color().COLOR_TEXT + '50',
    fontSize: 10,
  },
});
