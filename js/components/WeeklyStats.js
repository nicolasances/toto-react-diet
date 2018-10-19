import React, {Component} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import * as TotoEventBus from '../services/TotoEventBus';
import * as theme from '../styles/ThemeColors';
import DietAPI from '../services/DietAPI';
import TotoBarChart from '../widgets/TotoBarChart';
import moment from 'moment';

export default class WeeklyStats extends Component {

  constructor(props) {
    super(props);

    this.height = props.height == null ? 250 : props.height;

    this.state = {
      mealsStats: [],
      averageCalories: 0
    };

    // Bind the functions that need 'this'
    this.updateState = this.updateState.bind(this);
    this.onMealAdded = this.onMealAdded.bind(this);
    this.loadData = this.loadData.bind(this);
  }

  // When the component is mounted
  componentDidMount() {

    // Create the dates of the week
    this.createDatesOfWeek();

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
  updateState(mealsStats) {

    if (this.state.dates == null) return;

    // Define the average calories
    let averageCalories = 0;
    let days = 0;

		// Put the data as an array of {}
		var data = [];
		for (var i = 0; i < this.state.dates.length; i++) {

      var day = mealsStats[this.state.dates[i]];

      // If there are meals for that date:
      if (day != null) {

        let datum = {x: parseInt(this.state.dates[i]), y: day.calories};

        // If the date is today => highlight as temporary
        if (this.state.dates[i] >= moment().format('YYYYMMDD')) datum.temporary = true;

        // Add the calories and increase the number of days, if we're before than today
        if (this.state.dates[i] < moment().format('YYYYMMDD')) {
          averageCalories += day.calories;
          days++;
        }

        // Add the datum
        data.push(datum);
      }
      else {
        data.push({x: parseInt(this.state.dates[i]), y: 0});
      }
		}

    // Calculate average calories
    averageCalories = days == 0 ? 0 : averageCalories / days;

    this.setState({
      mealsStats: data,
      averageCalories: averageCalories.toFixed(0)
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
      <View style={{height: 250}}>
        <View style={styles.infoContainer}>
          <Text style={styles.week}>Week {moment().format('W')}</Text>
          <View style={{flex: 1}}></View>
          <View>
            <Text style={styles.averageLabel}>Average Kcal</Text>
            <Text style={styles.averageValue}>{this.state.averageCalories}</Text>
          </View>
        </View>
        <TotoBarChart
              height={150}
              data={this.state.mealsStats}
              xAxisTransform={(value) => moment(value, 'YYYYMMDD').format('dd')}
              valueLabelTransform={(value) => value.toFixed(0)}
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
    fontSize: 18,
    textAlign: 'right',
  },
});
