import React, {Component} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import * as TotoEventBus from '../services/TotoEventBus';
import * as theme from '../styles/ThemeColors';
import DietAPI from '../services/DietAPI';
import WeightAPI from '../services/WeightAPI';
import TotoBarChart from '../widgets/TotoBarChart';
import moment from 'moment';

export default class MonthlyStats extends Component {

  constructor(props) {
    super(props);

    this.height = props.height == null ? 250 : props.height;

    this.state = {
      mealsStats: [],
      weights: [],
      // Define the y lines
      ylines: [2000, 2500, 3000]
    };

    // Set the prospection IN MONTHS
    this.prospection = 7;

    // Bind the functions that need 'this'
    this.updateState = this.updateState.bind(this);
    this.onMealAdded = this.onMealAdded.bind(this);
    this.loadData = this.loadData.bind(this);
    this.onWeightsLoaded = this.onWeightsLoaded.bind(this);
  }

  // When the component is mounted
  componentDidMount() {

    // Load the data
    this.loadData();

    // Subscribe to relevant events
    TotoEventBus.bus.subscribeToEvent('mealAdded', this.onMealAdded);
  }

  /**
   * Unmount the component
   */
  componentWillUnmount() {
    // Unsubscribe to relevant events
    TotoEventBus.bus.unsubscribeToEvent('mealAdded', this.onMealAdded);
  }

  /**
   * React to the meal added event
   */
  onMealAdded(event) {

    this.setState({mealStats: null}, () => {this.loadData()});
  }

  /**
   * Updates the state
   */
  updateState(response) {

    if (response == null) return;

		// Put the data as an array of {}
		var data = [];
		for (var i = 0; i < response.meals.length; i++) {

      let week = response.meals[i];

      if (week.week == 0) continue;

      // Skip this current week
      if (week.week == moment().format('WW') && week.year == moment().format('YYYY')) continue;

      // Create a date out of the week and year (like the day of the first day of that week)
      let date = moment(week.year + '-' + week.week, 'YYYYWW');

      let datum = {x: new Date(date), y: week.calories};

      // Add the datum
      data.push(datum);
		}

    this.setState({
      mealsStats: data
    });
  }

  /**
   * Updates the state when the weights have been loaded
   */
  onWeightsLoaded(response) {

    if (response == null) return;

    let data = [];

    // Create the {x, y} coordinates to pass to the graph
    for (var i = 0; i < response.weights.length; i++) {

      let week = response.weights[i];

      // Create a date out of the week and year (like the day of the first day of that week)
      let date = moment(week.year + '-' + week.weekOfYear, 'YYYYWW');

      data.push({x: new Date(date), y: week.weight});

    }

    this.setState({weights: []}, () => {this.setState({weights: data})});

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

		// Go back to the prospection required
		date = date.subtract(this.prospection, 'months');

		new DietAPI().getCaloriesPerWeek(date.format('YYYYMMDD')).then(this.updateState);

    new WeightAPI().getWeightsPerWeek(date.format('YYYYMMDD')).then(this.onWeightsLoaded);

  }

  /**
   * Renders this component
   */
  render() {

    return (
      <View style={{height: 250}}>
        <View style={{flex: 1}}></View>
        <TotoBarChart
              height={200}
              barSpacing={1}
              data={this.state.mealsStats}
              yLines={this.state.ylines}
              minY={1500}
              xAxisTransform={(x) => {return moment(x).format('MMM')}}
              xLabelMode='when-changed'
              xLabelWidth='unlimited'
              overlayLineData={this.state.weights}
              overlayMinY={70}
              />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  infoContainer: {
    flex: 1,
    padding: 12,
    flexDirection: 'row',
  },
  week: {
    color: theme.color().COLOR_TEXT,
    fontSize: 16,
  },
  averageLabel: {
    color: theme.color().COLOR_TEXT,
    fontSize: 12,
  },
  averageValue: {
    color: theme.color().COLOR_ACCENT,
    fontSize: 22,
    textAlign: 'right',
  },
});
