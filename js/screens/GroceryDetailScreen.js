import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Keyboard, StyleSheet, View, Text, Image, ART, Dimensions, Animated, Easing, TextInput, KeyboardAvoidingView, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import * as scale from 'd3-scale';
import * as shape from 'd3-shape';
import * as array from 'd3-array';
import * as path from 'd3-path';
import * as theme from '../styles/ThemeColors';
import * as TotoEventBus from '../services/TotoEventBus';
import TotoTitleBar from '../widgets/TotoTitleBar';
import DietAPI from '../services/DietAPI';
import TotoCircleValue from '../widgets/TotoCircleValue';
import TotoMacro from '../widgets/TotoMacro';
import TotoIconButton from '../widgets/TotoIconButton';

const {Group, Shape, Surface} = ART;
const d3 = {scale, shape, array, path};
const window = Dimensions.get('window');

// Horizontal padding to be applied
const paddingH = 12;

/**
 * This screen is used both to:
 *  - display the details of a specific food
 *  - create a new food
 */
export default class GroceryDetailScreen extends Component {

  // Define the Navigation options
  static navigationOptions = ({navigation}) => {

    // Define the title based on what this window is for
    let title;

    // If no grocery is passed, it means I'm trying to create a new food
    if (navigation.getParam('grocery') == null) {
      // Set the title to 'New food'
      title = 'New food'
    }
    // otherwise I'm looking at the detail of the food
    else {
      // Set the title to the food name
      title = navigation.getParam('grocery').name;
    }

    return {
      headerLeft: null,
      headerTitle: <TotoTitleBar
                      title={title}
                      back={true}
                      />
    }
  }

  // Constructor
  constructor(props) {

    super(props);

    // Get the passed grocery, if any
    this.grocery = this.props.navigation.getParam('grocery');

    // Get the category of food from the data passed in the nevigation
    let categoryId = this.grocery != null ? this.grocery.category : this.props.navigation.getParam('categoryId');

    // Save the food in the state object
    this.state = {
      food: {
        carbs: 0,
        fat: 0,
        proteins: 0,
        calories: 0,
        sugars: 0,
        category: categoryId
      },
      category: new DietAPI().getGroceryCategory(categoryId),
      changed: false,
      sugarAnimatedValue: new Animated.Value(0)
    };

    // Bind to this
    this.onChangeName = this.onChangeName.bind(this);
    this.onChangeCalories = this.onChangeCalories.bind(this);
    this.onChangeFat = this.onChangeFat.bind(this);
    this.onChangeCarbs = this.onChangeCarbs.bind(this);
    this.onChangeProteins = this.onChangeProteins.bind(this);
    this.onChangeSugar = this.onChangeSugar.bind(this);
    this.onOk = this.onOk.bind(this);
    this.onDelete = this.onDelete.bind(this);
    this.changeCategory = this.changeCategory.bind(this);
    this.onCategorySelected = this.onCategorySelected.bind(this);
  }

  /**
   * When the component is mounted, start the animations
   */
  componentDidMount() {

    // If this screen shows the detail of a food (grocery)
    if (this.grocery) {
      // Set the state
      this.setState({
        food: this.grocery
      },
      // and animate the sugar bar
      () => {this.animateSugarBar(this.state.food.sugars, 1000, Easing.bounce);});
    }

    // Register to events
    TotoEventBus.bus.subscribeToEvent('categorySelected', this.onCategorySelected);
  }

  /**
   * Unmounting
   */
  componentWillUnmount() {
    // Unsubscribe to events
    TotoEventBus.bus.unsubscribeToEvent('categorySelected', this.onCategorySelected);
  }

  /**
   * Animate the sugar bar
   */
  animateSugarBar(toVal, dur, ease) {

    Animated.timing(this.state.sugarAnimatedValue, {
      toValue: toVal,
      easing: ease,
      duration: dur,
    }).start();

  }

  /**
   * Reacts to the event of a category beeing selected, as part of the food's category change
   */
  onCategorySelected(event) {

    // Change the category of the food
    this.setState((prevState) => ({
      changed: true,
      food: {
        ...prevState.food,
        category: event.context.category.id
      },
      category: event.context.category
    }));

  }

  /**
   * When the name of the food is changed
   */
  onChangeName(text) {

    if (text == '' || text == null) return;

    this.setState(prevState => ({
      food: {
        ...prevState.food,
        name: text
      }
    }))
  }

