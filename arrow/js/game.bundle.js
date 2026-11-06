/* 山海一箭 · 自动生成，请勿直接编辑（源码见 src/） */
(function(){var M={},C={};function R(n){n=n.replace(/^\.\//,"").replace(/\.js$/,"");if(C[n])return C[n].exports;var m={exports:{}};C[n]=m;M[n](m,m.exports,R);return m.exports;}
M["rng"]=function(module,exports,require){
// 确定性随机数（mulberry32 + 字符串哈希），关卡 N 永远相同
function hashStr(s) {
  var h = 2166136261 >>> 0;
  s = String(s);
  for (var i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

function makeRng(seed) {
  var a = (typeof seed === 'number' ? seed : hashStr(seed)) >>> 0;
  if (a === 0) a = 0x9e3779b9;
  function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    var t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  return {
    next: next,
    int: function (lo, hi) { return lo + Math.floor(next() * (hi - lo + 1)); },
    pick: function (arr) { return arr[Math.floor(next() * arr.length)]; },
    shuffle: function (arr) {
      for (var i = arr.length - 1; i > 0; i--) {
        var j = Math.floor(next() * (i + 1));
        var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
      }
      return arr;
    }
  };
}

module.exports = { makeRng: makeRng, hashStr: hashStr };

};
M["config"]=function(module,exports,require){
// ===== 广告与数值配置（上线前只需改这里） =====
module.exports = {
  // 在微信公众平台「流量主 → 广告管理」创建后替换。保持 adunit-xxxx 占位时，广告会被模拟（直接发放奖励）。
  AD_UNIT_REWARDED: 'adunit-xxxxxxxxxxxxxxxx',
  AD_UNIT_INTERSTITIAL: 'adunit-yyyyyyyyyyyyyyyy',
  // 插屏：第 10 关以后，且距上次插屏至少 3 次胜利
  INTERSTITIAL_MIN_LEVEL: 11,
  INTERSTITIAL_EVERY_WINS: 3,
  // 初始免费道具次数
  FREE_ASSISTS: { hint: 3, undo: 2, remove: 2 },
  HEARTS: 3,
  SLIDE_SPEED: 25, // 格/秒
  TOTAL_LEVELS: 500,
  // 7 日签到奖励
  CHECKIN: [
    { hint: 1 }, { remove: 1 }, { undo: 1 }, { hint: 2 },
    { remove: 2 }, { undo: 2 }, { hint: 2, remove: 2, undo: 2 }
  ],
  SHARE_TITLE: '上古异兽被困箭阵，你能一箭破局吗？'
};

};
M["levelgen"]=function(module,exports,require){
// 关卡生成 + 求解/评级
// 棋盘 w x h 个格；每条箭是 2–5 格的折线，cells[0] 为箭尾，cells[len-1] 为箭头。
// 生成方法：逆向插入。新放入的箭，其“出射线”（箭头沿方向到边界的格子）不得经过任何已放置的格子，
// 因此按插入的逆序逐个移除一定可解。
var R = require('./rng');

var DIRS = [[1, 0], [0, 1], [-1, 0], [0, -1]];

function headDir(cells) {
  var n = cells.length, h = cells[n - 1], p = cells[n - 2];
  return [h[0] - p[0], h[1] - p[1]];
}

// 出射线上的格子索引列表
function rayCells(w, h, cells) {
  var d = headDir(cells), hd = cells[cells.length - 1];
  var x = hd[0] + d[0], y = hd[1] + d[1], out = [];
  while (x >= 0 && y >= 0 && x < w && y < h) { out.push(y * w + x); x += d[0]; y += d[1]; }
  return out;
}

function randomWalk(w, h, occ, start, len, rng, turnP) {
  var path = [start], used = {};
  used[start[1] * w + start[0]] = 1;
  var dir = rng.int(0, 3);
  for (var i = 1; i < len; i++) {
    var cur = path[path.length - 1];
    var opts = [];
    // 继续直行或转弯
    var tryDirs = rng.next() < turnP ? [(dir + 1) % 4, (dir + 3) % 4, dir] : [dir, (dir + 1) % 4, (dir + 3) % 4];
    if (rng.next() < 0.5 && tryDirs.length === 3 && tryDirs[0] !== dir) { var t = tryDirs[0]; tryDirs[0] = tryDirs[1]; tryDirs[1] = t; }
    for (var k = 0; k < tryDirs.length; k++) {
      var dd = DIRS[tryDirs[k]], nx = cur[0] + dd[0], ny = cur[1] + dd[1];
      if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
      var id = ny * w + nx;
      if (occ[id] >= 0 || used[id]) continue;
      opts.push([nx, ny, tryDirs[k]]);
      break;
    }
    if (!opts.length) break;
    var o = opts[0];
    path.push([o[0], o[1]]); used[o[1] * w + o[0]] = 1; dir = o[2];
  }
  return path;
}

function generate(w, h, rng, opt) {
  var N = w * h, occ = new Int16Array(N).fill(-1), segs = [];
  var target = Math.floor(N * opt.coverage), filled = 0;
  var cx = (w - 1) / 2, cy = (h - 1) / 2;
  for (var pass = 0; pass < 3 && filled < target; pass++) {
    var cells = [];
    for (var i = 0; i < N; i++) if (occ[i] < 0) {
      var x = i % w, y = (i / w) | 0;
      var dist = Math.max(Math.abs(x - cx) / w, Math.abs(y - cy) / h);
      cells.push([i, dist * opt.centerW + rng.next()]);
    }
    cells.sort(function (a, b) { return a[1] - b[1]; });
    for (var c = 0; c < cells.length && filled < target; c++) {
      var id = cells[c][0];
      if (occ[id] >= 0) continue;
      var start = [id % w, (id / w) | 0], best = null, bestScore = -1e9;
      for (var t = 0; t < opt.tries; t++) {
        var len = pickLen(rng, opt, pass);
        var path = randomWalk(w, h, occ, start, len, rng, opt.turnP);
        if (path.length < Math.max(2, pass === 2 ? 2 : opt.minLen)) continue;
        for (var o = 0; o < 2; o++) {
          var cl = o ? path.slice().reverse() : path;
          var ray = rayCells(w, h, cl), ok = true;
          for (var r = 0; r < ray.length; r++) if (occ[ray[r]] >= 0) { ok = false; break; }
          if (!ok) continue;
          var sc = ray.length * opt.rayW + cl.length * opt.lenW + rng.next() * 2;
          if (opt.noEdgeOut && ray.length === 0) sc -= 3;
          if (sc > bestScore) { bestScore = sc; best = cl; }
        }
      }
      if (best) {
        var si = segs.length;
        for (var b = 0; b < best.length; b++) occ[best[b][1] * w + best[b][0]] = si;
        segs.push({ cells: best });
        filled += best.length;
        if (opt.maxSegs && segs.length >= opt.maxSegs) { pass = 9; break; }
      }
    }
  }
  return { w: w, h: h, segs: segs };
}

function pickLen(rng, opt, pass) {
  var lo = opt.minLen, hi = opt.maxLen;
  if (pass === 2) lo = 2;
  // 偏好中等长度
  var r = (rng.next() + rng.next()) / 2;
  return lo + Math.floor(r * (hi - lo + 1));
}

// 按当前占用判断某箭是否可直接飞出
function isFree(board, occ, si) {
  var ray = rayCells(board.w, board.h, board.segs[si].cells);
  for (var r = 0; r < ray.length; r++) if (occ[ray[r]] >= 0) return false;
  return true;
}

function buildOcc(board, alive) {
  var occ = new Int16Array(board.w * board.h).fill(-1);
  for (var i = 0; i < board.segs.length; i++) {
    if (alive && !alive[i]) continue;
    var c = board.segs[i].cells;
    for (var j = 0; j < c.length; j++) occ[c[j][1] * board.w + c[j][0]] = i;
  }
  return occ;
}

// 贪心逐层移除：可解性 + 难度
function grade(board) {
  var n = board.segs.length, alive = [], left = n, layers = 0, frees = [], order = [];
  for (var i = 0; i < n; i++) alive.push(true);
  while (left > 0) {
    var occ = buildOcc(board, alive), free = [];
    for (var s = 0; s < n; s++) if (alive[s] && isFree(board, occ, s)) free.push(s);
    if (!free.length) return { solvable: false, layers: layers, n: n };
    for (var f = 0; f < free.length; f++) { alive[free[f]] = false; order.push(free[f]); }
    left -= free.length; frees.push(free.length); layers++;
  }
  var cov = 0;
  for (var k = 0; k < n; k++) cov += board.segs[k].cells.length;
  cov /= (board.w * board.h);
  var avgFree = n / layers;
  var D = n * 0.3 + layers * 2.0 + (n / frees[0]) * 0.6;
  return { solvable: true, layers: layers, n: n, avgFree: avgFree, firstFree: frees[0], coverage: cov, D: D, order: order };
}

// 给箭上色：相邻箭尽量不同色
function colorize(board, rng) {
  var n = board.segs.length, occ = buildOcc(board), adj = [];
  for (var i = 0; i < n; i++) adj.push({});
  for (var y = 0; y < board.h; y++) for (var x = 0; x < board.w; x++) {
    var a = occ[y * board.w + x];
    if (a < 0) continue;
    if (x + 1 < board.w) { var b = occ[y * board.w + x + 1]; if (b >= 0 && b !== a) { adj[a][b] = 1; adj[b][a] = 1; } }
    if (y + 1 < board.h) { var c = occ[(y + 1) * board.w + x]; if (c >= 0 && c !== a) { adj[a][c] = 1; adj[c][a] = 1; } }
  }
  for (var s = 0; s < n; s++) {
    var cand = rng.shuffle([0, 1, 2, 3]), best = cand[0], bestBad = 99;
    for (var k = 0; k < 4; k++) {
      var bad = 0;
      for (var nb in adj[s]) if (board.segs[nb].color === cand[k]) bad++;
      if (bad < bestBad) { bestBad = bad; best = cand[k]; }
    }
    board.segs[s].color = best;
  }
}

// ---------- 关卡曲线 ----------
function lerp(a, b, t) { return a + (b - a) * Math.max(0, Math.min(1, t)); }

function paramsFor(n) {
  // 尺寸：L1 3x3 → L20 6x8 → L60 8x10 → L100+ 9x12
  var w, h;
  if (n <= 20) {
    var tbl = [[3,3],[3,4],[4,4],[4,4],[4,5],[4,5],[5,5],[5,5],[5,6],[5,6],[5,6],[5,7],[5,7],[6,7],[6,7],[6,7],[6,8],[6,8],[6,8],[6,8]];
    w = tbl[n - 1][0]; h = tbl[n - 1][1];
  } else if (n <= 60) { w = (n < 40 ? 7 : 8); h = n < 30 ? 8 : (n < 45 ? 9 : 10); if (w === 7 && h === 10) h = 9; }
  else if (n <= 100) { w = n < 80 ? 8 : 9; h = n < 80 ? 10 : 11; }
  else { w = 9; h = 12; }
  var boss = (n % 10 === 0) && n > 5;     // 每 10 关为守关关：稍难
  var rest = (n % 10 === 1) && n > 10;    // 守关后的喘息关
  var cov = n <= 20 ? lerp(0.55, 0.82, (n - 2) / 18) : lerp(0.84, 0.93, (n - 20) / 200);
  if (rest) cov -= 0.06;
  var opt = {
    coverage: Math.min(0.95, cov + (boss ? 0.02 : 0)),
    minLen: 2, maxLen: n <= 3 ? 3 : (n <= 12 ? 4 : 5),
    turnP: lerp(0.15, 0.5, n / 120),
    tries: 40,
    centerW: lerp(1, 6, n / 80),
    rayW: lerp(0.0, 0.6, n / 150),
    lenW: 0.5,
    noEdgeOut: n > 40
  };
  return { w: w, h: h, opt: opt, boss: boss, rest: rest };
}

// 目标难度：平滑上升曲线 + 守关/喘息的小波动
function targetD(n, p) {
  var base = 2 + 26 * (1 - Math.exp(-n / 70)) + n * 0.012;
  if (p.boss) base *= 1.12;
  if (p.rest) base *= 0.85;
  return base;
}

function makeTutorial() {
  // 手工设计第 1 关：先点右向的红箭，再点被它挡住的玉色箭
  return {
    w: 3, h: 3,
    segs: [
      { cells: [[0, 0], [1, 0], [2, 0]], color: 0 },           // 第一排 → 直接飞出
      { cells: [[0, 2], [0, 1], [1, 1]], color: 1 },           // L 形，箭头向右：被玉箭挡住
      { cells: [[2, 2], [2, 1]], color: 2 }                    // 向上：被第一排红箭挡住
    ]
  };
}

var cache = {};
function getLevel(n) {
  if (cache[n]) return cache[n];
  var board;
  if (n === 1) {
    board = makeTutorial();
    board.grade = grade(board);
  } else {
    var p = paramsFor(n), T = targetD(n, p), best = null, bestErr = 1e9;
    var K = n <= 20 ? 10 : 6;
    for (var k = 0; k < K || (!best && k < 60); k++) {
      var rng = R.makeRng('shanhai-arrow-L' + n + '-' + k);
      var b = generate(p.w, p.h, rng, p.opt);
      if (b.segs.length < 2) continue;
      var g = grade(b);
      if (!g.solvable) continue;
      if (n >= 4 && g.layers < 2) continue;
      var err = Math.abs(g.D - T);
      if (err < bestErr) { bestErr = err; best = b; best.grade = g; }
    }
    board = best;
    colorize(board, R.makeRng('color-' + n));
  }
  board.id = n;
  board.boss = n % 10 === 0;
  cache[n] = board;
  return board;
}

function getDaily(dateStr) {
  var key = 'daily-' + dateStr;
  if (cache[key]) return cache[key];
  var rng0 = R.makeRng(key), best = null, bestD = -1;
  var w = 8, h = 10;
  for (var k = 0; k < 5; k++) {
    var rng = R.makeRng(key + '-' + k);
    var opt = { coverage: 0.9, minLen: 2, maxLen: 5, turnP: 0.45, tries: 40, centerW: 5, rayW: 0.5, lenW: 0.5, noEdgeOut: true };
    var b = generate(w, h, rng, opt), g = grade(b);
    if (!g.solvable) continue;
    if (g.D > bestD) { bestD = g.D; best = b; best.grade = g; }
  }
  colorize(best, rng0);
  best.id = 'daily';
  best.daily = dateStr;
  cache[key] = best;
  return best;
}

module.exports = {
  DIRS: DIRS, headDir: headDir, rayCells: rayCells, generate: generate, grade: grade,
  isFree: isFree, buildOcc: buildOcc, getLevel: getLevel, getDaily: getDaily, paramsFor: paramsFor,
  targetD: targetD, TOTAL: 500
};

};
M["beasts"]=function(module,exports,require){
// 异兽图鉴：每 10 关解锁一只（第 10、20、30…关的守关关通关时解锁）
// 原文据维基文库《山海经》校对（简体转写）
module.exports = [
  { id: 'jiuweihu', name: '九尾狐', place: '青丘之山', src: '南山经',
    quote: '又东三百里，曰青丘之山……有兽焉，其状如狐而九尾，其音如婴儿，能食人；食者不蛊。',
    plain: '青丘山上的九尾狐，叫声像婴儿啼哭；传说吃了它的肉，就不会被邪气所侵。' },
  { id: 'lushu', name: '鹿蜀', place: '杻阳之山', src: '南山经',
    quote: '有兽焉，其状如马而白首，其文如虎而赤尾，其音如谣，其名曰鹿蜀，佩之宜子孙。',
    plain: '白头、虎纹、红尾巴的骏马，叫声像人在唱歌；佩带它的皮毛，能让子孙兴旺。' },
  { id: 'jingwei', name: '精卫', place: '发鸠之山', src: '北山经',
    quote: '有鸟焉，其状如乌，文首、白喙、赤足，名曰精卫，其鸣自詨。是炎帝之少女，名曰女娃，女娃游于东海，溺而不返，故为精卫，常衔西山之木石，以堙于东海。',
    plain: '炎帝的小女儿女娃溺于东海，化作精卫鸟，日日衔来西山的树枝石子，誓要填平大海。' },
  { id: 'dangkang', name: '当康', place: '钦山', src: '东山经',
    quote: '有兽焉，其状如豚而有牙，其名曰当康，其鸣自叫，见则天下大穰。',
    plain: '长着獠牙的小猪，叫声就是自己的名字；它一出现，天下便会五谷丰登。' },
  { id: 'wenyao', name: '文鳐鱼', place: '泰器之山', src: '西山经',
    quote: '是多文鳐鱼，状如鲤鱼，鱼身而鸟翼，苍文而白首，赤喙，常从西海游于东海，以夜飞。',
    plain: '长着鸟翅膀的鲤鱼，夜里从西海飞往东海；见到它，预示着大丰收。' },
  { id: 'bifang', name: '毕方', place: '章莪之山', src: '西山经',
    quote: '有鸟焉，其状如鹤，一足，赤文青质而白喙，名曰毕方，其鸣自叫也，见则其邑有讹火。',
    plain: '只有一只脚的青色仙鹤，身上有红色花纹；它出现的地方，往往会莫名起火。' },
  { id: 'huan', name: '讙', place: '翼望之山', src: '西山经',
    quote: '有兽焉，其状如狸，一目而三尾，名曰讙，其音如夺百声，是可以御凶，服之已瘅。',
    plain: '独眼三尾的野猫，能模仿上百种声音；养着它可以辟邪挡灾。' },
  { id: 'zheng', name: '狰', place: '章莪之山', src: '西山经',
    quote: '有兽焉，其状如赤豹，五尾一角，其音如击石，其名如狰。',
    plain: '火红的豹子，头顶独角、身后五条尾巴，吼声像敲击石头一样铿锵。' },
  { id: 'luanniao', name: '鸾鸟', place: '女床之山', src: '西山经',
    quote: '有鸟焉，其状如翟而五采文，名曰鸾鸟，见则天下安宁。',
    plain: '羽毛五彩斑斓的神鸟，像长尾的山鸡；它现身之时，天下太平安宁。' },
  { id: 'dijiang', name: '帝江', place: '天山', src: '西山经',
    quote: '有神焉，其状如黄囊，赤如丹火，六足四翼，浑敦无面目，是识歌舞，实为帝江也。',
    plain: '像一只红彤彤的黄布袋，六只脚、四只翅膀，没有脸，却最懂唱歌跳舞。' },
  { id: 'yingzhao', name: '英招', place: '槐江之山', src: '西山经',
    quote: '实惟帝之平圃，神英招司之，其状马身而人面，虎文而鸟翼，狥于四海，其音如榴。',
    plain: '天帝花园的看守神，马身人面、虎纹鸟翼，常常巡游四海。' },
  { id: 'paoxiao', name: '狍鸮', place: '钩吾之山', src: '北山经',
    quote: '有兽焉，其状如羊身人面，其目在腋下，虎齿人爪，其音如婴儿，名曰狍鸮，是食人。',
    plain: '羊身人脸、眼睛长在腋下的贪食怪兽，后世注家认为它就是饕餮。' },
  { id: 'chenghuang', name: '乘黄', place: '白民之国', src: '海外西经',
    quote: '白民之国在龙鱼北，白身披发。有乘黄，其状如狐，其背上有角，乘之寿二千岁。',
    plain: '背上长角的狐形神兽，传说骑上它的人可以活到两千岁。' },
  { id: 'luwu', name: '陆吾', place: '昆仑之丘', src: '西山经',
    quote: '昆仑之丘，是实惟帝之下都，神陆吾司之。其神状虎身而九尾，人面而虎爪；是神也，司天之九部及帝之囿时。',
    plain: '镇守昆仑山的天神，虎身九尾、人面虎爪，掌管天上九域和天帝的苑囿。' },
  { id: 'kui', name: '夔', place: '流波山', src: '大荒东经',
    quote: '其上有兽，状如牛，苍身而无角，一足，出入水则必风雨，其光如日月，其声如雷，其名曰夔。黄帝得之，以其皮为鼓，橛以雷兽之骨，声闻五百里，以威天下。',
    plain: '独脚无角的青色神牛，出入水中必有风雨；黄帝用它的皮做鼓，鼓声震动五百里。' },
  { id: 'zhulong', name: '烛龙', place: '章尾山', src: '大荒北经',
    quote: '西北，赤水之北，有章尾山。有神，人面蛇身而赤，直目正乘，其瞑乃晦，其视乃明，不食不寝不息，风雨是谒。是烛九阴，是谓烛龙。',
    plain: '人面赤身的巨龙，闭眼天下就是黑夜，睁眼就是白昼，照亮幽暗的九阴之地。' },
  { id: 'yinglong', name: '应龙', place: '凶犁土丘', src: '大荒北经',
    quote: '夸父不量力，欲追日景，逮之于禺谷……应龙已杀蚩尤，又杀夸父，乃去南方处之，故南方多雨。',
    plain: '生有双翼的神龙，曾助黄帝斩杀蚩尤与夸父；它栖居南方，所以南方多雨。' }
];

};
M["platform"]=function(module,exports,require){
// 平台薄层：微信小游戏 / 浏览器 统一接口
var CFG = require('./config');
var isWx = typeof wx !== 'undefined' && !!wx.createCanvas;
var P = { isWx: isWx };

var canvas, info;
P.init = function () {
  if (isWx) {
    info = wx.getSystemInfoSync();
    canvas = wx.createCanvas();
    var dpr = Math.min(info.pixelRatio || 2, 3);
    canvas.width = info.windowWidth * dpr;
    canvas.height = info.windowHeight * dpr;
    var safeTop = info.safeArea ? info.safeArea.top : (info.statusBarHeight || 20);
    var safeBottom = info.safeArea ? Math.max(0, info.windowHeight - info.safeArea.bottom) : 0;
    // 胶囊按钮区域：HUD 需避开
    var menu = null;
    try { menu = wx.getMenuButtonBoundingClientRect(); } catch (e) {}
    if (menu && menu.bottom) safeTop = Math.max(safeTop, menu.bottom + 4);
    return { canvas: canvas, ctx: canvas.getContext('2d'), w: info.windowWidth, h: info.windowHeight, dpr: dpr, safeTop: safeTop, safeBottom: safeBottom };
  }
  canvas = document.getElementById('game');
  var dpr2 = Math.min(window.devicePixelRatio || 1, 3);
  var probe = document.getElementById('safe');
  var st = probe ? parseFloat(getComputedStyle(probe).paddingTop) || 0 : 0;
  var sb = probe ? parseFloat(getComputedStyle(probe).paddingBottom) || 0 : 0;
  var W = window.innerWidth, H = window.innerHeight;
  canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
  canvas.width = Math.round(W * dpr2); canvas.height = Math.round(H * dpr2);
  return { canvas: canvas, ctx: canvas.getContext('2d'), w: W, h: H, dpr: dpr2, safeTop: st, safeBottom: sb };
};

P.onResize = function (fn) { if (!isWx) window.addEventListener('resize', fn); };

P.createOffscreen = function (w, h) {
  var c = isWx ? wx.createCanvas() : document.createElement('canvas');
  c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h));
  return c;
};

P.onTouch = function (start, move, end) {
  if (isWx) {
    var pt = function (e) { var t = (e.changedTouches && e.changedTouches[0]) || (e.touches && e.touches[0]); return t ? [t.clientX, t.clientY] : [0, 0]; };
    wx.onTouchStart(function (e) { var p = pt(e); start(p[0], p[1]); });
    wx.onTouchMove(function (e) { var p = pt(e); move(p[0], p[1]); });
    wx.onTouchEnd(function (e) { var p = pt(e); end(p[0], p[1]); });
    wx.onTouchCancel(function (e) { var p = pt(e); end(p[0], p[1]); });
    return;
  }
  var down = false;
  canvas.addEventListener('pointerdown', function (e) { down = true; e.preventDefault(); start(e.clientX, e.clientY); });
  window.addEventListener('pointermove', function (e) { if (down) move(e.clientX, e.clientY); });
  window.addEventListener('pointerup', function (e) { if (down) { down = false; end(e.clientX, e.clientY); } });
  window.addEventListener('pointercancel', function (e) { if (down) { down = false; end(e.clientX, e.clientY); } });
};

// ---------- 存储 ----------
var KEY = 'shanhai_arrow_save_v1';
P.load = function () {
  try {
    var s = isWx ? wx.getStorageSync(KEY) : localStorage.getItem(KEY);
    return s ? (typeof s === 'string' ? JSON.parse(s) : s) : null;
  } catch (e) { return null; }
};
P.save = function (obj) {
  try { var s = JSON.stringify(obj); if (isWx) wx.setStorageSync(KEY, s); else localStorage.setItem(KEY, s); } catch (e) {}
};

// ---------- 图片 / 字体 / 分包 ----------
P.loadImage = function (src) {
  return new Promise(function (resolve) {
    var img = isWx ? wx.createImage() : new Image();
    img.onload = function () { resolve(img); };
    img.onerror = function () { resolve(null); };
    img.src = src;
  });
};
P.loadSubpackage = function (name) {
  return new Promise(function (resolve) {
    if (!isWx || !wx.loadSubpackage) return resolve(true);
    wx.loadSubpackage({ name: name, success: function () { resolve(true); }, fail: function () { resolve(false); } });
  });
};
P.loadFont = function (family, base) {
  return new Promise(function (resolve) {
    try {
      if (isWx) { var f = wx.loadFont(base + '.ttf'); return resolve(f || null); }
      if (typeof FontFace === 'undefined') return resolve(null);
      var ff = new FontFace(family, 'url(' + base + '.woff2) format("woff2"), url(' + base + '.ttf) format("truetype")');
      ff.load().then(function (x) { document.fonts.add(x); resolve(family); }, function () { resolve(null); });
    } catch (e) { resolve(null); }
  });
};

// ---------- 音频 ----------
var SFX = ['pluck0', 'pluck1', 'pluck2', 'pluck3', 'pluck4', 'pluck5', 'pluck6', 'pluck7', 'hit', 'tap', 'win', 'fail', 'remove', 'unlock'];
var audio = { sfx: true, music: true };
var ac = null, buffers = {}, bgmNode = null, bgmGain = null, wxPool = [], wxPoolI = 0, wxBgm = null;
P.audioInit = function () {
  if (isWx) {
    try { wx.setInnerAudioOption && wx.setInnerAudioOption({ obeyMuteSwitch: true, mixWithOther: true }); } catch (e) {}
    for (var i = 0; i < 6; i++) wxPool.push(wx.createInnerAudioContext());
    wxBgm = wx.createInnerAudioContext();
    wxBgm.src = 'audio/bgm.mp3'; wxBgm.loop = true; wxBgm.volume = 0.45;
    return;
  }
  var AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  ac = new AC();
  SFX.concat(['bgm']).forEach(function (n) {
    fetch('audio/' + n + '.mp3').then(function (r) { return r.arrayBuffer(); }).then(function (b) {
      return new Promise(function (res, rej) { ac.decodeAudioData(b, res, rej); });
    }).then(function (buf) { buffers[n] = buf; if (n === 'bgm') P.setMusic(audio.music); }).catch(function () {});
  });
};
P.unlockAudio = function () {
  if (ac && ac.state === 'suspended') ac.resume();
  if (isWx && audio.music && wxBgm && wxBgm.paused) wxBgm.play();
  if (!isWx && audio.music && !bgmNode) P.setMusic(true);
};
P.play = function (name, vol) {
  if (!audio.sfx) return;
  vol = vol == null ? 1 : vol;
  if (isWx) {
    var c = wxPool[wxPoolI++ % wxPool.length];
    try { c.stop(); c.src = 'audio/' + name + '.mp3'; c.volume = vol; c.play(); } catch (e) {}
    return;
  }
  if (!ac || !buffers[name] || ac.state !== 'running') return;
  var s = ac.createBufferSource(), g = ac.createGain();
  s.buffer = buffers[name]; g.gain.value = vol * 0.8; s.connect(g); g.connect(ac.destination); s.start();
};
P.setSfx = function (on) { audio.sfx = on; };
P.setMusic = function (on) {
  audio.music = on;
  if (isWx) { if (!wxBgm) return; if (on) wxBgm.play(); else wxBgm.pause(); return; }
  if (!ac) return;
  if (on && !bgmNode && buffers.bgm && ac.state === 'running') {
    bgmNode = ac.createBufferSource(); bgmGain = ac.createGain();
    bgmNode.buffer = buffers.bgm; bgmNode.loop = true; bgmGain.gain.value = 0.35;
    bgmNode.connect(bgmGain); bgmGain.connect(ac.destination); bgmNode.start();
  } else if (!on && bgmNode) { try { bgmNode.stop(); } catch (e) {} bgmNode = null; }
};
P.vibrate = function () { if (isWx && wx.vibrateShort) { try { wx.vibrateShort({ type: 'light' }); } catch (e) {} } else if (typeof navigator !== 'undefined' && navigator.vibrate) { try { navigator.vibrate(25); } catch (e) {} } };

// ---------- 广告 ----------
var placeholder = function (id) { return !id || /x{6,}|y{6,}/.test(id); };
var rewarded = null, rewardCb = null, inter = null;
P.adsInit = function () {
  if (!isWx) return;
  if (wx.createRewardedVideoAd && !placeholder(CFG.AD_UNIT_REWARDED)) {
    rewarded = wx.createRewardedVideoAd({ adUnitId: CFG.AD_UNIT_REWARDED });
    rewarded.onError(function () {});
    rewarded.onClose(function (res) { var cb = rewardCb; rewardCb = null; if (cb) cb(!res || res.isEnded); });
  }
  if (wx.createInterstitialAd && !placeholder(CFG.AD_UNIT_INTERSTITIAL)) {
    inter = wx.createInterstitialAd({ adUnitId: CFG.AD_UNIT_INTERSTITIAL });
    inter.onError(function () {});
  }
};
// 返回 Promise<{ok:boolean, msg?:string}>
P.showRewarded = function () {
  return new Promise(function (resolve) {
    if (!rewarded) { resolve({ ok: true, msg: '测试：模拟广告' }); return; }
    rewardCb = function (ok) { resolve({ ok: ok, msg: ok ? '' : '完整观看后才能获得奖励' }); };
    rewarded.show().catch(function () {
      rewarded.load().then(function () { return rewarded.show(); }).catch(function () { rewardCb = null; resolve({ ok: false, msg: '广告暂时无法播放，请稍后再试' }); });
    });
  });
};
P.showInterstitial = function () {
  if (!inter) return;
  inter.show().catch(function () {});
};
P.share = function () {
  if (isWx && wx.shareAppMessage) wx.shareAppMessage({ title: CFG.SHARE_TITLE });
};
P.setupShare = function () {
  if (!isWx) return;
  try { wx.showShareMenu({ withShareTicket: false, menus: ['shareAppMessage', 'shareTimeline'] }); } catch (e) {}
  try { wx.onShareAppMessage(function () { return { title: CFG.SHARE_TITLE }; }); } catch (e) {}
};
P.today = function () {
  var d = new Date();
  var m = d.getMonth() + 1, dd = d.getDate();
  return d.getFullYear() + '-' + (m < 10 ? '0' : '') + m + '-' + (dd < 10 ? '0' : '') + dd;
};
P.onShow = function (fn) { if (isWx && wx.onShow) wx.onShow(fn); else if (typeof document !== 'undefined') document.addEventListener('visibilitychange', function () { if (!document.hidden) fn(); }); };
P.onHide = function (fn) { if (isWx && wx.onHide) wx.onHide(fn); else if (typeof document !== 'undefined') document.addEventListener('visibilitychange', function () { if (document.hidden) fn(); }); };
P.raf = function (fn) { return (isWx ? requestAnimationFrame : window.requestAnimationFrame)(fn); };

module.exports = P;

};
M["draw"]=function(module,exports,require){
// 绘制工具：圆角矩形、按钮、面板、文字换行、手指指引
var D = {};
D.FONT_T = '"ShanHaiTitle","Songti SC","STSongti-SC-Black","STSong","Noto Serif CJK SC","Noto Serif SC",serif';
D.FONT_B = '"PingFang SC","Hiragino Sans GB","Microsoft YaHei","Noto Sans SC","Noto Sans CJK SC","Source Han Sans SC",sans-serif';
D.setTitleFont = function (f) { if (f) { D.FONT_T = '"' + f + '",' + D.FONT_T; D.FONT_B = D.FONT_B + ',"' + f + '"'; } };

D.rr = function (c, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  c.beginPath();
  c.moveTo(x + r, y);
  c.lineTo(x + w - r, y); c.arcTo(x + w, y, x + w, y + r, r);
  c.lineTo(x + w, y + h - r); c.arcTo(x + w, y + h, x + w - r, y + h, r);
  c.lineTo(x + r, y + h); c.arcTo(x, y + h, x, y + h - r, r);
  c.lineTo(x, y + r); c.arcTo(x, y, x + r, y, r);
  c.closePath();
};

D.text = function (c, s, x, y, size, color, opt) {
  opt = opt || {};
  c.font = (opt.weight || (opt.title ? '900' : '600')) + ' ' + size + 'px ' + (opt.title ? D.FONT_T : D.FONT_B);
  c.textAlign = opt.align || 'center';
  c.textBaseline = opt.base || 'middle';
  if (opt.shadow) { c.fillStyle = opt.shadow; c.fillText(s, x + (opt.sx == null ? 0 : opt.sx), y + (opt.sy == null ? 3 : opt.sy)); }
  if (opt.stroke) { c.lineJoin = 'round'; c.lineWidth = opt.sw || 6; c.strokeStyle = opt.stroke; c.strokeText(s, x, y); }
  c.fillStyle = color; c.fillText(s, x, y);
};

// 中文逐字换行
D.wrap = function (c, s, maxW) {
  var lines = [], cur = '';
  for (var i = 0; i < s.length; i++) {
    var ch = s[i];
    if (ch === '\n') { lines.push(cur); cur = ''; continue; }
    var t = cur + ch;
    if (c.measureText(t).width > maxW && cur) {
      // 标点不放行首
      if ('，。；：、！？）」』》…'.indexOf(ch) >= 0) { lines.push(t); cur = ''; continue; }
      lines.push(cur); cur = ch;
    } else cur = t;
  }
  if (cur) lines.push(cur);
  return lines;
};
D.para = function (c, s, x, y, maxW, size, lh, color, opt) {
  opt = opt || {};
  c.font = (opt.weight || '500') + ' ' + size + 'px ' + (opt.title ? D.FONT_T : D.FONT_B);
  var lines = D.wrap(c, s, maxW);
  c.textAlign = opt.align || 'left'; c.textBaseline = 'top'; c.fillStyle = color;
  for (var i = 0; i < lines.length; i++) c.fillText(lines[i], x, y + i * lh);
  return lines.length * lh;
};

// 漆面按钮：red / jade / wood
var THEMES = {
  red: ['#E0584A', '#B32A20', '#7E1710', '#FFE9C4'],
  jade: ['#8CC7A6', '#4E8E6E', '#2C5B44', '#FFF6DE'],
  wood: ['#A87449', '#7A4A27', '#4C2C14', '#FBE8C4'],
  gold: ['#F3D27E', '#CC9A35', '#8A6316', '#4A2A08']
};
D.button = function (c, x, y, w, h, label, theme, pressed, opt) {
  opt = opt || {};
  var t = THEMES[theme || 'red'];
  c.save();
  if (pressed) { c.translate(x + w / 2, y + h / 2); c.scale(0.95, 0.95); c.translate(-x - w / 2, -y - h / 2); }
  var r = Math.min(h / 2, opt.r || h / 2);
  // 投影
  c.globalAlpha = 0.35; D.rr(c, x + 2, y + 8, w, h, r); c.fillStyle = '#2a1608'; c.fill(); c.globalAlpha = 1;
  // 金边
  D.rr(c, x - 4, y - 4, w + 8, h + 8, r + 4);
  var gg = c.createLinearGradient(0, y - 4, 0, y + h + 4);
  gg.addColorStop(0, '#FBE6A6'); gg.addColorStop(0.5, '#C99534'); gg.addColorStop(1, '#7C5512');
  c.fillStyle = gg; c.fill();
  // 漆面
  D.rr(c, x, y, w, h, r);
  var g = c.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, t[0]); g.addColorStop(0.55, t[1]); g.addColorStop(1, t[2]);
  c.fillStyle = g; c.fill();
  // 高光
  c.save(); D.rr(c, x, y, w, h, r); c.clip();
  c.globalAlpha = 0.28; D.rr(c, x + 10, y + 5, w - 20, h * 0.42, r * 0.8); c.fillStyle = '#ffffff'; c.fill();
  c.restore();
  if (label) {
    var fs = opt.size || Math.round(h * 0.4);
    D.text(c, label, x + w / 2, y + h / 2 + (opt.sub ? -fs * 0.28 : 0) + 1, fs, t[3], { title: true, shadow: 'rgba(40,10,0,0.45)', sy: 2 });
    if (opt.sub) D.text(c, opt.sub, x + w / 2, y + h / 2 + fs * 0.55, Math.round(fs * 0.48), t[3], { weight: '600' });
  }
  if (opt.icon) c.drawImage(opt.icon, x + 14, y + (h - h * 0.66) / 2, h * 0.66, h * 0.66);
  c.restore();
};

// 卷轴面板
D.panel = function (c, x, y, w, h) {
  c.save();
  c.globalAlpha = 0.45; D.rr(c, x + 4, y + 14, w, h, 26); c.fillStyle = '#1d0f05'; c.fill(); c.globalAlpha = 1;
  D.rr(c, x - 6, y - 6, w + 12, h + 12, 30);
  var gg = c.createLinearGradient(0, y, 0, y + h);
  gg.addColorStop(0, '#F2D48A'); gg.addColorStop(0.5, '#B98A33'); gg.addColorStop(1, '#F2D48A');
  c.fillStyle = gg; c.fill();
  D.rr(c, x, y, w, h, 24);
  var g = c.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, '#FBF2DC'); g.addColorStop(1, '#EBD9B2');
  c.fillStyle = g; c.fill();
  // 内框细线
  D.rr(c, x + 14, y + 14, w - 28, h - 28, 16);
  c.strokeStyle = 'rgba(150,105,40,0.45)'; c.lineWidth = 2; c.stroke();
  // 云纹角
  c.strokeStyle = 'rgba(176,128,48,0.55)'; c.lineWidth = 3;
  [[x + 30, y + 30, 1, 1], [x + w - 30, y + 30, -1, 1], [x + 30, y + h - 30, 1, -1], [x + w - 30, y + h - 30, -1, -1]].forEach(function (p) {
    c.beginPath(); c.arc(p[0] + 10 * p[2], p[1] + 10 * p[3], 10, 0, Math.PI * 2); c.stroke();
  });
  c.restore();
  // 上下卷轴木杆
  D.roller(c, x - 22, y - 20, w + 44);
  D.roller(c, x - 22, y + h - 4, w + 44);
};
D.roller = function (c, x, y, w) {
  var g = c.createLinearGradient(0, y, 0, y + 26);
  g.addColorStop(0, '#9A5E30'); g.addColorStop(0.5, '#5C3115'); g.addColorStop(1, '#3A1C08');
  D.rr(c, x + 16, y, w - 32, 24, 12); c.fillStyle = g; c.fill();
  var gg = c.createLinearGradient(0, y - 4, 0, y + 28);
  gg.addColorStop(0, '#FBE3A0'); gg.addColorStop(1, '#9C6E1C');
  c.fillStyle = gg;
  D.rr(c, x, y - 4, 24, 32, 8); c.fill();
  D.rr(c, x + w - 24, y - 4, 24, 32, 8); c.fill();
};

// 木质牌匾
D.plaque = function (c, cx, cy, w, h) {
  var x = cx - w / 2, y = cy - h / 2;
  c.save();
  c.beginPath();
  var k = h * 0.28;
  c.moveTo(x + k, y); c.lineTo(x + w - k, y); c.quadraticCurveTo(x + w, y, x + w, y + k);
  c.lineTo(x + w, y + h - k); c.quadraticCurveTo(x + w, y + h, x + w - k, y + h);
  c.lineTo(x + k, y + h); c.quadraticCurveTo(x, y + h, x, y + h - k);
  c.lineTo(x, y + k); c.quadraticCurveTo(x, y, x + k, y); c.closePath();
  var g = c.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, '#A06A3E'); g.addColorStop(0.5, '#6E4122'); g.addColorStop(1, '#4A2810');
  c.fillStyle = g; c.fill();
  c.lineWidth = 4; c.strokeStyle = '#D9AE55'; c.stroke();
  c.lineWidth = 1.5; c.strokeStyle = 'rgba(255,230,170,0.5)';
  D.rr(c, x + 8, y + 7, w - 16, h - 14, 10); c.stroke();
  c.restore();
};

// 手指指引
D.hand = function (c, x, y, s, t) {
  var bob = Math.sin(t * 6) * 8;
  c.save();
  c.translate(x + 10, y + 18 + bob);
  c.scale(s, s);
  c.rotate(-0.35);
  // 波纹
  c.lineWidth = 3;
  var ph = (t * 1.6) % 1;
  c.strokeStyle = 'rgba(255,240,180,' + (1 - ph) + ')';
  c.beginPath(); c.arc(-4, -18, 10 + ph * 30, 0, Math.PI * 2); c.stroke();
  c.fillStyle = '#FFF8E6'; c.strokeStyle = '#6B3E1A'; c.lineWidth = 3.5;
  // 食指
  D.rr(c, -12, -22, 22, 58, 11); c.fill(); c.stroke();
  // 手掌
  D.rr(c, -14, 18, 52, 50, 16); c.fill(); c.stroke();
  // 弯曲的其它手指
  for (var i = 0; i < 3; i++) { D.rr(c, 10 + i * 0, 14 + i * 0, 0, 0, 0); }
  c.beginPath(); c.moveTo(12, 26); c.lineTo(12, 40); c.moveTo(25, 28); c.lineTo(25, 42); c.stroke();
  c.restore();
};

module.exports = D;

};
M["main"]=function(module,exports,require){
// 《山海一箭》主逻辑：场景、关卡玩法、UI
var P = require('./platform');
var CFG = require('./config');
var G = require('./levelgen');
var BEASTS = require('./beasts');
var D = require('./draw');

var LW = 750, LH = 1334;
var scr, ctx, S = 1, VW = LW, VH = LH, X0 = 0, SAFE_T = 0, SAFE_B = 0;
var IMG = {}, BIMG = {}, BSIL = {};
var save, scene = 'loading', modal = null, regions = [], pressedKey = null;
var now = 0, last = 0, toasts = [], parts = [];
var loadProgress = 0;

var COLORS = [
  { base: '#C8372D', dark: '#7E1A13', light: '#F08070', tint: 'rgba(200,55,45,0.16)' },
  { base: '#6FA98A', dark: '#3A6B53', light: '#B4E0C6', tint: 'rgba(111,169,138,0.2)' },
  { base: '#2E3A6B', dark: '#161D3E', light: '#6A7CC0', tint: 'rgba(46,58,107,0.15)' },
  { base: '#D4A443', dark: '#8A6214', light: '#FBE09A', tint: 'rgba(212,164,67,0.22)' }
];
var CN_NUM = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
function cnNum(n) {
  if (n <= 10) return CN_NUM[n];
  if (n < 20) return '十' + CN_NUM[n - 10];
  if (n < 100) return CN_NUM[Math.floor(n / 10)] + '十' + (n % 10 ? CN_NUM[n % 10] : '');
  return String(n);
}
function chapterOf(level) { return Math.floor((level - 1) / 10); }
function beastOfChapter(ch) { return BEASTS[ch % BEASTS.length]; }
function beastUnlocked(i) { return save.maxCleared >= (i + 1) * 10; }

// ---------------- 存档 ----------------
function defaultSave() {
  return { v: 1, maxCleared: 0, stars: {}, assists: { hint: CFG.FREE_ASSISTS.hint, undo: CFG.FREE_ASSISTS.undo, remove: CFG.FREE_ASSISTS.remove },
    sfx: true, music: true, vib: true, checkin: { last: '', count: 0 }, daily: {}, winsSinceAd: 0, seenBeast: {} };
}
function loadSave() {
  var s = P.load(), d = defaultSave();
  if (!s || s.v !== 1) return d;
  for (var k in d) if (s[k] === undefined) s[k] = d[k];
  return s;
}
function persist() { P.save(save); }

// ---------------- 启动 ----------------
var IMAGES = ['bg_game.jpg', 'bg_menu.jpg', 'logo.png', 'corner.png', 'ic_hint.png', 'ic_heartplus.png', 'ic_remove.png', 'ic_zoom.png',
  'ic_daily.png', 'ic_settings.png', 'ic_play.png', 'ic_home.png', 'heart.png', 'star.png', 'star_empty.png', 'lock.png', 'scroll.png', 'coin.png', 'giftbag.png', 'seal.png'];

function start() {
  var s = P.init();
  scr = s; ctx = s.ctx;
  layout();
  P.onResize(function () { var s2 = P.init(); scr = s2; ctx = s2.ctx; layout(); boardCache = null; });
  save = loadSave();
  P.setSfx(save.sfx); P.audioInit(); P.setMusic(save.music);
  P.adsInit(); P.setupShare();
  P.onTouch(onDown, onMove, onUp);
  P.onHide(function () { persist(); });
  P.raf(frame);
  var total = IMAGES.length + BEASTS.length * 2 + 1, done = 0;
  function tick() { done++; loadProgress = done / total; }
  var jobs = IMAGES.map(function (n) { return P.loadImage('images/' + n).then(function (im) { IMG[n.replace(/\.(png|jpg)$/, '')] = im; tick(); }); });
  jobs.push(P.loadFont('ShanHaiTitle', 'fonts/title').then(function (f) { if (f) D.setTitleFont(f); tick(); }));
  Promise.all(jobs).then(function () {
    scene = 'menu';
    return P.loadSubpackage('beasts');
  }).then(function () {
    return Promise.all(BEASTS.map(function (b) {
      return Promise.all([
        P.loadImage('subpkg/beasts/' + b.id + '.png').then(function (im) { BIMG[b.id] = im; tick(); }),
        P.loadImage('subpkg/beasts/' + b.id + '_s.png').then(function (im) { BSIL[b.id] = im; tick(); })
      ]);
    }));
  });
  // 调试入口（浏览器）：?level=80 直接进入关卡
  if (!P.isWx && typeof location !== 'undefined') {
    var q = location.search;
    var m = /level=(\d+)/.exec(q);
    if (m) { var wait = setInterval(function () { if (scene === 'menu') { clearInterval(wait); if (/unlock/.test(q)) save.maxCleared = Math.max(save.maxCleared, +m[1] - 1); startLevel(+m[1]); } }, 50); }
    var sc = /scene=(\w+)/.exec(q);
    if (sc) { var w2 = setInterval(function () { if (scene === 'menu') { clearInterval(w2); if (/unlock/.test(q)) save.maxCleared = Math.max(save.maxCleared, 60); if (sc[1] === 'codex') openCodex(); else if (sc[1] === 'levels') openLevels(); } }, 50); }
    if (typeof window !== 'undefined') window.__game = { startLevel: startLevel, state: function () { return st; }, save: function () { return save; }, autoSolve: autoSolveStep, tap: function (i) { tapSeg(i); }, blocked: function () { for (var i = 0; i < st.board.segs.length; i++) if (st.alive[i] && !st.anims[i] && !G.isFree(st.board, st.occ, i)) return i; return -1; }, cellPx: function (x, y) { var p = cellPx(x, y); return [p[0] * S, p[1] * S]; }, openBeast: function (i) { openBeast(BEASTS[i]); }, openSettings: openSettings, openDaily: openDaily, hint: function () { doHint(); }, scene: function () { return scene; }, modal: function () { return modal; }, openCodex: openCodex, openCheckin: openCheckin };
  }
}

function layout() {
  S = Math.min(scr.w / LW, scr.h / LH);
  VW = scr.w / S; VH = scr.h / S;
  X0 = (VW - LW) / 2;
  SAFE_T = scr.safeTop / S; SAFE_B = scr.safeBottom / S;
}

// ---------------- 主循环 ----------------
function frame(t) {
  P.raf(frame);
  t = t || Date.now();
  var dt = last ? Math.min(0.05, (t - last) / 1000) : 0.016;
  last = t; now += dt;
  update(dt);
  render();
}

function update(dt) {
  if (scene === 'play' && st) updatePlay(dt);
  if (scrollV && !dragging) { scrollY += scrollV * dt; scrollV *= Math.pow(0.04, dt); if (Math.abs(scrollV) < 5) scrollV = 0; clampScroll(); }
  for (var i = parts.length - 1; i >= 0; i--) {
    var p = parts[i]; p.t += dt;
    if (p.t >= p.life) { parts.splice(i, 1); continue; }
    p.x += p.vx * dt; p.y += p.vy * dt; p.vy += (p.g || 0) * dt; p.vx *= (1 - (p.drag || 0) * dt); p.vy *= (1 - (p.drag || 0) * dt);
  }
  for (var j = toasts.length - 1; j >= 0; j--) { toasts[j].t += dt; if (toasts[j].t > 2.2) toasts.splice(j, 1); }
}

function render() {
  var c = ctx;
  c.setTransform(scr.dpr * S, 0, 0, scr.dpr * S, 0, 0);
  regions = [];
  if (scene === 'loading') drawLoading(c);
  else if (scene === 'menu') drawMenu(c);
  else if (scene === 'levels') drawLevels(c);
  else if (scene === 'codex') drawCodex(c);
  else if (scene === 'play') drawPlay(c);
  drawParts(c, 'top');
  if (modal) drawModal(c);
  drawToasts(c);
}

function region(key, x, y, w, h, cb, opt) {
  regions.push({ key: key, x: x, y: y, w: w, h: h, cb: cb, modal: !!(opt && opt.modal), circle: opt && opt.circle });
}
function hitRegion(x, y) {
  for (var i = regions.length - 1; i >= 0; i--) {
    var r = regions[i];
    if (modal && !r.modal) continue;
    if (r.circle) { var dx = x - (r.x + r.w / 2), dy = y - (r.y + r.h / 2); if (dx * dx + dy * dy <= (r.w / 2 + 8) * (r.w / 2 + 8)) return r; }
    else if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) return r;
  }
  return null;
}
function isPressed(key) { return pressedKey === key; }

function toast(s) { toasts = [{ s: s, t: 0 }]; }

function cover(c, img) {
  if (!img) { c.fillStyle = '#EFE2C4'; c.fillRect(0, 0, VW, VH); return; }
  var sc = Math.max(VW / img.width, VH / img.height);
  var w = img.width * sc, h = img.height * sc;
  c.drawImage(img, (VW - w) / 2, (VH - h) / 2, w, h);
}

// ---------------- 输入 ----------------
var downAt = null, dragging = false, scrollY = 0, scrollV = 0, scrollMax = 0, lastMoveY = 0, lastMoveT = 0;
function onDown(x, y) {
  x /= S; y /= S;
  P.unlockAudio();
  downAt = { x: x, y: y, t: now, sy: scrollY };
  dragging = false; scrollV = 0; lastMoveY = y; lastMoveT = now;
  var r = hitRegion(x, y);
  pressedKey = r ? r.key : null;
  if (!r && !modal && scene === 'play') { downAt.board = true; boardTap(x, y); }
}
function onMove(x, y) {
  x /= S; y /= S;
  if (!downAt) return;
  if ((scene === 'levels' || scene === 'codex') && !modal) {
    if (!dragging && Math.abs(y - downAt.y) > 12) { dragging = true; pressedKey = null; }
    if (dragging) {
      scrollY = downAt.sy - (y - downAt.y);
      var dtm = Math.max(0.001, now - lastMoveT);
      scrollV = -(y - lastMoveY) / dtm * 0.6 + scrollV * 0.4;
      lastMoveY = y; lastMoveT = now;
      clampScroll(true);
    }
  }
}
function onUp(x, y) {
  x /= S; y /= S;
  var wasDrag = dragging; dragging = false;
  if (!downAt) return;
  var board = downAt.board; downAt = null;
  if (wasDrag) { clampScroll(); pressedKey = null; return; }
  scrollV = 0;
  if (board) return;
  var r = hitRegion(x, y);
  var pk = pressedKey; pressedKey = null;
  if (r && r.key === pk) { P.play('tap', 0.6); r.cb(); }
}
function clampScroll(soft) {
  if (scrollY < 0) scrollY = soft ? scrollY * 0.6 : 0;
  if (scrollY > scrollMax) scrollY = soft ? scrollMax + (scrollY - scrollMax) * 0.6 : scrollMax;
  if (!soft) { scrollY = Math.max(0, Math.min(scrollMax, scrollY)); }
}

// ---------------- 加载 ----------------
function drawLoading(c) {
  c.fillStyle = '#EFE2C4'; c.fillRect(0, 0, VW, VH);
  var cx = VW / 2, cy = VH / 2;
  D.text(c, '山海一箭', cx, cy - 60, 72, '#3A2410', { title: true });
  c.fillStyle = 'rgba(80,50,20,0.2)'; D.rr(c, cx - 200, cy + 30, 400, 14, 7); c.fill();
  c.fillStyle = '#C8372D'; D.rr(c, cx - 200, cy + 30, 400 * loadProgress, 14, 7); c.fill();
  D.text(c, '研墨中……', cx, cy + 80, 28, '#6B4A26');
}

// ---------------- 主菜单 ----------------
function checkinAvailable() { return save.checkin.last !== P.today(); }
function currentLevel() { return Math.min(CFG.TOTAL_LEVELS, save.maxCleared + 1); }

function drawMenu(c) {
  cover(c, IMG.bg_menu);
  var cx = VW / 2;
  // 顶部暗角，衬托标题
  var vg = c.createLinearGradient(0, 0, 0, VH * 0.35);
  vg.addColorStop(0, 'rgba(255,248,230,0.35)'); vg.addColorStop(1, 'rgba(255,248,230,0)');
  c.fillStyle = vg; c.fillRect(0, 0, VW, VH * 0.35);
  var top = SAFE_T + 40;
  if (IMG.logo) { var lw = 600, lh = lw * IMG.logo.height / IMG.logo.width; c.drawImage(IMG.logo, cx - lw / 2, top, lw, lh); top += lh; }
  D.text(c, '上古异兽 · 一箭破局', cx, top + 30, 32, '#FFF4D6', { title: true, stroke: 'rgba(60,30,10,0.75)', sw: 7 });

  // 守关异兽
  var lv = currentLevel(), ch = chapterOf(lv), b = beastOfChapter(ch);
  var bottomBlock = VH - SAFE_B - 520;
  var by = top + 70 + Math.max(0, (bottomBlock - top - 70) / 2);
  var bim = BIMG[b.id];
  var bs = Math.min(320, Math.max(180, bottomBlock - top - 90));
  var rg = c.createRadialGradient(cx, by, 10, cx, by, bs * 0.75);
  rg.addColorStop(0, 'rgba(255,236,170,0.75)'); rg.addColorStop(1, 'rgba(255,236,170,0)');
  c.fillStyle = rg; c.beginPath(); c.arc(cx, by, bs * 0.75, 0, Math.PI * 2); c.fill();
  if (bim) {
    var sc = bs / Math.max(bim.width, bim.height), bob = Math.sin(now * 2) * 8;
    c.drawImage(bim, cx - bim.width * sc / 2, by - bim.height * sc / 2 + bob, bim.width * sc, bim.height * sc);
  }
  D.text(c, '守关异兽 · ' + b.name, cx, by + bs / 2 + 26, 28, '#FFF4D6', { title: true, stroke: 'rgba(60,30,10,0.8)', sw: 6 });

  // 按钮
  var y0 = VH - SAFE_B - 430;
  D.button(c, cx - 220, y0, 440, 120, '开始游戏', 'red', isPressed('start'), { size: 50, sub: '第 ' + lv + ' 关' });
  region('start', cx - 220, y0, 440, 120, function () { startLevel(lv); });
  var y1 = y0 + 150;
  D.button(c, cx - 220, y1, 205, 92, '选关', 'jade', isPressed('levels'), { size: 36 });
  region('levels', cx - 220, y1, 205, 92, openLevels);
  D.button(c, cx + 15, y1, 205, 92, '每日挑战', 'jade', isPressed('daily'), { size: 36 });
  region('daily', cx + 15, y1, 205, 92, openDaily);

  // 底部圆形按钮
  var y2 = VH - SAFE_B - 110;
  var items = [
    { k: 'codex', img: IMG.scroll, label: '图鉴', cb: openCodex, x: cx - 210 },
    { k: 'checkin', img: IMG.giftbag, label: '签到', cb: openCheckin, x: cx, dot: checkinAvailable() },
    { k: 'settings', img: IMG.ic_settings, label: '设置', cb: openSettings, x: cx + 210 }
  ];
  items.forEach(function (it) { roundIcon(c, it.k, it.x, y2, 104, it.img, it.label, it.cb, { dot: it.dot, framed: it.k !== 'settings' }); });
}

// 圆形图标按钮（带标签）
function roundIcon(c, key, cx, cy, size, img, label, cb, opt) {
  opt = opt || {};
  var pr = isPressed(key) ? 0.92 : 1, s = size * pr;
  if (opt.framed) {
    c.save();
    c.beginPath(); c.arc(cx, cy, s / 2, 0, Math.PI * 2);
    var g = c.createRadialGradient(cx, cy - s * 0.2, 4, cx, cy, s / 2);
    g.addColorStop(0, '#FFF5DA'); g.addColorStop(1, '#D8BE86'); c.fillStyle = g; c.fill();
    c.lineWidth = 5; c.strokeStyle = '#B4832E'; c.stroke();
    c.lineWidth = 2; c.strokeStyle = '#6B4515'; c.beginPath(); c.arc(cx, cy, s / 2 + 3, 0, Math.PI * 2); c.stroke();
    c.restore();
    if (img) { var k = s * 0.72 / Math.max(img.width, img.height); c.drawImage(img, cx - img.width * k / 2, cy - img.height * k / 2, img.width * k, img.height * k); }
  } else if (img) {
    var k2 = s / Math.max(img.width, img.height);
    c.drawImage(img, cx - img.width * k2 / 2, cy - img.height * k2 / 2, img.width * k2, img.height * k2);
  }
  if (opt.disabled) { c.save(); c.globalAlpha = 0.5; c.fillStyle = '#3a2a1a'; c.beginPath(); c.arc(cx, cy, s / 2, 0, Math.PI * 2); c.fill(); c.restore(); }
  if (label) D.text(c, label, cx, cy + size / 2 + 22, 26, '#FFF6DC', { title: true, stroke: 'rgba(50,25,8,0.85)', sw: 6 });
  if (opt.dot) { c.fillStyle = '#E8392B'; c.beginPath(); c.arc(cx + s * 0.36, cy - s * 0.36, 12, 0, Math.PI * 2); c.fill(); c.lineWidth = 3; c.strokeStyle = '#fff'; c.stroke(); }
  if (opt.badge != null) {
    var bx = cx + s * 0.36, byy = cy - s * 0.38;
    if (opt.badge === 'ad') {
      D.rr(c, bx - 30, byy - 16, 60, 32, 16); c.fillStyle = '#2E3A6B'; c.fill(); c.lineWidth = 2.5; c.strokeStyle = '#F3D27E'; c.stroke();
      c.fillStyle = '#FFF2C8'; c.beginPath(); c.moveTo(bx - 14, byy - 8); c.lineTo(bx - 14, byy + 8); c.lineTo(bx - 3, byy); c.closePath(); c.fill();
      D.text(c, '广告', bx + 13, byy + 1, 17, '#FFF2C8', { weight: '700' });
    } else {
      c.fillStyle = '#C8372D'; c.beginPath(); c.arc(bx, byy, 19, 0, Math.PI * 2); c.fill(); c.lineWidth = 3; c.strokeStyle = '#FBE3A0'; c.stroke();
      D.text(c, String(opt.badge), bx, byy + 1, 22, '#fff', { weight: '800' });
    }
  }
  region(key, cx - size / 2, cy - size / 2, size, size, cb, { circle: true, modal: opt.modal });
}

// ---------------- 选关 ----------------
var levelItems = null;
function buildLevelItems() {
  levelItems = []; var y = 0, cols = 5, cell = 128;
  var chapters = Math.ceil(CFG.TOTAL_LEVELS / 10);
  for (var ch = 0; ch < chapters; ch++) {
    levelItems.push({ type: 'ch', ch: ch, y: y, h: 150 }); y += 176;
    for (var i = 0; i < 10; i++) {
      var n = ch * 10 + i + 1; if (n > CFG.TOTAL_LEVELS) break;
      var row = Math.floor(i / cols), col = i % cols;
      levelItems.push({ type: 'lv', n: n, y: y + row * (cell + 34), x: col * cell + cell / 2 + (LW - cols * cell) / 2, h: cell });
    }
    y += 2 * (cell + 34) + 24;
  }
  levelItems.total = y;
}
function openLevels() {
  if (!levelItems) buildLevelItems();
  scene = 'levels';
  var cur = currentLevel(), ch = chapterOf(cur);
  for (var i = 0; i < levelItems.length; i++) if (levelItems[i].type === 'ch' && levelItems[i].ch === ch) scrollY = levelItems[i].y - 20;
  scrollMax = Math.max(0, levelItems.total - (VH - SAFE_T - 150) + 80);
  clampScroll();
}
function headerBar(c, title, back) {
  var y = SAFE_T + 14;
  var g = c.createLinearGradient(0, 0, 0, y + 110);
  g.addColorStop(0, 'rgba(60,35,15,0.92)'); g.addColorStop(1, 'rgba(60,35,15,0.78)');
  c.fillStyle = g; c.fillRect(0, 0, VW, y + 100);
  c.fillStyle = '#C99534'; c.fillRect(0, y + 100, VW, 4);
  roundIcon(c, 'back', X0 + 66, y + 50, 84, IMG.ic_home, null, back);
  D.text(c, title, VW / 2, y + 50, 44, '#FBE6B0', { title: true, shadow: 'rgba(0,0,0,0.5)' });
  return y + 104;
}
function drawLevels(c) {
  cover(c, IMG.bg_game);
  c.fillStyle = 'rgba(250,240,215,0.35)'; c.fillRect(0, 0, VW, VH);
  var top = SAFE_T + 118;
  scrollMax = Math.max(0, levelItems.total - (VH - top) + 60);
  c.save(); c.beginPath(); c.rect(0, top, VW, VH - top); c.clip();
  var off = top + 20 - scrollY, cur = currentLevel();
  for (var i = 0; i < levelItems.length; i++) {
    var it = levelItems[i], y = it.y + off;
    if (y > VH + 20 || y + it.h < top - 20) continue;
    if (it.type === 'ch') {
      var b = beastOfChapter(it.ch), unlocked = beastUnlocked(it.ch % BEASTS.length) || it.ch >= BEASTS.length && save.maxCleared >= (it.ch + 1) * 10;
      var x = X0 + 30, w = LW - 60;
      c.save(); c.globalAlpha = 0.92; D.rr(c, x, y, w, it.h, 22);
      var g = c.createLinearGradient(x, 0, x + w, 0); g.addColorStop(0, '#6E4122'); g.addColorStop(1, '#4A2810');
      c.fillStyle = g; c.fill(); c.restore();
      D.rr(c, x, y, w, it.h, 22); c.lineWidth = 3; c.strokeStyle = '#D4A443'; c.stroke();
      var im = unlocked ? BIMG[b.id] : BSIL[b.id];
      if (im) { var k = 128 / Math.max(im.width, im.height); c.drawImage(im, x + 20 + (128 - im.width * k) / 2, y + 11 + (128 - im.height * k) / 2, im.width * k, im.height * k); }
      D.text(c, '第' + cnNum(it.ch + 1) + '章 · ' + b.place, x + 170, y + 52, 38, '#FBE6B0', { title: true, align: 'left' });
      var got = 0, done = 0;
      for (var n = it.ch * 10 + 1; n <= it.ch * 10 + 10; n++) { if (save.stars[n]) { got += save.stars[n]; done++; } }
      D.text(c, '守关异兽：' + (unlocked ? b.name : '？？？') + '   ' + done + '/10 关  ★' + got, x + 170, y + 104, 24, '#E9D3A2', { align: 'left' });
    } else {
      var lx = X0 + it.x, ly = y + it.h / 2 - 12, locked = it.n > cur, r = 50;
      var key = 'lv' + it.n, pr = isPressed(key) ? 0.92 : 1;
      c.save(); c.translate(lx, ly); c.scale(pr, pr);
      c.beginPath(); c.arc(0, 4, r + 6, 0, Math.PI * 2); c.fillStyle = 'rgba(40,20,5,0.3)'; c.fill();
      c.beginPath(); c.arc(0, 0, r + 6, 0, Math.PI * 2);
      var gg = c.createLinearGradient(0, -r, 0, r); gg.addColorStop(0, '#FBE3A0'); gg.addColorStop(1, '#8C6216'); c.fillStyle = gg; c.fill();
      c.beginPath(); c.arc(0, 0, r, 0, Math.PI * 2);
      var g2 = c.createRadialGradient(-12, -16, 4, 0, 0, r);
      if (locked) { g2.addColorStop(0, '#B9B2A4'); g2.addColorStop(1, '#6E675C'); }
      else if (it.n % 10 === 0) { g2.addColorStop(0, '#F08070'); g2.addColorStop(1, '#8E1F18'); }
      else { g2.addColorStop(0, '#A9DDBF'); g2.addColorStop(1, '#3F7259'); }
      c.fillStyle = g2; c.fill();
      if (locked && IMG.lock) c.drawImage(IMG.lock, -24, -26, 48, 52);
      else D.text(c, String(it.n), 0, 2, it.n >= 100 ? 34 : 40, '#FFF8E4', { title: true, stroke: 'rgba(30,20,10,0.55)', sw: 5 });
      if (it.n === cur) { c.lineWidth = 5; c.strokeStyle = 'rgba(255,230,140,' + (0.6 + 0.4 * Math.sin(now * 5)) + ')'; c.beginPath(); c.arc(0, 0, r + 12, 0, Math.PI * 2); c.stroke(); }
      c.restore();
      var stars = save.stars[it.n] || 0;
      if (!locked) for (var s = 0; s < 3; s++) { var si = s < stars ? IMG.star : IMG.star_empty; if (si) c.drawImage(si, lx - 45 + s * 30, ly + r + 2, 30, 30); }
      if (!locked) region(key, lx - r, ly - r, 2 * r, 2 * r, (function (n) { return function () { startLevel(n); }; })(it.n), { circle: true });
    }
  }
  c.restore();
  headerBar(c, '选择关卡', function () { scene = 'menu'; });
}

// ---------------- 图鉴 ----------------
var codexReturn = 'menu';
function openCodex() { codexReturn = scene === 'play' ? 'play' : 'menu'; scene = 'codex'; scrollY = 0; scrollV = 0; }
function drawCodex(c) {
  cover(c, IMG.bg_game);
  c.fillStyle = 'rgba(250,240,215,0.4)'; c.fillRect(0, 0, VW, VH);
  var top = SAFE_T + 118, cols = 3, cw = 214, ch = 268, gap = 18;
  var got = 0; for (var i = 0; i < BEASTS.length; i++) if (beastUnlocked(i)) got++;
  var rows = Math.ceil(BEASTS.length / cols);
  scrollMax = Math.max(0, 90 + rows * (ch + gap) + 40 - (VH - top - SAFE_B));
  c.save(); c.beginPath(); c.rect(0, top, VW, VH - top); c.clip();
  var off = top + 20 - scrollY;
  D.text(c, '已收集 ' + got + ' / ' + BEASTS.length + ' 只异兽 · 每通关 10 关解锁一只', VW / 2, off + 26, 26, '#5A3A1A', { title: true });
  var sx = X0 + (LW - cols * cw - (cols - 1) * gap) / 2;
  for (var k = 0; k < BEASTS.length; k++) {
    var b = BEASTS[k], col = k % cols, row = Math.floor(k / cols);
    var x = sx + col * (cw + gap), y = off + 70 + row * (ch + gap);
    if (y > VH || y + ch < top) continue;
    var un = beastUnlocked(k), key = 'cx' + k, pr = isPressed(key) ? 0.95 : 1;
    c.save(); c.translate(x + cw / 2, y + ch / 2); c.scale(pr, pr); c.translate(-cw / 2, -ch / 2);
    c.globalAlpha = 0.3; D.rr(c, 3, 8, cw, ch, 20); c.fillStyle = '#2a1608'; c.fill(); c.globalAlpha = 1;
    D.rr(c, 0, 0, cw, ch, 20);
    var g = c.createLinearGradient(0, 0, 0, ch); g.addColorStop(0, un ? '#FCF4DE' : '#D9CDB4'); g.addColorStop(1, un ? '#EAD5A6' : '#B9AB90');
    c.fillStyle = g; c.fill(); c.lineWidth = 4; c.strokeStyle = un ? '#C99534' : '#8A7A60'; c.stroke();
    var im = un ? BIMG[b.id] : BSIL[b.id];
    if (im) { var s = 170 / Math.max(im.width, im.height); c.drawImage(im, (cw - im.width * s) / 2, 14 + (170 - im.height * s) / 2, im.width * s, im.height * s); }
    D.rr(c, 14, ch - 70, cw - 28, 54, 14); c.fillStyle = un ? '#7A2A1C' : '#6E675C'; c.fill();
    D.text(c, un ? b.name : '第 ' + (k + 1) * 10 + ' 关解锁', cw / 2, ch - 42, un ? 32 : 24, '#FBE6B0', { title: un });
    c.restore();
    if (un) region(key, x, y, cw, ch, (function (bb) { return function () { openBeast(bb); }; })(b));
  }
  c.restore();
  headerBar(c, '异兽图鉴', function () { scene = codexReturn; });
}
function openBeast(b) { modal = { type: 'beast', b: b, t: 0 }; }

// ---------------- 关卡玩法 ----------------
var st = null, boardCache = null;
function startLevel(n, daily) {
  var board = daily ? G.getDaily(daily) : G.getLevel(n);
  st = {
    n: n, daily: daily || null, board: board, alive: board.segs.map(function () { return true; }),
    occ: null, hearts: CFG.HEARTS, anims: {}, combo: 0, lastRemove: -9, qishi: 0, hint: -1, hintT: 0,
    misses: 0, undoUsed: false, revived: false, removeMode: false, won: false, winT: 0, failed: false, removedCount: 0,
    tut: n === 1 && !daily ? 0 : -1, flash: {}, shakeT: 0, heartAnim: [], startT: now
  };
  st.occ = G.buildOcc(board, st.alive);
  modal = null; scene = 'play'; boardCache = null; parts = [];
  computeBoardLayout();
  if (!daily && n === 2) toast('撞到其他箭会失去 1 颗心');
}
var BL = null; // 棋盘布局
function computeBoardLayout() {
  var b = st.board, pad = 30;
  var top = SAFE_T + 14 + 104 + 64, bottom = VH - SAFE_B - 210;
  var availW = LW - 40 - pad * 2, availH = bottom - top - pad * 2;
  var cell = Math.min(availW / b.w, availH / b.h, 120);
  var bw = cell * b.w + pad * 2, bh = cell * b.h + pad * 2;
  BL = { cell: cell, pad: pad, x: X0 + (LW - bw) / 2, y: top + (bottom - top - bh) / 2, w: bw, h: bh };
  BL.ox = BL.x + pad; BL.oy = BL.y + pad;
}
function cellPx(cx, cy) { return [BL.ox + (cx + 0.5) * BL.cell, BL.oy + (cy + 0.5) * BL.cell]; }

function buildBoardCache() {
  var k = scr.dpr * S, M = 14;
  var cv = P.createOffscreen((BL.w + M * 2) * k, (BL.h + M * 2) * k), c = cv.getContext('2d');
  c.setTransform(k, 0, 0, k, M * k, M * k);
  var w = BL.w, h = BL.h, pad = BL.pad, b = st.board, cell = BL.cell;
  // 檀木外框
  D.rr(c, 0, 0, w, h, 26);
  var g = c.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#8A5530'); g.addColorStop(0.5, '#6A3B1C'); g.addColorStop(1, '#4E2A12');
  c.fillStyle = g; c.fill();
  // 木纹
  c.save(); D.rr(c, 0, 0, w, h, 26); c.clip();
  var rr = 12345;
  function rnd() { rr = (rr * 16807) % 2147483647; return rr / 2147483647; }
  c.lineWidth = 1.2;
  for (var i = 0; i < 70; i++) {
    var yy = rnd() * h; c.strokeStyle = 'rgba(' + (rnd() < 0.5 ? '30,12,2' : '190,130,80') + ',' + (0.08 + rnd() * 0.12) + ')';
    c.beginPath(); c.moveTo(0, yy);
    for (var xx = 0; xx <= w; xx += 40) c.lineTo(xx, yy + Math.sin(xx / 70 + i) * 4 + (rnd() - 0.5) * 2);
    c.stroke();
  }
  c.restore();
  // 金线
  D.rr(c, 5, 5, w - 10, h - 10, 22); c.lineWidth = 3; c.strokeStyle = '#E2B65C'; c.stroke();
  D.rr(c, pad - 9, pad - 9, w - 2 * pad + 18, h - 2 * pad + 18, 12); c.lineWidth = 4; c.strokeStyle = '#D4A443'; c.stroke();
  D.rr(c, pad - 4, pad - 4, w - 2 * pad + 8, h - 2 * pad + 8, 9); c.lineWidth = 2; c.strokeStyle = '#3A1E0A'; c.stroke();
  // 宣纸格
  var ig = c.createLinearGradient(0, pad, 0, h - pad); ig.addColorStop(0, '#FAF0D8'); ig.addColorStop(1, '#EEDDB6');
  c.fillStyle = ig; D.rr(c, pad - 2, pad - 2, w - 2 * pad + 4, h - 2 * pad + 4, 8); c.fill();
  // 内阴影
  c.save(); D.rr(c, pad - 2, pad - 2, w - 2 * pad + 4, h - 2 * pad + 4, 8); c.clip();
  var sh = c.createLinearGradient(0, pad, 0, pad + 26); sh.addColorStop(0, 'rgba(90,50,10,0.25)'); sh.addColorStop(1, 'rgba(90,50,10,0)');
  c.fillStyle = sh; c.fillRect(pad, pad - 2, w, 26);
  c.restore();
  c.strokeStyle = 'rgba(140,100,50,0.16)'; c.lineWidth = 1.5;
  for (var x = 1; x < b.w; x++) { c.beginPath(); c.moveTo(pad + x * cell, pad); c.lineTo(pad + x * cell, h - pad); c.stroke(); }
  for (var y = 1; y < b.h; y++) { c.beginPath(); c.moveTo(pad, pad + y * cell); c.lineTo(w - pad, pad + y * cell); c.stroke(); }
  c.fillStyle = 'rgba(140,100,50,0.4)';
  for (var x2 = 1; x2 < b.w; x2++) for (var y2 = 1; y2 < b.h; y2++) { c.beginPath(); c.arc(pad + x2 * cell, pad + y2 * cell, Math.max(2, cell * 0.035), 0, Math.PI * 2); c.fill(); }
  // 角花
  if (IMG.corner) {
    var cs = Math.min(170, Math.max(110, Math.min(w, h) * 0.26)), im = IMG.corner;
    var cw = cs, chh = cs * im.height / im.width;
    [[0, 0, 1, 1], [w, 0, -1, 1], [0, h, 1, -1], [w, h, -1, -1]].forEach(function (q) {
      c.save(); c.translate(q[0], q[1]); c.scale(q[2], q[3]); c.drawImage(im, -12, -12, cw, chh); c.restore();
    });
  }
  boardCache = { cv: cv, k: k, m: M };
}

// 蛇形路径：参数 t 处的位置（格坐标）
function segPoint(seg, t) {
  var cells = seg.cells, L = cells.length, d = G.headDir(cells);
  function P_(i) {
    if (i < L) return cells[i];
    var hd = cells[L - 1], k = i - L + 1; return [hd[0] + d[0] * k, hd[1] + d[1] * k];
  }
  var i = Math.floor(t), f = t - i;
  var a = P_(Math.max(0, i)), b = P_(Math.max(0, i + 1));
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
}
function segPoly(seg, s) {
  var L = seg.cells.length, pts = [segPoint(seg, s)];
  for (var i = Math.floor(s) + 1; i < s + L - 1; i++) pts.push(segPoint(seg, i));
  pts.push(segPoint(seg, s + L - 1));
  return pts;
}

function boardTap(x, y) {
  if (!st || st.won || st.failed || !BL) return;
  var cx = (x - BL.ox) / BL.cell - 0.5, cy = (y - BL.oy) / BL.cell - 0.5;
  if (cx < -1 || cy < -1 || cx > st.board.w || cy > st.board.h) { if (st.removeMode) { st.removeMode = false; toast('已取消去除'); } return; }
  var best = -1, bd = 0.62;
  for (var i = 0; i < st.board.segs.length; i++) {
    if (!st.alive[i] || st.anims[i]) continue;
    var cl = st.board.segs[i].cells;
    for (var k = 0; k < cl.length; k++) {
      var a = cl[k], b = cl[Math.min(k + 1, cl.length - 1)];
      var dd = distSeg(cx, cy, a[0], a[1], b[0], b[1]);
      if (dd < bd) { bd = dd; best = i; }
    }
  }
  if (best < 0) { if (st.removeMode) { st.removeMode = false; toast('已取消去除'); } return; }
  if (st.removeMode) { st.removeMode = false; useAssist('remove', function () { removeSeg(best, true); }); return; }
  if (st.tut >= 0) {
    var want = tutTarget();
    if (want >= 0 && best !== want && G.isFree(st.board, st.occ, best)) { /* 允许 */ }
  }
  tapSeg(best);
}
function distSeg(px, py, ax, ay, bx, by) {
  var dx = bx - ax, dy = by - ay, l = dx * dx + dy * dy, t = l ? ((px - ax) * dx + (py - ay) * dy) / l : 0;
  t = Math.max(0, Math.min(1, t));
  var qx = ax + dx * t - px, qy = ay + dy * t - py; return Math.sqrt(qx * qx + qy * qy);
}

function tapSeg(i) {
  var b = st.board, seg = b.segs[i], ray = G.rayCells(b.w, b.h, seg.cells);
  var blockAt = -1;
  for (var r = 0; r < ray.length; r++) if (st.occ[ray[r]] >= 0) { blockAt = r; break; }
  if (st.hint === i) st.hint = -1;
  if (blockAt < 0) { removeSeg(i, false); return; }
  // 撞击
  var blocker = st.occ[ray[blockAt]];
  st.anims[i] = { type: 'bump', t: 0, k: blockAt + 0.28, blocker: blocker, hit: false };
}

function removeSeg(i, byAssist) {
  var seg = st.board.segs[i], L = seg.cells.length;
  var ray = G.rayCells(st.board.w, st.board.h, seg.cells);
  st.alive[i] = false; st.occ = G.buildOcc(st.board, st.alive);
  st.removedCount++;
  if (byAssist) {
    st.anims[i] = { type: 'dissolve', t: 0 };
    P.play('remove');
    seg.cells.forEach(function (cc) { var p = cellPx(cc[0], cc[1]); burst(p[0], p[1], 10, 'ink'); burst(p[0], p[1], 6, 'gold'); });
  } else {
    st.anims[i] = { type: 'exit', t: 0, dist: ray.length + L + 4 };
    if (now - st.lastRemove < 1.6) st.combo++; else st.combo = 1;
    st.lastRemove = now;
    P.play('pluck' + Math.min(7, st.combo - 1));
    st.qishi = Math.min(1.2, st.qishi + 0.1 + 0.05 * Math.min(st.combo, 6));
    if (st.combo >= 3) floatText(cellPx(seg.cells[L - 1][0], seg.cells[L - 1][1]), '连击 ×' + st.combo, '#FBE09A');
    if (st.qishi >= 1) {
      st.qishi = 0.35;
      floatText([VW / 2, BL.y + BL.h / 2], '气势如虹', '#FFE7A0', 64);
      burst(VW / 2, BL.y + BL.h / 2, 60, 'gold', 520);
    }
  }
  if (st.tut >= 0) st.tut++;
  if (st.hint >= 0 && !st.alive[st.hint]) st.hint = -1;
}

function updatePlay(dt) {
  if (st.hintT > 0) { st.hintT -= dt; if (st.hintT <= 0) st.hint = -1; }
  st.qishi = Math.max(0, st.qishi - dt * 0.06);
  if (st.shakeT > 0) st.shakeT -= dt;
  for (var k in st.flash) { st.flash[k] -= dt; if (st.flash[k] <= 0) delete st.flash[k]; }
  for (var h = st.heartAnim.length - 1; h >= 0; h--) { st.heartAnim[h].t += dt; if (st.heartAnim[h].t > 0.8) st.heartAnim.splice(h, 1); }
  var V = CFG.SLIDE_SPEED;
  for (var key in st.anims) {
    var a = st.anims[key], i = +key, seg = st.board.segs[i];
    a.t += dt;
    if (a.type === 'exit') {
      var acc = 0.07;
      a.s = a.t < acc ? V * a.t * a.t / (2 * acc) : V * (a.t - acc / 2);
      // 金色墨迹拖尾
      var hp = segPoint(seg, a.s + seg.cells.length - 1), px = cellPx(hp[0], hp[1]);
      var n = 2 + Math.min(4, st.combo);
      for (var q = 0; q < n; q++) spawn(px[0] + (Math.random() - 0.5) * BL.cell * 0.3, px[1] + (Math.random() - 0.5) * BL.cell * 0.3, 'gold');
      if (a.s >= a.dist) delete st.anims[key];
    } else if (a.type === 'bump') {
      var tf = a.k / V;
      if (a.t < tf) { var u = a.t / tf; a.s = a.k * (u * u * (3 - 2 * u)); }
      else if (a.t < tf + 0.32) {
        a.s = a.k;
        if (!a.hit) {
          a.hit = true; st.flash[i] = 0.5; st.flash[a.blocker] = 0.35; st.shakeT = 0.3;
          P.play('hit'); if (save.vib) P.vibrate();
          var hp2 = segPoint(seg, a.s + seg.cells.length - 1), p2 = cellPx(hp2[0], hp2[1]);
          burst(p2[0], p2[1], 14, 'red');
          loseHeart();
        }
      } else if (a.t < tf + 0.32 + 0.24) { var u2 = (a.t - tf - 0.32) / 0.24; a.s = a.k * (1 - u2 * u2); }
      else delete st.anims[key];
    } else if (a.type === 'dissolve') {
      if (a.t > 0.5) delete st.anims[key];
    }
  }
  // 胜利判定
  if (!st.won && !st.failed && st.removedCount === st.board.segs.length && Object.keys(st.anims).length === 0) win();
  if (st.won) {
    st.winT += dt;
    if (st.winT > 0.05 && st.winT < 1.0 && Math.random() < dt * 6) {
      var x = BL.x + BL.w * (0.15 + Math.random() * 0.7), y = BL.y + BL.h * (0.15 + Math.random() * 0.7);
      burst(x, y, 1, 'blot'); burst(x, y, 18, 'gold', 420);
    }
    if (st.winT < 2.2 && Math.random() < dt * 30) spawn(Math.random() * VW, -20, 'petal');
    if (st.winT > 1.5 && !modal) showWin();
  }
}

function loseHeart() {
  if (st.n === 1 && !st.daily) { toast('被挡住了！先让前面的箭飞走'); return; }
  st.hearts--; st.misses++;
  st.heartAnim.push({ i: st.hearts, t: 0 });
  if (st.hearts <= 0) {
    st.failed = true;
    setTimeout(function () { P.play('fail'); modal = { type: 'fail', t: 0 }; }, 650);
  }
}

function win() {
  st.won = true; st.winT = 0; st.hint = -1;
  P.play('win');
  var stars = st.revived ? 1 : st.hearts;
  st.stars = stars;
  if (st.daily) {
    var first = !save.daily[st.daily];
    save.daily[st.daily] = Math.max(save.daily[st.daily] || 0, stars);
    if (first) { save.assists.hint += 1; st.dailyReward = true; }
  } else {
    save.stars[st.n] = Math.max(save.stars[st.n] || 0, stars);
    var wasMax = save.maxCleared;
    save.maxCleared = Math.max(save.maxCleared, st.n);
    if (st.n % 10 === 0 && st.n > wasMax) {
      var bi = st.n / 10 - 1;
      if (bi < BEASTS.length) st.unlock = BEASTS[bi];
    }
    save.winsSinceAd++;
  }
  persist();
}
function showWin() {
  modal = { type: 'win', t: 0 };
  if (st.unlock) setTimeout(function () { P.play('unlock'); }, 900);
}

// ---------------- 道具 ----------------
var ASSIST_NAME = { hint: '提示', undo: '撤销', remove: '去除' };
function useAssist(kind, apply) {
  if (save.assists[kind] > 0) { save.assists[kind]--; persist(); apply(); return; }
  modal = { type: 'ad', kind: kind, t: 0, apply: apply };
}
function doHint() {
  if (st.won || st.failed) return;
  var free = [];
  for (var i = 0; i < st.board.segs.length; i++) if (st.alive[i] && !st.anims[i] && G.isFree(st.board, st.occ, i)) free.push(i);
  if (!free.length) { toast('稍等，箭还在飞'); return; }
  if (st.hint >= 0 && st.alive[st.hint]) { toast('先点亮着的那支箭吧'); return; }
  useAssist('hint', function () {
    // 优先提示“能解放其他箭”的那支
    var bestI = free[0], bestScore = -1;
    free.forEach(function (f) {
      var sc = 0, cells = st.board.segs[f].cells;
      for (var j = 0; j < st.board.segs.length; j++) if (st.alive[j] && j !== f) {
        var ray = G.rayCells(st.board.w, st.board.h, st.board.segs[j].cells);
        for (var r = 0; r < ray.length; r++) { var o = st.occ[ray[r]]; if (o >= 0) { if (o === f) sc++; break; } }
      }
      if (sc > bestScore) { bestScore = sc; bestI = f; }
    });
    st.hint = bestI; st.hintT = 8;
  });
}
function doUndo() {
  if (st.won || st.failed) return;
  if (st.undoUsed) { toast('每关只能撤销一次'); return; }
  if (st.misses === 0 || st.hearts >= CFG.HEARTS) { toast('还没有失误可以撤销'); return; }
  useAssist('undo', function () {
    st.undoUsed = true; st.hearts++; st.misses--;
    floatText([X0 + 150, SAFE_T + 64], '+1', '#FF8A7A', 44);
    toast('已撤销上一次失误，恢复 1 颗心');
  });
}
function doRemove() {
  if (st.won || st.failed) return;
  if (st.removeMode) { st.removeMode = false; toast('已取消去除'); return; }
  st.removeMode = true; toast('点选一支要去除的箭');
}

// ---------------- 粒子 ----------------
function spawn(x, y, type, sp) {
  var a = Math.random() * Math.PI * 2, v = (sp || 60) * (0.3 + Math.random());
  var p = { x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, t: 0, life: 0.5 + Math.random() * 0.5, type: type, r: 3 + Math.random() * 5, drag: 2 };
  if (type === 'gold') { p.col = Math.random() < 0.5 ? '#FFE08A' : '#F5B83D'; p.vy -= 20; }
  if (type === 'red') { p.col = '#E8483A'; p.life = 0.45; }
  if (type === 'ink') { p.col = 'rgba(30,22,16,0.6)'; p.r = 6 + Math.random() * 10; p.life = 0.7; }
  if (type === 'blot') { p.vx = 0; p.vy = 0; p.r = 30 + Math.random() * 50; p.life = 1.4; p.col = 'rgba(30,25,20,0.3)'; p.rot = Math.random() * 6; }
  if (type === 'petal') { p.col = ['#E8695A', '#F3B8B0', '#FBE09A', '#A3D2B6', '#FFFFFF'][Math.floor(Math.random() * 5)]; p.vx = (Math.random() - 0.5) * 120; p.vy = 60 + Math.random() * 120; p.g = 40; p.drag = 0.3; p.life = 2.6; p.r = 6 + Math.random() * 6; p.rot = Math.random() * 6; p.spin = (Math.random() - 0.5) * 6; }
  if (type === 'confetti') { p.col = ['#C8372D', '#6FA98A', '#D4A443', '#2E3A6B'][Math.floor(Math.random() * 4)]; p.g = 500; p.life = 1.6; p.drag = 0.5; }
  parts.push(p);
  if (parts.length > 900) parts.shift();
}
function burst(x, y, n, type, sp) { for (var i = 0; i < n; i++) spawn(x, y, type, sp || (type === 'gold' ? 260 : 160)); }
function floatText(p, s, col, size) { parts.push({ x: p[0], y: p[1], vx: 0, vy: -70, t: 0, life: 1.2, type: 'text', s: s, col: col, size: size || 40 }); }
function drawParts(c) {
  for (var i = 0; i < parts.length; i++) {
    var p = parts[i], u = p.t / p.life, al = 1 - u;
    if (p.type === 'text') {
      c.globalAlpha = Math.min(1, al * 2);
      D.text(c, p.s, p.x, p.y, p.size * (1 + 0.2 * Math.min(1, p.t * 6)), p.col, { title: true, stroke: 'rgba(60,20,5,0.85)', sw: 8 });
      continue;
    }
    if (p.type === 'blot') {
      // 水墨晕染：一圈柔和的墨色涟漪 + 中心淡墨
      var r = p.r * (0.3 + (1 - Math.pow(1 - Math.min(1, u * 1.6), 3)) * 1.1);
      c.globalAlpha = 0.5 * al;
      var gr = c.createRadialGradient(p.x, p.y, r * 0.05, p.x, p.y, r);
      gr.addColorStop(0, 'rgba(255,214,120,0.55)'); gr.addColorStop(0.55, 'rgba(120,80,40,0.12)'); gr.addColorStop(0.9, 'rgba(60,40,22,0.32)'); gr.addColorStop(1, 'rgba(60,40,22,0)');
      c.fillStyle = gr; c.beginPath(); c.arc(p.x, p.y, r, 0, Math.PI * 2); c.fill();
      continue;
    }
    if (p.type === 'petal') {
      c.save(); c.globalAlpha = Math.min(1, al * 2); c.translate(p.x, p.y); c.rotate(p.rot + p.t * p.spin); c.scale(1, 0.55 + 0.45 * Math.sin(p.t * 6 + p.rot));
      c.fillStyle = p.col; c.beginPath(); c.ellipse ? c.ellipse(0, 0, p.r * 1.6, p.r, 0, 0, Math.PI * 2) : c.arc(0, 0, p.r, 0, Math.PI * 2); c.fill();
      c.restore(); continue;
    }
    c.globalAlpha = al;
    c.fillStyle = p.col;
    c.beginPath(); c.arc(p.x, p.y, p.r * (p.type === 'ink' ? (0.6 + u) : (1 - u * 0.6)), 0, Math.PI * 2); c.fill();
    if (p.type === 'gold' && p.r > 5) { c.globalAlpha = al * 0.35; c.beginPath(); c.arc(p.x, p.y, p.r * 2.2, 0, Math.PI * 2); c.fill(); }
  }
  c.globalAlpha = 1;
}

// ---------------- 绘制：关卡 ----------------
function tutTarget() {
  if (st.tut < 0 || st.tut > 2) return -1;
  var order = [0, 2, 1];
  return order[st.tut];
}

function drawPlay(c) {
  cover(c, IMG.bg_game);
  if (!BL) computeBoardLayout();
  if (!boardCache) buildBoardCache();
  var shx = 0, shy = 0;
  if (st.shakeT > 0) { shx = (Math.random() - 0.5) * 10 * st.shakeT / 0.3; shy = (Math.random() - 0.5) * 10 * st.shakeT / 0.3; }
  c.save(); c.translate(shx, shy);
  c.drawImage(boardCache.cv, BL.x - boardCache.m, BL.y - boardCache.m, boardCache.cv.width / boardCache.k, boardCache.cv.height / boardCache.k);
  drawSegments(c);
  c.restore();
  drawParts(c);
  drawHUD(c);
  drawAssistBar(c);
  // 教学指引
  var tt = tutTarget();
  if (tt >= 0 && st.alive[tt] && !st.anims[tt] && !st.won) {
    var sg = st.board.segs[tt], mid = sg.cells[Math.floor(sg.cells.length / 2)], pp = cellPx(mid[0], mid[1]);
    D.hand(c, pp[0], pp[1], 1.1, now);
  } else if (st.hint >= 0 && st.alive[st.hint] && !st.anims[st.hint]) {
    var sh = st.board.segs[st.hint], hm = sh.cells[sh.cells.length - 1], hp = cellPx(hm[0], hm[1]);
    D.hand(c, hp[0], hp[1], 0.9, now);
  }
  if (st.won && st.unlock == null && st.winT > 0.2) drawWinBeast(c);
  else if (st.won && st.winT > 0.2) drawWinBeast(c);
}

function drawWinBeast(c) {
  var b = beastOfChapter(chapterOf(st.daily ? currentLevel() : st.n)), im = BIMG[b.id];
  if (!im || modal) return;
  var u = Math.min(1, (st.winT - 0.2) / 0.5), sc = 0.2 + 0.8 * (1 - Math.pow(1 - u, 3)) + Math.sin(st.winT * 10) * 0.03 * (1 - u);
  var s = 320 / Math.max(im.width, im.height) * sc;
  c.save(); c.globalAlpha = u;
  var cx = VW / 2, cy = BL.y + BL.h / 2;
  var rg = c.createRadialGradient(cx, cy, 10, cx, cy, 260); rg.addColorStop(0, 'rgba(255,230,150,0.9)'); rg.addColorStop(1, 'rgba(255,230,150,0)');
  c.fillStyle = rg; c.beginPath(); c.arc(cx, cy, 260, 0, Math.PI * 2); c.fill();
  c.translate(cx, cy + Math.sin(st.winT * 4) * 8); c.rotate(Math.sin(st.winT * 3) * 0.05);
  c.drawImage(im, -im.width * s / 2, -im.height * s / 2, im.width * s, im.height * s);
  c.restore();
}

function drawSegments(c) {
  var b = st.board, cell = BL.cell;
  // 底色圆
  for (var y = 0; y < b.h; y++) for (var x = 0; x < b.w; x++) {
    var o = st.occ[y * b.w + x], p = cellPx(x, y);
    if (o >= 0 && !st.anims[o]) { c.fillStyle = COLORS[b.segs[o].color].tint; c.beginPath(); c.arc(p[0], p[1], cell * 0.4, 0, Math.PI * 2); c.fill(); }
    else { c.fillStyle = 'rgba(176,128,48,0.45)'; c.beginPath(); c.arc(p[0], p[1], Math.max(2.5, cell * 0.05), 0, Math.PI * 2); c.fill(); }
  }
  // 提示光晕
  for (var i = 0; i < b.segs.length; i++) {
    var a = st.anims[i];
    if (!st.alive[i] && !a) continue;
    var s = a && a.s ? a.s : 0, alpha = 1;
    if (a && a.type === 'exit') { alpha = Math.max(0, Math.min(1, (a.dist - s) / 3)); }
    if (a && a.type === 'dissolve') { alpha = 1 - a.t / 0.5; }
    var glow = (st.hint === i) ? 0.5 + 0.5 * Math.sin(now * 7) : (st.removeMode && st.alive[i] ? 0.35 + 0.25 * Math.sin(now * 6) : 0);
    drawArrow(c, b.segs[i], s, alpha, st.flash[i] ? st.flash[i] : 0, glow, a && a.type === 'dissolve' ? 1 + a.t : 1);
  }
}

function drawArrow(c, seg, s, alpha, flash, glow, scale) {
  var cell = BL.cell, col = COLORS[seg.color], pts = segPoly(seg, s).map(function (p) { return cellPx(p[0], p[1]); });
  var w = cell * 0.34, L = pts.length;
  var hp = pts[L - 1], pp = pts[L - 2], dx = hp[0] - pp[0], dy = hp[1] - pp[1], dl = Math.sqrt(dx * dx + dy * dy) || 1;
  if (dl < 0.01 * cell && L > 2) { pp = pts[L - 3]; dx = hp[0] - pp[0]; dy = hp[1] - pp[1]; dl = Math.sqrt(dx * dx + dy * dy) || 1; }
  dx /= dl; dy /= dl;
  var d0 = G.headDir(seg.cells); if (s > 0.001 || dl < 1) { /* 头部方向固定为出射方向 */ }
  if (s > 0) { dx = d0[0]; dy = d0[1]; }
  c.save(); c.globalAlpha = alpha;
  if (scale !== 1) { var m = pts[Math.floor(L / 2)]; c.translate(m[0], m[1]); c.scale(scale, scale); c.translate(-m[0], -m[1]); }
  c.lineCap = 'round'; c.lineJoin = 'round';
  function path(ox, oy, shorten) {
    c.beginPath(); c.moveTo(pts[0][0] + ox, pts[0][1] + oy);
    for (var i = 1; i < L - 1; i++) c.lineTo(pts[i][0] + ox, pts[i][1] + oy);
    c.lineTo(hp[0] - dx * shorten + ox, hp[1] - dy * shorten + oy);
  }
  var tip = [hp[0] + dx * cell * 0.36, hp[1] + dy * cell * 0.36], nx = -dy, ny = dx, hw = cell * 0.3, back = cell * 0.12;
  function head(ox, oy, grow) {
    var bx = hp[0] - dx * back + ox, by = hp[1] - dy * back + oy, g = grow || 0;
    c.beginPath();
    c.moveTo(tip[0] + dx * g + ox, tip[1] + dy * g + oy);
    c.lineTo(bx + nx * (hw + g), by + ny * (hw + g));
    c.quadraticCurveTo(hp[0] + dx * cell * 0.02 + ox, hp[1] + dy * cell * 0.02 + oy, bx - nx * (hw + g), by - ny * (hw + g));
    c.closePath();
  }
  if (glow > 0) {
    c.strokeStyle = 'rgba(255,215,90,' + (0.55 * glow) + ')'; c.lineWidth = w + cell * 0.32; path(0, 0, 0); c.stroke();
    c.fillStyle = 'rgba(255,215,90,' + (0.55 * glow) + ')'; head(0, 0, cell * 0.12); c.fill();
  }
  // 阴影
  c.strokeStyle = 'rgba(60,30,8,0.28)'; c.lineWidth = w + 4; path(cell * 0.05, cell * 0.08, 0); c.stroke();
  c.fillStyle = 'rgba(60,30,8,0.28)'; head(cell * 0.05, cell * 0.08, 2); c.fill();
  var base = col.base, dark = col.dark, light = col.light;
  if (flash > 0) { var f = Math.sin(flash * 30) > 0; if (f) { base = '#F04A3A'; dark = '#8E0F08'; light = '#FFB0A0'; } }
  // 描边
  c.strokeStyle = dark; c.lineWidth = w + 5; path(0, 0, 0); c.stroke();
  c.fillStyle = dark; head(0, 0, 2.5); c.fill();
  // 主体
  c.strokeStyle = base; c.lineWidth = w; path(0, 0, 0); c.stroke();
  c.fillStyle = base; head(0, 0, 0); c.fill();
  // 漆面高光
  c.strokeStyle = light; c.globalAlpha = alpha * 0.55; c.lineWidth = w * 0.42; path(-w * 0.12, -w * 0.16, cell * 0.12); c.stroke();
  c.strokeStyle = '#FFFFFF'; c.globalAlpha = alpha * 0.55; c.lineWidth = w * 0.13; path(-w * 0.2, -w * 0.26, cell * 0.2); c.stroke();
  c.globalAlpha = alpha * 0.5; c.fillStyle = '#FFFFFF';
  c.beginPath(); c.arc(tip[0] - dx * cell * 0.2 - nx * cell * 0.06 - w * 0.1, tip[1] - dy * cell * 0.2 - ny * cell * 0.06 - w * 0.14, cell * 0.045, 0, Math.PI * 2); c.fill();
  // 箭尾金环
  c.globalAlpha = alpha; c.strokeStyle = '#F3D27E'; c.lineWidth = 2.5;
  c.beginPath(); c.arc(pts[0][0], pts[0][1], w * 0.28, 0, Math.PI * 2); c.stroke();
  c.restore();
}

function drawHUD(c) {
  var y = SAFE_T + 14, x = X0 + 16, w = LW - 32, h = 104;
  // 底条
  c.save();
  c.globalAlpha = 0.25; D.rr(c, x + 2, y + 8, w, h, 52); c.fillStyle = '#2a1608'; c.fill(); c.globalAlpha = 1;
  D.rr(c, x, y, w, h, 52);
  var g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, 'rgba(250,240,218,0.92)'); g.addColorStop(1, 'rgba(226,208,170,0.92)');
  c.fillStyle = g; c.fill(); c.lineWidth = 3; c.strokeStyle = '#B4832E'; c.stroke();
  c.restore();
  roundIcon(c, 'home', x + 56, y + h / 2, 84, IMG.ic_home, null, function () {
    if (st.won) return;
    modal = { type: 'quit', t: 0 };
  });
  // 心
  for (var i = 0; i < CFG.HEARTS; i++) {
    var hx = x + 118 + i * 54, hy = y + h / 2 - 23, im = i < st.hearts ? IMG.heart : null;
    var ha = null; for (var k = 0; k < st.heartAnim.length; k++) if (st.heartAnim[k].i === i) ha = st.heartAnim[k];
    c.save();
    if (!im) { c.globalAlpha = 0.25; if (IMG.heart) c.drawImage(IMG.heart, hx, hy, 48, 46); }
    if (ha) { var u = ha.t / 0.8; c.globalAlpha = 1 - u; c.translate(hx + 24, hy + 23); c.scale(1 + u * 0.8, 1 + u * 0.8); c.translate(-hx - 24, -hy - 23); if (IMG.heart) c.drawImage(IMG.heart, hx, hy, 48, 46); }
    else if (im) { var beat = i === st.hearts - 1 && st.hearts === 1 ? 1 + 0.08 * Math.sin(now * 8) : 1; c.translate(hx + 24, hy + 23); c.scale(beat, beat); c.drawImage(im, -24, -23, 48, 46); }
    c.restore();
  }
  // 关卡牌匾
  var px = X0 + LW / 2 + 8, title = st.daily ? '每日' : String(st.n);
  D.plaque(c, px, y + h / 2, st.daily ? 150 : 132, 92);
  if (st.daily) D.text(c, '每日挑战', px, y + h / 2 + 2, 30, '#FBE6B0', { title: true, shadow: 'rgba(0,0,0,0.5)' });
  else D.text(c, title, px, y + h / 2 + 3, st.n >= 100 ? 44 : 50, '#FBE6B0', { title: true, shadow: 'rgba(0,0,0,0.5)' });
  // 气势条
  var qx = px + 86, qw = 150, qy = y + h / 2 + 4;
  D.text(c, '气势', qx + qw / 2, qy - 26, 20, '#6B4A26', { title: true });
  D.rr(c, qx, qy - 11, qw, 22, 11); c.fillStyle = 'rgba(70,45,20,0.35)'; c.fill();
  var qv = Math.min(1, st.qishi);
  if (qv > 0.02) {
    D.rr(c, qx + 2, qy - 9, (qw - 4) * qv, 18, 9);
    var qg = c.createLinearGradient(0, qy - 9, 0, qy + 9); qg.addColorStop(0, '#B4E8C8'); qg.addColorStop(1, '#3F8A62');
    c.fillStyle = qg; c.fill();
  }
  D.rr(c, qx, qy - 11, qw, 22, 11); c.lineWidth = 2; c.strokeStyle = '#8A6214'; c.stroke();
  // 守关异兽头像
  var b = beastOfChapter(chapterOf(st.daily ? currentLevel() : st.n)), bx = x + w - 52, by = y + h / 2;
  c.save();
  c.beginPath(); c.arc(bx, by, 58, 0, Math.PI * 2);
  var gg = c.createLinearGradient(0, by - 58, 0, by + 58); gg.addColorStop(0, '#FBE3A0'); gg.addColorStop(1, '#8C6216'); c.fillStyle = gg; c.fill();
  c.beginPath(); c.arc(bx, by, 51, 0, Math.PI * 2);
  var rg = c.createRadialGradient(bx, by - 10, 5, bx, by, 51); rg.addColorStop(0, '#FFF6DE'); rg.addColorStop(1, '#C9B58A'); c.fillStyle = rg; c.fill();
  c.clip();
  var im2 = BIMG[b.id];
  if (im2) { var s2 = 96 / Math.max(im2.width, im2.height); c.drawImage(im2, bx - im2.width * s2 / 2, by - im2.height * s2 / 2 + 4 + Math.sin(now * 2.2) * 2, im2.width * s2, im2.height * s2); }
  c.restore();
  region('beast', bx - 58, by - 58, 116, 116, function () { openBeastPeek(b); }, { circle: true });
  // 副标题
  var sub = st.daily ? ('每日挑战 · ' + st.daily) : (st.n === 1 ? '点击箭，它会沿箭头方向飞出' : (st.n % 10 === 0 ? '守关之战 · ' + b.name : '第' + cnNum(chapterOf(st.n) + 1) + '章 · ' + b.place + ' · 守关异兽 ' + b.name));
  if (st.n === 1 && st.tut === 1) sub = '被挡住的箭飞不出去，要先清开前路';
  if (st.n === 1 && st.tut === 2) sub = '最后一支，点它！';
  if (st.removeMode) sub = '点选一支要去除的箭（点空白处取消）';
  var sy = y + h + 34;
  c.font = '700 28px ' + D.FONT_T; var tw = c.measureText(sub).width + 60;
  D.rr(c, VW / 2 - tw / 2, sy - 24, tw, 48, 24); c.fillStyle = st.removeMode ? 'rgba(126,26,19,0.85)' : 'rgba(70,40,15,0.72)'; c.fill();
  D.text(c, sub, VW / 2, sy + 1, 28, '#FBEBC4', { title: true });
}

