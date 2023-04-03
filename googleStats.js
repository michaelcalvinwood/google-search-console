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

// Setup MYSQL

const mysql = require('mysql2');

const pool = mysql.createPool({
    connectionLimit : 100, //important
    host     : process.env.MYSQL_HOST,
    user     : process.env.MYSQL_USER,
    password : process.env.MYSQL_PASSWORD,
    database : process.env.MYSQL_DATABASE,
    debug    :  false
});

let databaseReady = false;

pool.query("SHOW DATABASES",(err, data) => {
    if(err) {
        console.error(err);
        return;
    }
    // rows fetch
    console.log(data);
    databaseReady = true;
});

const mysqlQuery = query => {
  return new Promise ((resolve, reject) => {
    pool.query(query,(err, data) => {
      if(err) {
          console.error(err);
          return reject(err);
      }
      // rows fetch
      //console.log(data);
      return resolve(data);
  });
  })
}


const insertG3Stats = async (info) => {
  const { date, pageViews, uniquePageViews, visitors } = info;
  const query = `INSERT INTO g3_stats (date, page_views, unique_page_views, visitors) VALUES ('${date}', ${pageViews}, ${uniquePageViews}, ${visitors})`;
  const result = await mysqlQuery(query);
  //console.log('query result', result);
  return result;
}

const getStatsForGivenDay = async day => {
  const query = `SELECT page_views, unique_page_views, visitors FROM g3_stats WHERE date = '${day}'`;
  const result = await mysqlQuery(query);
  if (!result.length) return false;

  const stats = {
    pageViews: result[0]['page_views'],
    uniquePageViews: result[0]['unique_page_views'],
    visitors: result[0]['visitors']
  }
  
  return stats;
}

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

  try {
    while (curDate !== last) {
      if (curDate === null) curDate = first;
      else curDate = DateTime.fromISO(curDate).plus({days: 1}).toISODate();
  
      result = await analyticsQueryG3(curDate, curDate);
      info.date = curDate;
      info.pageViews = result[0];
      info.uniquePageViews = result[1];
      info.visitors = result[2];
  
      await insertG3Stats(info);
  
      console.log(curDate);
    }
  } catch (e) {
    console.error(e);
  }
}

const getEveryDayBetweenTwoDates = (firstDate, lastDate) => {
  const dates = [];
  let curDate = firstDate;
  dates.push(firstDate);
  while (curDate !== lastDate) {
    curDate = DateTime.fromISO(curDate).plus({days: 1}).toISODate();
    dates.push(curDate);
  }
  return dates;
}

const getDatesInQuarter = (quarter, year) => {
  let startDate, endDate;

  switch (quarter) {
    case 'Q1':
      startDate = `${year}-01-01`;
      endDate = `${year}-03-31`;
      break;
    case 'Q2':
      startDate = `${year}-04-01`;
      endDate = `${year}-06-30`;
      break;
    case 'Q3':
      startDate = `${year}-07-01`;
      endDate = `${year}-09-30`;
      break;
    case 'Q4':
      startDate = `${year}-10-01`;
      endDate = `${year}-12-31`;
      break;
  }

  const dates = getEveryDayBetweenTwoDates(startDate, endDate);

  return dates;

}

/*
 * Example quarter: 'Q1-2019'
 */
const cycleThroughQuarters = async (startQuarter, lastQuarter) => {
  let curQuarter = null;
  let curYear = null;
  let finalQuarter = lastQuarter.split('-')[0];
  let finalYear = Number(lastQuarter.split('-')[1]);

  console.log('final', finalYear, finalQuarter)

  const quaterlyInfo = [];
  quaterlyInfo.push(['Year', 'Quarter', 'Page Views', 'Unique Page Views', 'Visitors']);

  let pageViews, uniquePageViews, visitors;

  while (curYear !== finalYear || curQuarter !== finalQuarter) {
    if (curQuarter === null) {
      curQuarter = startQuarter.split('-')[0];
      curYear = Number(startQuarter.split('-')[1]);
    } else {
      switch (curQuarter) {
        case 'Q1':
          curQuarter = 'Q2';
          break;
        case 'Q2':
          curQuarter = 'Q3';
          break;
        case 'Q3':
          curQuarter = 'Q4';
          break;
        case 'Q4':
          curQuarter = 'Q1';
          ++curYear;
          break;
      }
    }

    let multiplier;

    switch (curYear) {
      case 2019:
        multiplier = 1.24;
        break;
      case 2020:
        multiplier = 1.255;
        break;
      case 2021:
        multiplier = 1.275;
        break;
      case 2022:
        multiplier = 1.29;
        break;
      case 2023:
        multiplier = 1.31;
        break;
    }

    console.log('cur', curYear, curQuarter, multiplier)
    const dates = getDatesInQuarter(curQuarter, curYear);
    
    pageViews = 0;
    uniquePageViews = 0; 
    visitors = 0;

    for (let i = 0; i < dates.length; ++i) {
      let stats = await getStatsForGivenDay(dates[i]);
      pageViews += stats.pageViews;
      uniquePageViews += stats.uniquePageViews;
      visitors += stats.visitors;
    }

    pageViews = Math.trunc(pageViews * multiplier);
    uniquePageViews = Math.trunc(uniquePageViews * multiplier);
    visitors = Math.trunc(visitors * multiplier);

    quaterlyInfo.push([curYear, curQuarter, pageViews, uniquePageViews, visitors])
  }

  console.log('quarterlyInfo', quaterlyInfo);
  
}

cycleThroughQuarters('Q1-2019', 'Q2-2019');




// G4 Analytics Query
// Develop with domains that I own

// G4 Measurement Protocol for Sending Events
// https://developers.google.com/analytics/devguides/collection/protocol/ga4



// playground

//sendPageViewG3('https://dev.pymnts.com/today-on-pymnts/', 'Today on Pymnts', 'UA-11167465-10');
//analyticsQueryG3('2023-03-01', 'today');

//

const test = {
  date: '2015-01-01',
  pageViews: 100000,
  uniquePageViews: 50000,
  visitors: 25000
}

// setTimeout(() => {
//   cycleThroughDays ('2023-01-01', '2023-04-01');
// }, 2000) 
