import React, {Component} from 'react';
import {View, Text, StyleSheet, TextInput, TouchableOpacity} from 'react-native';
import TotoTitleBar from '../widgets/TotoTitleBar';
import TotoIconButton from '../widgets/TotoIconButton';
import * as theme from '../styles/ThemeColors';
import * as TotoEventBus from '../services/TotoEventBus';

export default class NewMealFoodDetailScreen extends Component {

    // Define the Navigation options
    static navigationOptions = ({navigation}) => {

      return {
        headerLeft: null,
        headerTitle: <TotoTitleBar
                        title={navigation.getParam('food').name}
                        back={true}
                        />
      }
    }

    // Constructor
    constructor(props) {
      super(props);

      // Initialize state
      this.state = {
        food: this.props.navigation.getParam('food'),
        amount: 0,
        unit: 'gr'
      }

      //  Bind the functions
      this.onOk = this.onOk.bind(this);
      this.onRemove = this.onRemove.bind(this);
    }

    /**
     * Function to be called when the user input is confirmed
     */
    onOk() {

      // 1. publish the 'amount set' event
      TotoEventBus.bus.publishEvent({name: 'foodAmountInMealChanged', context: this.state});

      // 2. Go back
      this.props.navigation.goBack();
    }

    /**
     * Function to be called when the user clicks the remove button
     */
    onRemove() {

      // 1. Publish the 'food removed ' event
      TotoEventBus.bus.publishEvent({name: 'foodInMealRemoved', context: this.state})

      // 2. Go back
      this.props.navigation.goBack();
    }

    /**
     * Renders a button to select the unit
     */
    renderUnit(unit, stateUnit) {

      // Define the button style
      let style = (unit == stateUnit) ? styles.unitSelectedContainer : styles.unitContainer;

      return (
        <TouchableOpacity style={style} onPress={(item) => {this.setState({unit: unit})}}>
          <Text style={styles.unitText}>{unit == null ? '%' : unit}</Text>
        </TouchableOpacity>
      )
    }

    // Render function
    render() {

      let unit = this.renderUnit(null, this.state.unit);
      let unitG = this.renderUnit('gr', this.state.unit);
      let unitMl = this.renderUnit('ml', this.state.unit);

      return (

        <View style={styles.container}>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Amount</Text>
            <TextInput
              style={styles.inputValue}
              onChangeText={(text) => this.setState({amount: text})} />
          </View>

          <View style={styles.unitsContainer}>
            {unit}
            {unitG}
            {unitMl}
          </View>

          <View style={styles.buttonsContainer}>
            <TotoIconButton
                image={require('../../img/tick.png')}
                label='Confirm'
                onPress={this.onOk} />
            <TotoIconButton
                image={require('../../img/trash.png')}
                label='Remove'
                secondary={true}
                onPress={this.onRemove}
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
    padding: 12
  },
  inputContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingVertical: 12,
  },
  inputLabel: {
    color: theme.color().COLOR_TEXT,
    paddingBottom: 6,
  },
  inputValue: {
    color: theme.color().COLOR_TEXT,
    width: 100,
    height: 100,
    borderRadius: 50,
    borderColor: theme.color().COLOR_THEME_LIGHT,
    borderWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    fontSize: 24
  },
  buttonsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  unitsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingVertical: 12,
  },
  unitContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: theme.color().COLOR_THEME_DARK,
    alignContent: 'center',
    justifyContent: 'center',
  },
  unitSelectedContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: theme.color().COLOR_ACCENT,
    backgroundColor: theme.color().COLOR_ACCENT,
    alignContent: 'center',
    justifyContent: 'center',
  },
  unitText: {
    color: theme.color().COLOR_TEXT_ACCENT,
    fontSize: 14,
    textAlign: 'center',
  },
});
