import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, Image, TouchableOpacity} from 'react-native';
import MealPrepsList from '../components/MealPrepsList';
import TotoTitleBar from '../widgets/TotoTitleBar';
import * as theme from '../styles/ThemeColors';
import * as TotoEventBus from '../services/TotoEventBus';

/**
 * Shows the list of prepared meals
 * Accepts the following NAVIGATION PARAMS:
 * - onItemPress          :  a callback to be called when the item is pressed
 */
export default class MealPrepsScreen extends Component<Props> {

  // Define the Navigation options
  static navigationOptions = ({navigation}) => {
    return {
      headerLeft: null,
      headerTitle: <TotoTitleBar
                      title='Available Meals'
                      back={true}
                      />

    }
  }

  constructor(props) {
    super(props);

    this.selectionMode = this.props.navigation.getParam('selectionMode');

  }

  /**
   * Renders this screen
   */
  render() {
    return (
      <View style={styles.container}>

        <MealPrepsList onItemPress={this.props.onItemPress}/>

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
