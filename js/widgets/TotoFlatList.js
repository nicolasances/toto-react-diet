import React, {Component} from 'react';
import {FlatList, StyleSheet, Text, TouchableOpacity, Image, View} from 'react-native';
import { withNavigation } from 'react-navigation';
import * as theme from '../styles/ThemeColors';
import * as TotoEventBus from '../services/TotoEventBus';
import moment from 'moment';

/**
 * Flat List styled for toto.
 * To use this you must provide:
 *  - data                  : the dataset as an [] of objects
 *  - dataExtractor()       : a function that takes the flat list item and extract the following data structure:
 *                            { title :   the title, main text, of this item,
 *                              avatar :  an object describing the avatar:
 *                                      { type: 'number, image', 'string'
 *                                        value: (optional) 'a value, in case of type number, an image in case of type image'
 *                                        unit: (optional) 'the unit, in case of type number',
 *                                        size: (optional, default 'm') can be 's' or 'm'
 *                                       }
 *                              sign :    an image to put as a "sign" (e.g. info sign to show that this item has info attached)
 *                                        should be a loaded image, (provided as require(..), so already loaded)
 *                              dateRange:  an object that describes a range of date. That will be used instead of an avatar
 *                                          { start:  'starting date', formatted as YYYYMMDD string
 *                                            end:    'ending date', formatted as YYYYMMDD string,
 *                                            type:   the type of date range. Can be:
 *                                                    'dayMonth' to only show the day and the month (default)
 *                                                    'dayMonthYear' - same as dayMonth but will add the year of the END value on the right
 *                                          }
 *                            }
 *  - onItemPress()         : a function to be called when the item is pressed
 *  - avatarImageLoader()   : a function(item) that will have to load the avatar image and return a loaded <Image />
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
        renderItem={(item) => <Item item={item} avatarImageLoader={this.props.avatarImageLoader} dataExtractor={this.props.dataExtractor} onItemPress={this.props.onItemPress}/>}
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
    let avatarContainer;
    let avatarSizeStyle = styles.avatarSizeM;
    
    // If there's an avatar
    if (data.avatar != null) {
      
      if (data.avatar.size != null && data.avatar.size == 's') avatarSizeStyle = styles.avatarSizeS;

      let avatar;

      // If the avatar is a NUMBER
      if (data.avatar.type == 'number') {
        avatar = <Text style={styles.avatarText}>{data.avatar.value.toFixed(0)}</Text>
      }
      // If the avatar is a STRING
      else if (data.avatar.type == 'string') {
        avatar = <Text style={styles.avatarText}>{data.avatar.value}</Text>
      }
      // If the avatar is an IMAGE
      else if (data.avatar.type == 'image') {
        imageSize = 20;
        if (data.avatar.size == 's') imageSize = 14;
        // If there's a source:
        if (data.avatar.value) avatar = <Image source={data.avatar.value}  style={{width: imageSize, height: imageSize, tintColor: theme.color().COLOR_TEXT}} />
        // If there's a configured image Loader
        else if (this.props.avatarImageLoader) {
          // Load the image
          avatar = this.props.avatarImageLoader(this.state);
        }
      }
      // For any other type of avatar, display nothing
      else {
        avatar = <Text></Text>
      }

      avatarContainer = (
        <View style={[styles.avatar, avatarSizeStyle]}>
          {avatar}
        </View>
      )
    }

    // If there's a DATE RANGE, instead of the avatar
    let dateRange;

    if (data.dateRange != null) {

      // Render a dayMonth type
      if (data.dateRange.type == null || data.dateRange.type.startsWith('dayMonth')) {

        // Dates to display
        let startDateDay = moment(data.dateRange.start, 'YYYYMMDD').format('D');
        let startDateMonth = moment(data.dateRange.start, 'YYYYMMDD').format('MMM');
        let endDateDay = moment(data.dateRange.end, 'YYYYMMDD').format('D');
        let endDateMonth = moment(data.dateRange.end, 'YYYYMMDD').format('MMM');

        // Year label
        let year;

        // In case of dayMonthYear, add the end year to the side of the boxes
        if (data.dateRange.type == 'dayMonthYear') {

          let yearLabel = moment(data.dateRange.end, 'YYYYMMDD').format('\'YY');

          year = (
            <Text style={styles.yearTextTruncated}>{yearLabel}</Text>
          )
        }

        dateRange = (
          <View style={styles.dateRangeContainer}>
            <View style={styles.dateContainer}>
              <Text style={styles.dateDay}>{startDateDay}</Text>
              <Text style={styles.dateMonth}>{startDateMonth}</Text>
            </View>
            <View style={styles.dateContainer}>
              <Text style={styles.dateDay}>{endDateDay}</Text>
              <Text style={styles.dateMonth}>{endDateMonth}</Text>
            </View>
            {year}
          </View>
        )
      }
    }

    // If there is a sign
    let sign;

    if (data.sign) sign = (
      <View style={styles.signContainer}>
        <Image source={data.sign} style={styles.sign} />
      </View>
    )

    // Text Container styles
    textContainerSizeStyle = styles.textContainerSizeM;
    if (!data.avatar ||  data.avatar.size == 's') textContainerSizeStyle = styles.textContainerSizeS;

    return (
      <TouchableOpacity style={styles.item} onPress={() => {if (this.props.onItemPress) this.props.onItemPress(this.props.item)}}>

        {avatarContainer}

        {dateRange}

        <View style={[styles.textContainer, textContainerSizeStyle]}>
          <Text style={{color: theme.color().COLOR_TEXT}}>{data.title}</Text>
        </View>

        {sign}

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
    borderRadius: 20,
    borderWidth: 2,
    borderColor: theme.color().COLOR_TEXT,
    justifyContent: 'center',
    alignItems: 'center',

  },
  avatarSizeM: {
    height: 40,
    width: 40,
  },
  avatarSizeS: {
    height: 24,
    width: 24,
  },
  avatarText: {
    fontSize: 12,
    color: theme.color().COLOR_TEXT,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingLeft: 12,
  },
  textContainerSizeM: {
    height: 40,
  },
  textContainerSizeS: {
    height: 24,
  },
  leftSideValueContainer: {
    justifyContent: 'center',
  },
  leftSideValue: {
    fontSize: 14,
    color: theme.color().COLOR_TEXT
  },
  signContainer: {
    marginLeft: 12,
    justifyContent: 'center'
  },
  sign: {
    width: 18,
    height: 18,
    tintColor: theme.color().COLOR_ACCENT_LIGHT
  },
  dateRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  dateContainer: {
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 5,
    borderColor: theme.color().COLOR_TEXT,
    marginHorizontal: 3,
    paddingHorizontal: 6,
    paddingVertical: 3,
    width: 40,
  },
  dateDay: {
    fontSize: 16,
    color: theme.color().COLOR_TEXT
  },
  dateMonth: {
    textTransform: 'uppercase',
    fontSize: 10,
    color: theme.color().COLOR_TEXT
  },
  yearTextTruncated: {
    fontSize: 14,
    width: 20,
    color: theme.color().COLOR_TEXT,
    opacity: 0.9,
    marginLeft: 6,
  },
})
