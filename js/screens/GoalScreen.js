import React, {Component} from 'react';
import {KeyboardAvoidingView, StyleSheet, Text, TextInput, View, Image, TouchableOpacity} from 'react-native';
import MealPrepsList from '../components/MealPrepsList';
import TotoTitleBar from '../widgets/TotoTitleBar';
import TotoIconButton from '../widgets/TotoIconButton';
import * as theme from '../styles/ThemeColors';
import * as TotoEventBus from '../services/TotoEventBus';
import moment from 'moment';
import DietAPI from '../services/DietAPI';

/**
 * Shows the dietary goals
 */
export default class GoalScreen extends Component<Props> {

  // Define the Navigation options
  static navigationOptions = ({navigation}) => {
    return {
      headerLeft: null,
      headerTitle: <TotoTitleBar
                      title='Your goals'
                      back={true}
                      />

    }
  }

  constructor(props) {
    super(props);

    // Initialize state
    this.state = {
      goal: {}
    }

    // Bind functions to this
    this.loadData = this.loadData.bind(this);
    this.onOk = this.onOk.bind(this);
    this.updateCaloriesGoal = this.updateCaloriesGoal.bind(this);
  }

  /**
   * When the component is mounted
   */
  componentDidMount() {

    // Load the data
    this.loadData();
  }

  /**
   * Loads the goals
   */
  loadData() {

    new DietAPI().getGoal().then((data) => {

      this.setState({
        goal: data
      });
    });
  }

  /**
   * Updates the goal
   */
  onOk() {

    // Avoid null errors
    if (this.state.goal == null) return;

    // If there was no goal set before:
    if (this.state.goal.id == null) {

      // Create a new goal
      new DietAPI().postGoal(this.state.goal).then((resp) => {

        // Send a notification
        TotoEventBus.bus.publishEvent({name: 'notification', context: {text: 'Your new goal has been set!'}});

        // Send an event to notify that a new goal has been set
        TotoEventBus.bus.publishEvent({name: 'goalSet', context: {goal: this.state.goal}});

        // Go back to the previous page
        this.props.navigation.goBack();
      });
    }
    // Otherwise update the previous goal
    else {

      // Update the goal
      new DietAPI().putGoal(this.state.goal.id, this.state.goal).then((resp) => {

        // Send a notification
        TotoEventBus.bus.publishEvent({name: 'notification', context: {text: 'Your new goal has been set!'}});

        // Send an event to notify that a new goal has been set
        TotoEventBus.bus.publishEvent({name: 'goalSet', context: {goal: this.state.goal}});

        // Go back to the previous page
        this.props.navigation.goBack();
      });
    }

  }

  /**
   * To be called when the text changes in the input field for the goal
   */
  updateCaloriesGoal(text) {

    this.setState(prevState => ({
      goal: {
        id: prevState.goal.id,
        set: prevState.goal.set,
        calories: text
      }
    }))
  }

  /**
   * Renders this screen
   */
  render() {

    // Set the date to display
    let date = 'No goal set';

    if (this.state.goal.set != null) date = moment(this.state.goal.set, 'YYYYMMDD').format('DD MMM YYYY');


    return (
      <KeyboardAvoidingView style={styles.container}>

        <View style={{flexDirection: 'row'}}>
          <View style={styles.timeContainer} >
            <Text style={styles.date}>{date}</Text>
          </View>

          <View style={styles.caloriesContainer}>
            <TextInput
              style={styles.inputValue}
              onChangeText={this.updateCaloriesGoal}
              keyboardType='numeric'
              value={this.state.goal.calories} />
          </View>
        </View>

        <View style={styles.buttonsContainer}>
          <TotoIconButton
              image={require('../../img/tick.png')}
              label='Confirm'
              onPress={this.onOk} />
        </View>
      </KeyboardAvoidingView>
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
    padding: 12
  },
  timeContainer: {
    flex: 0.6,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  caloriesContainer: {
    flex: 0.4,
    paddingVertical: 12,
  },
  date: {
    fontSize: 18,
    color: theme.color().COLOR_TEXT
  },
  inputValue: {
    color: theme.color().COLOR_ACCENT,
    width: 100,
    height: 100,
    borderRadius: 50,
    borderColor: theme.color().COLOR_THEME_LIGHT,
    borderWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    fontSize: 22
  },
  buttonsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
});
