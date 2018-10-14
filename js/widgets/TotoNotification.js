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
      text: null,
    }

    // Define the height of the popup
    this.height =  /* margins */ 12 + 12 +  /* paddings */ + 12 + 12 + /* fontSize */ 14 + /* Extra space */ 9;

    // Bind functions to this
    this.calculateHeight = this.calculateHeight.bind(this);
    this.hideNotification = this.hideNotification.bind(this);
    this.onNotification = this.onNotification.bind(this);
  }

  /**
   * On component mounted
   */
  componentDidMount() {
    // Listen to animation
    this.state.topAnimated.addListener((progress) => {
      this.setState({top: progress.value});
    });

    // Subscribe to events
    TotoEventBus.bus.subscribeToEvent('notification', this.onNotification);
  }

  /**
   * When the title bar is unmounted
   */
  componentWillUnmount() {
    // Unsubscribe to the events
    TotoEventBus.bus.unsubscribeToEvent('notification', this.onNotification);
  }

  /**
   * React to receiving notifications
   */
  onNotification(event) {

    this.setState({
      text: event.context.text
    });

    // Animate the bottom property of the notification to make the SLIDE IN effect
    Animated.timing(this.state.topAnimated, {
      toValue: window.height - this.height,
      delay: 500,
      easing: Easing.linear,
      duration: 100,
    }).start(this.hideNotification);

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
      duration: 300,
    }).start(() => {
      this.setState({
        text: null
      })
    });
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

    if (this.state.text == null) return (
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
          <Text style={styles.text}>{this.state.text}</Text>
        </View>
      </View>
    )

  }
}

const styles = StyleSheet.create({
  notificationContainer: {
    backgroundColor: theme.color().COLOR_ACCENT_LIGHT,
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
    color: theme.color().COLOR_TEXT_ACCENT
  }
})
