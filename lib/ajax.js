// requires
let moment = require('moment'),
  Axios = require('axios');

// constants
const HOST = 'huiyi.sankuai.com';
const ORIGIN = 'https://' + HOST;
const ROOT_URL = ORIGIN + '/';
const API_PREFIX = ORIGIN + '/meeting';

let axios = Axios.create({
  baseURL: API_PREFIX,
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
    axios.defaults.headers.Cookie = 'ssoid=' + ssoId;
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
  getRoomList(param) {
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
  getUserInfo() {
    return axios.post('/').then(res => res.data);
  },
  saveAppointMent(param) {
    return axios.post('/saveAppointment', Object.assign({
      atUser: [],
      notifyTime: 5,
      bookType: 2
    }, param)).then(res => res.data);
  }
};
