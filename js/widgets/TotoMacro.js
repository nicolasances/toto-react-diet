import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {StyleSheet, View, Text, Image, ART, Dimensions, Animated, Easing } from 'react-native';
import TotoAnimatedNumber from '../widgets/TotoAnimatedNumber';
import * as theme from '../styles/ThemeColors';

/**
 * Defines the component that shows a generic macro.
 * The value is going to be animated.
 * Requires:
 * - label      : the name of the macro (e.g. Carbs, Proteins, ...)
 * - Value      : the value, to which this widget is going to append 'g'
 */
export default class TotoMacro extends Component {

  constructor(props) {
    super(props);
  }

  /**
   * Renders this component
   */
  render() {

    return (

      <View style={styles.macroContainer}>
        <Text style={styles.macroLabel}>{this.props.label}</Text>
        <TotoAnimatedNumber style={styles.macroValue} value={this.props.value} />
      </View>
    )
  }
}

// Progress circle properties
TotoMacro.propTypes = {
  value: PropTypes.number.isRequired,
  label: PropTypes.string.isRequired,
}

/**
 * Style sheet
 */
const styles = StyleSheet.create({

  macroContainer: {
    backgroundColor: theme.color().COLOR_THEME_LIGHT,
    width: 72,
    borderRadius: 5,
    alignItems: 'stretch',
  },
  macroLabel: {
    fontSize: 12,
    flexDirection: 'row',
    textAlign: 'center',
    paddingVertical: 3,
    color: theme.color().COLOR_TEXT_ACCENT,
  },
  macroValue: {
    fontSize: 16,
    flexDirection: 'row',
    textAlign: 'center',
    color: theme.color().COLOR_TEXT_ACCENT,
    paddingVertical: 6
  },
});
