import React, {Component} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import * as TotoEventBus from '../services/TotoEventBus';
import * as theme from '../styles/ThemeColors';
import DietAPI from '../services/DietAPI';
import TotoLineChart from '../widgets/TotoLineChart';
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

    if (mealsStats == null) return;

    // Define the average calories
    let averageCalories = 0;
    let days = 0;

		// Put the data as an array of {}
		var data = [];
		for (var i = 0; i < mealsStats.meals.length; i++) {

      var day = mealsStats.meals[i];

      let datum = {x: new Date(moment(day.date, 'YYYYMMDD')), y: day.calories};

      // If the date is today => highlight as temporary
      if (day.date >= moment().format('YYYYMMDD')) datum.temporary = true;

      // Add the calories and increase the number of days, if we're before than today
      if (day.date < moment().format('YYYYMMDD')) {
        averageCalories += day.calories;
        days++;
      }

      // Add the datum
      data.push(datum);

		}

    // Calculate average calories
    averageCalories = days == 0 ? 0 : averageCalories / days;

    this.setState({
      mealsStats: data,
      averageCalories: averageCalories.toFixed(0)
    });
  }

  /**
   * Loads the weekly meals data from the API
   * Retrieves the meals of the week
   */
  loadData() {

		var date = moment();

		// Go to the sunday start of the week
		date = date.startOf('week');

		new DietAPI().getCaloriesPerDay(date.format('YYYYMMDD')).then(this.updateState);

  }

  /**
   * Renders this component
   */
  render() {

    return (
      <View style={{height: 250}}>
        <View style={styles.infoContainer}>
          <View style={{flex: 1}}></View>
          <View>
            <Text style={styles.averageLabel}>Average Kcal</Text>
            <Text style={styles.averageValue}>{this.state.averageCalories}</Text>
          </View>
        </View>
        <TotoLineChart
              height={150}
              data={this.state.mealsStats}
              xAxisTransform={(value) => moment(value).format('dd')}
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
    fontSize: 22,
    textAlign: 'right',
  },
});
