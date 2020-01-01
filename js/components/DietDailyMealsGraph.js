import React, {Component} from 'react';
import {Animated, Text, View, StyleSheet, Dimensions, ART} from 'react-native';
import * as scale from 'd3-scale';
import * as shape from 'd3-shape';
import * as array from 'd3-array';
import * as path from 'd3-path';
import * as theme from '../styles/ThemeColors';
import * as TotoEventBus from '../services/TotoEventBus';
import DietAPI from '../services/DietAPI';

const {Group, Shape, Surface} = ART;
const d3 = {scale, shape, array, path};
const window = Dimensions.get('window');

export default class DietDailyMealsGraph extends Component {

  /**
   * Constructor
   */
  constructor(props) {
    super(props);

    this.constants = {
      macroPointRadius: {min: 5, max: 12, gap: 5}
    }

    this.state = {mealTimes: []};

    this.height = this.props.height == null ? 250 : this.props.height;
    this.width = window.width;
    this.adjustBottom = 20;

    this.refreshData();

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
    this.refreshData();
    this.forceUpdate();
  }

  /**
   * Loads the data from the API (meals of today)
   */
  refreshData() {

      new DietAPI().getTodayMeals().then((data) => {
        this.meals = data.meals.sort((a, b) => {
          var ta = getTime(a.time);
          var tb = getTime(b.time);

          if (ta < tb) return -1;
          else if (ta > tb) return 1;
          else return 0;
        });
        this.macroPoints();
      });
  }

  /**
   * Gets a Shape for the specific macro nutrient point (related to a specific meal)
   */
  macroPoint(x, y, type, radius) {

    if (type == null) type = 'proteins';

    var key = x + '' + y + '' + type;

    var stroke = theme.color().COLOR_THEME_DARK;
    if (type == 'carbs') stroke = theme.color().COLOR_ACCENT_DARK;
    if (type == 'fat') stroke = theme.color().COLOR_ACCENT_LIGHT;

    var circle = ART.Path()
      .move(x, y)
      .arc(0, 2 * radius, radius)
      .arc(0, -2 * radius, radius)

    return (
      <Shape key={key} d={circle} strokeWidth={2} stroke={stroke} fill={theme.color().COLOR_THEME} />
    )
  }

  /**
   * Creates a Shape representing the bar of the consumed calories
   */
  macroBar(x, height) {

    var key = x + '-' + height;

    var path = ART.Path()
        .move(x, this.height)
        .line(0, height-this.height);

    return (
      <Shape key={key} d={path} strokeWidth={6} stroke={theme.color().COLOR_THEME_DARK}/>
    )

  }

  /**
   * Displays a Text with the specified amount
   */
  caloriesText(x, y, calories) {

    var key = 'text-' + x + '-' + y + '-' + calories;

    var fontSize = 14;
    var left = parseInt(x.toFixed(0));
    var top = parseInt(y.toFixed(0)) - fontSize - 9;
    var marginLeft = -13 - (calories.toFixed(0).length - 3) * 3; // TODO : if fontSize changes, add a multiplier in front

    return (
      <Text key={key} alignment='center' style={{marginLeft: marginLeft, color: theme.color().COLOR_TEXT, fontSize: fontSize, position: 'absolute', left: left, top: top}}>{calories.toFixed(0)}</Text>
    )

  }

