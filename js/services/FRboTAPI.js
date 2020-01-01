import TotoAPI from './TotoAPI';
import moment from 'moment';

/**
 * API to access the /model/frbot Toto API
 */
export default class FRboTAPI {

  /**
   * Saves the provided meal
   */
  predict() {

    let data = {
      weekday: 1, 
      time: "6:20",
      nResults: 4
    };

    // Post the data
    return new TotoAPI().fetch('/model/frbot/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }).then((response => response.json()));
  }


}
