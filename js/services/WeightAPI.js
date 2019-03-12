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

    return new Promise((s, f) => {

      new TotoAPI().fetch('/weight/weights' + filter).then((response) => response.json()).then((data) => {

        let weights = data.weights;

        // Order them
        weights.sort((a, b) => {
          let ya = parseInt(a.year);
          let yb = parseInt(b.year);
          let wa = parseInt(a.weekOfYear);
          let wb = parseInt(b.weekOfYear);

          if (ya < yb) return -1;
          if (ya > yb) return 1;

          if (wa < wb) return -1;
          if (wa > wb) return 1;

          return 0;
        });

        s({weights: weights});

      });
    });

  }

}
