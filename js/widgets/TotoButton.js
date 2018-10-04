import React, {Component} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import * as theme from '../styles/ThemeColors';

/**
 * Button.
 * Requires:
 * - onPress        : function called when the button is pressed
 * - secondary      : true if the button should be a secondary button
 */
export default class TotoButton extends Component {

  // Constructor
  constructor(props) {
    super(props);
  }

  // Render the component
  render() {

    // Style for the button
    let buttonStyle = styles.button;

    if (this.props.secondary) buttonStyle = styles.secondaryButton;

    return (

      <TouchableOpacity style={buttonStyle} onPress={this.props.onPress}>
        <Text style={styles.buttonText}>{this.props.label}</Text>
      </TouchableOpacity>
    )
  }
}


// Styles
const styles = StyleSheet.create({
  button: {
    backgroundColor: theme.color().COLOR_ACCENT,
    padding: 12,
    alignItems: 'center',
    borderRadius: 3
  },
  secondaryButton: {
    backgroundColor: theme.color().COLOR_THEME_DARK,
    padding: 12,
    alignItems: 'center',
    borderRadius: 3,
    color: theme.color().COLOR_TEXT,
  },
  buttonText: {
    fontSize: 18,
    color: theme.color().COLOR_TEXT_ACCENT
  }
});