  /**
  * When the fat of the food is changed
  */
  onChangeFat(text) {

    if (text == '' || text == null) return;

    // Update the state
    this.setState(prevState => ({
      changed: true,
      food: {
        ...prevState.food,
        fat: parseFloat(text)
      }
    }));

  }

  /**
  * When the carbs of the food is changed
  */
  onChangeCarbs(text) {

    if (text == '' || text == null) return;

    // Update the state
    this.setState(prevState => ({
      changed: true,
      food: {
        ...prevState.food,
        carbs: parseFloat(text)
      }
    }));
  }

  /**
  * When the proteins of the food is changed
  */
  onChangeProteins(text) {

    if (text == '' || text == null) return;

    // Update the state
    this.setState(prevState => ({
      changed: true,
      food: {
        ...prevState.food,
        proteins: parseFloat(text)
      }
    }));
  }

  /**
  * When the proteins of the food is changed
  */
  onChangeSugar(text) {

    if (text == '' || text == null) return;

    // Update the state
    this.setState(prevState => ({
      changed: true,
      food: {
        ...prevState.food,
        sugars: parseFloat(text)
      }
    }));
  }

  /**
  * When the calories of the food is changed
  */
  onChangeCalories(text) {

    if (text == '' || text == null) return;

    // Update the state
    this.setState(prevState => ({
      changed: true,
      food: {
        ...prevState.food,
        calories: parseFloat(text)
      }
    }));
  }

  /**
   * Saves the new food or update the existing one
   */
  onOk() {

    // Create a new food
    if (this.grocery == null) {

      new DietAPI().postFood(this.state.food).then((data) => {
        // Send a new food created event
        TotoEventBus.bus.publishEvent({name: 'newFoodCreated', context: {food: this.state.food}});

        // Send a notification
        TotoEventBus.bus.publishEvent({name: 'notification', context: {text: 'You added ' + this.state.food.name + '!'}});

        // Go back
        this.props.navigation.goBack();
      });
    }
    // Update the existing one
    else {

      new DietAPI().putFood(this.grocery.id, this.state.food).then((data) => {

        // Send a new food created event
        TotoEventBus.bus.publishEvent({name: 'foodUpdated', context: {food: this.state.food}});

        // Send a notification
        TotoEventBus.bus.publishEvent({name: 'notification', context: {text: 'You updated ' + this.state.food.name + '!'}});

        // Go back
        this.props.navigation.goBack();
      });
    }

  }

  /**
   * Deletes this food
   */
  onDelete() {

    // Delete the food
    new DietAPI().deleteFood(this.grocery.id).then(() => {

      // Send a delete food event
      TotoEventBus.bus.publishEvent({name: 'foodDeleted', context: {food: this.state.food}});

      // Send a notification
      TotoEventBus.bus.publishEvent({name: 'notification', context: {text: 'You deleted ' + this.state.food.name + '!'}});

      // Go back
      this.props.navigation.goBack();
    });
  }

  /**
   * Changes the category of the food
   */
  changeCategory() {

    // Define a temp navigation key
    let ref = 'GroceryDetail-' + Math.random();

    // Navigate
    this.props.navigation.navigate({
      routeName: 'GroceriesCategories',
      params: {selectionMode: {active: true, referer: ref}},
      key: ref
    });
  }

  /**
   * Render the screen
   */
  render() {

    // If we're creating a new food, create an input text to set the name of the food
    let nameTextInput;

    if (this.grocery == null) {

      // Define the name text input
      nameTextInput = (
        <View style={styles.nameTextInputContainer}>
          <TextInput
            style={styles.nameTextInput}
            onChangeText={this.onChangeName}
            keyboardType='default'
            autoCapitalize='sentences'
            placeholder='Food name'
            placeholderTextColor={theme.color().COLOR_TEXT + '50'} />
        </View>
      )
    }

    // Define the save button
    let saveButton;

    if (this.grocery == null || this.state.changed) {

      saveButton = (
        <TotoIconButton
            image={require('../../img/tick.png')}
            label='Confirm'
            onPress={this.onOk} />
      )
    }

    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView style={styles.container} behavior='height'>

        {nameTextInput}

        <TouchableOpacity style={styles.categoryContainer} onPress={this.changeCategory}>
          <Image source={this.state.category.image}  style={{width: 48, height: 48, tintColor: theme.color().COLOR_TEXT}} />
          <Text style={styles.categoryLabel}>{this.state.category.name}</Text>
        </TouchableOpacity>

        <View style={styles.macrosContainer}>
          <TotoMacro value={this.state.food.carbs} label='Carbs' input={true} onChangeText={this.onChangeCarbs} />
          <TotoMacro value={this.state.food.proteins} label='Proteins' input={true} onChangeText={this.onChangeProteins} />
          <TotoMacro value={this.state.food.fat} label='Fat' input={true} onChangeText={this.onChangeFat} />
          <TotoMacro value={this.state.food.sugars} label='Sugar' input={true} onChangeText={this.onChangeSugar} />
        </View>

        <View style={styles.sugarContainer}>
          <Text style={styles.sugarLabel}>Sugar ({this.state.food.sugars} g)</Text>
          <AnimatedSugarBar sugar={this.state.sugarAnimatedValue} carbs={this.state.food.carbs} />
        </View>

        <View style={styles.caloriesContainer}>
          <Text style={styles.caloriesLabel}>Kcal</Text>
          <TextInput
                style={styles.caloriesInputValue}
                onChangeText={this.onChangeCalories}
                keyboardType='numeric'
                defaultValue={this.state.food.calories != null ? this.state.food.calories.toString() : ''} />
        </View>

        <View style={{flex: 1}}></View>

        <View style={styles.buttonsContainer}>
          {saveButton}
          <TotoIconButton
              image={require('../../img/trash.png')}
              label='Delete'
              onPress={this.onDelete} />
        </View>

        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    );
  }
}

