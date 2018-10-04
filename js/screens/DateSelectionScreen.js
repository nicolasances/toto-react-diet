import React, {Component} from 'react';
import {View, Text, StyleSheet, TextInput, TouchableOpacity, DatePickerIOS} from 'react-native';
import TotoTitleBar from '../widgets/TotoTitleBar';
import TotoButton from '../widgets/TotoButton';
import * as theme from '../styles/ThemeColors';
import * as TotoEventBus from '../services/TotoEventBus';

/**
 * Screen to select a data.
 * Requires the following navigation attributes:
 * - eventName      : the event to be thrown when the date is selected (the date will be provided as a context of the event:
 *                    context: {date: <value>}
 */
export default class DateSelectionScreen extends Component {

    // Define the Navigation options
    static navigationOptions = ({navigation}) => {

      return {
        headerLeft: null,
        headerTitle: <TotoTitleBar
                        title='Pick a date'
                        back={true}
                        />
      }
    }

    // Constructor
    constructor(props) {
      super(props);

      // Initialize state
      this.state = {
        chosenDate: new Date()
      }

      //  Bind the functions
      this.setDate = this.setDate.bind(this);
      this.onOk = this.onOk.bind(this);
    }

    /**
     * Update the date
     */
    setDate(newDate) {
      this.setState({chosenDate: newDate});
    }

    /**
     * Return the value
     */
    onOk() {

      // Fire the event
      TotoEventBus.bus.publishEvent({name: this.props.navigation.getParam('event'), context: {date: this.state.chosenDate}});

      // Go back
      this.props.navigation.goBack();
    }

    // Render function
    render() {

      return (

        <View style={styles.container}>

          <DatePickerIOS
            date={this.state.chosenDate}
            onDateChange={this.setDate}
            minuteInterval={5}
          />

          <View style={styles.buttonsContainer}>
            <View style={styles.buttonContainer}>
              <TotoButton
                  label='Confirm'
                  onPress={this.onOk} />
            </View>
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
  buttonsContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
});
