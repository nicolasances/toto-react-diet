import React, {Component} from 'react';
import {Text, View, StyleSheet} from 'react-native';
import * as theme from '../styles/ThemeColors';
import DietAPI from '../services/DietAPI';
import TotoFlatList from '../widgets/TotoFlatList';
import moment from 'moment';

/**
 * Displays the list of prepared meals.
 * Needs the following params:
 * - onItemPress          : react to the press of the food
 */
export default class MealPrepsList extends Component {

  constructor(props) {
    super(props);

    // Init the state
    this.state = {meals: []}

    // Load the groceries
    this.loadMeals();

  }

  /**
   * Loads the meals from the API
   */
  loadMeals() {

    new DietAPI().getMealPreps().then((data) => {
      this.setState({meals : data.meals});
    })
  }

  /**
   * Gets an item and extracts the data in the format
   * required by the Toto Flat List component
   */
  dataExtractor(item) {

    return {
      title: 'Meal for ' + moment(item.item.date, 'YYYYMMDD').format('ddd DD MMM YYYY'),
      avatar: {
        type: 'number',
        value: item.item.calories,
        unit: 'cal'
      }
    }
  }

  /**
   * Render the component
   */
  render() {

    return (

      <View style={styles.container}>
        <TotoFlatList
          data={this.state.meals}
          dataExtractor={this.dataExtractor}
          onItemPress={this.props.onItemPress}
          />
      </View>
    )
  }
}

const styles = StyleSheet.create({

  container: {
    paddingTop: 12,
    flex: 1
  }
})