// The Sugar Bar
class SugarBar extends Component {

  constructor(props) {
    super(props);

    // Sugar bar properties
    this.sugarBarProps = {
      strokeWidth: 8,
      paddingLeft: 12,
    }

  }

  /**
   * Renders a sugar bar that shows how much sugar is in the food
   */
  createSugarPath(sugar) {

    // Y position of the bar (to avoid being cut in 2)
    var y = this.sugarBarProps.strokeWidth / 2;

    // X starting position (padding)
    var x = this.sugarBarProps.paddingLeft;

    // x scale
    var xScale = d3.scale.scaleLinear().domain([0, this.props.carbs]).range([0, window.width - 4 * this.sugarBarProps.paddingLeft]);

    // Path of the bar
    var path = ART.Path()
                .move(x, y)
                .line(xScale(sugar), 0);

    return path;
  }

  /**
   * Render the sugar bar
   */
  render() {

    // Get the path
    let path = this.createSugarPath(this.props.sugar);

    return (
      <Surface width={window.width} height={20}>
        <Shape d={path} strokeWidth={this.sugarBarProps.strokeWidth} stroke={theme.color().COLOR_ACCENT}/>
      </Surface>
    )
  }
}

// Animated sugar bar
const AnimatedSugarBar = Animated.createAnimatedComponent(SugarBar);

/**
 * Style sheet
 */
const styles = StyleSheet.create({

  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignContent: 'flex-start',
    backgroundColor: theme.color().COLOR_THEME,
    padding: 12
  },
  macrosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingVertical: 12,
  },
  macroContainer: {
    backgroundColor: theme.color().COLOR_THEME_LIGHT,
    width: 72,
    borderRadius: 5,
    alignItems: 'stretch',
  },
  macroLabel: {
    fontSize: 12,
    flexDirection: 'row',
    textAlign: 'center',
    paddingVertical: 3,
    color: theme.color().COLOR_TEXT,
  },
  macroValue: {
    fontSize: 16,
    flexDirection: 'row',
    textAlign: 'center',
    color: theme.color().COLOR_TEXT,
    paddingVertical: 6
  },
  categoryContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  categoryLabel: {
    fontSize: 16,
    color: theme.color().COLOR_TEXT,
    paddingTop: 6,
  },
  sugarContainer: {
    height: 50,
    paddingTop: 12,
  },
  sugarLabel: {
    fontSize: 12,
    color: theme.color().COLOR_TEXT,
    paddingLeft: paddingH,
    paddingBottom: 6
  },
  nameTextInputContainer: {
    paddingVertical: 12,
  },
  nameTextInput: {
    fontSize: 20,
    color: theme.color().COLOR_TEXT,
    textAlign: 'center'
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    padding: 12,
  },
  caloriesContainer: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  caloriesLabel: {
    fontSize: 12,
    color: theme.color().COLOR_TEXT,
    textAlign: 'center',
    width: 100,
    paddingBottom: 6
  },
  caloriesInputValue: {
    color: theme.color().COLOR_TEXT,
    width: 100,
    height: 100,
    borderRadius: 50,
    borderColor: theme.color().COLOR_THEME_LIGHT,
    borderWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    fontSize: 22
  },
});
