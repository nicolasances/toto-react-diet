import React, {Component} from 'react';
import PropTypes from 'prop-types';
import AnimateNumber from 'react-native-animate-number';
import {Animated, Easing, Text, View, StyleSheet, Dimensions, ART, TouchableOpacity} from 'react-native';
import * as scale from 'd3-scale';
import * as shape from 'd3-shape';
import * as array from 'd3-array';
import * as path from 'd3-path';
import * as theme from '../styles/ThemeColors';
import * as TotoEventBus from '../services/TotoEventBus';

import DietAPI from '../services/DietAPI';

const {Group, Shape, Surface, Transform} = ART;
const d3 = {scale, shape, array, path};

export default class DietDaySphere extends Component {

  constructor(props) {

    super(props);

    this.width = Dimensions.get('window').width;
    this.height = 200;
    this.radius = this.props.radius == null ? 80 : this.props.radius;
    this.radiusWidth = 12;
    this.firstAnimationSpeed = 1500;
    this.stdAnimationSpeed = 800;

    this.state = {
      caloriesProgress: new Animated.Value(0),
      calories: 0,
      caloriesGoal: 3000
    }

    this.loadCalories();

    // Bind this
    this.mealAdded = this.mealAdded.bind(this);

  }

  /**
   * When mounting
   */
  componentDidMount() {
    TotoEventBus.bus.subscribeToEvent('mealAdded', this.mealAdded);
  }

  /**
  * When unmounting
  */
  componentWillUnmount() {
    TotoEventBus.bus.unsubscribeToEvent('mealAdded', this.mealAdded);
  }

  /**
   * React to a meal added
   */
  mealAdded() {

      // Retrieve the new meals
      new DietAPI().getTodayMeals().then(data => {

        if (data == null || data.meals == null) return;

        // Total amount of calories for the day
        var calories = 0;

        // Calculate the total amount of calories
        for (var i = 0; i < data.meals.length; i++) {
          calories += data.meals[i].calories;
        }

        // Calculate the progress and start the animation
        var caloriesProgress = calories * 360 / this.state.caloriesGoal;

        this.setState({
          caloriesProgress: caloriesProgress,
          calories: calories
        });

      });
  }

  /**
   * Load the calories for the day
   */
  loadCalories() {

    new DietAPI().getTodayMeals().then(data => {

      if (data == null || data.meals == null) return;

      // Total amount of calories for the day
      var calories = 0;

      // Calculate the total amount of calories
      for (var i = 0; i < data.meals.length; i++) {
        calories += data.meals[i].calories;
      }

      // Calculate the progress and start the animation
      var caloriesProgress = calories * 360 / this.state.caloriesGoal;

      // Define the animation properties based on the moment:
      //  - if it's the first load, then do a slow bounce animation
      //  - if we already loaded, to a simple fast transition
      var ease = this.state.calories == 0 ? Easing.bounce : Easing.inOut;
      var speed = this.state.calories == 0 ? this.firstAnimationSpeed : this.stdAnimationSpeed;


      this.animate(caloriesProgress, speed, ease);

      // Set the calories and the progress compared to the goal
      this.setState({
        calories: calories
      });

    });
  }

  animate(toVal, dur, ease) {

    Animated.timing(this.state.caloriesProgress, {
      toValue: toVal,
      easing: ease,
      duration: dur,
    }).start();

  }

  render() {

    return (
      <TouchableOpacity onPress={this.props.onItemPress}>

        <AnimatedProgress width={this.width} height={this.height} radius={this.radius} radiusWidth={this.radiusWidth} progress={this.state.caloriesProgress}/>

        <View style={{position: 'absolute', width: this.width, height: this.height, alignItems: 'center', justifyContent: 'center'}}>
          <AnimateNumber style={styles.caloriesCounter} value={this.state.calories} formatter={(val) => {return val.toFixed(0)}}/>
          <Text style={styles.calLabel}>cal.</Text>
        </View>

      </TouchableOpacity>
    )
  }

}

/**
 * Component representing the progress circle
 */
class ProgressCircle extends Component {

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
    const progressPath = this.circlePath(0, this.props.progress);

    return (
      <View>
        <Surface width={this.props.width} height={this.props.height}>
          <Shape d={backgroundPath} strokeWidth={this.props.radiusWidth} stroke={theme.color().COLOR_THEME_DARK} />
          <Shape d={progressPath} strokeWidth={this.props.radiusWidth} stroke={theme.color().COLOR_ACCENT} />
        </Surface>
      </View>
    )

  }

}

ProgressCircle.propTypes = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  radius: PropTypes.number.isRequired,
  radiusWidth: PropTypes.number.isRequired,
  progress: PropTypes.number.isRequired,
}

const AnimatedProgress = Animated.createAnimatedComponent(ProgressCircle);

const styles = StyleSheet.create({
  caloriesCounter: {
    fontSize: 28,
    color: theme.color().COLOR_TEXT
  },
  calLabel: {
    fontSize: 14,
    color: theme.color().COLOR_TEXT
  }
})
