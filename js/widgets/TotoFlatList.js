import React, {Component} from 'react';
import {FlatList, StyleSheet, Text, TouchableOpacity, Image, View} from 'react-native';
import { withNavigation } from 'react-navigation';
import * as theme from '../styles/ThemeColors';
import * as TotoEventBus from '../services/TotoEventBus';

/**
 * Flat List styled for toto.
 * To use this you must provide:
 *  - dataExtractor()       : a function that takes the flat list item and extract the following data structure:
 *                            { title : the title, main text, of this item,
 *                             avatar : an object describing the avatar:
 *                                      { type: 'number, image'
 *                                        value: (optional) 'a value, in case of type number, an image in case of type image'
 *                                        unit: (optional) 'the unit, in case of type number'
 *                                       }
 *                            }
 *  - onItemPress()         : a function to be called when the item is pressed
 */
export default class TotoFlatList extends Component {

  constructor(props) {
    super(props);
  }

  /**
   * Renders the toto flat list
   */
  render() {

    return (
      <FlatList
        data={this.props.data}
        renderItem={(item) => <Item item={item} dataExtractor={this.props.dataExtractor} onItemPress={this.props.onItemPress}/>}
        keyExtractor={(item, index) => {return 'toto-flat-list-' + index}}
        />
    )
  }

}

/**
 * Item of the Toto Flat list
 */
class Item extends Component {

  constructor(props) {
    super(props);

    // Initialize the state with the provided item
    this.state = this.props.item;

    // Bind this
    this.onDataChanged = this.onDataChanged.bind(this);
  }

  componentDidMount() {
    // Subscribe to data changed events
    TotoEventBus.bus.subscribeToEvent('totoListDataChanged', this.onDataChanged);
  }

  componentWillUnmount() {
    // Unsubscribe to data changed events
    TotoEventBus.bus.unsubscribeToEvent('totoListDataChanged', this.onDataChanged);
  }

  /**
   * React to a data change
   */
  onDataChanged(event) {
    if (this.state.item.id == event.context.item.id)
      this.setState(event.context.item);
  }

  render() {

    // The data to render
    var data = this.props.dataExtractor(this.state);

    // Define what avatar has to be rendered
    let avatar;

    // If there's an avatar
    if (data.avatar != null) {

      // If the avatar is a NUMBER
      if (data.avatar.type == 'number') {
        avatar = <Text style={styles.avatarText}>{data.avatar.value.toFixed(0)}</Text>
      }
      // If the avatar is an IMAGE
      else if (data.avatar.type == 'image') {
        avatar = <Image source={data.avatar.value}  style={{width: 24, height: 24, tintColor: theme.color().COLOR_TEXT}} />
      }
      // For any other type of avatar, display nothing
      else {
        avatar = <Text></Text>
      }
    }
    // If there's no avatar, don't display anything
    else {
      avatar = <Text></Text>
    }

    return (
      <TouchableOpacity style={styles.item} onPress={() => {if (this.props.onItemPress) this.props.onItemPress(this.props.item)}}>

        <View style={styles.avatar}>
          {avatar}
        </View>

        <View style={styles.textContainer}>
          <Text style={{color: theme.color().COLOR_TEXT}}>{data.title}</Text>
        </View>

        <View style={styles.leftSideValueContainer}>
          <Text style={styles.leftSideValue}>{data.leftSideValue}</Text>
        </View>

      </TouchableOpacity>
    )
  }
}

/**
 * Style sheets used for the toto flat list
 */
const styles = StyleSheet.create({

  listContainer: {
    flex: 1
  },
  item: {
    paddingHorizontal: 12,
    flexDirection: 'row',
    marginVertical: 6,
  },
  avatar: {
    height: 40,
    width: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: theme.color().COLOR_TEXT,
    justifyContent: 'center',
    alignItems: 'center',

  },
  avatarText: {
    fontSize: 12,
    color: theme.color().COLOR_TEXT,
  },
  textContainer: {
    flex: 1,
    height: 40,
    justifyContent: 'center',
    paddingLeft: 12,
  },
  leftSideValueContainer: {
    justifyContent: 'center',
  },
  leftSideValue: {
    fontSize: 14,
    color: theme.color().COLOR_TEXT
  },
})
