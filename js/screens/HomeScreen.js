import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, TouchableOpacity, Image} from 'react-native';
import * as theme from '../styles/ThemeColors';
import DietDailyMealsGraph from '../components/DietDailyMealsGraph';
import DietDaySphere from '../components/DietDaySphere';
import DietDayMacros from '../components/DietDayMacros';
import DietDailyMealsTimeline from '../components/DietDailyMealsTimeline';
import WeeklyStats from '../components/WeeklyStats';
import TotoTitleBar from '../widgets/TotoTitleBar';
import Swiper from 'react-native-swiper';


export default class HomeScreen extends Component<Props> {

  // Define the Navigation options
  static navigationOptions = ({navigation}) => {

    return {
      headerTitle: <TotoTitleBar
                      title='Nutrition'
                      leftButton={{image: require('../../img/groceries-bag.png'), navData: {screen: 'GroceriesCategories', data: {}}}}
                      rightButton={{image: require('../../img/add.png'), navData: {screen: 'NewMeal', data: {}}}}
                      />
    }
  }

  /**
   * Constructor of the Home Screen
   */
  constructor(props) {
    super(props);
  }

  /**
   * Renders the home screen
   */
  render() {
    return (
      <View style={styles.container}>
        <View style={{paddingTop: 12}}><DietDailyMealsTimeline /></View>
        <View style={{flex: 1, justifyContent: 'center'}}><DietDaySphere radius={70} /></View>
        <View style={{paddingBottom: 24, justifyContent: 'center'}}><DietDayMacros /></View>
        <Swiper style={{}} showsPagination={false}>
          <DietDailyMealsGraph height={250} />
          <WeeklyStats height={250} />
        </Swiper>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignContent: 'flex-start',
    backgroundColor: theme.color().COLOR_THEME,
  },

});