function openBeastPeek(b) {
  var idx = BEASTS.indexOf(b);
  if (beastUnlocked(idx)) openBeast(b); else toast('通关第 ' + (idx + 1) * 10 + ' 关，收服' + b.name);
}

function drawAssistBar(c) {
  var y = VH - SAFE_B - 112, xs = [X0 + 100, X0 + 283, X0 + 467, X0 + 650];
  var a = save.assists;
  roundIcon(c, 'hint', xs[0], y, 124, IMG.ic_hint, '提示', doHint, { badge: a.hint > 0 ? a.hint : 'ad' });
  roundIcon(c, 'undo', xs[1], y, 124, IMG.ic_heartplus, '撤销', doUndo, { badge: a.undo > 0 ? a.undo : 'ad', disabled: st.undoUsed || st.misses === 0 });
  roundIcon(c, 'remove', xs[2], y, 124, IMG.ic_remove, '去除', doRemove, { badge: a.remove > 0 ? a.remove : 'ad' });
  if (st.removeMode) { c.lineWidth = 5; c.strokeStyle = 'rgba(255,220,120,' + (0.6 + 0.4 * Math.sin(now * 8)) + ')'; c.beginPath(); c.arc(xs[2], y, 70, 0, Math.PI * 2); c.stroke(); }
  roundIcon(c, 'pcodex', xs[3], y, 118, IMG.scroll, '图鉴', openCodex, { framed: true });
}

