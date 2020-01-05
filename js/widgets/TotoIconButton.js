import React, {Component} from 'react';
import {View, TouchableOpacity, Image, StyleSheet, Text} from 'react-native';
import * as theme from '../styles/ThemeColors';

/*+
 * Displays a button as a circle with an icon inside
 * Requires:
 * - onPress        : function called when the button is pressed
 * - secondary      : true if the button should be a secondary button
 * - image          : the image to use
 * - size           : (optional, default: 'm') can be 'xxl', 'xl', 'l', 'm', 'ms', 's', 'xs'
 * - label          : (optional, default: none) shows a label
 * - disabled       : (optional, default false) disables the button
 */
export default class TotoIconButton extends Component {

  /*+
   * Constructor
   */
  constructor(props) {
    super(props);

    if (props.disabled == null) this.props.disabled = false;
  }

  /**
   * Render the component
   */
  render() {

    let containerSize = 48;
    let iconSize = 20;

    // Change the size based on the 'size' prop
    if (this.props.size == 'xxl') {
      containerSize = 120;
      iconSize = 54;
    }
    else if (this.props.size == 'xl') {
      containerSize = 72;
      iconSize = 38;
    }
    else if (this.props.size == 'l') {
      containerSize = 60;
      iconSize = 32;
    }
    else if (this.props.size == 'ms') {
      containerSize = 36;
      iconSize = 16;
    }
    else if (this.props.size == 's') {
      containerSize = 24;
      iconSize = 12;
    }
    else if (this.props.size == 'xs') {
      containerSize = 20;
      iconSize = 10;
    }

    // Define the sizeStyles
    let containerSizeStyle = {width: containerSize, height: containerSize, borderRadius: containerSize / 2};
    let iconSizeStyle = {width: iconSize, height: iconSize};

      // Define the coloring based on if this button is disabled or not
      if (this.props.disabled) {

        imageColor = {tintColor: theme.color().COLOR_DISABLED};
        containerBorderColor = {borderColor: theme.color().COLOR_DISABLED};
        labelColor = {color: theme.color().COLOR_DISABLED};
      }
      else {

        imageColor = {tintColor: theme.color().COLOR_ACCENT};
        containerBorderColor = {borderColor: theme.color().COLOR_ACCENT};
        labelColor = {color: theme.color().COLOR_ACCENT};
      }

    // Define the label component if any
    let label;

    if (this.props.label) {

      // Define the size of the label based on the size of the button
      let labelFontSize = 10;
      if (this.props.size == 'xxl') labelFontSize = 14;

      // Define the margin from the top based on the size of the button
      let labelMarginTop = 6;
      if (this.props.size == 'xxl') labelMarginTop = 12;

      label = (<Text style={[labelColor, styles.label, {fontSize: labelFontSize, marginTop: labelMarginTop}]}>{this.props.label}</Text>)
    }

    return (

      <View style={{alignItems: 'center', marginHorizontal: 6}}>
        <TouchableOpacity disabled={this.props.disabled} style={[styles.container, containerSizeStyle, containerBorderColor]} onPress={this.props.onPress}>
          <Image style={[styles.image, iconSizeStyle, imageColor]} source={this.props.image} />
        </TouchableOpacity>
        {label}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
    borderWidth: 2,
  },
  image: {
    alignItems: 'center',
  },
  label: {
    textAlign: 'center',
    textTransform: 'uppercase'
  },
});
