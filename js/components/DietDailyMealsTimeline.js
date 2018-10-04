import React, {Component} from 'react';
import {Animated, Text, View, StyleSheet, Dimensions, ART} from 'react-native';
import * as scale from 'd3-scale';
import * as array from 'd3-array';
import * as shape from 'd3-shape';
import * as theme from '../styles/ThemeColors';
import * as TotoEventBus from '../services/TotoEventBus';

import DietAPI from '../services/DietAPI';

const d3 = {scale, array, shape};
const {Group, Shape, Surface} = ART;

export default class DietDailyMealsTimeline extends Component {

  constructor(props) {

    super(props);

    this.width = Dimensions.get('window').width;
    this.timelineHeight = 8;
    this.timelineDashHeight = 3;
    this.paddingTop = 25;
    this.currentTimeRadius = 21;
    this.height = this.paddingTop + this.timelineHeight + this.currentTimeRadius;

    // Init the state
    this.state = {
      mealTimes: [],
      meals: [],
      lastTime: null
    }

    // Load the meals
    this.loadMeals();

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
    this.loadMeals();
  }

  /**
   * Load the meals of the day
   */
  loadMeals() {

    new DietAPI().getTodayMeals().then(data => {

      // Extract the time of each meal
      var times = [];

      if (data == null || data.meals == null) return;

      // Last time
      var lastTime = null;

      for (var i = 0; i < data.meals.length; i++) {

        var meal = data.meals[i];

        // Compare with last time
        if (lastTime == null) lastTime = meal.time;
        if (getTime(lastTime) < getTime(meal.time)) lastTime = meal.time;

        times.push(meal.time);
      }

      // Update the state object
      this.setState({
        meals: data.meals,
        mealTimes: times,
        lastTime: this.formatTime(lastTime)
      });

    });
  }

  /**
   * Formats correctly the time by removing leading zeros
   */
  formatTime(time) {

    if (time == null) return null;

    var hours = time.substring(0, time.indexOf(':'));
    var min = time.substring(time.indexOf(':') + 1);

    if (hours.length > 2) hours = hours.substring(hours.length - 2);

    return hours + ':' + min;
  }

  /**
   * Renders a timeline
   * Renders it as dotted for the future and as normal for the past
   */
  timelinePath(type, lastTime) {

    var noData = false;

    if (this.state.meals == null || this.state.meals.length == 0) noData = true;

    var minTimeInMeals = noData ? getTime('06:00') : d3.array.min(this.state.meals, d => {return getTime(d.time)});
    var maxTimeInMeals = noData ? getTime('21:00') : d3.array.max(this.state.meals, d => {return getTime(d.time)});

    var minTime = (getTime('06:00') < minTimeInMeals) ? getTime('06:00') : minTimeInMeals;
    var maxTime = (getTime('21:00') > maxTimeInMeals) ? getTime('21:00') : maxTimeInMeals;

    var x = d3.scale.scaleLinear().domain([minTime, maxTime]).range([32, this.width - 32]);

    // If the time is in the past
    if (type == 'past') {

      var x0 = x(minTime);
      var x1 = lastTime == null ? x(getTime('06:10')) : x(getTime(lastTime));

      var line = ART.Path()
                    .move(x0, this.paddingTop + this.timelineHeight / 2)
                    .line(x1 - x0, 0);

      return line;

    }
    else {

      var x0 = lastTime == null ? x(getTime('06:10')) : x(getTime(lastTime));
      var x1 = x(maxTime);

      // Length of each dash of the dashed line
      var dashLength = 1;
      var emptyLength = 10;

      // Start the line
      var line = ART.Path().move(x0, this.paddingTop + this.timelineHeight / 2);

      // Build the dashes
      for (var i = x0; i < x1; i+= dashLength + emptyLength) {

        // Stop drawing the line if it goes over x1
        if (i + dashLength + emptyLength > x1) break;

        // Move to begining of dash
        line.move(emptyLength, 0);

        // Draw a dash
        line.line(dashLength, 0);

      }

      return line;
    }
  }

  /**
   * Creates a circle path
   */
  circlePath(time) {

    if (time == null) return ART.Path();

    var minTimeInMeals = d3.array.min(this.state.meals, d => {return getTime(d.time)});
    var maxTimeInMeals = d3.array.max(this.state.meals, d => {return getTime(d.time)});

    var minTime = (getTime('06:00') < minTimeInMeals) ? getTime('06:00') : minTimeInMeals;
    var maxTime = (getTime('21:00') > maxTimeInMeals) ? getTime('21:00') : maxTimeInMeals;

    var x = d3.scale.scaleLinear().domain([minTime, maxTime]).range([32, this.width - 32]);

    var cx = x(getTime(time));
    var cy = 0;
    var radius = this.currentTimeRadius;

    return ART.Path()
      .move(cx, this.paddingTop + this.timelineHeight / 2 + cy - radius)
      .arc(0, 2 * radius, radius)
      .arc(0, -2 * radius, radius)

  }

  /**
   * Returns the position of the specified time on the timeline
   */
  getXTime(time) {

    if (time == null) return 0;

    var minTimeInMeals = d3.array.min(this.state.meals, d => {return getTime(d.time)});
    var maxTimeInMeals = d3.array.max(this.state.meals, d => {return getTime(d.time)});

    var minTime = (getTime('06:00') < minTimeInMeals) ? getTime('06:00') : minTimeInMeals;
    var maxTime = (getTime('21:00') > maxTimeInMeals) ? getTime('21:00') : maxTimeInMeals;

    var x = d3.scale.scaleLinear().domain([minTime, maxTime]).range([32, this.width - 32]);

    return x(getTime(time));

  }

  /**
   * Render method
   */
  render() {

    const pastTimelinePath = this.timelinePath('past', this.state.lastTime);
    const futureTimelinePath = this.timelinePath('future', this.state.lastTime);
    const currentTimeCirclePath = this.circlePath(this.state.lastTime);

    const xLastTime = this.getXTime(this.state.lastTime);


    return (

      <View>
        <Surface width={this.width} height={this.height}>
          <Shape d={pastTimelinePath} stroke={theme.color().COLOR_THEME_DARK} strokeWidth={this.timelineHeight}/>
          <Shape d={futureTimelinePath} stroke={theme.color().COLOR_THEME_DARK} strokeWidth={this.timelineDashHeight}/>
          <Shape d={currentTimeCirclePath} stroke={theme.color().COLOR_ACCENT} strokeWidth={2} fill={theme.color().COLOR_THEME}/>
        </Surface>
        <Text style={{fontSize: 11, left: xLastTime, top: this.paddingTop - 3, position: 'absolute', color: theme.color().COLOR_TEXT, marginLeft: -15}}>{this.state.lastTime}</Text>
      </View>

    );
  }
}


/**
* Returns the time as a float (e.g. 13:30 => 13,5) on the scale from 0 to 24
*
* - time : the time as a string (e.g. "13:30")
*/
var getTime = function(time) {

  var hour = time.substring(0, time.indexOf(':'));
  var minutes = time.substring(time.indexOf(':') + 1);

  var fractionMinutes = parseInt(minutes) / 60;

  return parseInt(hour) + fractionMinutes;
}

/**
 * Stylesheet of the component
 */
const style = StyleSheet.create({

})