// ---------------- 弹窗 ----------------
function openDaily() { modal = { type: 'daily', t: 0 }; }
function openSettings() { modal = { type: 'settings', t: 0 }; }
function openCheckin() { modal = { type: 'checkin', t: 0 }; }
function closeModal() { modal = null; }

function drawModal(c) {
  modal.t += 1 / 60;
  c.fillStyle = 'rgba(20,12,5,' + Math.min(0.6, modal.t * 4) + ')'; c.fillRect(0, 0, VW, VH);
  region('modal-bg', 0, 0, VW, VH, function () { if (modal && modal.dismissable !== false && ['beast', 'settings', 'checkin', 'daily'].indexOf(modal.type) >= 0) closeModal(); }, { modal: true });
  var u = Math.min(1, modal.t / 0.22), sc = 0.85 + 0.15 * (1 - Math.pow(1 - u, 3));
  c.save(); c.translate(VW / 2, VH / 2); c.scale(sc, sc); c.translate(-VW / 2, -VH / 2); c.globalAlpha = u;
  var f = MODALS[modal.type]; if (f) f(c);
  c.restore();
}

function mbtn(c, key, x, y, w, h, label, theme, cb, opt) {
  D.button(c, x, y, w, h, label, theme, isPressed(key), opt);
  region(key, x, y, w, h, cb, { modal: true });
}
function closeX(c, x, y) {
  var key = 'mclose', pr = isPressed(key) ? 0.9 : 1;
  c.save(); c.translate(x, y); c.scale(pr, pr);
  c.beginPath(); c.arc(0, 0, 30, 0, Math.PI * 2); c.fillStyle = '#7A2A1C'; c.fill(); c.lineWidth = 4; c.strokeStyle = '#E2B65C'; c.stroke();
  c.strokeStyle = '#FBE6B0'; c.lineWidth = 5; c.lineCap = 'round';
  c.beginPath(); c.moveTo(-10, -10); c.lineTo(10, 10); c.moveTo(10, -10); c.lineTo(-10, 10); c.stroke();
  c.restore();
  region(key, x - 34, y - 34, 68, 68, closeModal, { modal: true });
}

