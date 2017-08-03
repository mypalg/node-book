/**
 * UA统计器
 * 与本项目无关，临时保存
 */

const fs = require('fs');
const readLine = require('readline');
const uaDev = require('ua-device');
const rl = readLine.createInterface({
  input: fs.createReadStream('./static/ua.csv')
});

function createOrIncrease(tar, paths) {
  for (let i = 0; i < paths.length; i++) {
    if (tar[paths[i]] === undefined) {
      if (i === paths.length - 1) {
        tar[paths[i]] = 1;
      } else {
        tar[paths[i]] = {};
      }
    } else {
      if (i === paths.length - 1) {
        tar[paths[i]]++;
      }
    }
    tar = tar[paths[i]];
  }
}

function log(obj) {
  console.log(JSON.stringify(obj, null, 4));
}

let cnt = 0;
let browser = {};
let os = {};
let device = {};
let manufacturer = {};
rl.on('line', (line) => {
  let ua = new uaDev(line.substr(1, line.length - 2));
  createOrIncrease(browser, [ua.browser.name]);
  createOrIncrease(os, [ua.os.name, ua.os.version.original]);
  createOrIncrease(manufacturer, [ua.device.manufacturer]);
  createOrIncrease(device, [ua.device.manufacturer, ua.device.model]);
  if (++cnt % 1000 === 0) {
    console.log(cnt);
  }
}).on('close', () => {
  log(browser);
  log(os);
  log(manufacturer);
  log(device);
});
