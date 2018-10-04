import React, {Component} from 'react';
import {Animated, Easing, Text, View, StyleSheet, Dimensions, ART} from 'react-native';
import AnimateNumber from 'react-native-animate-number';
import * as theme from '../styles/ThemeColors';
import * as TotoEventBus from '../services/TotoEventBus';
import DietAPI from '../services/DietAPI';

export default class DietDayMacros extends Component {

  constructor(props) {

    super(props);

    this.state = {
      proteins: 0,
      carbs: 0,
      fat: 0
    };

    this.loadMacros();

    // Bind this
    this.mealAdded = this.mealAdded.bind(this);

  }

  /**
   * When mounting
   */
  componentDidMount() {
    TotoEventBus.bus.subscribeToEvent('mealAdded', this.mealAdded);
  }

  /**
  * When unmounting
  */
  componentWillUnmount() {
    TotoEventBus.bus.unsubscribeToEvent('mealAdded', this.mealAdded);
  }

  /**
   * React to a meal added
   */
  mealAdded() {
    this.loadMacros();
  }


  /**
   * Load the macros from the Diet API
   */
  loadMacros() {

    new DietAPI().getTodayMeals().then(data => {

      if (data == null || data.meals == null) return;

      var proteins = 0;
      var carbs = 0;
      var fat = 0;

      // Calculate total for each macro
      data.meals.map(meal => {

        proteins += meal.proteins;
        carbs += meal.carbs;
        fat += meal.fat;

      });

      // Update the state
      this.setState({
        proteins: proteins,
        carbs: carbs,
        fat: fat
      });

    });

  }

  /**
   * Render the component
   */
  render() {
    return (
      <View style={style.container}>
        <View style={style.macroContainer}>
          <Text style={style.label}>Carbs</Text>
          <AnimateNumber style={style.value} value={this.state.carbs} formatter={(val) => {return val.toFixed(0) + ' g'}}/>
        </View>
        <View style={style.macroContainer}>
          <Text style={style.label}>Proteins</Text>
          <AnimateNumber style={style.value} value={this.state.proteins} formatter={(val) => {return val.toFixed(0) + ' g'}}/>
        </View>
        <View style={style.macroContainer}>
          <Text style={style.label}>Fat</Text>
          <AnimateNumber style={style.value} value={this.state.fat} formatter={(val) => {return val.toFixed(0) + ' g'}}/>
        </View>
      </View>
    );
  }
}

// Style sheet for this component
const style = StyleSheet.create({

  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  macroContainer : {
    flex: 1,
    alignItems: 'center'
  },

  label : {
    fontSize: 8,
    color: theme.color().COLOR_TEXT,
    textTransform: 'uppercase'
  },

  value : {
    fontSize: 16,
    color: theme.color().COLOR_TEXT,
    // color: '#FFEB3B',
    paddingTop: 6
  }

});
