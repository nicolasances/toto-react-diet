import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View} from 'react-native';
import { createStackNavigator } from 'react-navigation';
import * as theme from './js/styles/ThemeColors';

import TotoNotification from './js/widgets/TotoNotification';

import HomeScreen from './js/screens/HomeScreen';
import GroceriesCategoriesScreen from './js/screens/GroceryCategoriesScreen';
import GroceriesScreen from './js/screens/GroceriesScreen';
import GroceryDetailScreen from './js/screens/GroceryDetailScreen';
import NewMealScreen from './js/screens/NewMealScreen';
import MagicAddFoodScreen from './js/screens/MagicAddFoodScreen';
import NewMealFoodDetailScreen from './js/screens/NewMealFoodDetailScreen';
import DateSelectionScreen from './js/screens/DateSelectionScreen';
import MealPrepsScreen from './js/screens/MealPrepsScreen';
import GoalScreen from './js/screens/GoalScreen';

const RootStack = createStackNavigator({

  Home: {screen: HomeScreen},
  GroceriesCategories: {screen: GroceriesCategoriesScreen},
  Groceries: {screen: GroceriesScreen},
  GroceryDetail: {screen: GroceryDetailScreen},
  NewMeal: {screen: NewMealScreen},
  NewMealFoodDetail: {screen: NewMealFoodDetailScreen},
  DateSelection: {screen: DateSelectionScreen},
  MealPreps: {screen: MealPrepsScreen},
  Goal: {screen: GoalScreen},
  MagicAddFood: {screen: MagicAddFoodScreen},

}, {
  initialRouteName: 'NewMeal',
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
      <View style={{flex: 1}}>
        <RootStack />
        <TotoNotification />
      </View>
    );
  }
}
