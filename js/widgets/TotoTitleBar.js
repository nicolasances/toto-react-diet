import React, {Component} from 'react';
import {View, TouchableOpacity, Image, Text, StyleSheet} from 'react-native';
import { withNavigation } from 'react-navigation';
import * as theme from '../styles/ThemeColors';
import TotoNotification from './TotoNotification';

/**
 * Title bar for Toto.
 * Properties:
 *
 * - titleBar     : the title of the screen
 * - back         : (optional, default false) true to show the back button
 * - rightButton  : (optional) shows a right button, requires
 *                  { image: the image to show,
 *                    navData: the navigation data {
 *                      screen: the name of the target screen
 *                      data: the optional parameters as an {}
 *                    },
 *                  }
 * - leftButton   : (optional) same as right button
 */
class TotoTitleBar extends Component {

  constructor(props) {
    super(props);

    // Init the state
    this.state = {
      notificationText: null
    }
  }

  /**
   * Renders the component
   */
  render() {

    // If the back property is set show a back button
    let backButton;

    if (this.props.back) {
      backButton = (
        <TouchableOpacity onPress={() => this.props.navigation.goBack()}>
          <Image source={require('../../img/back.png')}  style={{width: 24, height: 24, tintColor: theme.color().COLOR_TEXT}} />
        </TouchableOpacity>
      )
    }

    // Define a possible button for the left part of the title bar
    // Usually used if the back button is not there
    let leftButton;

    if (this.props.leftButton) {

      // Get the image
      var img = this.props.leftButton.image;

      // Get the navigation data
      var screen = this.props.leftButton.navData.screen;
      var navData = this.props.leftButton.navData.data;

      // Create the button
      leftButton = (
        <TouchableOpacity onPress={() => this.props.navigation.navigate(screen, navData)}>
          <Image source={img}  style={{width: 24, height: 24, tintColor: theme.color().COLOR_ACCENT}} />
        </TouchableOpacity>
      )
    }

    // Define the title of the screen
    let title = (
      <View style={{flex: 1, alignItems: 'center'}}>
        <Text style={styles.title}>{this.props.title}</Text>
      </View>
    )

    // Define a possible right button
    let rightButton;

    if (this.props.rightButton) {

      // Get the image
      var img = this.props.rightButton.image;

      // Get the navigation data
      var navData = this.props.rightButton.navData;

      // Create the button
      rightButton = (
        <TouchableOpacity onPress={() => this.props.navigation.navigate({routeName: navData.screen, params: navData.data, key: navData.navigationKey})}>
          <Image source={img}  style={{width: 24, height: 24, tintColor: theme.color().COLOR_ACCENT}} />
        </TouchableOpacity>
      )
    }
    // anyways draw an empty view so that the title is centered
    else {
      rightButton = (
        <View style={{width: 24}}>
        </View>
      )
    }

    // Return the view
    return (

      <View style={styles.titleBar}>

        {backButton}
        {leftButton}
        {title}
        {rightButton}

        <TotoNotification />

      </View>
    );
  }
}

export default withNavigation(TotoTitleBar);

/**
 * Styles for the Toto title bar
 */
const styles = StyleSheet.create({

  titleBar: {
    flexDirection: 'row',
    paddingTop: 24,
    paddingBottom: 12,
    justifyContent: 'flex-end',
    paddingHorizontal: 12,
    backgroundColor: theme.color().COLOR_THEME,
  },
  titleContainer : {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    color: theme.color().COLOR_TEXT
  },
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignContent: 'flex-start',
    backgroundColor: theme.color().COLOR_THEME,
  },
});
