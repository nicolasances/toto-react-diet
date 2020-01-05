import React, {Component} from 'react';
import {View, StyleSheet, Text, Dimensions, TouchableOpacity, Image} from 'react-native';
import TotoTitleBar from '../widgets/TotoTitleBar';
import * as theme from '../styles/ThemeColors';
import FRboTAPI from '../services/FRboTAPI';
import TotoIconButton from '../widgets/TotoIconButton';
import TotoFlatList from '../widgets/TotoFlatList';
import DietAPI from '../services/DietAPI';
import * as TotoEventBus from '../services/TotoEventBus';

const width = Dimensions.get('window').width;

export default class MagicAddFoodScreen extends Component {

  // Define the Navigation options
  static navigationOptions = ({navigation}) => {

    return {
      headerLeft: null,
      headerTitle: <TotoTitleBar
                      title='Voodoo'
                      back={true}
                      />
    }
  }

  // Constructor
  constructor(props) {
    super(props);

    // Initialize the state
    this.state = {
      mealData: this.props.navigation.getParam('mealData'),
      added: []
    }

    // Bind the onFoodSelected to this class
    this.loadAdvices = this.loadAdvices.bind(this);
    this.adviceDataExtractor = this.adviceDataExtractor.bind(this);
    this.onAdviceItemPress = this.onAdviceItemPress.bind(this);
    this.onReset = this.onReset.bind(this);
    this.onConfirm = this.onConfirm.bind(this);

  }

  /**
   * When mounting, subscribe to the events
   */
  componentDidMount() {
    this.loadAdvices();
  }

  /**
   * When unmounting, unsubscribe
   */
  componentWillUnmount() {
  }

  /**
   * Loads the advices for the most probable aliments to be added to this meal
   */
  loadAdvices() {

    if (this.props.navigation.getParam('mealData')) {

      // The needed data is an {} with: 
      // - weekday (0 to 6, 0 being Monday)
      // - time (e.g. "5:20" or "05:20")
      mealData = this.props.navigation.getParam('mealData');

      adviceInput = mealData;
      adviceInput.nResults = 5;

      new FRboTAPI().predict(adviceInput).then((data) => {
        this.setState({
          advices: data
        })
      })
    }

  }

  /**
   * When confirming, add all the aliments to the meal that was being created 
   * and go back!
   */
  onConfirm() {

    if (this.state.added.length == 0) return;
    
    let promises = [];

    for (i = 0; i < this.state.added.length; i++) {

      aliment = this.state.added[i];

      promises.push(new DietAPI().getFood(aliment.alimentId).then((data) => {
          
        // Publish the event that the grocery (advice) has been clicked
        TotoEventBus.bus.publishEvent({name: 'grocerySelected', context: {grocery: data}});

      }))

    }

    Promise.all(promises).then(() => {

      // Navigate back to the selection screen
        this.props.navigation.goBack();

    })

  }

  /**
   * Adds an item to the meal
   */
  onAdviceItemPress(item) {

    ad = this.state.advices;
    for (i = 0; i < ad.length; i++) {
      if (ad[i].alimentId == item.item.alimentId) {
        ad.splice(i, 1)
      }
    }

    // Add the item to the state and...
    // Remove the item from the available items 
    this.setState({
      added: [item.item, ...this.state.added],
      advices: []
    }, () => {
      this.setState({advices: ad})
    })

  }

  /**
   * Resets the advices and removes all added aliments 
   */
  onReset() {
    this.setState({
      added: [],
      advices: []
    })
    this.loadAdvices();
  }

  /**
   * Extractor for the advice data
   * @param {} item 
   */
  adviceDataExtractor(item) {

    return {
      title: item.item.name,
      avatar: {
        size: 'm'
      }
    }

  }


  // Render this screen
  render() {

    let counter;
    if (this.state.added.length > 0) counter = (
      <View style={styles.counterContainer}>
        <Text style={styles.counterText}>{this.state.added.length}</Text>
      </View>
    )

    return (

      <View style={styles.container}>

        <View style={styles.headerContainer}>

          <View style={{flex: 1, flexDirection: 'column', justifyContent: 'center'}}>
            <Text style={styles.time}>{mealData.time}</Text>
            <Text style={styles.weekday}>{mealData.weekdayString}</Text>
          </View>
          <View style={{flexDirection: 'column', marginHorizontal: 12, alignItems: 'center'}}>
            <Image source={require('../../img/chimp.png')} style={styles.chimpImage} />
            <Text style={styles.chimpText}>Spooky Toto Advice</Text>
          </View>
          
          <View style={{flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
            {counter}
          </View>

        </View>

        <View style={styles.buttonsContainer}>
          <TotoIconButton
                image={require('../../img/tick.png')}
                label='Add to meal'
                onPress={this.onConfirm} />
          <TotoIconButton
                image={require('../../img/reset.png')}
                size='m'
                onPress={this.onReset} />
        </View>

        <View style={styles.listContainer}>
          
          <TotoFlatList 
              data={this.state.advices}
              dataExtractor={this.adviceDataExtractor}
              onItemPress={this.onAdviceItemPress}
              />

        </View>

      </View>
    )
  }
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignContent: 'flex-start',
    backgroundColor: theme.color().COLOR_THEME,
    paddingTop: 12,
    paddingHorizontal: 12
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignContent: 'center',
    marginTop: 12
  },
  chimpText: {
    fontSize: 12,
    color: theme.color().COLOR_TEXT,
    marginTop: 12,
    textTransform: 'uppercase',
    width: 86,
    textAlign: 'center'
  },
  chimpImage: {
    width: 52, 
    height: 52,
    tintColor: theme.color().COLOR_TEXT
  },
  time: {
    fontSize: 26,
    color: theme.color().COLOR_TEXT,
    textAlign: 'center'
  },
  weekday: {
    fontSize: 12,
    color: theme.color().COLOR_TEXT,
    textAlign: 'center'
  },
  counterContainer: {
    flexDirection: 'column',
    width: 42,
    height: 42,
    borderRadius: 21,
    borderColor: theme.color().COLOR_THEME_DARK,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: "center",
  },
  counterText: {
    color: theme.color().COLOR_THEME_DARK, 
    fontSize: 16,
    fontWeight: 'bold'
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 24
  },
  listContainer: {
    flex: 1,
    flexDirection: 'column'
  },
});
