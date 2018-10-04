import React from 'react';
import * as config from '../Config';

/**
 * Wrapper for the fetch() React method that adds the required fields for Toto authentication
 */
export default class TotoAPI {

  fetch(url, options) {

    if (options == null) options = {method: 'GET', headers: {}};
    if (options.headers == null) options.headers = {};

    // Adding standard headers
    options.headers['Accept'] = 'application/json';
    options.headers['Authorization'] = 'Basic dG90bzpzdG8=';

    return fetch(config.API_URL + url, options);
  }
}