  /**
   * Create a coll background wave
   */
  createWavePath() {

    if (this.meals == null || this.meals.length == 0) return;

    var maxCalories = d3.array.max(this.meals, function(d) {return d.calories});
    var maxTimeInMeals = d3.array.max(this.meals, function(d) {return getTime(d.time)});
    var minTimeInMeals = d3.array.min(this.meals, function(d) {return getTime(d.time)});

    // Minimum and maximum macronutrient intake
    var maxMacro = d3.array.max(this.meals, d => {return d3.array.max([d.proteins, d.carbs, d.fat])});
    var minMacro = d3.array.min(this.meals, d => {return d3.array.min([d.proteins, d.carbs, d.fat])});

    // Scale that determines the radius of the macro point
    var radiusScale = d3.scale.scaleLinear().domain([minMacro, maxMacro]).range([this.constants.macroPointRadius.min, this.constants.macroPointRadius.max]);

    // Define  actual min and max time for the scale
    var minTime = (getTime('06:00') < minTimeInMeals) ? getTime('06:00') : minTimeInMeals;
    var maxTime = (getTime('21:00') > maxTimeInMeals) ? getTime('21:00') : maxTimeInMeals;

    var x = d3.scale.scaleLinear().domain([minTime, maxTime]).range([32, this.width - 32]);
    var y = d3.scale.scaleLinear().domain([0, maxCalories]).range([this.height, 24 + 3 * this.constants.macroPointRadius.max + this.constants.macroPointRadius.gap * 2]);

    var area = d3.shape.area()
                  .x((d) => {return x(getTime(d.time))})
                  .y1((d) => {return y(d.carbs * 4 + d.fat * 9 + d.proteins * 4) - 1 * (radiusScale(d.proteins) + radiusScale(d.fat) + radiusScale(d.carbs))})
                  .y0((d) => {return y(0)})
                  .curve(d3.shape.curveCardinal);

    var path = area([{time: '00:01', carbs: 0, fat: 0, proteins: 0, calories: 0}, ...this.meals, {time: '23:59', carbs: 0, fat: 0, proteins: 0, calories: 0}]);

    var key = 'wave-' + Math.random();

    return (
      <Shape key={key} d={path} strokeWidth={2} fill={theme.color().COLOR_THEME_DARK + '50'}/>
    )

  }

  /**
   * Generate the shapes for the macronutrients points
   */
  macroPoints() {

    var maxCalories = d3.array.max(this.meals, function(d) {return d.calories});
    var maxTimeInMeals = d3.array.max(this.meals, function(d) {return getTime(d.time)});
    var minTimeInMeals = d3.array.min(this.meals, function(d) {return getTime(d.time)});

    // Minimum and maximum macronutrient intake
    var maxMacro = d3.array.max(this.meals, d => {return d3.array.max([d.proteins, d.carbs, d.fat])});
    var minMacro = d3.array.min(this.meals, d => {return d3.array.min([d.proteins, d.carbs, d.fat])});

    // Scale that determines the radius of the macro point
    var radiusScale = d3.scale.scaleLinear().domain([minMacro, maxMacro]).range([this.constants.macroPointRadius.min, this.constants.macroPointRadius.max]);

    // Define  actual min and max time for the scale
    var minTime = (getTime('06:00') < minTimeInMeals) ? getTime('06:00') : minTimeInMeals;
    var maxTime = (getTime('21:00') > maxTimeInMeals) ? getTime('21:00') : maxTimeInMeals;

    var x = d3.scale.scaleLinear().domain([minTime, maxTime]).range([32, this.width - 32]);
    var y = d3.scale.scaleLinear().domain([0, maxCalories]).range([this.height, 24 + 3 * this.constants.macroPointRadius.max + this.constants.macroPointRadius.gap * 2]);

    // Create the array of shapes to be added
    var shapes = [];
    var texts = [];

    // Add the background wave path
    shapes.push(this.createWavePath());

    // Scan the meals and extracts the proteins, carbs and fats
    for (var i = 0 ; i < this.meals.length; i++) {

      var meal = this.meals[i];

      var yp = y(meal.proteins * 4) - 1 * radiusScale(meal.proteins);
      var yf = y(meal.fat * 9 + meal.proteins * 4) - 1 * (radiusScale(meal.proteins) + radiusScale(meal.fat)) - this.constants.macroPointRadius.gap;
      var yc = y(meal.carbs * 4 + meal.fat * 9 + meal.proteins * 4) - 1 * (radiusScale(meal.proteins) + radiusScale(meal.fat) + radiusScale(meal.carbs))  - 2 * this.constants.macroPointRadius.gap;

      shapes.push(this.macroBar(x(getTime(meal.time)), yc));
      shapes.push(this.macroPoint(x(getTime(meal.time)), yp, 'proteins', radiusScale(meal.proteins)));
      shapes.push(this.macroPoint(x(getTime(meal.time)), yf, 'fat', radiusScale(meal.fat)));
      shapes.push(this.macroPoint(x(getTime(meal.time)), yc, 'carbs', radiusScale(meal.carbs)));
      texts.push(this.caloriesText(x(getTime(meal.time)), yc, meal.calories));

    }

    this.setState({shapes: shapes, texts: texts});
  }

  /**
   * Render function
   */
  render () {
    
    return (
      <View>
        <Surface style={styles.surface} width={this.width} height={this.height}>
           {this.state.shapes}
        </Surface>
        {this.state.texts}
      </View>
    )
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

const styles = StyleSheet.create({
  surface: {
    // backgroundColor: '#00ACC1',
  },
});
