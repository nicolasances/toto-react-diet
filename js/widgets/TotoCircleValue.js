import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {StyleSheet, View, Text, Image, ART, Dimensions, Animated, Easing } from 'react-native';
import TotoAnimatedNumber from '../widgets/TotoAnimatedNumber';
import * as scale from 'd3-scale';
import * as shape from 'd3-shape';
import * as array from 'd3-array';
import * as path from 'd3-path';
import * as theme from '../styles/ThemeColors';

const {Group, Shape, Surface} = ART;
const d3 = {scale, shape, array, path};
const window = Dimensions.get('window');

/**
 * Component representing a circle with a value inside.
 * Requires the following props:
 * - width        : width of the window (not the circle!!!)
 * - height       : height of the circle container (not the circle!!!)
 * - radius       : radius of the circle
 * - radiusWidth  : width of the radius
 * - color        : color of the circle
 */
export default class TotoCircleValue extends Component {

  constructor(props) {
    super(props);

  }

  /**
   * Transforms cartesian coord in polar coordinates
   */
  polarCoord(centerX, centerY, radius, angleInDegrees) {

    var angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;

    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    }
  }

  /**
   * Creates a circle path with the provided start and end angle
   */
  circlePath(startAngle, endAngle) {

    var start = this.polarCoord(this.props.width / 2, this.props.height / 2, this.props.radius, endAngle * 0.9999);
    var end = this.polarCoord(this.props.width / 2, this.props.height / 2, this.props.radius, startAngle);
    var largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    var d = [
      'M', start.x, start.y,
      'A', this.props.radius, this.props.radius, 0, largeArcFlag, 0, end.x, end.y
    ]

    return d.join();

  }

  /**
   * Render the component
   */
  render() {

    const backgroundPath = this.circlePath(0, 360);
    // const progressPath = this.circlePath(0, this.props.progress);
    // <Shape d={progressPath} strokeWidth={this.props.radiusWidth} stroke={theme.color().COLOR_ACCENT} />

    // Define the correct font
    var circleValueStyle = this.props.radius < 50 ? styles.circleValueS : styles.circleValue;
    var circleValueUnitStyle = this.props.radius < 50 ? styles.circleValueUnitS : styles.circleValueUnit;

    return (

      <View>

        <Surface width={this.props.width} height={this.props.height} >
          <Shape d={backgroundPath} strokeWidth={this.props.radiusWidth} stroke={this.props.color} />
        </Surface>

        <View style={{position: 'absolute', width: this.props.width, height: this.props.height, alignItems: 'center', justifyContent: 'center'}}>
          <TotoAnimatedNumber style={circleValueStyle} value={this.props.value} />
          <Text style={circleValueUnitStyle}>cal.</Text>
        </View>
      </View>
    )

  }

}

// Progress circle properties
TotoCircleValue.propTypes = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  radius: PropTypes.number.isRequired,
  radiusWidth: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
  color: PropTypes.string.isRequired,
}

/**
 * Style sheet
 */
const styles = StyleSheet.create({

  circleValue: {
    fontSize: 28,
    color: theme.color().COLOR_TEXT
  },
  circleValueS: {
    fontSize: 20,
    color: theme.color().COLOR_TEXT
  },
  circleValueUnit: {
    fontSize: 14,
    color: theme.color().COLOR_TEXT
  },
  circleValueUnitS: {
    fontSize: 12,
    color: theme.color().COLOR_TEXT
  },
});
