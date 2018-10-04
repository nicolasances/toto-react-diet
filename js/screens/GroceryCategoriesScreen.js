import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, Image, TouchableOpacity} from 'react-native';
import GroceryCategoriesList from '../components/GroceryCategoriesList';
import * as theme from '../styles/ThemeColors';
import TotoTitleBar from '../widgets/TotoTitleBar';

/**
 * Shows the list of grocery categories.
 * Accepts the following parameters passed in the navigation:
 * - grocerySelectionMode     : object, see GroceriesScreen
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

  constructor(props) {
    super(props);

    this.onItemPress = this.onItemPress.bind(this);
  }

  /**
   * Reacts to item click
   */
  onItemPress(item) {
    
    var selectionMode = this.props.navigation.getParam('grocerySelectionMode');

    this.props.navigation.navigate('Groceries', {category: item.item.id, categoryName: item.item.name, selectionMode: selectionMode});
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