var MODALS = {
  win: function (c) {
    var w = 600, h = 560 + (st.unlock ? 280 : 0) + (st.dailyReward ? 60 : 0), x = VW / 2 - w / 2, y = VH / 2 - h / 2;
    D.panel(c, x, y, w, h);
    var title = st.daily ? '每日挑战完成' : (st.n % 10 === 0 ? '守关告捷' : '破阵成功');
    D.text(c, title, VW / 2, y + 78, 60, '#7A2A1C', { title: true, shadow: 'rgba(212,164,67,0.6)', sy: 3 });
    D.text(c, st.daily ? st.daily : '第 ' + st.n + ' 关', VW / 2, y + 136, 30, '#6B4A26', { title: true });
    for (var i = 0; i < 3; i++) {
      var tt = modal.t - 0.25 - i * 0.22, sx = VW / 2 + (i - 1) * 130, sy2 = y + 240 - (i === 1 ? 22 : 0);
      if (IMG.star_empty) c.drawImage(IMG.star_empty, sx - 52, sy2 - 52, 104, 104);
      if (i < st.stars && tt > 0) {
        if (!modal['s' + i]) { modal['s' + i] = 1; P.play('pluck' + (3 + i * 2)); burst(sx, sy2, 18, 'gold', 300); }
        var k = Math.min(1, tt / 0.25), s = 1 + (1 - k) * 1.2;
        c.save(); c.globalAlpha = k; c.translate(sx, sy2); c.scale(s, s); if (IMG.star) c.drawImage(IMG.star, -56, -56, 112, 112); c.restore();
      }
    }
    var yy = y + 330;
    if (st.dailyReward) { D.text(c, '首次完成奖励：提示 ×1', VW / 2, yy, 30, '#2C5B44', { title: true }); yy += 60; }
    if (st.unlock) {
      var b = st.unlock, im = BIMG[b.id];
      D.rr(c, x + 50, yy - 10, w - 100, 250, 22); c.fillStyle = 'rgba(122,42,28,0.1)'; c.fill(); c.lineWidth = 2; c.strokeStyle = 'rgba(176,128,48,0.6)'; c.stroke();
      if (im) { var s3 = 200 / Math.max(im.width, im.height); c.drawImage(im, x + 70 + (200 - im.width * s3) / 2, yy + 15 + (200 - im.height * s3) / 2, im.width * s3, im.height * s3); }
      D.text(c, '收服异兽', x + 400, yy + 50, 30, '#6B4A26', { title: true });
      D.text(c, b.name, x + 400, yy + 110, 60, '#7A2A1C', { title: true });
      D.text(c, '已收入《异兽图鉴》', x + 400, yy + 170, 24, '#6B4A26');
      region('unlockcard', x + 50, yy - 10, w - 100, 250, function () { var bb = st.unlock; modal = { type: 'beast', b: bb, t: 0, back: 'win' }; }, { modal: true });
      yy += 280;
    }
    if (st.daily) {
      mbtn(c, 'w-home', VW / 2 - 170, y + h - 160, 340, 104, '返回主页', 'red', function () { modal = null; scene = 'menu'; });
      return;
    }
    var hasNext = st.n < CFG.TOTAL_LEVELS;
    mbtn(c, 'w-next', VW / 2 - 200, y + h - 212, 400, 104, hasNext ? '下一关' : '全部通关', 'red', function () {
      if (!hasNext) { modal = null; scene = 'menu'; return; }
      var n = st.n + 1;
      if (n >= CFG.INTERSTITIAL_MIN_LEVEL && save.winsSinceAd >= CFG.INTERSTITIAL_EVERY_WINS) { save.winsSinceAd = 0; persist(); P.showInterstitial(); }
      startLevel(n);
    }, { size: 44 });
    mbtn(c, 'w-sel', VW / 2 - 200, y + h - 92, 190, 66, '选关', 'wood', function () { modal = null; openLevels(); }, { size: 28 });
    mbtn(c, 'w-retry', VW / 2 + 10, y + h - 92, 190, 66, '再玩一次', 'wood', function () { startLevel(st.n); }, { size: 28 });
  },
  fail: function (c) {
    var w = 580, h = 560, x = VW / 2 - w / 2, y = VH / 2 - h / 2;
    D.panel(c, x, y, w, h);
    D.text(c, '箭阵未破', VW / 2, y + 82, 60, '#7A2A1C', { title: true });
    D.text(c, '三颗心已用尽，异兽仍被困阵中', VW / 2, y + 150, 28, '#6B4A26');
    if (IMG.heart) { c.save(); c.globalAlpha = 0.85; c.drawImage(IMG.heart, VW / 2 - 50, y + 190, 100, 96); c.restore(); }
    D.text(c, '+1', VW / 2 + 70, y + 240, 44, '#C8372D', { title: true });
    mbtn(c, 'f-revive', VW / 2 - 210, y + 320, 420, 100, '看广告复活', 'jade', function () {
      P.showRewarded().then(function (r) {
        if (r.msg) toast(r.msg);
        if (r.ok) { st.hearts = 1; st.failed = false; st.revived = true; modal = null; }
      });
    }, { size: 40 });
    mbtn(c, 'f-retry', VW / 2 - 210, y + 446, 200, 76, '重新开始', 'red', function () { startLevel(st.n, st.daily); }, { size: 30 });
    mbtn(c, 'f-home', VW / 2 + 10, y + 446, 200, 76, '返回主页', 'wood', function () { modal = null; scene = 'menu'; }, { size: 30 });
  },
  ad: function (c) {
    var w = 560, h = 470, x = VW / 2 - w / 2, y = VH / 2 - h / 2, kind = modal.kind;
    D.panel(c, x, y, w, h);
    D.text(c, ASSIST_NAME[kind] + '次数已用完', VW / 2, y + 80, 44, '#7A2A1C', { title: true });
    var ic = { hint: IMG.ic_hint, undo: IMG.ic_heartplus, remove: IMG.ic_remove }[kind];
    if (ic) c.drawImage(ic, VW / 2 - 60, y + 125, 120, 120);
    D.text(c, '观看一段视频，获得 ' + ASSIST_NAME[kind] + ' ×1', VW / 2, y + 285, 28, '#6B4A26');
    mbtn(c, 'ad-ok', VW / 2 - 220, y + 335, 250, 92, '看广告', 'jade', function () {
      var m = modal;
      P.showRewarded().then(function (r) {
        if (r.msg) toast(r.msg);
        modal = null;
        if (r.ok) { m.apply(); }
      });
    }, { size: 36 });
    mbtn(c, 'ad-no', VW / 2 + 50, y + 335, 170, 92, '取消', 'wood', function () { modal = null; if (st) st.removeMode = false; }, { size: 32 });
  },
  quit: function (c) {
    var w = 540, h = 380, x = VW / 2 - w / 2, y = VH / 2 - h / 2;
    D.panel(c, x, y, w, h);
    D.text(c, '暂离战局', VW / 2, y + 80, 50, '#7A2A1C', { title: true });
    D.text(c, '返回主页后，本关进度不会保留', VW / 2, y + 150, 28, '#6B4A26');
    mbtn(c, 'q-yes', VW / 2 - 220, y + 230, 200, 92, '返回主页', 'wood', function () { modal = null; scene = 'menu'; }, { size: 30 });
    mbtn(c, 'q-no', VW / 2 + 20, y + 230, 200, 92, '继续', 'red', closeModal, { size: 36 });
  },
  beast: function (c) {
    var b = modal.b, w = 640, x = VW / 2 - w / 2;
    c.font = '500 28px ' + D.FONT_T;
    var ql = D.wrap(c, b.quote, w - 120).length;
    c.font = '500 27px ' + D.FONT_B;
    var pl = D.wrap(c, b.plain, w - 120).length;
    var h = 420 + ql * 44 + pl * 40 + 80, y = VH / 2 - h / 2;
    D.panel(c, x, y, w, h);
    var im = BIMG[b.id];
    var rg = c.createRadialGradient(VW / 2, y + 160, 10, VW / 2, y + 160, 170); rg.addColorStop(0, 'rgba(255,225,140,0.7)'); rg.addColorStop(1, 'rgba(255,225,140,0)');
    c.fillStyle = rg; c.beginPath(); c.arc(VW / 2, y + 160, 170, 0, Math.PI * 2); c.fill();
    if (im) { var s = 250 / Math.max(im.width, im.height); c.drawImage(im, VW / 2 - im.width * s / 2, y + 160 - im.height * s / 2 + Math.sin(now * 2) * 5, im.width * s, im.height * s); }
    D.text(c, b.name, VW / 2, y + 320, 58, '#7A2A1C', { title: true });
    D.text(c, '出自《山海经·' + b.src + '》 · ' + b.place, VW / 2, y + 372, 24, '#8A6214', { title: true });
    var yy = y + 410;
    D.rr(c, x + 40, yy - 8, w - 80, ql * 44 + 26, 14); c.fillStyle = 'rgba(122,42,28,0.07)'; c.fill();
    c.fillStyle = '#C8372D'; c.fillRect(x + 40, yy - 8, 5, ql * 44 + 26);
    D.para(c, b.quote, x + 62, yy + 4, w - 120, 28, 44, '#3A2410', { title: true, weight: '500' });
    yy += ql * 44 + 40;
    D.para(c, b.plain, x + 62, yy, w - 120, 27, 40, '#5A3A1A', { weight: '500' });
    closeX(c, x + w - 10, y + 10);
    if (modal.back === 'win') region('mclose', x + w - 44, y - 24, 68, 68, function () { modal = { type: 'win', t: 1, s0: 1, s1: 1, s2: 1 }; }, { modal: true });
  },
  daily: function (c) {
    var w = 580, h = 520, x = VW / 2 - w / 2, y = VH / 2 - h / 2, d = P.today(), got = save.daily[d] || 0;
    D.panel(c, x, y, w, h);
    D.text(c, '每日挑战', VW / 2, y + 80, 56, '#7A2A1C', { title: true });
    D.text(c, d, VW / 2, y + 140, 30, '#6B4A26', { title: true });
    if (IMG.ic_daily) c.drawImage(IMG.ic_daily, VW / 2 - 70, y + 170, 140, 140);
    D.text(c, got ? '今日已完成 ★' + got + '，可以再挑战' : '每天一局高难箭阵 · 首次完成奖励 提示×1', VW / 2, y + 345, 25, '#5A3A1A');
    mbtn(c, 'd-go', VW / 2 - 180, y + 390, 360, 96, got ? '再次挑战' : '开始挑战', 'red', function () { startLevel(0, d); }, { size: 40 });
    closeX(c, x + w - 10, y + 10);
  },
  settings: function (c) {
    var w = 560, h = 620, x = VW / 2 - w / 2, y = VH / 2 - h / 2;
    D.panel(c, x, y, w, h);
    D.text(c, '设置', VW / 2, y + 80, 56, '#7A2A1C', { title: true });
    var rows = [['音效', 'sfx'], ['音乐', 'music'], ['振动', 'vib']];
    rows.forEach(function (r, i) {
      var ry = y + 170 + i * 100, on = save[r[1]];
      D.text(c, r[0], x + 90, ry, 36, '#3A2410', { title: true, align: 'left' });
      var tx = x + w - 200, key = 'tg-' + r[1];
      D.rr(c, tx, ry - 30, 120, 60, 30); c.fillStyle = on ? '#4E8E6E' : '#9A8F7E'; c.fill(); c.lineWidth = 3; c.strokeStyle = '#B4832E'; c.stroke();
      c.beginPath(); c.arc(on ? tx + 90 : tx + 30, ry, 24, 0, Math.PI * 2); c.fillStyle = '#FFF6DE'; c.fill();
      D.text(c, on ? '开' : '关', on ? tx + 40 : tx + 82, ry + 1, 22, '#fff', { weight: '700' });
      region(key, tx - 10, ry - 40, 140, 80, function () {
        save[r[1]] = !save[r[1]]; persist();
        if (r[1] === 'sfx') P.setSfx(save.sfx);
        if (r[1] === 'music') P.setMusic(save.music);
      }, { modal: true });
    });
    mbtn(c, 's-tut', VW / 2 - 170, y + 460, 340, 80, '重温新手教程', 'jade', function () { startLevel(1); }, { size: 30 });
    D.text(c, '《山海一箭》 v1.0 · 异兽原文出自《山海经》', VW / 2, y + h - 34, 20, '#8A6A40');
    closeX(c, x + w - 10, y + 10);
  },
  checkin: function (c) {
    var w = 660, h = 700, x = VW / 2 - w / 2, y = VH / 2 - h / 2;
    var avail = checkinAvailable(), idx = save.checkin.count % 7;
    D.panel(c, x, y, w, h);
    D.text(c, '七日签到', VW / 2, y + 76, 56, '#7A2A1C', { title: true });
    D.text(c, '每天领取免费道具', VW / 2, y + 128, 26, '#6B4A26');
    var cw = 130, chh = 170, gap = 16;
    for (var i = 0; i < 7; i++) {
      var row = i < 4 ? 0 : 1, col = i < 4 ? i : i - 4, n = row ? 3 : 4;
      var cx = VW / 2 - (n * cw + (n - 1) * gap) / 2 + col * (cw + gap), cy = y + 170 + row * (chh + 20);
      var lastIdx = avail ? idx - 1 : (save.checkin.count - 1) % 7;
      var claimed = i <= lastIdx, today = i === idx && avail;
      D.rr(c, cx, cy, cw, chh, 18);
      var g = c.createLinearGradient(0, cy, 0, cy + chh);
      if (today) { g.addColorStop(0, '#FFE9B0'); g.addColorStop(1, '#E8B54E'); } else { g.addColorStop(0, '#F8EED6'); g.addColorStop(1, '#E2CFA4'); }
      c.fillStyle = g; c.fill(); c.lineWidth = today ? 5 : 2.5; c.strokeStyle = today ? '#C8372D' : '#B4832E'; c.stroke();
      D.text(c, '第' + cnNum(i + 1) + '天', cx + cw / 2, cy + 28, 24, '#6B4A26', { title: true });
      var rw = CFG.CHECKIN[i], keys = Object.keys(rw), icons = { hint: IMG.ic_hint, undo: IMG.ic_heartplus, remove: IMG.ic_remove };
      if (keys.length === 1) {
        if (icons[keys[0]]) c.drawImage(icons[keys[0]], cx + cw / 2 - 40, cy + 50, 80, 80);
        D.text(c, ASSIST_NAME[keys[0]] + '×' + rw[keys[0]], cx + cw / 2, cy + 148, 22, '#3A2410', { weight: '700' });
      } else {
        keys.forEach(function (kk, j) { if (icons[kk]) c.drawImage(icons[kk], cx + 8 + j * 38, cy + 64 + (j === 1 ? -10 : 0), 42, 42); });
        D.text(c, '全道具×2', cx + cw / 2, cy + 148, 22, '#3A2410', { weight: '700' });
      }
      if (claimed) {
        c.save(); c.globalAlpha = 0.55; D.rr(c, cx, cy, cw, chh, 18); c.fillStyle = '#5A4A30'; c.fill(); c.restore();
        if (IMG.seal) c.drawImage(IMG.seal, cx + cw / 2 - 40, cy + chh / 2 - 40, 80, 80);
        D.text(c, '已领', cx + cw / 2, cy + chh / 2 + 52, 26, '#FFF0D0', { title: true, stroke: '#5A1A10', sw: 5 });
      }
    }
    if (avail) {
      mbtn(c, 'ck-go', VW / 2 - 180, y + h - 135, 360, 96, '领取', 'red', function () {
        var rw = CFG.CHECKIN[save.checkin.count % 7];
        for (var k in rw) save.assists[k] += rw[k];
        save.checkin.count++; save.checkin.last = P.today(); persist();
        P.play('unlock');
        toast('签到成功：' + Object.keys(rw).map(function (k) { return ASSIST_NAME[k] + '×' + rw[k]; }).join('、'));
        burst(VW / 2, y + h - 100, 40, 'gold', 400);
      }, { size: 44 });
    } else D.text(c, '今日已签到，明天再来', VW / 2, y + h - 88, 32, '#6B4A26', { title: true });
    closeX(c, x + w - 10, y + 10);
  }
};

function drawToasts(c) {
  for (var i = 0; i < toasts.length; i++) {
    var t = toasts[i], a = Math.min(1, t.t * 6, (2.2 - t.t) * 3);
    c.save(); c.globalAlpha = a;
    c.font = '600 30px ' + D.FONT_B;
    var w = c.measureText(t.s).width + 70, y = VH * 0.3 - Math.min(1, t.t * 6) * 20;
    D.rr(c, VW / 2 - w / 2, y - 34, w, 68, 34); c.fillStyle = 'rgba(40,24,10,0.88)'; c.fill();
    c.lineWidth = 2; c.strokeStyle = '#D4A443'; c.stroke();
    D.text(c, t.s, VW / 2, y + 1, 30, '#FBEBC4');
    c.restore();
  }
}

// ---------------- 测试辅助：自动走一步（浏览器调试用） ----------------
function autoSolveStep() {
  if (!st) return false;
  for (var i = 0; i < st.board.segs.length; i++) if (st.alive[i] && !st.anims[i] && G.isFree(st.board, st.occ, i)) { tapSeg(i); return true; }
  return false;
}

module.exports = { start: start };

};
R("main").start();})();
