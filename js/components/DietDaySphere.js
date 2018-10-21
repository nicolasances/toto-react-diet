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
import moment from 'moment';

import DietAPI from '../services/DietAPI';

const {Group, Shape, Surface, Transform} = ART;
const d3 = {scale, shape, array, path};

export default class DietDaySphere extends Component {

  constructor(props) {

    super(props);

    this.radiusWidth = this.props.radiusWidth != null ? this.props.radiusWidth : 12;
    this.radius = this.props.radius == null ? 80 : this.props.radius;
    this.width = this.props.width != null ? this.props.width : Dimensions.get('window').width;
    this.height = 200;
    this.firstAnimationSpeed = 1500;
    this.stdAnimationSpeed = 300;

    this.state = {
      caloriesProgress: 0,
      caloriesProgressAnimated: new Animated.Value(0),
      calories: 0,
      caloriesGoal: 3000
    }

    // Animation listener to update the actual value with the animation
    this.state.caloriesProgressAnimated.addListener((progress) => {
      this.setState({caloriesProgress: progress.value});
    });

    // Bind this
    this.mealAdded = this.mealAdded.bind(this);
    this.loadGoal = this.loadGoal.bind(this);
    this.loadCalories = this.loadCalories.bind(this);
    this.onGoalReset = this.onGoalReset.bind(this);

  }

  /**
   * When mounting
   */
  componentDidMount() {
    // Subscribe to relevant events
    TotoEventBus.bus.subscribeToEvent('mealAdded', this.mealAdded);
    TotoEventBus.bus.subscribeToEvent('goalSet', this.onGoalReset);

    // Load the data
    this.loadGoal().then(this.loadCalories);
  }

  /**
  * When unmounting
  */
  componentWillUnmount() {
    // Unsubscribe to events
    TotoEventBus.bus.unsubscribeToEvent('mealAdded', this.mealAdded);
    TotoEventBus.bus.unsubscribeToEvent('goalSet', this.onGoalReset);
  }

  /**
   * Loads the goal
   */
  loadGoal() {

    return new Promise((success, failure) => {

      new DietAPI().getGoal().then((data) => {

        // If there's no goal set, set it to a default of 3000
        if (data == null || data.id == null) {
          this.setState({caloriesGoal: 3000});
        }
        // Otherwise set it to the set goal
        else {
          this.setState({caloriesGoal: parseInt(data.calories)});
        }

        success();

      });
    });
  }

  /**
   * React when the calories goal is changed
   */
  onGoalReset(event) {

    if (event == null || event.context == null || event.context.goal == null) return;

    let goal = event.context.goal;

    // Set the state
    this.setState({
      caloriesGoal: parseInt(goal.calories)
    })

    // Recalculate the progress
    var caloriesProgress = this.state.calories * 360 / parseInt(goal.calories);

    if (caloriesProgress > 360) caloriesProgress = 360;

    // Animate
    this.animate(caloriesProgress, this.stdAnimationSpeed, Easing.linear);

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

        // Update the state
        this.setState({calories: calories});

        // Calculate the progress and start the animation
        var caloriesProgress = calories * 360 / this.state.caloriesGoal;

        if (caloriesProgress > 360) caloriesProgress = 360;

        // Animate
        this.animate(caloriesProgress, this.stdAnimationSpeed, Easing.linear);

      });
  }

  /**
   * Load the calories for the day
   */
  loadCalories() {

    new DietAPI().getCaloriesPerDay(moment().format('YYYYMMDD')).then(data => {

      if (data == null || data.meals == null) return;

      // Total amount of calories for the day
      var calories = 0;

      // Calculate the total amount of calories
      if (data.meals.length > 0) calories = data.meals[0].calories;

      // Calculate the progress and start the animation
      var caloriesProgress = calories * 360 / this.state.caloriesGoal;

      if (caloriesProgress > 360) caloriesProgress = 360;

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

    Animated.timing(this.state.caloriesProgressAnimated, {
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
          <Text style={styles.calLabel}>cal</Text>
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
