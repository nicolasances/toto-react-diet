import React, {Component} from 'react';
import PropTypes from 'prop-types';
import AnimateNumber from 'react-native-animate-number';
import {Animated, Easing, Text, View, StyleSheet, Dimensions, ART, TouchableOpacity} from 'react-native';
import moment from 'moment';
import * as scale from 'd3-scale';
import * as shape from 'd3-shape';
import * as array from 'd3-array';
import * as path from 'd3-path';
import * as theme from '../styles/ThemeColors';
import * as TotoEventBus from '../services/TotoEventBus';
import DietAPI from '../services/DietAPI';

const {Group, Shape, Surface, Transform} = ART;
const d3 = {scale, shape, array, path};
const window = Dimensions.get('window');

/**
 * Renders a stream (flow) of points corresponding to the macros in the past x days
 */
export default class MacroFlow extends Component {

  /**
   * Constructor
   */
  constructor(props) {
    super(props);

    // Init state
    this.state = {
      plots: []
    }

    // Param: height and width
    this.width = this.props.width != null ? this.props.width : window.width;
    this.height = this.props.height != null ? this.props.height : 100;

    // Parameter: number of days to extract macros from
    this.prospection = 14;

    // H Gap between the points
    this.hgap = 0;

    // Sizes
    this.pplotSize = 1.5;
    this.cplotSize = 1.5;
    this.fplotSize = 1.5;

    this.minPlotOpacity = 99;
    this.maxPlotOpacity = 99;

    this.plotColor = theme.color().COLOR_THEME_LIGHT;

    // Bind this
    this.redefineScales = this.redefineScales.bind(this);
  }

  /**
   * When the component has mounted
   */
  componentDidMount() {

    // Load the data
    this.loadData();
  }

  /**
   * Loads the data from the API
   */
  loadData() {

    // Define the start date
    let from = moment().subtract(this.prospection, 'days').format('YYYYMMDD');

    // Get the data
    new DietAPI().getMealsPerDay(from).then((data) => {

      let start = moment().subtract(this.prospection, 'days');

      let dataArray = [];
      let plots = [];

      // Create an array out of the object received
      for (var i = 0; i < this.prospection; i++) {

        // Get the actual data for that date
        let datum = data[start.format('YYYYMMDD')];

        // Convert the date
        datum.date = new Date(moment(datum.date, 'YYYYMMDD'));

        // Put in the array
        if (datum) dataArray.push(datum);

        start = start.add(1, 'days');

      }

      // Redefine the scales
      this.redefineScales(dataArray);

      // Reset start
      start = moment().subtract(this.prospection, 'days');

      // Define the plots
      for (var i = 0; i < this.prospection; i++) {

        // Get the actual data for that date
        let datum = data[start.format('YYYYMMDD')];

        // Create the 3 plots (proteins, carbs, fats)
        if (datum) {
          // Define the opacity of the point
          let opacity = this.gscale(datum.date);

          // Create the plot
          plots.push({x: this.x(datum.date), y: this.y(datum.proteins), color: this.plotColor , radius: this.pplotSize});
          plots.push({x: this.x(datum.date) + this.hgap, y: this.y(datum.carbs), color: this.plotColor, radius: this.cplotSize});
          plots.push({x: this.x(datum.date) + this.hgap * 2, y: this.y(datum.fats), color: this.plotColor, radius: this.fplotSize});
        }

        start = start.add(1, 'days');
      }


      // Update the state
      this.setState({plots: null}, () => {this.setState({plots: plots})});

    });

  }

  /**
   * Redefines the x and y scales based on the data received
   */
  redefineScales(data) {

    let ymin = d3.array.min(data, (d) => {return d3.array.min([d.proteins, d.fats, d.carbs])});
    let ymax = d3.array.max(data, (d) => {return d3.array.max([d.proteins, d.fats, d.carbs])});

    let xmin = d3.array.min(data, (d) => {return d.date});
    let xmax = d3.array.max(data, (d) => {return d.date});

    this.x = d3.scale.scaleLinear().range([6, this.width - 2 - this.hgap * 2]).domain([xmin, xmax]);
    this.y = d3.scale.scaleLinear().range([this.height - 2, 2]).domain([ymin, ymax]);

    // Grey scale
    this.gscale = d3.scale.scaleLinear().range([this.minPlotOpacity, this.maxPlotOpacity]).domain([xmin, xmax]);

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
  createShape(path, color) {

    if (color == null) color = 'rgba(255, 255, 255)';

    let key = 'MacroFlowPlot-' + Math.random();

    return (
      <Shape key={key} d={path} strokeWidth={0} stroke={color} fill={color} />
    )
  }



  /**
   * Draws the plots for the provided data (array of {x, y} values)
   */
  drawPlots(data) {

    if (data == null) return;

    // List of shapes
    let shapes = [];

    for (var i = 0; i < data.length; i++) {

      let point = data[i];

      // Draw the circle
      let path = this.circlePath(point.x, point.y, point.radius);

      // Create the shape
      let shape = this.createShape(path, point.color);

      shapes.push(shape);

    }

    return shapes;

  }

  /**
   * Renders the component
   */
  render() {

    // Define the plots
    let plots = this.drawPlots(this.state.plots);

    return (
      <View style={styles.container}>
        <Surface width={this.width} height={this.height}>
          {plots}
        </Surface>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 20,
  },
})
