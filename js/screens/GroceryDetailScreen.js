import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {StyleSheet, View, Text, Image, ART, Dimensions, Animated, Easing } from 'react-native';
import * as scale from 'd3-scale';
import * as shape from 'd3-shape';
import * as array from 'd3-array';
import * as path from 'd3-path';
import * as theme from '../styles/ThemeColors';
import TotoTitleBar from '../widgets/TotoTitleBar';
import DietAPI from '../services/DietAPI';
import TotoCircleValue from '../widgets/TotoCircleValue';
import TotoMacro from '../widgets/TotoMacro';

const {Group, Shape, Surface} = ART;
const d3 = {scale, shape, array, path};
const window = Dimensions.get('window');

// Horizontal padding to be applied
const paddingH = 12;

export default class GroceryDetailScreen extends Component {

  // Define the Navigation options
  static navigationOptions = ({navigation}) => {

    return {
      headerLeft: null,
      headerTitle: <TotoTitleBar
                      title={navigation.getParam('grocery').name}
                      back={true}
                      />
    }
  }

  // Constructor
  constructor(props) {

    super(props);

    // Set the width
    this.width = window.width;

    // Save the food in the state object
    this.state = {
      food: {
        carbs: 0,
        fat: 0,
        proteins: 0,
        calories: 0
      },
      category: new DietAPI().getGroceryCategory(this.props.navigation.getParam('grocery').category),
      sugarAnimatedValue: new Animated.Value(0)
    };
  }

  /**
   * When the component is mounted, start the animations
   */
  componentDidMount() {

    this.setState({
      food: this.props.navigation.getParam('grocery')
    }, () => {this.animateSugarBar(this.state.food.sugars, 1000, Easing.bounce);});
  }

  /**
   * Animate the sugar bar
   */
  animateSugarBar(toVal, dur, ease) {

    Animated.timing(this.state.sugarAnimatedValue, {
      toValue: toVal,
      easing: ease,
      duration: dur,
    }).start();

  }

  /**
   * Render the screen
   */
  render() {

    return (
      <View style={styles.container}>

        <View style={styles.categoryContainer}>
          <Image source={this.state.category.image}  style={{width: 48, height: 48, tintColor: theme.color().COLOR_TEXT}} />
          <Text style={styles.categoryLabel}>{this.state.category.name}</Text>
        </View>

        <View style={styles.macrosContainer}>

          <TotoMacro value={this.state.food.carbs} label='Carbs' />
          <TotoMacro value={this.state.food.proteins} label='Proteins' />
          <TotoMacro value={this.state.food.fat} label='Fat' />

        </View>

        <View style={styles.sugarContainer}>
          <Text style={styles.sugarLabel}>Sugar ({this.state.food.sugars} g)</Text>
          <AnimatedSugarBar sugar={this.state.sugarAnimatedValue} carbs={this.state.food.carbs} />
        </View>

        <View style={styles.caloriesContainer}>
          <TotoCircleValue value={this.state.food.calories} width={this.width - 2 * paddingH} height={126} radius={60} radiusWidth={6} color={theme.color().COLOR_THEME_LIGHT} />
        </View>

      </View>
    );
  }
}

// The Sugar Bar
class SugarBar extends Component {

  constructor(props) {
    super(props);

    // Sugar bar properties
    this.sugarBarProps = {
      strokeWidth: 8,
      paddingLeft: 12,
    }

    // Window width
    this.width = window.width;

  }

  /**
   * Renders a sugar bar that shows how much sugar is in the food
   */
  createSugarPath(sugar) {

    // Y position of the bar (to avoid being cut in 2)
    var y = this.sugarBarProps.strokeWidth / 2;

    // X starting position (padding)
    var x = this.sugarBarProps.paddingLeft;

    // x scale
    var xScale = d3.scale.scaleLinear().domain([0, this.props.carbs]).range([0, this.width - 4 * this.sugarBarProps.paddingLeft]);

    // Path of the bar
    var path = ART.Path()
                .move(x, y)
                .line(xScale(sugar), 0);

    return path;
  }

  /**
   * Render the sugar bar
   */
  render() {

    // Get the path
    let path = this.createSugarPath(this.props.sugar);

    return (
      <Surface width={this.width} height={40}>
        <Shape d={path} strokeWidth={this.sugarBarProps.strokeWidth} stroke={theme.color().COLOR_ACCENT}/>
      </Surface>
    )
  }
}

// Animated sugar bar
const AnimatedSugarBar = Animated.createAnimatedComponent(SugarBar);

/**
 * Style sheet
 */
const styles = StyleSheet.create({

  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignContent: 'flex-start',
    backgroundColor: theme.color().COLOR_THEME,
    padding: 12
  },
  macrosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingVertical: 12,
  },
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
    color: theme.color().COLOR_TEXT,
  },
  macroValue: {
    fontSize: 16,
    flexDirection: 'row',
    textAlign: 'center',
    color: theme.color().COLOR_TEXT,
    paddingVertical: 6
  },
  caloriesContainer: {
    flex: 1,
  },
  categoryContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  categoryLabel: {
    fontSize: 16,
    color: theme.color().COLOR_TEXT,
    paddingTop: 6,
  },
  sugarContainer: {
    height: 80,
    paddingVertical: 12,
  },
  sugarLabel: {
    fontSize: 12,
    color: theme.color().COLOR_TEXT,
    paddingLeft: paddingH,
    paddingBottom: 6
  },
});
