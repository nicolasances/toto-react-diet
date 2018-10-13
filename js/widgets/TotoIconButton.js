import React, {Component} from 'react';
import {View, TouchableOpacity, Image, StyleSheet} from 'react-native';
import * as theme from '../styles/ThemeColors';

/*+
 * Displays a button as a circle with an icon inside
 * Requires:
 * - onPress        : function called when the button is pressed
 * - secondary      : true if the button should be a secondary button
 * - Image          : the image to use
 */
export default class TotoIconButton extends Component {

  /*+
   * Constructor
   */
  constructor(props) {
    super(props);
  }

  /**
   * Render the component
   */
  render() {

    return (

      <TouchableOpacity style={styles.container} onPress={this.props.onPress}>
        <Image style={styles.image} source={this.props.image} />
      </TouchableOpacity>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.color().COLOR_ACCENT,
    borderRadius: 30,
    width: 48,
    height: 48,
    marginHorizontal: 6,
  },
  image: {
    tintColor: theme.color().COLOR_ACCENT,
    width: 20,
    height: 20,
  },
});
