import React, {Component} from 'react';
import {Text, View, StyleSheet} from 'react-native';
import * as theme from '../styles/ThemeColors';
import DietAPI from '../services/DietAPI';
import * as TotoEventBus from '../services/TotoEventBus';
import TotoFlatList from '../widgets/TotoFlatList';

/**
 * Displays the list of groceries.
 * Needs the following params:
 * - category             : category id
 * - onItemPress          : react to the press of the food
 */
export default class GroceriesList extends Component {

  constructor(props) {
    super(props);

    // Init the state
    this.state = {groceries: []}

    // Load the groceries
    this.loadGroceries();

    // Bind to this
    this.onFoodListChanged = this.onFoodListChanged.bind(this);

  }

  /**
   * When mounting
   */
  componentDidMount() {
    // Subscribe to events
    TotoEventBus.bus.subscribeToEvent('newFoodCreated', this.onFoodListChanged);
    TotoEventBus.bus.subscribeToEvent('foodDeleted', this.onFoodListChanged);
    TotoEventBus.bus.subscribeToEvent('foodUpdated', this.onFoodListChanged);
  }

  /**
   * When unmounting
   */
  componentWillUnmount() {
    // Unsubscribe to events
    TotoEventBus.bus.unsubscribeToEvent('newFoodCreated', this.onFoodListChanged);
    TotoEventBus.bus.unsubscribeToEvent('foodDeleted', this.onFoodListChanged);
    TotoEventBus.bus.unsubscribeToEvent('foodUpdated', this.onFoodListChanged);
  }

  /**
   * React to the event where the food is added
   */
  onFoodListChanged(event) {
    this.loadGroceries();
  }

  /**
   * Loads the groceries from the API
   */
  loadGroceries() {

    var category = this.props.category;

    new DietAPI().getGroceries(category).then((data) => {
      this.setState({
        groceries: []
      }, () => {this.setState({groceries : data.foods})});
    })
  }

  /**
   * Gets an item and extracts the data in the format
   * required by the Toto Flat List component
   */
  dataExtractor(item) {

    return {
      title: item.item.name,
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
          data={this.state.groceries}
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
