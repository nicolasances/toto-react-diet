import React, {Component} from 'react';
import {View, StyleSheet, Text, Dimensions, TouchableOpacity} from 'react-native';
import TotoTitleBar from '../widgets/TotoTitleBar';
import TotoCircleValue from '../widgets/TotoCircleValue';
import TotoFlatList from '../widgets/TotoFlatList';
import TotoMacro from '../widgets/TotoMacro';
import TotoIconButton from '../widgets/TotoIconButton';
import DietAPI from '../services/DietAPI';
import * as TotoEventBus from '../services/TotoEventBus';
import * as theme from '../styles/ThemeColors';
import moment from 'moment';

const width = Dimensions.get('window').width;

export default class NewMealScreen extends Component {

  // Define the Navigation options
  static navigationOptions = ({navigation}) => {

    let navigationKey = 'NewMeal-' + Math.random();

    return {
      headerLeft: null,
      headerTitle: <TotoTitleBar
                      title='New Meal'
                      back={true}
                      rightButton={{
                        image: require('../../img/clock.png'),
                        navData: {
                          screen: 'MealPreps',
                          navigationKey: navigationKey,
                          data: {
                            selectionMode: {
                              active: true,
                              referer: navigationKey
                            }
                          }
                        }
                      }}
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
      sugars: 0,
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
    this.saveAsPrep = this.saveAsPrep.bind(this);
    this.onMealPrepSelected = this.onMealPrepSelected.bind(this);
    this.deleteMealPrep = this.deleteMealPrep.bind(this);
  }

  /**
   * When mounting, subscribe to the events
   */
  componentDidMount() {
    // Subscribe to relevant events
    TotoEventBus.bus.subscribeToEvent('grocerySelected', this.onFoodSelected);
    TotoEventBus.bus.subscribeToEvent('foodAmountInMealChanged', this.onFoodAmountChanged);
    TotoEventBus.bus.subscribeToEvent('newMealTimeChanged', this.onDateChanged);
    TotoEventBus.bus.subscribeToEvent('mealPrepSelected', this.onMealPrepSelected);
  }

  /**
   * When unmounting, unsubscribe
   */
  componentWillUnmount() {
    TotoEventBus.bus.unsubscribeToEvent('grocerySelected', this.onFoodSelected);
    TotoEventBus.bus.unsubscribeToEvent('foodAmountInMealChanged', this.onFoodAmountChanged);
    TotoEventBus.bus.unsubscribeToEvent('newMealTimeChanged', this.onDateChanged);
    TotoEventBus.bus.unsubscribeToEvent('mealPrepSelected', this.onMealPrepSelected);
  }

  /**
   * Reacts to the selection of a meal prep.
   * It loads the meal prep, replacing the current meal.
   */
  onMealPrepSelected(event) {

    // First clear the foods:
    this.setState({
      foods: []
    }, () => {
      // Then Update the state object
      this.setState({
        mealPrepId: event.context.meal.id,
        mealTime: event.context.meal.time,
        mealDateFormatted: moment(event.context.meal.date, 'YYYYMMDD').format('ddd DD MMM YYYY'),
        mealDate: event.context.meal.date,
        carbs: event.context.meal.carbs,
        proteins: event.context.meal.proteins,
        fat: event.context.meal.fat,
        calories: event.context.meal.calories,
        sugars: event.context.meal.sugars,
        foods: event.context.meal.aliments
      })
    })
  }

  /**
   * Method to clean the state and reset it
   */
  cleanState() {
    this.setState({
      mealPrepId: null,
      mealTime: moment().format('HH:mm'),
      mealDateFormatted: moment().format('ddd DD MMM YYYY'),
      mealDate: moment().format('YYYYMMDD'),
      carbs: 0,
      proteins: 0,
      fat: 0,
      sugars: 0,
      calories: 0,
      foods: []
    });
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

    // If the meal was a meal prep, delete it
    if (this.state.mealPrepId != null) {
      new DietAPI().deleteMealPrep(this.state.mealPrepId);
    }
  }

  /**
   * Saves this meal as a meal prep
   */
  saveAsPrep() {

    // If the meal prep was already saved, we just update it
    if (this.state.mealPrepId != null) {

      new DietAPI().putMealPrep(this.state.mealPrepId, this.state).then(data => {
        TotoEventBus.bus.publishEvent({name: 'notification', context: {text: 'The prepared meal has been saved!'}});
      });
    }
    // Else Call the API to crete a new meal prep
    else {

      new DietAPI().postMealPrep(this.state).then(data => {
        // Publish event
        TotoEventBus.bus.publishEvent({name: 'notification', context: {text: 'The prepared meal has been saved!'}});

        // Update the state with the new meal prep id
        this.setState({
          mealPrepId: data.id
        })
      });
    }
  }

  /**
   * React to the event of amount of food changed
   */
  onFoodAmountChanged(event) {

    // Create a copy of the foods array so that i can modify it
    let foods = this.state.foods;

    // Define new total amounts
    let totalCal = 0;
    let totalP = 0;
    let totalC = 0;
    let totalF = 0;

    // Find the food in the array so that i can modify it
    let food;
    for (var i = 0; i < foods.length; i++) {

      // Pick the food
      food = foods[i];

      if (foods[i].id == event.context.food.id) {

        // Modify the food
        if (event.context.unit == 'gr') food.amountGr = event.context.amount;
        else if (event.context.unit == 'ml') food.amountMl = event.context.amount;
        else food.amount = event.context.amount;

        // Replace the food in the array
        foods.splice(i, 1, food);

        // Fire an event to notify that the data has changed!
        TotoEventBus.bus.publishEvent({name: 'totoListDataChanged', context: {item: food}});
      }

      // Recalculate total amount
      if (food.amountGr != null) {
        totalCal += food.calories * food.amountGr / 100;
        totalC += food.carbs * food.amountGr / 100;
        totalF += food.fat * food.amountGr / 100;
        totalP += food.proteins * food.amountGr / 100;
      }
      else if (food.amountMl != null) {
        totalCal += food.calories * food.amountMl / 100;
        totalC += food.carbs * food.amountMl / 100;
        totalF += food.fat * food.amountMl / 100;
        totalP += food.proteins * food.amountMl / 100;
      }
      else if (food.amount != null) {
        totalCal += food.calories * food.amount;
        totalC += food.carbs * food.amount;
        totalF += food.fat * food.amount;
        totalP += food.proteins * food.amount;
      }
    }

    // Update the state
    this.setState(prevState => ({
      calories: totalCal,
      proteins: totalP,
      carbs: totalC,
      fat: totalF,
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
   * Deletes this  meal prep
   */
  deleteMealPrep() {

    // If there's no id
    if (this.state.mealPrepId == null) return;

    // Delete the meal prep
    new DietAPI().deleteMealPrep(this.state.mealPrepId).then((response) => {

      // Notify that the meal prep has been deleted
      TotoEventBus.bus.publishEvent({name: 'notification', context: {text: 'The prepared meal has been deleted!'}});

      // Clear the state
      this.cleanState();

    });

  }

  /**
   * Extracts the data for each of the added aliments
   */
  foodDataExtractor(item) {

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

    // Text warning that it's a meal prep loaded
    let mealPrepText;

    // Buttons
    let mealPrepDeleteButton;
    let saveButton;
    let saveMealPrepButton;

    // If a prepared meal has been loaded
    if (this.state.mealPrepId != null) {

      // Set the text that warns that it's a prepared meal
      mealPrepText = (
        <View style={styles.mealPrepTextContainer}>
          <Text style={styles.mealPrepText}>Loaded from a prepared meal</Text>
        </View>
      )

      // Enable the delete meal prep button
      mealPrepDeleteButton = (
        <TotoIconButton
          image={require('../../img/trash.png')}
          label='Delete'
          onPress={this.deleteMealPrep} />
      )
    }

    // Activate the save buttons if the meal has some calories
    if (this.state.calories > 0) {
      saveButton = (
        <TotoIconButton
          image={require('../../img/tick.png')}
          label='Save'
          onPress={this.save} />
      );

      saveMealPrepButton = (
        <TotoIconButton
        image={require('../../img/db-check.png')}
        label='Save as prep'
        onPress={this.saveAsPrep} />
      )
    }

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

        {mealPrepText}

        <View style={styles.buttonsContainer}>
            <TotoIconButton
              image={require('../../img/add.png')}
              label='Add some food'
              onPress={this.onPressAddFood} />
            {saveButton}
            {saveMealPrepButton}
            {mealPrepDeleteButton}
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealPrepTextContainer: {
    paddingVertical: 12,
    alignItems: 'center'
  },
  mealPrepText: {
    fontSize: 14,
    color: theme.color().COLOR_ACCENT,
  },
});
