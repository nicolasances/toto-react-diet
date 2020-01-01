import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, Image, TouchableOpacity} from 'react-native';
import GroceryCategoriesList from '../components/GroceryCategoriesList';
import TotoTitleBar from '../widgets/TotoTitleBar';
import TotoFlatList from '../widgets/TotoFlatList';
import * as theme from '../styles/ThemeColors';
import * as TotoEventBus from '../services/TotoEventBus';
import FRboTAPI from '../services/FRboTAPI';

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

    this.state = {}

    // Function binding
    this.onItemPress = this.onItemPress.bind(this);
    this.loadAdvices = this.loadAdvices.bind(this);

    this.loadAdvices();
  }

  /**
   * Loads the advices for the most probable aliments to be added to this meal
   */
  loadAdvices() {

    new FRboTAPI().predict().then((data) => {
      this.setState({
        advices: data
      })
    })

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
   * Extractor for the advice data
   * @param {} item 
   */
  adviceDataExtractor(item) {

    return {
      title: item.item.name
    }

  }

  /**
   * Renders this screen
   */
  render() {

    let advices;
    if (this.state.advices) {
      advices = (
        <View style={styles.adviceContainer}>
          <View style={styles.adviceHeader}>
            <Image source={require('../../img/chimp.png')} style={styles.chimp} />
            <Text style={styles.adviceTitle}>Are you looking for this?</Text>
          </View>
          <TotoFlatList data={this.state.advices} dataExtractor={this.adviceDataExtractor} />
        </View>
      )
    }

    return (
      <View style={styles.container}>

        {advices}

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
  adviceContainer: {
    backgroundColor: theme.color().COLOR_THEME_DARK,
    paddingVertical: 12
  },
  adviceHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 12
  },
  adviceTitle: {
    fontSize: 14,
    height: 16,
    color: theme.color().COLOR_THEME_LIGHT,
    marginLeft: 12,
  },
  chimp: {
    width: 24, 
    height: 24, 
    tintColor: theme.color().COLOR_THEME_LIGHT
  }
});
