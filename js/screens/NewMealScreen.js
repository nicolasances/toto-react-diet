import React, {Component} from 'react';
import {View, StyleSheet, Text, Dimensions, TouchableOpacity} from 'react-native';
import TotoTitleBar from '../widgets/TotoTitleBar';
import TotoCircleValue from '../widgets/TotoCircleValue';
import TotoFlatList from '../widgets/TotoFlatList';
import TotoMacro from '../widgets/TotoMacro';
import TotoButton from '../widgets/TotoButton';
import DietAPI from '../services/DietAPI';
import * as TotoEventBus from '../services/TotoEventBus';
import * as theme from '../styles/ThemeColors';
import moment from 'moment';

const width = Dimensions.get('window').width;

export default class NewMealScreen extends Component {

  // Define the Navigation options
  static navigationOptions = ({navigation}) => {

    return {
      headerLeft: null,
      headerTitle: <TotoTitleBar
                      title='New Meal'
                      back={true}
                      />
    }
  }

  // Constructor
  constructor(props) {
    super(props);

    // Initialize the state
    this.state = {
      mealTime: moment().format('HH:mm'),
      mealDateFormatted: moment().format('ddd DD MMM YYYY'),
      mealDate: moment().format('YYYYMMDD'),
      carbs: 0,
      proteins: 0,
      fat: 0,
      calories: 0,
      foods: []
    }

    // Bind the onFoodSelected to this class
    this.onFoodSelected = this.onFoodSelected.bind(this);
    this.onFoodClick = this.onFoodClick.bind(this);
    this.onPressAddFood = this.onPressAddFood.bind(this);
    this.onFoodAmountChanged = this.onFoodAmountChanged.bind(this);
    this.onDateChanged = this.onDateChanged.bind(this);
    this.save = this.save.bind(this);
  }

  /**
   * When mounting, subscribe to the events
   */
  componentDidMount() {
    // Subscribe to relevant events
    TotoEventBus.bus.subscribeToEvent('grocerySelected', this.onFoodSelected);
    TotoEventBus.bus.subscribeToEvent('foodAmountInMealChanged', this.onFoodAmountChanged);
    TotoEventBus.bus.subscribeToEvent('newMealTimeChanged', this.onDateChanged);
  }

  /**
   * When unmounting, unsubscribe
   */
  componentWillUnmount() {
    TotoEventBus.bus.unsubscribeToEvent('grocerySelected', this.onFoodSelected);
    TotoEventBus.bus.unsubscribeToEvent('foodAmountInMealChanged', this.onFoodAmountChanged);
    TotoEventBus.bus.unsubscribeToEvent('newMealTimeChanged', this.onDateChanged);
  }

  /**
   * Called when the date of the meal is changed
   */
  onDateChanged(event) {

    this.setState({
      mealTime: moment(event.context.date).format('HH:mm'),
      mealDateFormatted: moment(event.context.date).format('ddd DD MMM YYYY'),
      mealDate: moment(event.context.date).format('YYYYMMDD'),
    })
  }

  /**
   * Saves this meal
   */
  save() {

    // Call the API
    new DietAPI().postMeal(this.state).then(data => {

      // Throw an event
      TotoEventBus.bus.publishEvent({name: 'mealAdded'});

      // Go back
      this.props.navigation.goBack();
    });
  }

  /**
   * React to the event of amount of food changed
   */
  onFoodAmountChanged(event) {

    // Create a copy of the foods array so that i can modify it
    let foods = this.state.foods;

    // Find the food in the array so that i can modify it
    let food;
    for (var i = 0; i < foods.length; i++) {
      if (foods[i].id == event.context.food.id) {

        // Pick the food
        food = foods[i];

        // Modify the food
        if (event.context.unit == 'gr') food.amountGr = event.context.amount;
        else if (event.context.unit == 'ml') food.amountMl = event.context.amount;
        else food.amount = event.context.amount;

        // Replace the food in the array
        foods.splice(i, 1, food);

        // Fire an event to notify that the data has changed!
        TotoEventBus.bus.publishEvent({name: 'totoListDataChanged', context: {item: food}});

        break;
      }
    }

    // Calculate calories
    let addedCal = food.calories * event.context.amount / (event.context.unit != null ? 100 : 1);

    // Calculate macros
    let addedP = food.proteins * event.context.amount / (event.context.unit != null ? 100 : 1);
    let addedC = food.carbs * event.context.amount / (event.context.unit != null ? 100 : 1);
    let addedF = food.fat * event.context.amount / (event.context.unit != null ? 100 : 1);

    // Update the state
    this.setState(prevState => ({
      calories: prevState.calories + addedCal,
      proteins: prevState.proteins + addedP,
      carbs: prevState.carbs + addedC,
      fat: prevState.fat + addedF,
      foods: foods
    }));

  }

