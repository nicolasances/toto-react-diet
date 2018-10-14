
const TotoEvents = [
                     /**
                      * These two events are triggered when food data is changed in the construction of
                      * a new meal
                      */
                     'foodAmountInMealChanged', 'foodInMealRemoved', 'newMealTimeChanged',

                     /**
                      * This event is triggered when a grocery (food) is selected
                      */
                     'grocerySelected',

                      /**
                       * Toto List Data Changed event
                       * Used when something changes inside of an element that has been put in a TotoFlatList
                       * This event must come with the following context: {
                       *  item: {<the item that has been changed (new value)}
                       * }
                       */
                     'totoListDataChanged',

                     /**
                      * Event thrown when a new meal has been added
                      */
                     'mealAdded',

                     /**
                      * 1. A meal prep is selected in the meal prep screen
                      */
                     'mealPrepSelected',

                     /**
                      * This event is thrown to push notifications using TotoNotification.
                      * The notification event has a context object: {
                      *  text: 'the text of the notif'
                      * }
                      */
                     'notification',

                     /**
                      * This event is thrown when a new dietary goal is set
                      * Provides a context with the following object:
                      * { goal: {calories: 'the new calories goal'} }
                      */
                     'goalSet'

                   ];

class Bus {

  constructor() {
    this.subscribers = new Map();
  }

	/**
	 * Registers a listener to a specific event
	 *
	 * Requires:
	 *
	 * - 	eventName	:	the name of the event (see TotoEvents global variable for supported events)
	 *
	 * -	callback	:	a function(event) that will receive the event
	 */
	subscribeToEvent(eventName, callback) {

		if (this.subscribers.get(eventName) == null) {
			this.subscribers.set(eventName, []);
		}

		this.subscribers.get(eventName).push(callback);

	}

  /**
   * Unsubscribes to the specified event!!
   */
  unsubscribeToEvent(eventName, callback) {

    var callbacks = this.subscribers.get(eventName);

    if (callbacks == null) return;

    for (var i = 0; i < callbacks.length; i++) {
      if (callbacks[i] == callback) {
        callbacks.splice(i, 1);
        return;
      }
    }
  }

	/**
	 * Publishes an event on the bus and triggers the listeners callbacks
	 *
	 * Requires:
	 *
	 * - event		:	The event to be published. It's an object that must at least contain:
	 * 					{ name : the name of the event among those defined in the global variable TotoEvents,
	 * 					  context : a generic {} containing whatever is needed by the event listener to process the event
	 * 					}
	 */
	publishEvent(event) {

		var callbacks = this.subscribers.get(event.name);

		if (callbacks == null) return;

		for (var i = 0; i < callbacks.length; i++) {
			callbacks[i](event);
		}
	}

}

// Export the singleton event bus
export const bus = new Bus();
