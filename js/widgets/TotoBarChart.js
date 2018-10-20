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
 * - barSpacing          : (optional) the spacing between bars. Default 2
 */
class TotoBarChart extends Component {

  /**
   * Constructor
   */
  constructor(props) {
    super(props);

    // Init the state!
    this.state = {
      data: null
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

    // Update the state with the new data
    this.setState({data: []}, () => {this.setState({data: props.data})});

    // Define the min and max x values
    let xMin = d3.array.min(props.data, (d) => {return d.x});
    let xMax = d3.array.max(props.data, (d) => {return d.x});

    // Define the min and max y values
    let yMin = d3.array.min(props.data, (d) => {return d.y});
    let yMax = d3.array.max(props.data, (d) => {return d.y});

    // Update the scales
    this.x = d3.scale.scaleLinear().range([this.barSpacing, window.width - this.barWidth - this.barSpacing]).domain([xMin, xMax]);
    this.y = d3.scale.scaleLinear().range([0, this.height]).domain([0, yMax]);

  }

  /**
   * Returns a shape drawing the provided path
   */
  createShape(path, color) {

    let key = 'TotoBarChartShape-' + Math.random();

    return (
      <Shape key={key} d={path} strokeWidth={0} stroke={color} fill={color} />
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

    // For each point, create a bar
    for (var i = 0; i < data.length; i++) {

      // The single datum
      let value = data[i].x;

      // Transform the value if necessary
      value = this.props.xAxisTransform(value);

      // Positioning of the text
      let x = this.x(data[i].x);
      let key = 'Label-X-' + Math.random();

      // Create the text element
      let element = (
        <View key={key} style={{position: 'absolute', left: x, top: this.height - 40, width: this.barWidth, alignItems: 'center'}}>
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
      bars.push(this.createShape(p.toString(), color));
    }

    // Return the bars
    return bars;

  }

  /**
   * Renders the component
   */
  render() {

    let bars = this.createBars(this.state.data);
    let labels = this.createValueLabels(this.state.data);
    let xLabels = this.createXAxisLabels(this.state.data);

    return (
      <View style={styles.container}>
        <Surface height={this.props.height} width={window.width}>
          {bars}
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
    color: theme.color().COLOR_TEXT + '50',
    fontSize: 14,
  },
});
