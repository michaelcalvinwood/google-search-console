require('dotenv').config();

const {google} = require('googleapis');
const {JWT} = require('google-auth-library');
const searchconsole = google.searchconsole('v1');
const keys = require('./clientSecret.json');
const axios = require('axios');
const { v4: uuidv4, v4 } = require('uuid');
const { DateTime } = require("luxon");

//console.log(keys);

// Search Console API

const request = {
    email: keys.client_email,
    key: keys.private_key,
    scopes: ['https://www.googleapis.com/auth/webmasters','https://www.googleapis.com/auth/webmasters.readonly'],
  };
const client = new JWT(request);
google.options({auth: client});

// Check to see which properties are accessible with these credentials

const searchConsoleQuery = async () => {
    const resSiteList = await searchconsole.sites.list({});
    console.log(resSiteList.data);

    const resSearchAnalytics = await searchconsole.searchanalytics.query({
        // The site's URL, including protocol. For example: `http://www.example.com/`.
        siteUrl: 'https://www.pymnts.com/',
        requestBody: {
             "endDate": "2022-12-24",
             "startDate": "2022-03-01",
             "dimensions": ["date"]
        },
      });
      
      console.log(resSearchAnalytics.data.rows);
}


// G3 Analytics Query
// Parameters: https://developers.google.com/analytics/devguides/reporting/core/v3/reference
// https://flaviocopes.com/google-analytics-api-nodejs/

const analyticsQueryG3 = async (startDate, endDate) => {
  const scopes = 'https://www.googleapis.com/auth/analytics.readonly'
  const jwt = new google.auth.JWT(process.env.CLIENT_EMAIL, null, process.env.PRIVATE_KEY, scopes);
  const viewId = '22567948';
  const response = await jwt.authorize()
  const result = await google.analytics('v3').data.ga.get({
    'auth': jwt,
    'ids': 'ga:' + viewId,
    'start-date': startDate,
    'end-date': endDate,
    'metrics': 'ga:pageviews, ga:uniquePageViews, ga:visitors'
  })

  //console.dir(result.data.rows[0][0]);

  let test = JSON.stringify(result.data, null, 4);

  //console.log(test);

  return result.data.rows[0];

}

// Sample CSV Template: https://support.google.com/analytics/answer/10325025?hl=en#template


//https://ga-dev-tools.web.app/dimensions-metrics-explorer/

/*
  https://developers.google.com/analytics/devguides/reporting/core/v4/limits-quotas
  If the quota of requesting a Google Analytics API is exceeded, the API returns an error code 403 or 429 and a message that the account has exceeded the quota. See the terms of service for more information.
*/


// get page info page_info
// get user info user_info


// add sorting!!
const getPageInfoG3 = async (startDate, endDate) => {
  const scopes = 'https://www.googleapis.com/auth/analytics.readonly'
  const jwt = new google.auth.JWT(process.env.CLIENT_EMAIL, null, process.env.PRIVATE_KEY, scopes);
  const viewId = '22567948';
  const response = await jwt.authorize()
  let startIndex = 1;
  let totalResults = 2;
  while (startIndex < totalResults) {
    let result = await google.analytics('v3').data.ga.get({
      'auth': jwt,
      'ids': 'ga:' + viewId,
      'start-date': startDate,
      'end-date': endDate,
      'start-index': startIndex,
      'max-results': 10000,
      'dimensions': "ga:pagePath,ga:deviceCategory,ga:continent,ga:subContinent,ga:country,ga:region",
      'metrics': 'ga:pageviews, ga:uniquePageviews'
    })

    console.log('total results', result.data.totalResults);
    
    break; // for debug purposes
  }
  




  //console.dir(result.data.rows[0][0]);

  //let test = JSON.stringify(result.data);

  //console.log(test);
}

//getPageViewsG3('today', 'today');

//getPageInfoG3('2023-02-06', '2023-02-08');

// G3 Measurement Protocol for Sending Events
// Parameters: https://developers.google.com/analytics/devguides/collection/protocol/v1/parameters
// https://developers.google.com/analytics/devguides/collection/protocol/v1/
// use /debug/collect for testing

const sendPageViewG3 = async (url, title, propertyId = 'UA-11167465-10') => {
    const request = {
      url: 'https://www.google-analytics.com/collect',
      method: 'post',
      params: {
        v: 1,
        tid: propertyId,
        cid: '0b47ceb1-8abb-4c90-8995-57c3cdf32c14',
        t: 'pageview',
        dl: url,
        dt: title,
        ua: 'Axios User Agent'
      }
    }

    axios(request)
    .then(response => {
      console.log('response', response.data, response.data.parserMessage);
    })
    .catch(error => {
      console.error('error', error);
    })
}

const cycleThroughDays = async (first, last) => {
  let curDate = null;
  let result;
  const info = {}

  while (curDate !== last) {
    if (curDate === null) curDate = first;
    else curDate = DateTime.fromISO(curDate).plus({days: 1}).toISODate();

    result = await analyticsQueryG3(curDate, curDate);
    info.pageViews = result[0];
    info.uniquePageViews = result[1];
    info.visitors = result[2];

    console.log(curDate, info);
  }
}

// G4 Analytics Query
// Develop with domains that I own

// G4 Measurement Protocol for Sending Events
// https://developers.google.com/analytics/devguides/collection/protocol/ga4



// playground

//sendPageViewG3('https://dev.pymnts.com/today-on-pymnts/', 'Today on Pymnts', 'UA-11167465-10');
//analyticsQueryG3('2023-03-01', 'today');

cycleThroughDays ('2019-01-01', '2019-01-07');