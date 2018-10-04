import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View} from 'react-native';
import { createStackNavigator } from 'react-navigation';
import * as theme from './js/styles/ThemeColors';

import HomeScreen from './js/screens/HomeScreen';
import GroceriesCategoriesScreen from './js/screens/GroceryCategoriesScreen';
import GroceriesScreen from './js/screens/GroceriesScreen';
import GroceryDetailScreen from './js/screens/GroceryDetailScreen';
import NewMealScreen from './js/screens/NewMealScreen';
import NewMealFoodDetailScreen from './js/screens/NewMealFoodDetailScreen';
import DateSelectionScreen from './js/screens/DateSelectionScreen';

const RootStack = createStackNavigator({

  Home: {screen: HomeScreen},
  GroceriesCategories: {screen: GroceriesCategoriesScreen},
  Groceries: {screen: GroceriesScreen},
  GroceryDetail: {screen: GroceryDetailScreen},
  NewMeal: {screen: NewMealScreen},
  NewMealFoodDetail: {screen: NewMealFoodDetailScreen},
  DateSelection: {screen: DateSelectionScreen},

}, {
  initialRouteName: 'Home',
  navigationOptions: {
    headerStyle: {
      backgroundColor: theme.color().COLOR_THEME,
    },
  }
});

export default class App extends Component<Props> {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <RootStack />
    );
  }
}
