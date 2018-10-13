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
import TotoBarChart from '../widgets/TotoBarChart';

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
  updateState(mealsStats) {

    if (this.state.dates == null) return;

		// Put the data as an array of {}
		var data = [];
		for (var i = 0; i < this.state.dates.length; i++) {

      var day = mealsStats[this.state.dates[i]];

      // If there are meals for that date:
      if (day != null) {

        let datum = {x: parseInt(this.state.dates[i]), y: day.calories};

        // If the date is today => highlight as temporary
        if (this.state.dates[i] >= moment().format('YYYYMMDD')) datum.temporary = true;

        // Add the datum
        data.push(datum);
      }
      else {
        data.push({x: parseInt(this.state.dates[i]), y: 0});
      }
		}

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
   * Renders this component
   */
  render() {

    return (
      <View>
        <TotoBarChart data={this.state.mealsStats} height={250} valueLabelTransform={(value) => value.toFixed(0)} />
      </View>
    )
  }
}

const styles = StyleSheet.create({
});
