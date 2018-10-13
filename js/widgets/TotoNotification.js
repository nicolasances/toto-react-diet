import React, {Component} from 'react';
import {View, Text, StyleSheet, Dimensions, Animated, Easing} from 'react-native';
import * as theme from '../styles/ThemeColors';
import * as TotoEventBus from '../services/TotoEventBus';

const window = Dimensions.get('window');

export default class TotoNotification extends Component {

  constructor(props) {
    super(props);

    // Init the state with the start animation values
    this.state = {
      topAnimated: new Animated.Value(window.height),
      top: window.height,
    }

    // Define the height of the popup
    this.height =  /* margins */ 12 + 12 +  /* paddings */ + 12 + 12 + /* fontSize */ 14 + /* Extra space */ 9;

    // Bind functions to this
    this.calculateHeight = this.calculateHeight.bind(this);
    this.hideNotification = this.hideNotification.bind(this);
  }

  /**
   * On component mounted
   */
  componentDidMount() {
    // Listen to animation
    this.state.topAnimated.addListener((progress) => {
      this.setState({top: progress.value});
    });
  }

  /**
   * React to props change
   */
  componentWillReceiveProps(props) {

    if (props.text == null) return;

    // Animate the bottom property of the notification to make the SLIDE IN effect
    Animated.timing(this.state.topAnimated, {
      toValue: window.height - this.height,
      easing: Easing.bouncing,
      duration: 100,
    }).start(this.hideNotification);
  }

  /**
   * Starts the animation to show the notification
   * by sliding it in
   */
  showNotification() {
    // Animate the top property of the notification to make the SLIDE IN effect
    Animated.timing(this.state.topAnimated, {
      toValue: window.height - this.height,
      easing: Easing.bouncing,
      duration: 100,
    }).start(this.hideNotification)
  }

  /**
   * Starts the animation to hide the notification
   * by sliding it out
   */
  hideNotification() {
    // Animate the top property of the notification to make the SLIDE IN effect
    // Leave the message for a second and then remove
    Animated.timing(this.state.topAnimated, {
      toValue: window.height,
      delay: this.props.persistentTime == null ? 1500 : this.props.persistentTime,
      easing: Easing.linear,
      duration: 100,
    }).start();
  }

  /**
   * Calculates the height of the view, in order to define when the animation has to stop
   */
  calculateHeight(onLayoutEvent) {

    // this.height = onLayoutEvent.nativeEvent.layout.height;

  }

  /**
   * Render the notification
   */
  render() {

    if (this.props.text == null) return (
      <View></View>
    )

    // Define the animated styles
    let animatedStyles = {
      top: this.state.top,
      position: 'absolute',
      marginVertical: 12,
      flexDirection: 'row',
      width: window.width,
    }

    return (

      <View style={animatedStyles} onLayout={(event) => this.calculateHeight(event)}>
        <View style={styles.notificationContainer}>
          <Text style={styles.text}>{this.props.text}</Text>
        </View>
      </View>
    )

  }
}

const styles = StyleSheet.create({
  notificationContainer: {
    backgroundColor: theme.color().COLOR_THEME_DARK,
    padding: 12,
    marginHorizontal: 6,
    flex: 1,
    borderRadius: 5,
    shadowColor: 'black',
    shadowOpacity: 0.5,
    shadowRadius: 3,
    shadowOffset: {width: 1, height: 3}
  },
  text: {
    fontSize: 14,
    color: theme.color().COLOR_ACCENT
  }
})
