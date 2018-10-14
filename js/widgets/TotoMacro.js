import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {StyleSheet, View, Text, Image, ART, Dimensions, Animated, Easing, TextInput } from 'react-native';
import TotoAnimatedNumber from '../widgets/TotoAnimatedNumber';
import * as theme from '../styles/ThemeColors';

/**
 * Defines the component that shows a generic macro.
 * The value is going to be animated.
 * Requires:
 * - label      : the name of the macro (e.g. Carbs, Proteins, ...)
 * - Value      : the value, to which this widget is going to append 'g'
 * - input      : true if this should allow user input to set the macro.
 *                note that if this is set, the onChangeText prop has to be set too
 * - onChangeText: callback called when the user input changes
 */
export default class TotoMacro extends Component {

  constructor(props) {
    super(props);

    this.state = {
      value: 0
    }
  }

  componentWillReceiveProps(props) {

    this.setState({value: props.value});

  }

  /**
   * Renders this component
   */
  render() {

    // Define if this is a text input or just a display of the macro number
    let valueContainer;

    if (this.props.input) valueContainer = (
      <TextInput
          style={styles.valueInput}
          onChangeText={(text) => {this.props.onChangeText(text.replace(',', '.'))}}
          keyboardType='numeric'
          defaultValue={this.state.value != null ? this.state.value.toString() : ''} />
    )
    else valueContainer = (
      <TotoAnimatedNumber style={styles.macroValue} value={this.state.value} />
    )

    return (

      <View style={styles.macroContainer}>
        <Text style={styles.macroLabel}>{this.props.label}</Text>
        {valueContainer}
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
  valueInput: {
    fontSize: 16,
    textAlign: 'center',
    color: theme.color().COLOR_TEXT_ACCENT,
    paddingVertical: 6
  },
});
