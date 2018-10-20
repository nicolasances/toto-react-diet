import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, Image, TouchableOpacity} from 'react-native';
import GroceryCategoriesList from '../components/GroceryCategoriesList';
import TotoTitleBar from '../widgets/TotoTitleBar';
import * as theme from '../styles/ThemeColors';
import * as TotoEventBus from '../services/TotoEventBus';

/**
 * Shows the list of grocery categories.
 * Accepts the following parameters passed in the navigation:
 *
 * - grocerySelectionMode     : object, see GroceriesScreen
 *
 * - selectionMode            :  an object that specifies if the selection mode is active of the food and provide required additional params:
 *                               { active : true/false,
 *                                 referer : the name of the referer screen as registered in the Route provider}
 */
export default class GroceriesCategoriesScreen extends Component {

  // Define the Navigation options
  static navigationOptions = ({navigation}) => {
    return {
      headerLeft: null,
      headerTitle: <TotoTitleBar
                      title='Groceries'
                      back={true}
                      />

    }
  }

  /**
   * Constructor
   */
  constructor(props) {
    super(props);

    // Function binding
    this.onItemPress = this.onItemPress.bind(this);
  }

  /**
   * Reacts to item click
   */
  onItemPress(item) {

    let selMode = this.props.navigation.getParam('selectionMode');

    // If a selection mode has been passed, then use that one
    if (selMode) {
      // If the selection model is active
      if (selMode.active) {
        // Throw a 'category selected event'
        TotoEventBus.bus.publishEvent({name: 'categorySelected', context: {category: item.item}});

        // Go back to the referer
        this.props.navigation.goBack(selMode.referer);
      }
    }
    // otherwise check if a grocery selection mode has been passed
    // an navigate to the groceries list page
    else {
      // Optional grocery selection mode, to be passed to the groceries list page
      let selectionMode = this.props.navigation.getParam('grocerySelectionMode');

      this.props.navigation.navigate('Groceries', {category: item.item.id, categoryName: item.item.name, selectionMode: selectionMode});
    }
  }

  /**
   * Renders this screen
   */
  render() {
    return (
      <View style={styles.container}>

        <GroceryCategoriesList onItemPress={this.onItemPress} />

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