  /**
   * Callback called when a food is selected from the groveries list
   */
  onFoodSelected(event) {

    // Get the food out of the event
    var food = event.context.grocery;

    // Add the food
    this.setState(prevState => ({
      foods: [...prevState.foods, food]
    }));

  }

  /**
   * Called when the add food button is pressed
   */
  onPressAddFood() {

    // Define a navigation key for this screen
    let navigationKey = 'NewMeal-' + Math.random()

    this.props.navigation.navigate({
      routeName: 'GroceriesCategories',
      params: {grocerySelectionMode: {active: true, referer: navigationKey}},
      key: navigationKey
    });
  }

  /**
   * Callback function called when the user clicks one
   * of the added foods (meal food list)
   */
  onFoodClick(item) {
      this.props.navigation.navigate('NewMealFoodDetail', {food: item.item});
  }

  /**
   * Extracts the data for each of the added aliments
   */
  foodDataExtractor(item) {

    console.log(item.item);

    // Define the amount to show on the left
    let amount;
    if (item.item.amountGr != null) amount = item.item.amountGr;
    else if (item.item.amountMl != null) amount = item.item.amountMl;
    else amount = item.item.amount;

    if (amount == null) amount = '';

    // Define the unit
    let unit;
    if (item.item.amountGr != null) unit = 'g';
    else if (item.item.amountMl != null) unit = 'ml';
    else unit = '';

    return {
      title: item.item.name,
      avatar: {
        type: 'number',
        value: item.item.calories,
        unit: 'cal'
      },
      leftSideValue: amount + unit
    }
  }

  // Render this screen
  render() {

    return (

      <View style={styles.container}>

        <View style={{flexDirection: 'row'}}>
          <TouchableOpacity style={styles.mealTimeContainer} onPress={(item) => this.props.navigation.navigate('DateSelection', {event: 'newMealTimeChanged'})}>
            <Text style={styles.mealTime}>{this.state.mealTime}</Text>
            <Text style={styles.mealDate}>{this.state.mealDateFormatted}</Text>
          </TouchableOpacity>

          <View style={styles.caloriesContainer}>
            <TotoCircleValue
                width={width / 2}
                height={86}
                radius={40}
                radiusWidth={6}
                color={theme.color().COLOR_THEME_LIGHT}
                value={this.state.calories}
                />
          </View>
        </View>

        <View style={styles.macrosContainer}>
          <TotoMacro value={this.state.carbs} label='Carbs' />
          <TotoMacro value={this.state.proteins} label='Proteins' />
          <TotoMacro value={this.state.fat} label='Fat' />
        </View>

        <View style={styles.buttonsContainer}>
          <View style={styles.buttonContainer}>
            <TotoButton
              label='Add some food'
              onPress={this.onPressAddFood} />
          </View>
          <View style={styles.buttonContainer}>
            <TotoButton
              label='Save'
              onPress={this.save} />
          </View>
        </View>

        <View style={styles.alimentsContainer}>
          <TotoFlatList
            data={this.state.foods}
            dataExtractor={this.foodDataExtractor}
            onItemPress={this.onFoodClick}
            />
        </View>

      </View>
    )
  }
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignContent: 'flex-start',
    backgroundColor: theme.color().COLOR_THEME,
    paddingTop: 12,
    paddingHorizontal: 12
  },
  mealTimeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  mealTime: {
    fontSize: 26,
    color: theme.color().COLOR_TEXT
  },
  mealDate: {
    fontSize: 12,
    color: theme.color().COLOR_TEXT
  },
  caloriesContainer: {
    flex: 1,
    paddingVertical: 12,
  },
  alimentsContainer: {
    flex: 1
  },
  macrosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingVertical: 12,
  },
  buttonsContainer: {
    paddingVertical: 12,
    flexDirection: 'row',
  },
  buttonContainer: {
    flex: 1,
    alignContent: 'stretch',
    paddingHorizontal: 6
  }
});
