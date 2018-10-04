import React, {Component} from 'react';
import {Text, View, StyleSheet, FlatList, Image, TouchableOpacity} from 'react-native';
import * as theme from '../styles/ThemeColors';
import DietAPI from '../services/DietAPI';
import TotoFlatList from '../widgets/TotoFlatList';

/**
 * Displays the list of grocery categories
 * Accepts the following props:
 * - onItemPress          : function, reacts to the click of an item
 */
export default class GroceryCategoriesList extends Component {

  constructor(props) {

    super(props);

    this.state = {
      categories: []
    }

  }

  /**
   * Load the grocery categories when the component mounts
   */
  componentDidMount() {
    this.setState({categories: new DietAPI().getGroceryCategories()});
  }

  /**
   * Extract the data required for the Toto Flat List
   */
  dataExtractor(item) {

    return {
      title: item.item.name,
      avatar: {
        type: 'image',
        value: item.item.image
      }
    }
  }

  /**
   * Renders the component
   */
  render() {

    return (
      <View style={styles.container}>

        <TotoFlatList
          data={this.state.categories}
          dataExtractor={this.dataExtractor}
          onItemPress={this.props.onItemPress} />

      </View>
    )
  }

}

/**
 * Styles for this component
 */
const styles = StyleSheet.create({

  container: {
    flex: 1,
    paddingTop: 12,
  },

})
