// requires
const moment = require('moment'),
  Axios = require('axios'),
  NodeCache = require( "node-cache" );
const ssoidCache = new NodeCache();

// constants
const HOST = 'huiyi.sankuai.com';
const ORIGIN = 'https://' + HOST;
const ROOT_URL = ORIGIN + '/';
const API_PREFIX = ORIGIN + '/meeting';

let axios = Axios.create({
  baseURL: API_PREFIX,
  timeout: 5000,
  headers: {
    'Host': HOST,
    'Connection': 'keep-alive',
    'Pragma': 'no-cache',
    'Cache-Control': 'no-cache',
    'Origin': ORIGIN,
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36',
    'content-type': 'application/json',
    'accept': 'application/json',
    'x-requested-with': 'XMLHttpRequest',
    'Referer': ROOT_URL,
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'en-US,en;q=0.8'
  }
});

module.exports = {
  setSsoId(ssoId) {
    if (ssoId) {
      axios.defaults.headers.Cookie = 'ssoid=' + ssoId;
    }
  },
  /**
   * @param {{}} param
   * @param {Date} [date]
   * @param {number=81} [buildingId]
   * @param {number=0} [floorId]
   * @param {number=0} [equipId]
   * @param {number=0} [capacityMin]
   * @param {number=0} [capacityMax]
   * @return {Promise}
   */
  getRoomList(param, ssoId) {
    this.setSsoId(ssoId);
    const DEFAULT_PARAM = {
      'date': +moment(moment().format('YYYY-MM-DD')).add(13, 'd'),
      'buildingId': 81,
      'floorId': 0,
      'equipId': 0,
      'capacityMin': 0,
      'capacityMax': 0,
      'page': {'pageNo': 1, 'pageSize': 33}
    };
    param = Object.assign({}, DEFAULT_PARAM, param);
    return axios.post('/findRoomBooked', param).then(res => res.data);
  },
  getUserInfo(ssoId) {
    axios.defaults.headers.Cookie = 'ssoid=' + ssoId;
    let userInfo = ssoidCache.get(ssoId);
    return userInfo ? new Promise((resolve, reject) => {resolve(userInfo)}) : axios.post('/').then(res => {
      ssoidCache.set(ssoId, res.data);
      return res.data;
    })
  },
  saveAppointMent(param, ssoId) {
    this.setSsoId(ssoId);
    return axios.post('/saveAppointment', Object.assign({
      atUser: [],
      notifyTime: 5,
      bookType: 2
    }, param)).then(res => res.data);
  }
};
