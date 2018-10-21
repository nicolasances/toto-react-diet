import TotoAPI from './TotoAPI';
import moment from 'moment';

/**
 * API to access the /diet Toto API
 */
export default class WeightAPI {

  /**
   * Retrieves the weights per week
   */
  getWeightsPerWeek(dateFrom) {

    var filter = '?dateFrom=' + dateFrom;

    return new TotoAPI().fetch('/weight/weights' + filter).then((response) => response.json());

  }

}
