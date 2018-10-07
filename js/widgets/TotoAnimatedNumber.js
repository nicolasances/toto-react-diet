import React, {Component} from 'react';
import {StyleSheet, View, Text, Image, ART, Dimensions, Animated, Easing } from 'react-native';
import * as theme from '../styles/ThemeColors';

class TotoAnimatedNumber extends Component {

  constructor(props) {
    super(props);

    this.state = {
      animatedValue: new Animated.Value(0)
    }

    this.state.animatedValue.addListener((progress) => {
      this.setState({value: progress.value});
    });

  }

  componentWillReceiveProps(props) {

    Animated.timing(this.state.animatedValue, {
      toValue: props.value,
      easing: Easing.linear,
      duration: 1000,
    }).start();

  }

  render() {

    return (
      <Text style={this.props.style}>{this.state.value != null ? this.state.value.toFixed(0) : 0}</Text>
    )
  }

}

export default Animated.createAnimatedComponent(TotoAnimatedNumber);
