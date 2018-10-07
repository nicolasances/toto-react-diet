import React, {Component} from 'react';
import {View, Text, ART, Dimensions, StyleSheet} from 'react-native';
import * as scale from 'd3-scale';
import * as shape from 'd3-shape';
import * as array from 'd3-array';
import * as path from 'd3-path';
import * as theme from '../styles/ThemeColors';
import * as TotoEventBus from '../services/TotoEventBus';
import DietAPI from '../services/DietAPI';
import moment from 'moment';

const {Group, Shape, Surface} = ART;
const d3 = {scale, shape, array, path};
const window = Dimensions.get('window');

export default class WeeklyStats extends Component {

  constructor(props) {
    super(props);

    this.height = props.height == null ? 250 : props.height;
    this.width = window.width;
    this.calCircleRadius = 15;
    this.paddingH = 12;

    this.state = {
      mealsStats: []
    };

    // Bind the functions that need 'this'
    this.updateState = this.updateState.bind(this);
    this.createCirclesPath = this.createCirclesPath.bind(this);
  }

  // When the component is mounted
  componentDidMount() {

    // Create the dates of the week
    this.createDatesOfWeek();

    // Load the data
    this.loadData();
  }

  /**
   * Updates the state
   */
  updateState(data) {
    this.setState({
      mealsStats: data
    });
  }

  /**
   * Creates the array with the dates of the week
   */
  createDatesOfWeek() {

    var date = moment();

    // If today is friday or saturday, move to the sunday cause we're already
    // in the new week
    if (date.day() == 5 || date.day() == 6) date = date.add(7 - date.day(), 'days');

    // Go to the sunday start of the week
    date = date.startOf('week');

    // Go to the previous friday, since that's the start of the weight week
    date = date.subtract(2, 'days');

    // Array of dates
    let dates = [];

    // Start creating the dates
    for (i = 0; i < 7; i++) {

      // Add the date to the array
      dates.push(date.format('YYYYMMDD'));

      // Go on one day
      date = date.add(1, 'days');
    }

    // Update the state
    this.setState({dates: dates});

  }

  /**
   * Loads the weekly meals data from the API
   * Retrieves the meals of the week
   *
   * Consider that the week starts on FRIDAY since that's when the
   * weight is taken
   */
  loadData() {

		var date = moment();

		// If today is friday or saturday, move to the sunday cause we're already
		// in the new week
		if (date.day() == 5 || date.day() == 6) date = date.add(7 - date.day(), 'days');

		// Go to the sunday start of the week
		date = date.startOf('week');

		// Go to the previous friday, since that's the start of the weight week
		date = date.subtract(2, 'days');

		new DietAPI().getMealsPerDay(date.format('YYYYMMDD')).then(this.updateState);

  }

  /**
   * Returns a shape drawing the provided path
   */
  createShape(path) {

    let key = 'WeeklyStatsShape-' + Math.random();

    return (
      <Shape key={key} d={path} strokeWidth={2} stroke={theme.color().COLOR_ACCENT} />
    )
  }

  /**
   * Creates the circles for each day
   */
  createCirclesPath(mealsStats) {

    if (this.state.dates == null) return;

		// Put the data as an array of {}
		var data = [];
		for (var i = 0; i < this.state.dates.length; i++) {

      var day = mealsStats[this.state.dates[i]];

      // If there are meals for that date:
      if (day != null) {
        data.push(day);
      }
		}

		// Create the x and y scales
		var x = d3.scale.scaleBand().range([this.paddingH + this.calCircleRadius, this.width - this.paddingH - this.calCircleRadius]).padding(0.1).domain([0, 1, 2, 3, 4, 5, 6]);
		var y = d3.scale.scaleLinear().range([this.height - 32, 32]).domain([0, d3.array.max(data, function(d) {return d.calories})]);

    let circles = [];

    for (let i = 0; i < data.length; i++) {
      var circle = ART.Path()
            .move(x(i), y(data[i].calories))
            .arc(0, 2 * this.calCircleRadius, this.calCircleRadius)
            .arc(0, -2 * this.calCircleRadius, this.calCircleRadius);

      var shape = this.createShape(circle);

      circles.push(shape);

    }

    return circles;

  }

  /**
   * Renders this component
   */
  render() {

    let circles = this.createCirclesPath(this.state.mealsStats);

    return (
      <View>
        <Surface style={styles.surface} width={this.width} height={this.height}>
          {circles}
        </Surface>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  surface: {},
});
