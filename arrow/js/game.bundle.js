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
  // 初始免费道具次数（提示 / 锤子=移走任意一条线 / 炸弹=清除 3×3 内普通线 / 交换=把一条普通线首尾调头）
  FREE_ASSISTS: { hint: 3, hammer: 2, bomb: 1, swap: 1 },
  // ===== 金币经济（v4） =====
  START_COINS: 200,
  COINS: { win: [30, 45, 60], login: 50, daily: 100 }, // 通关按星级 1/2/3★；每日登录；每日挑战首次完成
  PRICES: { hint: 100, hammer: 150, bomb: 200, swap: 150 }, // 道具金币价；重置免费
  WIN_AD_DOUBLE: true,        // 胜利页「看广告翻倍」（每关一次）
  REVIVE_HEARTS: 3,           // 心数用尽后看广告复活：恢复的心数（每关一次）
  // 埋点：本地记录始终开启；设为 true 且在 mp 后台「自定义分析」配置同名事件后，才调用 wx.reportEvent 上报
  ANALYTICS_WX: false,
  // 每关心数（撞线扣 1 颗）。大棋盘若觉得太严苛可调成 4 或 5，界面会自动适配
  HEARTS: 3,
  // 棋盘最大放大倍数（双指捏合 / 滚轮）
  MAX_ZOOM: 3.5,
  SLIDE_SPEED: 25, // 格/秒（最低速度；长线/远距离会自动加速，保证 0.75 秒内飞出）
  TOTAL_LEVELS: 500,
  // ===== 每关倒计时（v3） =====
  // 限时 = 取整到 5 秒( (基础 + 线数×(每线秒数 + 每线每轮秒数×轮数) + 每轮秒数×轮数 + 每机关线秒数×机关线数) × 关卡系数 )
  TIMER_ENABLED: true,
  // v4 更密的盘（每盘 120–200 条短线）：中期约剩 25–45% 时间
  TIMER_BASE: 20,            // 基础秒数
  TIMER_PER_LINE: 1.85,      // 每条线（含思考）秒数
  TIMER_PER_LINE_ROUND: 0.023, // 每条线再按“移除轮数”加秒（轮数越多每条线越需要思考）
  TIMER_PER_ROUND: 0,        // 每个“移除轮数”额外秒数
  TIMER_PER_MECH: 1.5,       // 每条机关线额外秒数
  TIMER_ROUND_TO: 5,         // 取整粒度（秒）
  TIMER_MIN: 45,             // 下限（第 1 关教学除外）
  TIMER_TUTORIAL_SECONDS: 0, // 第 1 关教学：0 = 不计时
  TIMER_GUARDIAN_MULT: 0.9,  // 守关关（每 10 关）稍紧
  TIMER_REST_MULT: 1.0,      // 守关后的喘息关
  TIMER_DAILY_MULT: 0.95,    // 每日挑战系数
  TIMER_DAILY_SECONDS: 0,    // 每日挑战固定秒数（>0 时覆盖公式）
  TIMER_INTRO_SECONDS: 3,    // 进关后若不点击，3 秒后自动开始计时（首次点线会立即开始）
  TIMER_WARN_SECONDS: 10,    // 最后 N 秒变红、跳动、每秒“嗒”一声
  TIMER_REVIVE_SECONDS: 30,  // 看广告续时秒数
  TIMER_REVIVES_PER_LEVEL: 2,// 每关最多续时次数
  // 三星 = 零失误 且 用时 ≤ 限时 × STAR_TIME_FRAC；前 STAR_NO_TIME_LEVELS 关不按用时扣星
  STAR_TIME_FRAC: 0.75,
  STAR_NO_TIME_LEVELS: 10,
  // 7 日签到奖励
  CHECKIN: [
    { hint: 1 }, { hammer: 1 }, { swap: 1 }, { hint: 2 },
    { bomb: 1 }, { hammer: 2 }, { hint: 2, hammer: 2, bomb: 1, swap: 1 }
  ],
  SHARE_TITLE: '上古异兽被困箭阵，你能一箭破局吗？'
};

};
M["levelpick"]=function(module,exports,require){
// 自动生成：tools/precompute.js（第 2..500 关选用的候选种子编号）
module.exports = [2,1,2,4,4,2,5,2,0,3,1,0,2,0,1,3,1,3,4,4,1,0,2,1,0,4,2,4,3,3,1,0,3,2,3,3,0,1,2,3,2,2,1,0,4,3,3,1,1,2,0,0,2,4,2,4,3,2,0,3,4,2,4,4,0,3,0,2,2,3,1,4,0,0,3,1,1,1,4,4,3,3,0,4,4,3,3,4,3,1,1,0,0,4,4,0,1,3,3,2,1,4,1,4,2,2,4,1,4,0,0,4,2,2,3,2,1,0,2,2,2,0,1,2,3,4,3,3,0,4,1,1,3,1,2,3,2,4,0,3,3,3,0,4,4,2,2,0,1,3,1,0,4,3,1,0,1,4,2,1,2,2,4,3,0,3,1,0,3,3,4,0,2,0,0,3,1,0,3,0,0,3,2,1,1,0,4,3,1,0,0,3,0,0,3,1,2,4,2,4,3,4,1,2,1,1,0,0,3,4,2,4,0,4,1,2,1,4,1,4,3,1,1,1,4,3,4,3,4,2,2,3,2,2,4,3,1,2,4,3,0,0,2,3,2,3,1,0,2,2,1,3,4,1,2,1,3,3,3,2,0,4,2,1,4,0,1,4,0,1,1,3,2,2,0,2,3,1,4,4,2,0,2,4,0,3,1,3,0,3,0,0,0,3,3,3,4,3,1,0,4,0,4,1,1,4,2,1,2,1,0,0,0,3,3,0,2,0,4,4,2,3,0,1,3,2,2,4,4,0,1,4,4,2,4,0,4,4,0,3,3,0,2,4,2,2,4,2,1,0,4,3,3,4,3,4,3,4,2,0,0,3,0,2,3,0,1,1,0,4,0,1,3,0,3,4,3,2,0,1,2,3,3,1,3,4,3,2,4,3,1,2,4,0,4,3,2,4,0,2,0,1,3,1,1,1,4,3,0,1,3,1,4,0,1,0,4,1,2,0,1,3,1,3,0,1,4,1,2,1,2,4,0,2,1,4,1,1,4,3,2,4,4,0,3,4,0,0,4,0,0,3,4,2,3,3,3,4,0,1,3,3,0,4,2,1,4,3,0,2,2,1,2,3,1,4,1,1,4,4,2,1,2,2,3,2,2,2,0,4,1,0,0,1,0,0,2,4,0];

};
M["levelgen"]=function(module,exports,require){
// 关卡生成 + 规则 + 求解/评级（v4：更密的短线 + 机关）
// 棋盘 w x h；每条线是一条折线，cells[0] 为线尾，cells[len-1] 为箭头。
// 点击后整条线沿出射方向蛇形滑出；出射线（箭头沿方向到边界的格子，经过传送门会跳到配对门继续）上有别的线就会撞上。
//
// 可解性保证：
// 1) 生成：维护“阻挡依赖图”（A 的出射线上有 B，则 A 依赖 B），每放入/延长一条线都做增量环检测，图始终无环 ⇒ 普通线一定可解。
//    传送门在生成前预留格子，出射线按传送规则计算，因此同样纳入依赖图。
// 2) 机关：所有机关都是“单调”的——移除任何线只会让局面变好（出射线更空、冰层更薄、钥匙取走后锁打开、炸弹/连锁只会额外移除线；
//    双向线/旋转机关只是多出可选方向）。因此“可移除集合”只增不减，贪心逐轮移除到不动点即为精确判定：贪心清空 ⇔ 有解。
//    冰封与锁会削弱可移除性，所以装饰后用同一个求解器验证，卡住的冰/锁会被降级或去掉，直到可解。
// 思路参考：IcedSoul/minigame-everyday day-03-arrow 的“增量放置 + 环检测 + 防孤格 + 端点延长补洞”，此处为独立重写。
var R = require('./rng');

var DIRS = [[1, 0], [0, 1], [-1, 0], [0, -1]]; // 右 下 左 上（顺时针）
var PORTAL = 30000;

function headDir(cells) {
  var n = cells.length, h = cells[n - 1], p = cells[n - 2];
  return [h[0] - p[0], h[1] - p[1]];
}
function dirIndex(d) { for (var i = 0; i < 4; i++) if (DIRS[i][0] === d[0] && DIRS[i][1] === d[1]) return i; return -1; }

// 传送门映射（格子 id → 配对格 id，或 -1）
function pmapOf(board) {
  if (board._pmap && board._pmap.length === board.w * board.h) return board._pmap;
  var m = new Int32Array(board.w * board.h).fill(-1);
  (board.portals || []).forEach(function (p) { m[p[0]] = p[1]; m[p[1]] = p[0]; });
  try { Object.defineProperty(board, '_pmap', { value: m, enumerable: false, configurable: true, writable: true }); } catch (e) { board._pmap = m; }
  return m;
}

// 从格子 (x,y) 出发沿 (dx,dy) 的出射线（不含起点）；经过传送门时跳到配对门继续（同方向）
function traceRay(w, h, pmap, x, y, dx, dy) {
  var out = [], guard = 0;
  x += dx; y += dy;
  while (x >= 0 && y >= 0 && x < w && y < h && guard++ < w * h * 2) {
    var c = y * w + x;
    out.push(c);
    if (pmap && pmap[c] >= 0) { var p = pmap[c]; out.push(p); x = p % w; y = (p / w) | 0; }
    x += dx; y += dy;
  }
  return out;
}

// 兼容旧接口：无传送门、按箭头方向
function rayCells(w, h, cells) {
  var d = headDir(cells), hd = cells[cells.length - 1];
  return traceRay(w, h, null, hd[0], hd[1], d[0], d[1]);
}

// ---------------- 生成器 ----------------
// opt: minLen, maxLen, meanLen, turnP, hugP, bias(>0 偏好被挡/向内的线 → 依赖链更深), tries, maxCap, portals(对数)
function generate(w, h, rng, opt) {
  var N = w * h;
  var occ = new Int16Array(N).fill(-1);
  var pmap = new Int32Array(N).fill(-1), portals = [];
  var segs = [], deps = [], rays = [];
  var cover = []; for (var i = 0; i < N; i++) cover.push([]);   // cover[c]：出射线经过 c 的线
  var mark = new Int32Array(4096), stamp = 0, stack = [];
  var tmark = new Int32Array(4096), tstamp = 0;
  var maxLen = opt.maxLen, cap = opt.maxCap || maxLen + 3;

  // 预留传送门：成对、不同行不同列（避免射线来回循环）、离边至少 2 格、两门相距较远
  for (var pp = 0; pp < (opt.portals || 0); pp++) {
    for (var tr = 0; tr < 200; tr++) {
      var ax = rng.int(2, w - 3), ay = rng.int(2, h - 3), bx = rng.int(2, w - 3), by = rng.int(2, h - 3);
      if (ax === bx || ay === by || Math.abs(ax - bx) + Math.abs(ay - by) < (w + h) / 4) continue;
      var a = ay * w + ax, b = by * w + bx, ok = true;
      for (var q = 0; q < portals.length; q++) {
        var o1 = portals[q][0], o2 = portals[q][1];
        [o1, o2].forEach(function (o) {
          var ox = o % w, oy = (o / w) | 0;
          if (ox === ax || oy === ay || ox === bx || oy === by) ok = false;
        });
      }
      if (!ok) continue;
      portals.push([a, b]); pmap[a] = b; pmap[b] = a; occ[a] = PORTAL; occ[b] = PORTAL;
      break;
    }
  }

  function ensure(n) { if (n >= mark.length) { var m = new Int32Array(mark.length * 2); m.set(mark); mark = m; var t = new Int32Array(tmark.length * 2); t.set(tmark); tmark = t; } }

  // 从 starts 出发沿 deps 搜索，是否能到达 targets（tmark 标记）中的任一节点
  function reaches(starts) {
    stamp++; stack.length = 0;
    for (var i = 0; i < starts.length; i++) { var s = starts[i]; if (tmark[s] === tstamp) return true; if (mark[s] !== stamp) { mark[s] = stamp; stack.push(s); } }
    while (stack.length) {
      var a = stack.pop(), d = deps[a];
      for (var j = 0; j < d.length; j++) {
        var b = d[j];
        if (tmark[b] === tstamp) return true;
        if (mark[b] !== stamp) { mark[b] = stamp; stack.push(b); }
      }
    }
    return false;
  }

  // 评估一条候选线（cells 为 [id...]，末元素为箭头）。self: 若为延长已有线则传其编号
  var inPath = new Int32Array(N), pstamp = 0;
  function evaluate(ids, self, addedFrom) {
    var n = ids.length; if (n < 2) return null;
    var hd = ids[n - 1], pv = ids[n - 2];
    var hx = hd % w, hy = (hd / w) | 0, dx = hx - pv % w, dy = hy - ((pv / w) | 0);
    pstamp++;
    for (var i = 0; i < n; i++) inPath[ids[i]] = pstamp;
    var ray = traceRay(w, h, portals.length ? pmap : null, hx, hy, dx, dy), blockers = [];
    tstamp++;
    for (var r = 0; r < ray.length; r++) {
      var c = ray[r];
      if (inPath[c] === pstamp) return null;          // 出射线穿过自身
      var o = occ[c];
      if (o >= 0 && o !== PORTAL && o !== self && tmark[o] !== tstamp) { tmark[o] = tstamp; blockers.push(o); }
    }
    // 目标集合：会依赖这条线的线（出射线经过新增格子的）以及它自己
    tstamp++;
    var any = false;
    if (self >= 0) { tmark[self] = tstamp; any = true; }
    for (var k = addedFrom; k < n; k++) {
      var cv = cover[ids[k]];
      for (var m = 0; m < cv.length; m++) { if (cv[m] !== self) { tmark[cv[m]] = tstamp; any = true; } }
    }
    if (any && blockers.length && reaches(blockers)) return null;
    return { ray: ray, blockers: blockers };
  }

  function commitNew(ids, ev) {
    var si = segs.length; ensure(si + 2);
    for (var i = 0; i < ids.length; i++) {
      var c = ids[i]; occ[c] = si;
      var cv = cover[c]; for (var m = 0; m < cv.length; m++) deps[cv[m]].push(si);
    }
    for (var r = 0; r < ev.ray.length; r++) cover[ev.ray[r]].push(si);
    segs.push(ids); deps.push(ev.blockers); rays.push(ev.ray);
    return si;
  }
  function commitExtend(si, newIds, added, ev, headChanged) {
    if (headChanged) {
      var old = rays[si];
      for (var r = 0; r < old.length; r++) { var cv = cover[old[r]], p = cv.indexOf(si); if (p >= 0) cv.splice(p, 1); }
      for (var r2 = 0; r2 < ev.ray.length; r2++) cover[ev.ray[r2]].push(si);
      rays[si] = ev.ray; deps[si] = ev.blockers;
    }
    for (var i = 0; i < added.length; i++) {
      var c = added[i]; occ[c] = si;
      var cl = cover[c]; for (var m = 0; m < cl.length; m++) if (cl[m] !== si) deps[cl[m]].push(si);
    }
    segs[si] = newIds;
  }

  function freeNb(c, extraStamp) {
    var x = c % w, y = (c / w) | 0, n = 0;
    if (x > 0 && occ[c - 1] < 0 && inPath[c - 1] !== extraStamp) n++;
    if (x < w - 1 && occ[c + 1] < 0 && inPath[c + 1] !== extraStamp) n++;
    if (y > 0 && occ[c - w] < 0 && inPath[c - w] !== extraStamp) n++;
    if (y < h - 1 && occ[c + w] < 0 && inPath[c + w] !== extraStamp) n++;
    return n;
  }
  function nbs(c) {
    var x = c % w, y = (c / w) | 0, out = [];
    if (x < w - 1) out.push([c + 1, 0]);
    if (y < h - 1) out.push([c + w, 1]);
    if (x > 0) out.push([c - 1, 2]);
    if (y > 0) out.push([c - w, 3]);
    return out;
  }
  function isolates(c, ps) {
    var nb = nbs(c);
    for (var i = 0; i < nb.length; i++) {
      var q = nb[i][0];
      if (occ[q] >= 0 || inPath[q] === ps) continue;
      if (freeNb(q, ps) === 0) return true;
    }
    return false;
  }

  function pickLen() {
    var r = rng.next();
    if (r < opt.shortP) return rng.int(2, 3);
    var u = (rng.next() + rng.next() + rng.next()) / 3;
    return Math.max(opt.minLen, Math.min(maxLen, Math.round(opt.minLen + u * 2 * (opt.meanLen - opt.minLen))));
  }

  function walk(start, len) {
    pstamp++; var ps = pstamp;
    var path = [start]; inPath[start] = ps;
    var dir = rng.int(0, 3);
    for (var i = 1; i < len; i++) {
      var cur = path[path.length - 1], nb = nbs(cur), cand = [];
      for (var k = 0; k < nb.length; k++) { var q = nb[k][0]; if (occ[q] < 0 && inPath[q] !== ps) cand.push(nb[k]); }
      if (!cand.length) break;
      var safe = [];
      for (var k2 = 0; k2 < cand.length; k2++) { inPath[cand[k2][0]] = ps; if (!isolates(cand[k2][0], ps)) safe.push(cand[k2]); inPath[cand[k2][0]] = 0; }
      if (safe.length) cand = safe;
      var ch = null;
      if (rng.next() < opt.hugP) {
        var best = 9;
        for (var a = 0; a < cand.length; a++) { var f = freeNb(cand[a][0], ps) + rng.next() * 0.9; if (f < best) { best = f; ch = cand[a]; } }
      } else {
        var straight = null, turns = [];
        for (var b = 0; b < cand.length; b++) { if (cand[b][1] === dir) straight = cand[b]; else turns.push(cand[b]); }
        if (straight && (rng.next() > opt.turnP || !turns.length)) ch = straight;
        else if (turns.length) ch = turns[rng.int(0, turns.length - 1)];
        else ch = straight;
      }
      path.push(ch[0]); inPath[ch[0]] = ps; dir = ch[1];
    }
    return path;
  }

  function tryPlace(start, len, minLen) {
    var best = null, bestSc = -1e9;
    for (var t = 0; t < opt.tries; t++) {
      var p = walk(start, t === 0 ? len : (t & 1 ? len : Math.max(minLen, len - 2 - (t >> 1))));
      if (p.length < minLen) continue;
      for (var o = 0; o < 2; o++) {
        var ids = o ? p.slice().reverse() : p;
        for (var cut = 0; cut <= 2 && ids.length - cut >= minLen; cut++) {
          var cand = cut ? ids.slice(0, ids.length - cut) : ids;
          var ev = evaluate(cand, -1, 0);
          if (!ev) continue;
          var sc = cand.length * opt.lenW + opt.bias * Math.min(6, ev.blockers.length) + (ev.blockers.length ? 0 : -opt.bias * 0.5) + rng.next() * 1.5;
          if (sc > bestSc) { bestSc = sc; best = { ids: cand, ev: ev }; }
          break;
        }
      }
    }
    if (best) { commitNew(best.ids, best.ev); return true; }
    return false;
  }

  function tryExtend(c) {
    var nb = rng.shuffle(nbs(c)), opts = [];
    for (var i = 0; i < nb.length; i++) {
      var q = nb[i][0], si = occ[q]; if (si < 0 || si === PORTAL) continue;
      var ids = segs[si]; if (ids.length >= cap) continue;
      if (ids[0] === q) opts.push([si, 0]);
      if (ids[ids.length - 1] === q) opts.push([si, 1]);
    }
    opts.sort(function (a, b) { return (a[1] - b[1]) * 10 + (segs[a[0]].length - segs[b[0]].length) * 0.1; });
    for (var k = 0; k < opts.length; k++) {
      var s = opts[k][0], old = segs[s], nids;
      if (opts[k][1] === 0) { nids = [c].concat(old); var ev = evaluate(nids, s, 0); if (ev) { commitExtend(s, nids, [c], ev, false); return true; } }
      else { nids = old.concat([c]); var ev2 = evaluate(nids, s, nids.length - 1); if (ev2) { commitExtend(s, nids, [c], ev2, true); return true; } }
    }
    return false;
  }

  var order = [];
  for (var c0 = 0; c0 < N; c0++) {
    var x0 = c0 % w, y0 = (c0 / w) | 0;
    var edge = Math.min(x0, y0, w - 1 - x0, h - 1 - y0) / Math.max(1, Math.min(w, h) / 2);
    order.push([c0, rng.next() + edge * opt.edgeFirst]);
  }
  order.sort(function (a, b) { return a[1] - b[1]; });
  for (var oi = 0; oi < order.length; oi++) {
    var st = order[oi][0];
    if (occ[st] >= 0) continue;
    tryPlace(st, pickLen(), Math.min(opt.minLen, 4));
  }
  for (var pass = 0; pass < 3; pass++) {
    var left = 0;
    for (var c1 = 0; c1 < N; c1++) if (occ[c1] < 0 && !tryExtend(c1)) left++;
    if (!left) break;
    for (var c2 = 0; c2 < N; c2++) if (occ[c2] < 0) tryPlace(c2, rng.int(2, 4), 2);
  }
  for (var c3 = 0; c3 < N; c3++) if (occ[c3] < 0) tryExtend(c3);

  var out = [];
  for (var s2 = 0; s2 < segs.length; s2++) out.push({ cells: segs[s2].map(function (id) { return [id % w, (id / w) | 0]; }) });
  return { w: w, h: h, segs: out, portals: portals };
}

// ---------------- 规则（运行时与求解器共用） ----------------
function buildOcc(board, alive) {
  var occ = new Int16Array(board.w * board.h).fill(-1);
  for (var i = 0; i < board.segs.length; i++) {
    if (alive && !alive[i]) continue;
    var c = board.segs[i].cells;
    for (var j = 0; j < c.length; j++) occ[c[j][1] * board.w + c[j][0]] = i;
  }
  return occ;
}

// 相邻线（有一条边相邻）
function adjOf(board) {
  if (board._adj && board._adj.length === board.segs.length) return board._adj;
  var occ = buildOcc(board), n = board.segs.length, sets = [], w = board.w;
  for (var i = 0; i < n; i++) sets.push({});
  for (var y = 0; y < board.h; y++) for (var x = 0; x < w; x++) {
    var a = occ[y * w + x]; if (a < 0) continue;
    if (x + 1 < w) { var b = occ[y * w + x + 1]; if (b >= 0 && b !== a) { sets[a][b] = 1; sets[b][a] = 1; } }
    if (y + 1 < board.h) { var c = occ[(y + 1) * w + x]; if (c >= 0 && c !== a) { sets[a][c] = 1; sets[c][a] = 1; } }
  }
  var adj = sets.map(function (s) { return Object.keys(s).map(Number); });
  try { Object.defineProperty(board, '_adj', { value: adj, enumerable: false, configurable: true, writable: true }); } catch (e) { board._adj = adj; }
  return adj;
}

function isPlain(seg) { return !seg.ice && seg.lock == null && seg.key == null && !seg.bi && !seg.rot && !seg.bomb && seg.chain == null; }
function mechOf(seg) {
  if (seg.ice) return 'ice';
  if (seg.lock != null) return 'lock';
  if (seg.key != null) return 'key';
  if (seg.bi) return 'bi';
  if (seg.rot) return 'rot';
  if (seg.bomb) return 'bomb';
  if (seg.chain != null) return 'chain';
  return null;
}

// 旋转机关可选方向（不能朝自己身体倒退）
function rotDirs(seg) {
  var cl = seg.cells, L = cl.length, hd = cl[L - 1], pv = cl[L - 2], out = [];
  for (var i = 0; i < 4; i++) if (!(hd[0] + DIRS[i][0] === pv[0] && hd[1] + DIRS[i][1] === pv[1])) out.push(i);
  return out;
}

// 运行状态：alive / ice（剩余冰层）/ rdir（旋转机关当前方向）
function initState(board) {
  var n = board.segs.length, s = { alive: [], ice: [], rdir: [], left: n };
  for (var i = 0; i < n; i++) {
    var sg = board.segs[i];
    s.alive.push(true); s.ice.push(sg.ice || 0);
    s.rdir.push(sg.rot ? (sg.rdir != null ? sg.rdir : dirIndex(headDir(sg.cells))) : -1);
  }
  s.occ = buildOcc(board, s.alive);
  return s;
}
function cloneState(s) { return { alive: s.alive.slice(), ice: s.ice.slice(), rdir: s.rdir.slice(), left: s.left, occ: new Int16Array(s.occ) }; }

// 某条线的某个出射选项：'head'（默认）、'tail'（双向线反向）、'r0'..'r3'（旋转机关指定方向）
// 返回 { track: 按运动顺序的格子(尾→头), dir: [dx,dy], ray: 出射线格子 id }
function exitOf(board, si, opt, state) {
  var seg = board.segs[si], cl = seg.cells, d;
  if (opt === 'tail') { cl = cl.slice().reverse(); d = headDir(cl); }
  else if (opt && opt.charAt(0) === 'r') d = DIRS[+opt.charAt(1)];
  else if (seg.rot && state && state.rdir[si] >= 0) d = DIRS[state.rdir[si]];
  else d = headDir(cl);
  var hd = cl[cl.length - 1];
  return { track: cl, dir: d, ray: traceRay(board.w, board.h, board.portals && board.portals.length ? pmapOf(board) : null, hd[0], hd[1], d[0], d[1]) };
}
// 当前（玩家视角）可尝试的出射选项
function optionsOf(board, si, state, all) {
  var seg = board.segs[si];
  if (seg.bi) return ['head', 'tail'];
  if (seg.rot) return all ? rotDirs(seg).map(function (i) { return 'r' + i; }) : ['r' + state.rdir[si]];
  return ['head'];
}
// 第一处阻挡在出射线上的下标（-1 = 畅通）
function blockIndex(ex, occ, si) {
  for (var r = 0; r < ex.ray.length; r++) { var o = occ[ex.ray[r]]; if (o >= 0 && o !== si) return r; }
  return -1;
}
// 能否点击（冰封未破 / 上锁 时不可点）
function tapBlock(board, state, si) {
  if (state.ice[si] > 0) return 'ice';
  var lk = board.segs[si].lock;
  if (lk != null && state.alive[lk]) return 'lock';
  return null;
}
// 求解器视角：能否移除（任一可选方向畅通）。返回可用选项或 null
function removableOpt(board, state, si, all) {
  if (!state.alive[si] || tapBlock(board, state, si)) return null;
  var ops = optionsOf(board, si, state, all);
  for (var k = 0; k < ops.length; k++) { var ex = exitOf(board, si, ops[k], state); if (blockIndex(ex, state.occ, si) < 0) return ops[k]; }
  return null;
}

// 移除一条线并结算机关效果。cause: 'exit'（飞出）| 'tool'（道具）。返回 [{i, why}]（why: self/bomb/chain）
function removeLine(board, state, si, cause) {
  var out = [], queue = [[si, 'self']], adj = adjOf(board);
  while (queue.length) {
    var q = queue.shift(), i = q[0];
    if (!state.alive[i]) continue;
    state.alive[i] = false; state.left--;
    var cl = board.segs[i].cells;
    for (var j = 0; j < cl.length; j++) { var c = cl[j][1] * board.w + cl[j][0]; if (state.occ[c] === i) state.occ[c] = -1; }
    out.push({ i: i, why: q[1] });
    var nb = adj[i];
    for (var k = 0; k < nb.length; k++) if (state.alive[nb[k]] && state.ice[nb[k]] > 0) state.ice[nb[k]]--;
    var seg = board.segs[i];
    // 连锁：连带拉出搭档
    if (seg.chain != null && state.alive[seg.chain]) queue.push([seg.chain, 'chain']);
    // 炸弹：飞出时炸开 3×3 范围内的普通线
    if (seg.bomb && cause === 'exit' && q[1] === 'self') {
      var bc = bombCenter(seg), victims = [];
      for (var dy = -1; dy <= 1; dy++) for (var dx = -1; dx <= 1; dx++) {
        var x = bc[0] + dx, y = bc[1] + dy; if (x < 0 || y < 0 || x >= board.w || y >= board.h) continue;
        var o = state.occ[y * board.w + x]; if (o >= 0 && victims.indexOf(o) < 0 && isPlain(board.segs[o])) victims.push(o);
      }
      victims.forEach(function (v) { queue.push([v, 'bomb']); });
    }
  }
  return out;
}
function bombCenter(seg) { return seg.cells[Math.floor(seg.cells.length / 2)]; }
// 3×3 范围（道具炸弹）内允许清除的线：普通线
function bombVictims(board, state, cx, cy) {
  var v = [];
  for (var dy = -1; dy <= 1; dy++) for (var dx = -1; dx <= 1; dx++) {
    var x = cx + dx, y = cy + dy; if (x < 0 || y < 0 || x >= board.w || y >= board.h) continue;
    var o = state.occ[y * board.w + x]; if (o >= 0 && v.indexOf(o) < 0 && isPlain(board.segs[o])) v.push(o);
  }
  return v;
}

// 贪心逐轮求解（单调系统下精确）：每轮移走所有当前可出的线（含机关效果）
function solve(board, state0) {
  var s = state0 ? cloneState(state0) : initState(board), n = board.segs.length, layers = 0, frees = [], order = [];
  while (s.left > 0) {
    var free = [];
    for (var i = 0; i < n; i++) { if (!s.alive[i]) continue; var op = removableOpt(board, s, i, true); if (op) free.push([i, op]); }
    if (!free.length) return { solvable: false, layers: layers, n: n, state: s, frees: frees, order: order };
    var cnt = 0;
    for (var f = 0; f < free.length; f++) {
      if (!s.alive[free[f][0]]) continue;
      order.push(free[f]);
      cnt += removeLine(board, s, free[f][0], 'exit').length;
    }
    frees.push(free.length); layers++;
  }
  return { solvable: true, layers: layers, n: n, frees: frees, order: order, state: s };
}

function grade(board) {
  var r = solve(board), n = board.segs.length, w = board.w, hh = board.h;
  if (!r.solvable) return { solvable: false, layers: r.layers, n: n, stuck: r.state };
  var cov = 0, lens = [], long6 = 0, mech = 0;
  for (var q = 0; q < n; q++) { var L = board.segs[q].cells.length; cov += L; lens.push(L); if (L >= 6) long6++; if (mechOf(board.segs[q])) mech++; }
  var avgLen = cov / n;
  cov /= (w * hh);
  var avgFree = n / r.layers;
  return { solvable: true, layers: r.layers, n: n, avgFree: avgFree, firstFree: r.frees[0], coverage: cov, avgLen: avgLen, longFrac: long6 / n, maxLen: Math.max.apply(0, lens), mech: mech, order: r.order.map(function (o) { return o[0]; }) };
}
// 兼容：按当前占用判断普通方向是否可出
function isFree(board, occ, si) {
  var ex = exitOf(board, si, 'head', null);
  return blockIndex(ex, occ, si) < 0;
}

// ---------------- 机关装饰 ----------------
var MECHS = [['ice', 11], ['lock', 16], ['bi', 21], ['rot', 31], ['portal', 41], ['bomb', 51], ['chain', 61]];
var MECH_NAME = { ice: '冰封', lock: '锁与钥匙', bi: '双向', rot: '旋转机关', portal: '传送门', bomb: '炸弹', chain: '连锁' };
function mechStart(m) { for (var i = 0; i < MECHS.length; i++) if (MECHS[i][0] === m) return MECHS[i][1]; return 1e9; }
// 第 n 关使用的机关：首次出现的 5 关内只有新机关（+普通线）；之后本章新机关+一种旧机关；71 关起两种已学机关组合
function mechsFor(n) {
  var learned = MECHS.filter(function (m) { return m[1] <= n; }).map(function (m) { return m[0]; });
  if (!learned.length) return [];
  var newest = learned[learned.length - 1];
  if (n < mechStart(newest) + 5) return [newest];
  var prev = learned.slice(0, -1);
  if (n < 71) return prev.length ? [newest, prev[n % prev.length]] : [newest];
  var h = R.hashStr('mix-' + n), a = learned[h % learned.length], b = learned[(h >>> 4) % learned.length];
  if (a === b) b = learned[(learned.indexOf(a) + 1 + ((h >>> 9) % (learned.length - 1))) % learned.length];
  return [a, b];
}

function decorate(board, mechs, rng, opt) {
  opt = opt || {};
  var n = board.segs.length, segs = board.segs, f = n / 150 * (mechs.length > 1 ? 0.7 : 1), intro = !!opt.intro;
  var used = {};
  function pool(pred) { var a = []; for (var i = 0; i < n; i++) if (!used[i] && isPlain(segs[i]) && pred(segs[i], i)) a.push(i); return rng.shuffle(a); }
  function cnt(base) { return Math.max(intro ? 2 : 2, Math.round(base * f * (intro ? 0.6 : 1))); }
  var adj = adjOf(board);
  var base = grade(board); // 普通移除顺序（用于挑“有意义”的位置）
  var round = new Int32Array(n);
  if (base.solvable) { var rr = solve(board); var k = 0; rr.frees.forEach(function (c, li) { for (var j = 0; j < c; j++) { var it = rr.order[k++]; if (it) round[it[0]] = li; } }); }
  mechs.forEach(function (m) {
    if (m === 'portal') return; // 生成时已预留
    if (m === 'ice') {
      // 冰封：放在中后期移除的线上（周围先走的邻线多，能破冰）
      var p = pool(function (s, i) { return s.cells.length >= 3 && round[i] >= 2 && adj[i].length >= 3; });
      p.slice(0, cnt(10)).forEach(function (i) {
        var early = adj[i].filter(function (j) { return round[j] < round[i]; }).length;
        var v = Math.max(1, Math.min(intro ? 1 : 3, early - 1, 1 + Math.floor(rng.next() * 3)));
        segs[i].ice = v; used[i] = 1;
      });
    } else if (m === 'lock') {
      // 锁+钥匙：钥匙在锁之前（求解顺序上）被移除；两者不相邻也可
      var locks = pool(function (s, i) { return round[i] >= 3; }), keys = pool(function (s, i) { return true; });
      var made = 0, want = cnt(5);
      for (var a = 0; a < locks.length && made < want; a++) {
        var L = locks[a]; if (used[L]) continue;
        var cands = keys.filter(function (k2) { return !used[k2] && k2 !== L && round[k2] < round[L] && round[k2] >= Math.max(0, round[L] - 6); });
        if (!cands.length) continue;
        var K = cands[0];
        segs[L].lock = K; segs[K].key = L; segs[L].pair = segs[K].pair = made; used[L] = used[K] = 1; made++;
      }
    } else if (m === 'bi') {
      // 双向：反向出射线不穿过自己，且尾端的阻挡线在普通求解顺序里比本线更早走（尾端会成为真正的捷径）
      var occ0 = buildOcc(board), pm0 = board.portals && board.portals.length ? pmapOf(board) : null, scored = [];
      pool(function (s) { return s.cells.length >= 3; }).forEach(function (i) {
        var s = segs[i], cl = s.cells.slice().reverse(), d = headDir(cl), hd = cl[cl.length - 1];
        var ray = traceRay(board.w, board.h, pm0, hd[0], hd[1], d[0], d[1]), ready = 0;
        for (var r = 0; r < ray.length; r++) { var o = occ0[ray[r]]; if (o === i) return; if (o >= 0) ready = Math.max(ready, round[o] + 1); }
        if (ready < round[i]) scored.push([i, round[i] - ready + rng.next()]);
      });
      scored.sort(function (x, y) { return y[1] - x[1]; });
      scored.slice(0, cnt(9)).forEach(function (q) { segs[q[0]].bi = true; used[q[0]] = 1; });
    } else if (m === 'rot') {
      // 旋转机关：箭头处的转盘，初始朝向随机（多数不是原方向，需要先转）
      var pr = pool(function (s) { return s.cells.length >= 3; });
      pr.slice(0, cnt(7)).forEach(function (i) {
        var ds = rotDirs(segs[i]), nat = dirIndex(headDir(segs[i].cells)), others = ds.filter(function (d) { return d !== nat; });
        segs[i].rot = true; segs[i].rdir = rng.next() < 0.8 ? others[rng.int(0, others.length - 1)] : nat; used[i] = 1;
      });
    } else if (m === 'bomb') {
      var pbm = pool(function (s, i) { return s.cells.length >= 3 && round[i] <= Math.max(2, base.layers * 0.6); });
      pbm.slice(0, cnt(4)).forEach(function (i) { segs[i].bomb = true; used[i] = 1; });
    } else if (m === 'chain') {
      // 连锁：两条相邻的普通线锁链相连，飞走一条会连带拉出另一条
      var pc = pool(function (s, i) { return s.cells.length >= 3; }), made2 = 0, want2 = cnt(4);
      for (var c = 0; c < pc.length && made2 < want2; c++) {
        var A = pc[c]; if (used[A]) continue;
        var bs = adj[A].filter(function (j) { return !used[j] && isPlain(segs[j]) && segs[j].cells.length >= 3; });
        if (!bs.length) continue;
        var B = bs[rng.int(0, bs.length - 1)];
        segs[A].chain = B; segs[B].chain = A; segs[A].pair = segs[B].pair = made2; used[A] = used[B] = 1; made2++;
      }
    }
  });
  // 验证 + 修复：卡住的冰降级、卡住的锁拆掉，直到可解
  for (var it = 0; it < 30; it++) {
    var r = solve(board);
    if (r.solvable) return true;
    var s = r.state, fixed = false;
    for (var i = 0; i < n; i++) {
      if (!s.alive[i]) continue;
      if (s.ice[i] > 0) { segs[i].ice = Math.max(0, segs[i].ice - s.ice[i]); if (!segs[i].ice) delete segs[i].ice; fixed = true; }
      var lk = segs[i].lock;
      if (lk != null && s.alive[lk]) { delete segs[lk].key; delete segs[lk].pair; delete segs[i].lock; delete segs[i].pair; fixed = true; }
    }
    if (!fixed) break;
  }
  // 兜底：去掉全部冰与锁（普通线 DAG 必然可解）
  segs.forEach(function (s) { delete s.ice; delete s.lock; delete s.key; });
  return solve(board).solvable;
}

// 上色：相邻线尽量不同色（8 色）
var NCOLORS = 8;
function colorize(board, rng) {
  var n = board.segs.length, adj = adjOf(board);
  var base = []; for (var k0 = 0; k0 < NCOLORS; k0++) base.push(k0);
  for (var s = 0; s < n; s++) {
    var cand = rng.shuffle(base.slice()), best = cand[0], bestBad = 99;
    for (var k = 0; k < NCOLORS; k++) {
      var bad = 0;
      for (var j = 0; j < adj[s].length; j++) if (board.segs[adj[s][j]].color === cand[k]) bad++;
      if (bad < bestBad) { bestBad = bad; best = cand[k]; }
    }
    board.segs[s].color = best;
  }
}

// ---------------- 关卡曲线 ----------------
function lerp(a, b, t) { return a + (b - a) * Math.max(0, Math.min(1, t)); }
function ease(t) { t = Math.max(0, Math.min(1, t)); return 1 - (1 - t) * (1 - t); }

// 尺寸：L2 14x20 → L10 20x30 → L30 26x40 → L80 起逐步到 L150 28x44
function sizeFor(n) {
  if (n <= 10) { var t = (n - 2) / 8; return [Math.round(lerp(14, 20, t)), Math.round(lerp(20, 30, t))]; }
  if (n <= 30) { var t2 = (n - 10) / 20; return [Math.round(lerp(20, 26, t2)), Math.round(lerp(30, 40, t2))]; }
  var t3 = (n - 80) / 70; return [Math.round(lerp(26, 28, t3)), Math.round(lerp(40, 44, t3))];
}

function paramsFor(n) {
  var sz = sizeFor(n), w = sz[0], h = sz[1];
  var boss = (n % 10 === 0) && n > 5;
  var rest = (n % 10 === 1) && n > 10;
  var mechs = mechsFor(n);
  var opt = {
    minLen: 4, maxLen: 11, meanLen: lerp(7, 7.2, n / 200), maxCap: 13,
    shortP: 0.05, turnP: lerp(0.4, 0.5, n / 150), hugP: lerp(0.35, 0.45, n / 150),
    bias: lerp(-2.5, -0.6, ease((n - 2) / 200)) + (boss ? 0.8 : 0) - (rest ? 0.8 : 0),
    lenW: 0.35, tries: 6, edgeFirst: lerp(1.2, 0.6, ease(n / 80)),
    portals: mechs.indexOf('portal') >= 0 ? (n < mechStart('portal') + 5 ? 1 : 2) : 0
  };
  return { w: w, h: h, opt: opt, boss: boss, rest: rest, mechs: mechs, intro: mechs.length === 1 && n === mechStart(mechs[0]) };
}

// 目标“移除轮数”
function targetRounds(n, p) {
  var base;
  if (n <= 10) base = lerp(10, 22, (n - 2) / 8);
  else if (n <= 30) base = lerp(24, 38, (n - 10) / 20);
  else base = 38 + 22 * (1 - Math.exp(-(n - 30) / 150));
  if (p.boss) base *= 1.15;
  if (p.rest) base *= 0.88;
  return base;
}
function targetD(n, p) { return targetRounds(n, p); }

var PICK = null;
try { PICK = require('./levelpick'); } catch (e) { PICK = null; }

function candidatesFor(n) { return n <= 10 ? 6 : 5; }

function buildLevel(n, k) {
  var p = paramsFor(n);
  var rng = R.makeRng('shanhai-arrow-v4-L' + n + '-' + k);
  var b = generate(p.w, p.h, rng, p.opt);
  if (p.mechs.length) decorate(b, p.mechs, R.makeRng('mech-v4-L' + n + '-' + k), { intro: p.intro });
  b.mechs = p.mechs;
  b.grade = grade(b);
  return b;
}

function searchLevel(n) {
  var p = paramsFor(n), T = targetRounds(n, p), best = null, bestErr = 1e9, bestK = -1;
  var K = candidatesFor(n);
  for (var k = 0; k < K || (!best && k < 40); k++) {
    var b = buildLevel(n, k), g = b.grade;
    if (!g.solvable) continue;
    var err = Math.abs(g.layers - T) + (1 - g.coverage) * 40;
    if (err < bestErr) { bestErr = err; best = b; bestK = k; }
  }
  best.pick = bestK;
  return best;
}

function makeTutorial() {
  return {
    w: 3, h: 3, portals: [], mechs: [],
    segs: [
      { cells: [[0, 0], [1, 0], [2, 0]], color: 0 },
      { cells: [[0, 2], [0, 1], [1, 1]], color: 1 },
      { cells: [[2, 2], [2, 1]], color: 6 }
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
    var k = PICK && PICK[n - 2] != null ? PICK[n - 2] : -1;
    if (k >= 0) { board = buildLevel(n, k); board.pick = k; if (!board.grade.solvable) board = searchLevel(n); }
    else board = searchLevel(n);
    colorize(board, R.makeRng('color-' + n));
  }
  board.id = n;
  board.boss = n % 10 === 0;
  cache[n] = board;
  return board;
}

function dailyMechs(dateStr) {
  var h = R.hashStr('dm-' + dateStr), all = ['ice', 'lock', 'bi', 'rot', 'portal', 'bomb', 'chain'];
  var a = all[h % 7], b = all[(h >>> 3) % 7]; if (a === b) b = all[(all.indexOf(a) + 3) % 7];
  return [a, b];
}
function dailyParams(mechs) {
  return { minLen: 4, maxLen: 11, meanLen: 7.2, maxCap: 13, shortP: 0.05, turnP: 0.5, hugP: 0.45, bias: -0.3, lenW: 0.35, tries: 6, edgeFirst: 0.5, portals: mechs.indexOf('portal') >= 0 ? 2 : 0 };
}
function getDaily(dateStr) {
  var key = 'daily-' + dateStr;
  if (cache[key]) return cache[key];
  var best = null, bestErr = 1e9, mechs = dailyMechs(dateStr);
  // 每日挑战：28x44 大盘 + 两种机关，目标约 65 轮；只生成 1 个候选（手机上即时生成）
  for (var k = 0; k < 1 || (!best && k < 30); k++) {
    var rng = R.makeRng(key + '-v4-' + k);
    var b = generate(28, 44, rng, dailyParams(mechs));
    decorate(b, mechs, R.makeRng(key + '-mech-' + k));
    var g = grade(b);
    if (!g.solvable) continue;
    var err = Math.abs(g.layers - 65) + (1 - g.coverage) * 40;
    if (err < bestErr) { bestErr = err; best = b; best.grade = g; }
  }
  best.mechs = mechs;
  colorize(best, R.makeRng(key));
  best.id = 'daily';
  best.daily = dateStr;
  cache[key] = best;
  return best;
}

// 深拷贝（游玩时可能“调头”改动线，不能污染缓存）
function cloneBoard(b) {
  var o = JSON.parse(JSON.stringify({ w: b.w, h: b.h, segs: b.segs, portals: b.portals || [], mechs: b.mechs || [] }));
  o.grade = b.grade; o.id = b.id; o.boss = b.boss; o.daily = b.daily; o.pick = b.pick;
  return o;
}

module.exports = {
  DIRS: DIRS, headDir: headDir, dirIndex: dirIndex, rayCells: rayCells, traceRay: traceRay, pmapOf: pmapOf, generate: generate, grade: grade, solve: solve,
  isFree: isFree, buildOcc: buildOcc, adjOf: adjOf, getLevel: getLevel, getDaily: getDaily, paramsFor: paramsFor, sizeFor: sizeFor, mechsFor: mechsFor,
  targetD: targetD, targetRounds: targetRounds, searchLevel: searchLevel, buildLevel: buildLevel, decorate: decorate, cloneBoard: cloneBoard,
  initState: initState, cloneState: cloneState, exitOf: exitOf, optionsOf: optionsOf, blockIndex: blockIndex, tapBlock: tapBlock, removableOpt: removableOpt,
  removeLine: removeLine, bombVictims: bombVictims, bombCenter: bombCenter, rotDirs: rotDirs, isPlain: isPlain, mechOf: mechOf,
  MECHS: MECHS, MECH_NAME: MECH_NAME, mechStart: mechStart, dailyMechs: dailyMechs,
  NCOLORS: NCOLORS, TOTAL: 500
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

// 多点触控：fn(type, id, x, y)，type 为 down / move / up（取消也按 up 处理）
P.onPointers = function (fn) {
  if (isWx) {
    var each = function (type) {
      return function (e) {
        var ts = e.changedTouches || e.touches || [];
        for (var i = 0; i < ts.length; i++) { var t = ts[i]; fn(type, t.identifier != null ? t.identifier : i, t.clientX, t.clientY); }
      };
    };
    wx.onTouchStart(each('down'));
    wx.onTouchMove(each('move'));
    wx.onTouchEnd(each('up'));
    wx.onTouchCancel(each('up'));
    return;
  }
  var down = {};
  canvas.addEventListener('pointerdown', function (e) { down[e.pointerId] = 1; e.preventDefault(); fn('down', e.pointerId, e.clientX, e.clientY); });
  window.addEventListener('pointermove', function (e) { if (down[e.pointerId]) fn('move', e.pointerId, e.clientX, e.clientY); });
  var up = function (e) { if (down[e.pointerId]) { delete down[e.pointerId]; fn('up', e.pointerId, e.clientX, e.clientY); } };
  window.addEventListener('pointerup', up);
  window.addEventListener('pointercancel', up);
};
// 鼠标滚轮（仅浏览器）：fn(x, y, deltaY)
P.onWheel = function (fn) {
  if (isWx) return;
  canvas.addEventListener('wheel', function (e) { e.preventDefault(); var d = e.deltaY * (e.deltaMode === 1 ? 33 : 1); fn(e.clientX, e.clientY, d); }, { passive: false });
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

// 任意键存储（埋点日志等）
P.loadKey = function (key) {
  try { var s = isWx ? wx.getStorageSync(key) : localStorage.getItem(key); return s ? (typeof s === 'string' ? JSON.parse(s) : s) : null; } catch (e) { return null; }
};
P.saveKey = function (key, obj) {
  try { var s = JSON.stringify(obj); if (isWx) wx.setStorageSync(key, s); else localStorage.setItem(key, s); } catch (e) {}
};
// 微信自定义分析上报（需在 mp 后台「数据分析 → 自定义分析」先配置事件；未配置或非微信环境时静默跳过）
P.reportEvent = function (name, data) {
  if (!isWx || typeof wx.reportEvent !== 'function') return false;
  try { wx.reportEvent(name, data || {}); return true; } catch (e) { return false; }
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
var SFX = ['pluck0', 'pluck1', 'pluck2', 'pluck3', 'pluck4', 'pluck5', 'pluck6', 'pluck7', 'hit', 'tap', 'win', 'fail', 'remove', 'unlock', 'tick'];
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
var rewarded = null, rewardCb = null, inter = null, adOpen = 0;
// 广告是否正在展示（倒计时据此暂停）
P.adShowing = function () { return adOpen > 0; };
P._setAdShowing = function (on) { adOpen = on ? 1 : 0; }; // 调试 / 测试用
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
    try { inter.onClose(function () { adOpen = 0; }); } catch (e) {}
  }
};
// 返回 Promise<{ok:boolean, msg?:string}>
P.showRewarded = function () {
  return new Promise(function (resolve) {
    if (!rewarded) { resolve({ ok: true, msg: '测试：模拟广告' }); return; }
    adOpen = 1;
    rewardCb = function (ok) { adOpen = 0; resolve({ ok: ok, msg: ok ? '' : '完整观看后才能获得奖励' }); };
    rewarded.show().catch(function () {
      rewarded.load().then(function () { return rewarded.show(); }).catch(function () { adOpen = 0; rewardCb = null; resolve({ ok: false, msg: '广告暂时无法播放，请稍后再试' }); });
    });
  });
};
P.showInterstitial = function () {
  if (!inter) return;
  adOpen = 1;
  inter.show().catch(function () { adOpen = 0; });
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
M["timer"]=function(module,exports,require){
// 每关倒计时：限时公式 + 纯逻辑计时器（无平台依赖，可在 Node 里单测）
var CFG = require('./config');

// 机关线数（冰封/锁/钥匙/双向/旋转/炸弹/连锁 + 每对传送门算 2）
function mechCount(board) {
  var m = 0;
  for (var i = 0; i < board.segs.length; i++) { var s = board.segs[i]; if (s.ice || s.lock != null || s.key != null || s.bi || s.rot || s.bomb || s.chain != null) m++; }
  return m + 2 * ((board.portals || []).length);
}
// 三星用时标准（秒）：限时 × STAR_TIME_FRAC；前 N 关不按用时扣星（返回 0 = 不要求）
function starTimeFor(limit, n, daily) {
  if (!limit) return 0;
  if (!daily && n <= (CFG.STAR_NO_TIME_LEVELS || 0)) return 0;
  return Math.round(limit * (CFG.STAR_TIME_FRAC || 0.7));
}
function roundTo(x, k) { k = k || 5; return Math.round(x / k) * k; }

// 第 n 关（或每日挑战 daily=日期字符串）的限时秒数；0 = 不计时
function limitFor(board, n, daily) {
  if (!CFG.TIMER_ENABLED) return 0;
  if (!daily && n === 1) return CFG.TIMER_TUTORIAL_SECONDS || 0;
  if (daily && CFG.TIMER_DAILY_SECONDS) return CFG.TIMER_DAILY_SECONDS;
  var lines = board.segs.length, rounds = board.grade ? board.grade.layers || 0 : 0, mech = mechCount(board);
  var raw = CFG.TIMER_BASE + lines * (CFG.TIMER_PER_LINE + (CFG.TIMER_PER_LINE_ROUND || 0) * rounds) + CFG.TIMER_PER_ROUND * rounds + (CFG.TIMER_PER_MECH || 0) * mech;
  if (daily) raw *= CFG.TIMER_DAILY_MULT;
  else if (n % 10 === 0 && n > 5) raw *= CFG.TIMER_GUARDIAN_MULT;
  else if (n % 10 === 1 && n > 10) raw *= CFG.TIMER_REST_MULT;
  return Math.max(CFG.TIMER_MIN || 0, roundTo(raw, CFG.TIMER_ROUND_TO));
}

function create(limit) {
  return { limit: limit || 0, left: limit || 0, started: false, idle: 0, revives: 0, expired: false, lastSec: Math.ceil(limit || 0), elapsed: 0 };
}
function active(t) { return !!(t && t.limit > 0); }
function start(t) { if (active(t) && !t.expired) t.started = true; }
// 推进 dt 秒；paused 时完全不动。返回 { tick: 剩余整秒(最后 N 秒每秒一次) | null, expired: bool }
function tick(t, dt, paused) {
  var ev = { tick: null, expired: false };
  if (!active(t) || t.expired || paused) return ev;
  if (!t.started) {
    t.idle += dt;
    if (t.idle >= (CFG.TIMER_INTRO_SECONDS || 0)) t.started = true;
    return ev;
  }
  t.left = Math.max(0, t.left - dt); t.elapsed += dt;
  var sec = Math.ceil(t.left);
  if (sec !== t.lastSec) {
    if (sec < t.lastSec && sec > 0 && sec <= (CFG.TIMER_WARN_SECONDS || 10)) ev.tick = sec;
    t.lastSec = sec;
  }
  if (t.left <= 0) { t.expired = true; ev.expired = true; }
  return ev;
}
function canRevive(t) { return active(t) && t.revives < (CFG.TIMER_REVIVES_PER_LEVEL || 0); }
function revive(t, sec) {
  sec = sec == null ? CFG.TIMER_REVIVE_SECONDS : sec;
  t.left += sec; t.expired = false; t.revives++; t.started = true; t.lastSec = Math.ceil(t.left);
}
function warn(t) { return active(t) && t.started && Math.ceil(t.left) <= (CFG.TIMER_WARN_SECONDS || 10); }
function fmt(sec) {
  sec = Math.max(0, Math.ceil(sec - 1e-6));
  var m = Math.floor(sec / 60), s = sec % 60;
  return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
}

module.exports = { mechCount: mechCount, starTimeFor: starTimeFor, limitFor: limitFor, create: create, start: start, tick: tick, canRevive: canRevive, revive: revive, warn: warn, fmt: fmt, active: active };

};
M["analytics"]=function(module,exports,require){
// 数据埋点：本地环形日志 + wx.reportEvent 占位（CFG.ANALYTICS_WX=true 且已在 mp 后台配置事件时才真正上报）
// 事件：game_start, tutorial_step, level_start, arrow_tap, arrow_blocked, arrow_removed, hint_used,
//       level_win, level_fail, level_retry, ad_offer, ad_reward_success, session_end
var P = require('./platform');
var CFG = require('./config');
var KEY = 'shanhai_arrow_events_v1', MAX = 400;
var log = null, dirty = 0, session = null;
var EVENTS = ['game_start', 'tutorial_step', 'level_start', 'arrow_tap', 'arrow_blocked', 'arrow_removed', 'hint_used',
  'level_win', 'level_fail', 'level_retry', 'ad_offer', 'ad_reward_success', 'session_end'];

function load() { if (!log) { log = P.loadKey(KEY); if (!log || !log.events) log = { events: [], counts: {} }; } return log; }
function flush() { if (log && dirty) { P.saveKey(KEY, log); dirty = 0; } }
function track(name, data) {
  load();
  var e = { e: name, t: Date.now() };
  if (data) for (var k in data) e[k] = data[k];
  if (session) e.sid = session.id;
  log.events.push(e);
  if (log.events.length > MAX) log.events.splice(0, log.events.length - MAX);
  log.counts[name] = (log.counts[name] || 0) + 1;
  dirty++;
  // 高频事件（点按/移除）批量落盘，其余立即落盘
  if (name !== 'arrow_tap' && name !== 'arrow_removed' && name !== 'arrow_blocked' || dirty >= 30) flush();
  if (CFG.ANALYTICS_WX) {
    var flat = {}; for (var k2 in e) if (k2 !== 'e' && k2 !== 't' && (typeof e[k2] === 'number' || typeof e[k2] === 'string')) flat[k2] = e[k2];
    P.reportEvent(name, flat);
  }
  return e;
}
function startSession() { session = { id: Date.now().toString(36), t0: Date.now() }; track('game_start'); }
function endSession() { if (session) { track('session_end', { dur: Math.round((Date.now() - session.t0) / 1000) }); flush(); } }
function recent(n) { load(); return log.events.slice(-(n || 50)); }
function counts() { load(); return log.counts; }

module.exports = { track: track, flush: flush, startSession: startSession, endSession: endSession, recent: recent, counts: counts, EVENTS: EVENTS };

};
M["glyphs"]=function(module,exports,require){
// 代码绘制的国风小图标：机关（冰封/铜锁/玉钥/转盘/传送门/炸弹/锁链）与道具（锤子/炸弹/调头/重置）
var Y = {};
var PAIR_COLS = ['#F2C14E', '#7FD1E8', '#F28BB8', '#A3E07A', '#C9A0FF', '#FF9F68'];
Y.PAIR_COLS = PAIR_COLS;
Y.PORTAL_COLS = [['#B48CFF', '#5B2EA6'], ['#5FE0C8', '#147A6A'], ['#FFB25F', '#9A4B0B']];

function circle(c, x, y, r) { c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); }

// 冰封：半透明冰晶六角牌 + 剩余层数 + 裂纹（已破的层数越多裂纹越多）
Y.ice = function (c, x, y, s, remain, total) {
  var r = s * 0.42;
  c.save();
  c.beginPath();
  for (var i = 0; i < 6; i++) { var a = Math.PI / 6 + i * Math.PI / 3; c[i ? 'lineTo' : 'moveTo'](x + Math.cos(a) * r, y + Math.sin(a) * r); }
  c.closePath();
  var g = c.createLinearGradient(x - r, y - r, x + r, y + r);
  g.addColorStop(0, 'rgba(235,250,255,0.97)'); g.addColorStop(1, 'rgba(140,200,240,0.97)');
  c.fillStyle = g; c.fill();
  c.lineWidth = Math.max(1, s * 0.06); c.strokeStyle = '#2E6E9E'; c.stroke();
  var cracks = Math.max(0, total - remain);
  c.strokeStyle = 'rgba(30,80,120,0.85)'; c.lineWidth = Math.max(0.8, s * 0.035);
  for (var k = 0; k < cracks; k++) {
    var a0 = k * 2.1 + 0.4;
    c.beginPath(); c.moveTo(x + Math.cos(a0) * r * 0.95, y + Math.sin(a0) * r * 0.95);
    c.lineTo(x + Math.cos(a0 + 0.5) * r * 0.45, y + Math.sin(a0 + 0.5) * r * 0.45);
    c.lineTo(x + Math.cos(a0 + 0.2) * r * 0.15, y + Math.sin(a0 + 0.2) * r * 0.15);
    c.stroke();
  }
  c.fillStyle = '#123E63'; c.font = '900 ' + Math.round(s * 0.5) + 'px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.fillText(String(remain), x, y + s * 0.03);
  c.restore();
};
// 冰封线外的霜层（沿线描一层冰蓝）
Y.frost = function (c, pathFn, w) {
  c.save();
  c.strokeStyle = 'rgba(200,236,255,0.75)'; c.lineWidth = w * 1.9; pathFn(); c.stroke();
  c.strokeStyle = 'rgba(255,255,255,0.85)'; c.lineWidth = Math.max(1, w * 0.35); c.setLineDash([w * 0.9, w * 1.3]); pathFn(); c.stroke();
  c.restore();
};

// 青铜锁（配对色描边）
Y.lock = function (c, x, y, s, col) {
  var w = s * 0.62, h = s * 0.48, top = y - h * 0.25;
  c.save();
  circle(c, x, y, s * 0.47); c.fillStyle = 'rgba(25,18,10,0.82)'; c.fill(); c.lineWidth = Math.max(1.2, s * 0.08); c.strokeStyle = col; c.stroke();
  c.lineWidth = Math.max(1.2, s * 0.09); c.strokeStyle = '#C99A4B';
  c.beginPath(); c.arc(x, top, w * 0.3, Math.PI, 0); c.stroke();
  var g = c.createLinearGradient(0, top, 0, top + h); g.addColorStop(0, '#E3B866'); g.addColorStop(1, '#8A5A1E');
  c.fillStyle = g; c.beginPath(); c.rect(x - w / 2, top, w, h); c.fill();
  c.fillStyle = '#3A220C'; circle(c, x, top + h * 0.42, s * 0.06); c.fill(); c.fillRect(x - s * 0.025, top + h * 0.45, s * 0.05, h * 0.35);
  c.restore();
};
// 玉钥匙
Y.key = function (c, x, y, s, col) {
  c.save();
  circle(c, x, y, s * 0.47); c.fillStyle = 'rgba(25,18,10,0.82)'; c.fill(); c.lineWidth = Math.max(1.2, s * 0.08); c.strokeStyle = col; c.stroke();
  c.translate(x, y); c.rotate(-Math.PI / 4);
  var g = c.createLinearGradient(-s * 0.3, 0, s * 0.3, 0); g.addColorStop(0, '#B8F0C8'); g.addColorStop(1, '#3E9A62');
  c.fillStyle = g; c.strokeStyle = g; c.lineWidth = Math.max(1.2, s * 0.09);
  circle(c, -s * 0.17, 0, s * 0.13); c.fill();
  c.fillStyle = 'rgba(25,18,10,0.9)'; circle(c, -s * 0.17, 0, s * 0.05); c.fill();
  c.beginPath(); c.moveTo(-s * 0.05, 0); c.lineTo(s * 0.3, 0); c.stroke();
  c.beginPath(); c.moveTo(s * 0.2, 0); c.lineTo(s * 0.2, s * 0.1); c.moveTo(s * 0.28, 0); c.lineTo(s * 0.28, s * 0.1); c.stroke();
  c.restore();
};

// 旋转机关：青铜转盘（齿边），ang 为转动角
Y.disc = function (c, x, y, s, ang) {
  var r = s * 0.46;
  c.save(); c.translate(x, y); c.rotate(ang || 0);
  c.beginPath();
  for (var i = 0; i < 16; i++) { var a = i * Math.PI / 8, rr = i % 2 ? r : r * 0.86; c[i ? 'lineTo' : 'moveTo'](Math.cos(a) * rr, Math.sin(a) * rr); }
  c.closePath();
  var g = c.createRadialGradient(0, -r * 0.3, r * 0.1, 0, 0, r); g.addColorStop(0, '#F3D27E'); g.addColorStop(1, '#8C5A16');
  c.fillStyle = g; c.fill(); c.lineWidth = Math.max(1, s * 0.05); c.strokeStyle = '#3A220C'; c.stroke();
  circle(c, 0, 0, r * 0.62); c.fillStyle = '#2B4A3C'; c.fill();
  c.restore();
};
// 旋转提示弧形箭头（教学/高亮用）
Y.rotArrow = function (c, x, y, r, col) {
  c.save(); c.strokeStyle = col; c.fillStyle = col; c.lineWidth = Math.max(1.5, r * 0.18);
  c.beginPath(); c.arc(x, y, r, -Math.PI * 0.9, Math.PI * 0.35); c.stroke();
  var ax = x + Math.cos(Math.PI * 0.35) * r, ay = y + Math.sin(Math.PI * 0.35) * r;
  c.beginPath(); c.moveTo(ax + r * 0.35, ay - r * 0.1); c.lineTo(ax - r * 0.25, ay + r * 0.35); c.lineTo(ax - r * 0.2, ay - r * 0.3); c.closePath(); c.fill();
  c.restore();
};

// 传送门：同色一对，旋涡转动
Y.portal = function (c, x, y, s, cols, t) {
  var r = s * 0.46;
  c.save();
  var g = c.createRadialGradient(x, y, r * 0.1, x, y, r);
  g.addColorStop(0, '#120A1E'); g.addColorStop(0.65, cols[1]); g.addColorStop(1, cols[0]);
  circle(c, x, y, r); c.fillStyle = g; c.fill();
  c.lineWidth = Math.max(1.2, s * 0.08); c.strokeStyle = cols[0]; c.stroke();
  c.translate(x, y); c.rotate(t * 2.4);
  c.strokeStyle = 'rgba(255,255,255,0.75)'; c.lineWidth = Math.max(1, s * 0.05);
  for (var k = 0; k < 3; k++) { c.rotate(Math.PI * 2 / 3); c.beginPath(); c.arc(r * 0.18, 0, r * 0.5, -0.4, 1.6); c.stroke(); }
  c.restore();
};

// 炸弹：黑铁弹 + 引信火星
Y.bomb = function (c, x, y, s, t) {
  var r = s * 0.3;
  c.save();
  circle(c, x, y, s * 0.47); c.fillStyle = 'rgba(25,18,10,0.82)'; c.fill(); c.lineWidth = Math.max(1.2, s * 0.08); c.strokeStyle = '#E8483A'; c.stroke();
  var g = c.createRadialGradient(x - r * 0.4, y - r * 0.3, r * 0.1, x, y + r * 0.1, r);
  g.addColorStop(0, '#8A8A96'); g.addColorStop(1, '#1A1A22');
  circle(c, x, y + s * 0.05, r); c.fillStyle = g; c.fill();
  c.strokeStyle = '#D9B26A'; c.lineWidth = Math.max(1, s * 0.06);
  c.beginPath(); c.moveTo(x + r * 0.5, y - r * 0.6); c.quadraticCurveTo(x + r * 0.9, y - r * 1.2, x + r * 1.1, y - r * 1.05); c.stroke();
  var f = 0.7 + 0.3 * Math.sin((t || 0) * 18);
  c.fillStyle = 'rgba(255,200,80,' + f + ')'; circle(c, x + r * 1.15, y - r * 1.1, s * 0.08 * f + s * 0.03); c.fill();
  c.restore();
};

// 锁链环（两节相扣），horiz 为链方向
Y.chain = function (c, x, y, s, horiz) {
  c.save(); c.translate(x, y); if (!horiz) c.rotate(Math.PI / 2);
  var w = s * 0.34, h = s * 0.2;
  c.lineWidth = Math.max(1.2, s * 0.09);
  [[-w * 0.45, '#E6C068'], [w * 0.45, '#B8862E']].forEach(function (q) {
    c.strokeStyle = '#2A1A08'; c.lineWidth = Math.max(2, s * 0.15);
    c.beginPath(); c.ellipse ? c.ellipse(q[0], 0, w * 0.55, h * 0.75, 0, 0, Math.PI * 2) : c.arc(q[0], 0, w * 0.55, 0, Math.PI * 2); c.stroke();
    c.strokeStyle = q[1]; c.lineWidth = Math.max(1.2, s * 0.09);
    c.beginPath(); c.ellipse ? c.ellipse(q[0], 0, w * 0.55, h * 0.75, 0, 0, Math.PI * 2) : c.arc(q[0], 0, w * 0.55, 0, Math.PI * 2); c.stroke();
  });
  c.restore();
};

// 连锁线中段的徽记：暗底圆 + 配对色描边 + 锁链
Y.chainBadge = function (c, x, y, s, col) {
  c.save();
  circle(c, x, y, s * 0.47); c.fillStyle = 'rgba(25,18,10,0.82)'; c.fill(); c.lineWidth = Math.max(1.2, s * 0.08); c.strokeStyle = col; c.stroke();
  c.restore();
  Y.chain(c, x, y, s * 0.95, true);
};

// ---------- 道具图标：玉盘 + 代码绘制的图形 ----------
Y.jade = function (c, cx, cy, size) {
  var r = size / 2;
  c.save();
  circle(c, cx, cy, r); var g = c.createLinearGradient(0, cy - r, 0, cy + r); g.addColorStop(0, '#F6D98C'); g.addColorStop(1, '#8C5A16'); c.fillStyle = g; c.fill();
  c.lineWidth = 2; c.strokeStyle = '#4A2E0C'; c.stroke();
  circle(c, cx, cy, r * 0.8); var g2 = c.createRadialGradient(cx - r * 0.2, cy - r * 0.3, r * 0.1, cx, cy, r * 0.8); g2.addColorStop(0, '#BFEBD3'); g2.addColorStop(1, '#3F7E62'); c.fillStyle = g2; c.fill();
  c.lineWidth = 1.5; c.strokeStyle = 'rgba(40,30,10,0.6)'; c.stroke();
  c.restore();
};
Y.itemGlyph = function (c, kind, cx, cy, size, t) {
  var s = size;
  c.save(); c.translate(cx, cy); c.lineCap = 'round'; c.lineJoin = 'round';
  if (kind === 'hammer') {
    c.rotate(-Math.PI / 4);
    c.fillStyle = '#8A5A2B'; c.fillRect(-s * 0.05, -s * 0.05, s * 0.1, s * 0.42);
    var g = c.createLinearGradient(-s * 0.22, 0, s * 0.22, 0); g.addColorStop(0, '#D7DCE4'); g.addColorStop(1, '#6E7684');
    c.fillStyle = g; c.fillRect(-s * 0.22, -s * 0.2, s * 0.44, s * 0.17); c.lineWidth = 1.5; c.strokeStyle = '#2A2A30'; c.strokeRect(-s * 0.22, -s * 0.2, s * 0.44, s * 0.17);
  } else if (kind === 'bomb') {
    var r = s * 0.2;
    var gb = c.createRadialGradient(-r * 0.4, -r * 0.2, r * 0.1, 0, s * 0.04, r); gb.addColorStop(0, '#9A9AA6'); gb.addColorStop(1, '#16161C');
    circle(c, 0, s * 0.05, r); c.fillStyle = gb; c.fill();
    c.strokeStyle = '#D9B26A'; c.lineWidth = s * 0.035; c.beginPath(); c.moveTo(r * 0.5, -r * 0.55); c.quadraticCurveTo(r * 0.95, -r * 1.25, r * 1.2, -r * 1.1); c.stroke();
    c.fillStyle = '#FFC24D'; circle(c, r * 1.25, -r * 1.15, s * 0.05 * (0.8 + 0.2 * Math.sin((t || 0) * 12))); c.fill();
  } else if (kind === 'swap') {
    c.strokeStyle = '#FFF6DC'; c.fillStyle = '#FFF6DC'; c.lineWidth = s * 0.06;
    c.beginPath(); c.moveTo(-s * 0.2, -s * 0.08); c.lineTo(s * 0.16, -s * 0.08); c.stroke();
    c.beginPath(); c.moveTo(s * 0.24, -s * 0.08); c.lineTo(s * 0.12, -s * 0.17); c.lineTo(s * 0.12, s * 0.01); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(s * 0.2, s * 0.1); c.lineTo(-s * 0.16, s * 0.1); c.stroke();
    c.beginPath(); c.moveTo(-s * 0.24, s * 0.1); c.lineTo(-s * 0.12, s * 0.01); c.lineTo(-s * 0.12, s * 0.19); c.closePath(); c.fill();
  } else if (kind === 'reset') {
    c.strokeStyle = '#FFF6DC'; c.fillStyle = '#FFF6DC'; c.lineWidth = s * 0.06;
    c.beginPath(); c.arc(0, 0, s * 0.17, -Math.PI * 0.35, Math.PI * 1.35); c.stroke();
    var ax = Math.cos(-Math.PI * 0.35) * s * 0.17, ay = Math.sin(-Math.PI * 0.35) * s * 0.17;
    c.beginPath(); c.moveTo(ax + s * 0.09, ay + s * 0.02); c.lineTo(ax - s * 0.06, ay - s * 0.08); c.lineTo(ax - s * 0.03, ay + s * 0.1); c.closePath(); c.fill();
  } else if (kind === 'tasks') {
    c.fillStyle = '#FFF6DC'; c.fillRect(-s * 0.16, -s * 0.2, s * 0.32, s * 0.4);
    c.strokeStyle = '#7A2A1C'; c.lineWidth = s * 0.035;
    for (var i = 0; i < 3; i++) { var yy = -s * 0.1 + i * s * 0.1; c.beginPath(); c.moveTo(-s * 0.1, yy); c.lineTo(-s * 0.06, yy + s * 0.04); c.lineTo(0, yy - s * 0.03); c.stroke(); c.beginPath(); c.moveTo(s * 0.03, yy); c.lineTo(s * 0.11, yy); c.stroke(); }
  }
  c.restore();
};

module.exports = Y;

};
M["main"]=function(module,exports,require){
// 《山海一箭》主逻辑：场景、关卡玩法、UI
var P = require('./platform');
var CFG = require('./config');
var G = require('./levelgen');
var BEASTS = require('./beasts');
var D = require('./draw');
var T = require('./timer');
var A = require('./analytics');
var Y = require('./glyphs');

var LW = 750, LH = 1334;
var scr, ctx, S = 1, VW = LW, VH = LH, X0 = 0, SAFE_T = 0, SAFE_B = 0;
var IMG = {}, BIMG = {}, BSIL = {};
var save, scene = 'loading', modal = null, regions = [], pressedKey = null;
var now = 0, last = 0, toasts = [], parts = [];
var loadProgress = 0;
var appHidden = false; // 切到后台（倒计时暂停）

// 棋盘线色：国风粉彩，在墨青底上清晰可辨（朱砂、青瓷、碧玉、黛紫、赭石、桃夭、天青、缃黄）
var COLORS = ['#F28B7D', '#9ED9C3', '#8CCB6E', '#AA9DF2', '#E8A956', '#F4A6C6', '#7FC1F2', '#F2D46A'];
var BOARD_BG = ['#30394A', '#262D3B'], DOT_COL = 'rgba(150,165,190,0.28)';
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
  var fa = CFG.FREE_ASSISTS;
  return { v: 2, maxCleared: 0, stars: {}, best: {}, coins: CFG.START_COINS || 0, assists: { hint: fa.hint, hammer: fa.hammer, bomb: fa.bomb, swap: fa.swap },
    sfx: true, music: true, vib: true, checkin: { last: '', count: 0 }, daily: {}, winsSinceAd: 0, seenBeast: {}, seenMech: {}, loginDay: '', tasks: null };
}
function loadSave() {
  var s = P.load(), d = defaultSave();
  if (!s || (s.v !== 1 && s.v !== 2)) return d;
  if (s.v === 1) {
    // v1 → v2：撤销/去除 映射到 交换/锤子，补金币与新道具
    var a = s.assists || {};
    s.assists = { hint: a.hint || 0, hammer: a.remove || 0, bomb: d.assists.bomb, swap: a.undo || 0 };
    s.coins = d.coins; s.v = 2;
  }
  for (var k in d) if (s[k] === undefined) s[k] = d[k];
  for (var k2 in d.assists) if (s.assists[k2] === undefined) s.assists[k2] = 0;
  return s;
}
// ---------------- 每日任务 / 金币 ----------------
var TASKS = [
  { id: 'levels', name: '完成 3 关', need: 3, coins: 50 },
  { id: 'hint', name: '使用提示 1 次', need: 1, coins: 30 },
  { id: 'perfect', name: '零失误通关 1 关', need: 1, coins: 50 },
  { id: 'daily', name: '完成每日挑战', need: 1, coins: 100 }
];
function tasksToday() {
  var d = P.today();
  if (!save.tasks || save.tasks.day !== d) save.tasks = { day: d, levels: 0, hint: 0, perfect: 0, daily: 0, claimed: {} };
  return save.tasks;
}
function taskProgress(id, n) { var t = tasksToday(); t[id] = (t[id] || 0) + (n || 1); persist(); }
function tasksClaimable() { var t = tasksToday(); for (var i = 0; i < TASKS.length; i++) if (!t.claimed[TASKS[i].id] && t[TASKS[i].id] >= TASKS[i].need) return true; return false; }
function addCoins(n, why) { save.coins = (save.coins || 0) + n; persist(); }
function checkLoginBonus() {
  var d = P.today();
  if (save.loginDay === d) return;
  save.loginDay = d; addCoins(CFG.COINS.login, 'login');
  setTimeout(function () { toast('每日登录 +' + CFG.COINS.login + ' 金币'); }, 600);
}
// 激励视频统一入口（埋点 ad_offer / ad_reward_success）
function rewardedAd(placement) {
  A.track('ad_offer', { place: placement, level: st ? st.n : 0 });
  return P.showRewarded().then(function (r) { if (r.ok) A.track('ad_reward_success', { place: placement, level: st ? st.n : 0 }); return r; });
}
function persist() { P.save(save); }

// ---------------- 启动 ----------------
var IMAGES = ['bg_game.jpg', 'bg_menu.jpg', 'logo.png', 'corner.png', 'ic_hint.png', 'ic_heartplus.png', 'ic_remove.png', 'ic_zoom.png',
  'ic_daily.png', 'ic_settings.png', 'ic_play.png', 'ic_home.png', 'heart.png', 'star.png', 'star_empty.png', 'lock.png', 'scroll.png', 'coin.png', 'giftbag.png', 'seal.png'];

function start() {
  var s = P.init();
  scr = s; ctx = s.ctx;
  layout();
  P.onResize(function () { var s2 = P.init(); scr = s2; ctx = s2.ctx; layout(); boardCache = null; lineCache = null; if (st) { computeBoardLayout(); setView(1, 0, 0); } });
  save = loadSave();
  P.setSfx(save.sfx); P.audioInit(); P.setMusic(save.music);
  P.adsInit(); P.setupShare();
  P.onPointers(onPtr);
  P.onWheel(onWheel);
  P.onHide(function () { appHidden = true; persist(); A.endSession(); });
  P.onShow(function () { appHidden = false; last = 0; A.startSession(); });
  A.startSession();
  P.raf(frame);
  var total = IMAGES.length + BEASTS.length * 2 + 1, done = 0;
  function tick() { done++; loadProgress = done / total; }
  var jobs = IMAGES.map(function (n) { return P.loadImage('images/' + n).then(function (im) { IMG[n.replace(/\.(png|jpg)$/, '')] = im; tick(); }); });
  jobs.push(P.loadFont('ShanHaiTitle', 'fonts/title').then(function (f) { if (f) D.setTitleFont(f); tick(); }));
  Promise.all(jobs).then(function () {
    scene = 'menu';
    checkLoginBonus();
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
    if (typeof window !== 'undefined') window.__game = { startLevel: startLevel, state: function () { return st; }, save: function () { return save; }, autoSolve: autoSolveStep, tap: function (i) { tapSeg(i); }, blocked: function () { for (var i = 0; i < st.board.segs.length; i++) if (st.alive[i] && !st.anims[i] && !G.isFree(st.board, st.occ, i)) return i; return -1; }, cellPx: function (x, y) { var p = cellPx(x, y); return [p[0] * S, p[1] * S]; }, openBeast: function (i) { openBeast(BEASTS[i]); }, openSettings: openSettings, openDaily: openDaily, hint: function () { doHint(); }, scene: function () { return scene; }, modal: function () { return modal; }, openCodex: openCodex, openCheckin: openCheckin, view: function () { return { z: VZ.z, px: VZ.px, py: VZ.py, vp: VP }; }, zoomAt: function (z, x, y) { zoomAt(z, x / S, y / S); }, panTo: function (cx, cy) { panToCell(cx, cy); }, timer: function () { return st && st.timer; }, cacheBuilds: function () { return lineCache ? lineCache.builds : 0; }, benchRebuild: function (n) { var t0 = Date.now(); for (var k = 0; k < n; k++) { st.ver++; ensureLineCache(excludedSet()); } var t1 = Date.now(); for (var j = 0; j < n; j++) render(); return { rebuildMs: (t1 - t0) / n, frameMs: (Date.now() - t1) / n }; }, timerPaused: function () { return timerPaused(); }, setHidden: function (h) { appHidden = !!h; }, setAdShowing: function (on) { P._setAdShowing(on); }, setTimeLeft: function (sec) { if (st && st.timer) { st.timer.left = sec; st.timer.started = true; st.timer.lastSec = Math.ceil(sec); } }, openQuit: function () { modal = { type: 'quit', t: 0 }; }, closeModal: function () { modal = null; }, limitFor: function (n) { return T.limitFor(G.getLevel(n), n); }, limitDaily: function (d) { return T.limitFor(G.getDaily(d), 0, d); },
      G: G, ms: function () { return st && st.ms; }, rotate: function (i) { rotateSeg(i); }, tapOpt: function (i, o) { tapSeg(i, o); },
      boardTapLogical: function (x, y) { boardTap(x, y); }, cellPxLogical: function (x, y) { return cellPx(x, y); }, mode: function () { return st && st.mode; },
      enterMode: enterMode, doHint: doHint, events: function (n) { return A.recent(n); }, eventCounts: function () { return A.counts(); },
      openTasks: function () { modal = { type: 'tasks', t: 0 }; }, tasks: function () { return tasksToday(); }, reset: doReset, hintCands: function () { return hintCandidates(); },
      layout: function () { return { BL: BL, VP: VP, S: S, VW: VW, VH: VH, X0: X0, SAFE_T: SAFE_T, SAFE_B: SAFE_B }; }, forceWin: function () { st.board.segs.forEach(function (sg, i) { if (st.alive[i]) removeSeg(i, true); }); } };
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
  for (var j = toasts.length - 1; j >= 0; j--) { toasts[j].t += dt; if (toasts[j].t > (toasts[j].d || 2.2)) toasts.splice(j, 1); }
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

function toast(s, dur) { toasts = [{ s: s, t: 0, d: dur || 2.2 }]; }

function cover(c, img) {
  if (!img) { c.fillStyle = '#EFE2C4'; c.fillRect(0, 0, VW, VH); return; }
  var sc = Math.max(VW / img.width, VH / img.height);
  var w = img.width * sc, h = img.height * sc;
  c.drawImage(img, (VW - w) / 2, (VH - h) / 2, w, h);
}

// ---------------- 输入 ----------------
// 多点触控：单指点按 / 拖动（放大后平移棋盘），双指捏合缩放，双击空白处复原；浏览器支持滚轮缩放、鼠标拖动
var downAt = null, dragging = false, scrollY = 0, scrollV = 0, scrollMax = 0, lastMoveY = 0, lastMoveT = 0;
var ptrs = {}, nPtr = 0, pinch = null, gestureLock = false, lastEmptyTap = null;
var TAP_SLOP = 16; // 逻辑像素：超过即视为拖动而非点按
function onPtr(type, id, x, y) {
  x /= S; y /= S;
  if (type === 'down') {
    if (nPtr <= 0) { ptrs = {}; nPtr = 0; }
    if (!ptrs[id]) nPtr++;
    ptrs[id] = { x: x, y: y };
    if (nPtr === 1) { gestureLock = false; pinch = null; onDown(x, y); }
    else if (nPtr === 2 && downAt && downAt.board && scene === 'play' && !modal) startPinch();
    else if (downAt) downAt.cancel = true;
  } else if (type === 'move') {
    if (!ptrs[id]) return;
    ptrs[id].x = x; ptrs[id].y = y;
    if (pinch) updatePinch();
    else if (nPtr === 1 && !gestureLock) onMove(x, y);
  } else {
    if (!ptrs[id]) return;
    delete ptrs[id]; nPtr = Math.max(0, nPtr - 1);
    if (pinch) { if (nPtr < 2) { pinch = null; gestureLock = true; downAt = null; dragging = false; pressedKey = null; } }
    else if (nPtr === 0 && !gestureLock) onUp(x, y);
    if (nPtr === 0) gestureLock = false;
  }
}
function twoPtrs() { var a = []; for (var k in ptrs) a.push(ptrs[k]); return a.slice(0, 2); }
function startPinch() {
  var t = twoPtrs(); if (t.length < 2) return;
  var mx = (t[0].x + t[1].x) / 2, my = (t[0].y + t[1].y) / 2;
  pinch = { d0: Math.max(20, Math.hypot(t[0].x - t[1].x, t[0].y - t[1].y)), z0: VZ.z, lx: (mx - VP.x - VZ.px) / VZ.z, ly: (my - VP.y - VZ.py) / VZ.z };
  if (downAt) downAt.cancel = true;
  dragging = false; pressedKey = null;
}
function updatePinch() {
  var t = twoPtrs(); if (t.length < 2) return;
  var mx = (t[0].x + t[1].x) / 2, my = (t[0].y + t[1].y) / 2, d = Math.hypot(t[0].x - t[1].x, t[0].y - t[1].y);
  var z = clampZ(pinch.z0 * d / pinch.d0);
  setView(z, mx - VP.x - z * pinch.lx, my - VP.y - z * pinch.ly);
}
function onWheel(x, y, d) {
  x /= S; y /= S;
  if (scene !== 'play' || modal || !VP || !inVP(x, y)) return;
  zoomAt(VZ.z * Math.exp(-d * 0.0015), x, y);
}
function onDown(x, y) {
  P.unlockAudio();
  downAt = { x: x, y: y, t: now, sy: scrollY, px0: VZ.px, py0: VZ.py };
  dragging = false; scrollV = 0; lastMoveY = y; lastMoveT = now;
  var r = hitRegion(x, y);
  pressedKey = r ? r.key : null;
  if (!r && !modal && scene === 'play') downAt.board = true;
}
function onMove(x, y) {
  if (!downAt) return;
  if (downAt.board) {
    if (downAt.cancel) return;
    if (!dragging && Math.hypot(x - downAt.x, y - downAt.y) > TAP_SLOP) dragging = true;
    if (dragging && VZ.z > 1.001) setView(VZ.z, downAt.px0 + (x - downAt.x), downAt.py0 + (y - downAt.y));
    return;
  }
  if ((scene === 'levels' || scene === 'codex') && !modal) {
    if (!dragging && Math.abs(y - downAt.y) > 12) { dragging = true; pressedKey = null; }
    if (dragging) {
      scrollY = downAt.sy - (y - downAt.y);
      var dtm = Math.max(0.001, now - lastMoveT);
      scrollV = -(y - lastMoveY) / dtm * 0.6 + scrollV * 0.4;
      lastMoveY = y; lastMoveT = now;
      clampScroll(true);
    }
  } else if (pressedKey && Math.hypot(x - downAt.x, y - downAt.y) > 40) pressedKey = null;
}
function onUp(x, y) {
  var wasDrag = dragging; dragging = false;
  if (!downAt) return;
  var board = downAt.board, cancel = downAt.cancel; downAt = null;
  if (wasDrag) { if (!board) clampScroll(); pressedKey = null; return; }
  scrollV = 0;
  if (board) { if (!cancel) boardTap(x, y); return; }
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
  items[0].x = cx - 255; items[1].x = cx - 85; items[2].x = cx + 255;
  items.splice(2, 0, { k: 'tasks', img: null, label: '任务', cb: function () { modal = { type: 'tasks', t: 0 }; }, x: cx + 85, dot: tasksClaimable(), task: true });
  items.forEach(function (it) {
    if (it.task) { var pr = isPressed('tasks') ? 0.92 : 1; Y.jade(c, it.x, y2, 104 * pr); Y.itemGlyph(c, 'tasks', it.x, y2, 104 * pr, now); }
    roundIcon(c, it.k, it.x, y2, 104, it.img, it.label, it.cb, { dot: it.dot, framed: it.k !== 'settings' && !it.task });
  });
  // 金币
  var gx = X0 + 30, gy = SAFE_T + 24;
  D.rr(c, gx, gy, 190, 56, 28); c.fillStyle = 'rgba(60,32,10,0.82)'; c.fill(); c.lineWidth = 2.5; c.strokeStyle = '#D4A443'; c.stroke();
  if (IMG.coin) c.drawImage(IMG.coin, gx + 6, gy + 6, 44, 44);
  D.text(c, String(save.coins || 0), gx + 120, gy + 29, 30, '#FBE6B0', { title: true });
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
    if (opt.badge === 'coin') {
      D.rr(c, bx - 30, byy - 16, 60, 32, 16); c.fillStyle = '#5A3A10'; c.fill(); c.lineWidth = 2.5; c.strokeStyle = '#F3D27E'; c.stroke();
      if (IMG.coin) c.drawImage(IMG.coin, bx - 27, byy - 12, 24, 24);
      D.text(c, '+', bx + 12, byy, 24, '#FFF2C8', { weight: '800' });
    } else if (opt.badge === '免费') {
      D.rr(c, bx - 30, byy - 16, 60, 32, 16); c.fillStyle = '#2C6B4E'; c.fill(); c.lineWidth = 2.5; c.strokeStyle = '#F3D27E'; c.stroke();
      D.text(c, '免费', bx, byy + 1, 18, '#FFF2C8', { weight: '700' });
    } else if (opt.badge === 'ad') {
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
// 机关首次出现时的教学：toast 全文 + 副标题短句 + 手指指向
var MECH_TIPS = {
  ice: '冰封线：相邻的线每飞走一条，冰层少一层；破冰后才能点',
  lock: '铜锁线：先让同色圈的玉钥匙线飞走，锁才会打开',
  bi: '双向线：两端都有箭头，点哪一端就朝哪一端飞',
  rot: '旋转机关：点箭头处的转盘顺时针转 90°，点线身发射',
  portal: '传送门：箭路进入一扇门，会从同色的另一扇门继续',
  bomb: '炸弹线：飞出时炸开周围 3×3 内的普通线',
  chain: '连锁线：锁链相连的两条线，飞走一条会连带拉出另一条'
};
var MECH_SHORT = {
  ice: '冰封：邻线飞走一条，冰层少一层', lock: '铜锁：先放走同色圈的玉钥匙线', bi: '双向：点哪端就朝哪端飞',
  rot: '转盘：点箭头转向，点线身发射', portal: '传送门：箭路从同色门穿出', bomb: '炸弹：飞出时炸开周围普通线', chain: '连锁：飞走一条，拉出另一条'
};
function mechTarget(board, m) {
  if (m === 'portal') return board.portals && board.portals.length ? { cell: board.portals[0][0] } : null;
  // 选离棋盘中心最近的那条，方便看到
  var best = -1, bd = 1e9, cx = board.w / 2, cy = board.h / 2;
  for (var i = 0; i < board.segs.length; i++) {
    var sg = board.segs[i], k = G.mechOf(sg);
    if (m === 'lock' ? k !== 'key' : k !== m) continue;
    var mid = sg.cells[Math.floor(sg.cells.length / 2)], d = Math.abs(mid[0] - cx) + Math.abs(mid[1] - cy);
    if (d < bd) { bd = d; best = i; }
  }
  return best >= 0 ? { seg: best } : null;
}
function startLevel(n, daily, retry) {
  var base = daily ? G.getDaily(daily) : G.getLevel(n);
  var board = G.cloneBoard(base), ms = G.initState(board);
  st = {
    n: n, daily: daily || null, board: board, ms: ms, alive: ms.alive, occ: ms.occ,
    hearts: CFG.HEARTS, anims: {}, combo: 0, lastRemove: -9, qishi: 0, hint: -1, hintT: 0, hintOpt: null,
    misses: 0, heartRevived: false, timeRevived: false, mode: null, won: false, winT: 0, failed: false, removedCount: 0,
    tut: n === 1 && !daily ? 0 : -1, flash: {}, shakeT: 0, heartAnim: [], startT: now, ver: 0, tapHL: null, spin: {}, comboShow: null, doubled: false
  };
  st.timer = T.create(T.limitFor(base, n, daily));
  st.starTime = T.starTimeFor(st.timer.limit, n, daily);
  // 锁链：找到配对两条线相邻的一条边，画在交界处
  st.links = [];
  board.segs.forEach(function (sg, i) {
    if (sg.chain == null || sg.chain < i) return;
    var other = board.segs[sg.chain], found = null;
    for (var a = 0; a < sg.cells.length && !found; a++) for (var b = 0; b < other.cells.length; b++) {
      var p = sg.cells[a], q = other.cells[b];
      if (Math.abs(p[0] - q[0]) + Math.abs(p[1] - q[1]) === 1) { found = { a: i, b: sg.chain, x: (p[0] + q[0]) / 2, y: (p[1] + q[1]) / 2, horiz: p[1] === q[1] }; break; }
    }
    if (found) st.links.push(found);
  });
  st.mtut = null;
  var fresh = (board.mechs || []).filter(function (m) { return !save.seenMech[m]; });
  if (fresh.length) {
    var m = fresh[0];
    st.mtut = { m: m, target: mechTarget(board, m), t: 0, done: false };
    save.seenMech[m] = 1; persist();
    A.track('tutorial_step', { step: 'mech_' + m, level: n });
  }
  modal = null; scene = 'play'; boardCache = null; parts = [];
  computeBoardLayout(); setView(1, 0, 0); lineCache = null;
  if (st.mtut) toast(MECH_TIPS[st.mtut.m], 4.5);
  else if (!daily && n === 2) toast('撞到其他线会失去 1 颗心');
  else if (!daily && n === 3) toast('双指捏合可放大棋盘，双击空白处复原');
  if (retry) A.track('level_retry', { level: daily ? 'daily' : n });
  A.track('level_start', { level: daily ? 'daily' : n, lines: board.segs.length, mechs: (board.mechs || []).join('+'), limit: st.timer.limit });
  if (!daily && n === 1) A.track('tutorial_step', { step: 'l1_start', level: 1 });
}
var BL = null; // 棋盘布局
var VP = null; // 棋盘格子区（逻辑坐标）
var VZ = { z: 1, px: 0, py: 0 }; // 缩放与平移（相对 VP 左上角）
function computeBoardLayout() {
  var b = st.board, pad = b.w >= 14 ? 22 : 30;
  var top = SAFE_T + 14 + 104 + 64, bottom = VH - SAFE_B - 210;
  var availW = LW - 40 - pad * 2, availH = bottom - top - pad * 2;
  var cell = Math.min(availW / b.w, availH / b.h, 120);
  var bw = cell * b.w + pad * 2, bh = cell * b.h + pad * 2;
  BL = { cell: cell, pad: pad, x: X0 + (LW - bw) / 2, y: top + (bottom - top - bh) / 2, w: bw, h: bh };
  BL.ox = BL.x + pad; BL.oy = BL.y + pad;
  VP = { x: BL.ox, y: BL.oy, w: cell * b.w, h: cell * b.h };
}
function clampZ(z) { return Math.max(1, Math.min(CFG.MAX_ZOOM || 3, z)); }
function setView(z, px, py) {
  z = clampZ(z);
  if (!VP) { VZ = { z: z, px: 0, py: 0 }; return; }
  px = Math.max(VP.w - z * VP.w, Math.min(0, px)); py = Math.max(VP.h - z * VP.h, Math.min(0, py));
  if (z < 1.001) { z = 1; px = 0; py = 0; }
  VZ.z = z; VZ.px = px; VZ.py = py;
}
function zoomAt(z, sx, sy) {
  var lx = (sx - VP.x - VZ.px) / VZ.z, ly = (sy - VP.y - VZ.py) / VZ.z;
  z = clampZ(z);
  setView(z, sx - VP.x - z * lx, sy - VP.y - z * ly);
}
function panToCell(cx, cy) { // 放大时把某格移到视野中央
  if (VZ.z <= 1.001) return;
  setView(VZ.z, VP.w / 2 - VZ.z * (cx + 0.5) * BL.cell, VP.h / 2 - VZ.z * (cy + 0.5) * BL.cell);
}
function inVP(x, y) { return VP && x >= VP.x && y >= VP.y && x <= VP.x + VP.w && y <= VP.y + VP.h; }
// 格坐标 → 屏幕逻辑坐标（含缩放平移）
function cellPx(cx, cy) { var k = BL.cell * VZ.z; return [VP.x + VZ.px + (cx + 0.5) * k, VP.y + VZ.py + (cy + 0.5) * k]; }

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
  // 角花（画在内盘之下，避免遮住格子）
  if (IMG.corner) {
    var cs = Math.min(150, Math.max(90, Math.min(w, h) * 0.2)), im = IMG.corner;
    var cw = cs, chh = cs * im.height / im.width;
    [[0, 0, 1, 1], [w, 0, -1, 1], [0, h, 1, -1], [w, h, -1, -1]].forEach(function (q) {
      c.save(); c.translate(q[0], q[1]); c.scale(q[2], q[3]); c.drawImage(im, -12, -12, cw, chh); c.restore();
    });
  }
  // 金线
  D.rr(c, 5, 5, w - 10, h - 10, 22); c.lineWidth = 3; c.strokeStyle = '#E2B65C'; c.stroke();
  D.rr(c, pad - 9, pad - 9, w - 2 * pad + 18, h - 2 * pad + 18, 12); c.lineWidth = 4; c.strokeStyle = '#D4A443'; c.stroke();
  D.rr(c, pad - 4, pad - 4, w - 2 * pad + 8, h - 2 * pad + 8, 9); c.lineWidth = 2; c.strokeStyle = '#1A1208'; c.stroke();
  // 墨青石板底
  var ig = c.createLinearGradient(0, pad, 0, h - pad); ig.addColorStop(0, BOARD_BG[0]); ig.addColorStop(1, BOARD_BG[1]);
  c.fillStyle = ig; D.rr(c, pad - 2, pad - 2, w - 2 * pad + 4, h - 2 * pad + 4, 8); c.fill();
  // 内阴影
  c.save(); D.rr(c, pad - 2, pad - 2, w - 2 * pad + 4, h - 2 * pad + 4, 8); c.clip();
  var sh = c.createLinearGradient(0, pad, 0, pad + 22); sh.addColorStop(0, 'rgba(0,0,0,0.35)'); sh.addColorStop(1, 'rgba(0,0,0,0)');
  c.fillStyle = sh; c.fillRect(pad, pad - 2, w, 22);
  c.restore();
  boardCache = { cv: cv, k: k, m: M };
}


// 运动路径：track（尾→头）+ 出射线（含传送门跳跃）+ 板外延伸；返回格坐标点列
function buildPath(ex, L) {
  var b = st.board, pts = ex.track.slice();
  for (var r = 0; r < ex.ray.length; r++) pts.push([ex.ray[r] % b.w, (ex.ray[r] / b.w) | 0]);
  var last = pts[pts.length - 1];
  for (var k = 1; k <= L + 3; k++) pts.push([last[0] + ex.dir[0] * k, last[1] + ex.dir[1] * k]);
  return pts;
}
function pathPoint(path, t) {
  var n = path.length, i = Math.floor(t), f = t - i;
  var a = path[Math.max(0, Math.min(n - 1, i))], b = path[Math.max(0, Math.min(n - 1, i + 1))];
  if (Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) > 1.5) return f < 0.5 ? a : b; // 传送门：瞬移
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
}
// 线在偏移 s 时的折线（按传送门断开成若干段）
function polyRuns(path, s, L) {
  var pts = [pathPoint(path, s)];
  for (var i = Math.floor(s) + 1; i < s + L - 1; i++) pts.push(pathPoint(path, i));
  pts.push(pathPoint(path, s + L - 1));
  var runs = [[pts[0]]];
  for (var k = 1; k < pts.length; k++) {
    var p = pts[k], q = pts[k - 1];
    if (Math.abs(p[0] - q[0]) + Math.abs(p[1] - q[1]) > 1.5) runs.push([p]); else runs[runs.length - 1].push(p);
  }
  return runs;
}
function staticDir(i) {
  var sg = st.board.segs[i];
  if (sg.rot && st.ms.rdir[i] >= 0) return G.DIRS[st.ms.rdir[i]];
  return G.headDir(sg.cells);
}

// 点击命中：点击点 0.5 格以内最近的线；返回 { i, u（沿线位置，0=尾 L-1=头）, dHead（到箭头格的距离） }
function hitLine(cx, cy) {
  var best = -1, bd = 0.5, bu = 0;
  for (var i = 0; i < st.board.segs.length; i++) {
    if (!st.alive[i] || st.anims[i]) continue;
    var cl = st.board.segs[i].cells, d0 = staticDir(i), L = cl.length;
    for (var j = 0; j < L; j++) {
      var a = cl[j], b = j + 1 < L ? cl[j + 1] : [a[0] + d0[0] * 0.4, a[1] + d0[1] * 0.4];
      var r = distSegT(cx, cy, a[0], a[1], b[0], b[1]);
      if (r[0] < bd) { bd = r[0]; best = i; bu = j + r[1] * (j + 1 < L ? 1 : 0.4); }
    }
  }
  if (best < 0) return null;
  var hd = st.board.segs[best].cells[st.board.segs[best].cells.length - 1];
  return { i: best, u: bu, dHead: Math.hypot(cx - hd[0], cy - hd[1]) };
}
function boardTap(x, y) {
  if (!st || st.won || st.failed || !BL) return;
  var k = BL.cell * VZ.z;
  var cx = (x - VP.x - VZ.px) / k - 0.5, cy = (y - VP.y - VZ.py) / k - 0.5;
  var hit = inVP(x, y) ? hitLine(cx, cy) : null;
  if (st.mode === 'bomb' && inVP(x, y)) { bombAt(Math.round(cx), Math.round(cy)); return; }
  if (!hit) {
    if (st.mode) { cancelMode(); return; }
    if (lastEmptyTap && now - lastEmptyTap.t < 0.38 && Math.hypot(x - lastEmptyTap.x, y - lastEmptyTap.y) < 50) {
      if (VZ.z > 1.05) setView(1, 0, 0); else zoomAt(2.2, x, y);
      lastEmptyTap = null;
    } else lastEmptyTap = { t: now, x: x, y: y };
    return;
  }
  lastEmptyTap = null;
  var i = hit.i, seg = st.board.segs[i], L = seg.cells.length;
  if (st.mode === 'hammer') { var hi = i; st.mode = null; useItem('hammer', function () { hammerFx(hi); removeSeg(hi, true); }); return; }
  if (st.mode === 'swap') { swapAt(i); return; }
  // 旋转机关：点箭头格（转盘）= 转向；点线身 = 发射
  if (seg.rot && hit.dHead < 0.5 && G.tapBlock(st.board, st.ms, i) === null) { rotateSeg(i); return; }
  var opt = null;
  if (seg.bi) opt = hit.u < (L - 1) / 2 ? 'tail' : 'head';
  tapSeg(i, opt);
}
function distSegT(px, py, ax, ay, bx, by) {
  var dx = bx - ax, dy = by - ay, l = dx * dx + dy * dy, t = l ? ((px - ax) * dx + (py - ay) * dy) / l : 0;
  t = Math.max(0, Math.min(1, t));
  var qx = ax + dx * t - px, qy = ay + dy * t - py; return [Math.sqrt(qx * qx + qy * qy), t];
}
function distSeg(px, py, ax, ay, bx, by) { return distSegT(px, py, ax, ay, bx, by)[0]; }

function mtutDone(m) { if (st.mtut && !st.mtut.done && st.mtut.m === m) { st.mtut.done = true; A.track('tutorial_step', { step: 'mech_' + m + '_done', level: st.n }); } }

function rotateSeg(i) {
  T.start(st.timer);
  var ds = G.rotDirs(st.board.segs[i]), cur = st.ms.rdir[i], idx = ds.indexOf(cur), nx = ds[(idx + 1) % ds.length];
  st.spin[i] = { from: cur, to: nx, t: 0 };
  st.ms.rdir[i] = nx; st.ver++;
  if (st.hint === i && st.hintOpt === 'rot') { var op = G.removableOpt(st.board, st.ms, i, false); if (op) st.hintOpt = null; }
  P.play('tap', 0.8);
  A.track('arrow_tap', { level: st.daily ? 'daily' : st.n, act: 'rotate' });
  mtutDone('rot');
}

function tapSeg(i, opt) {
  if (!st.alive[i] || st.anims[i]) return;
  T.start(st.timer);
  var b = st.board, seg = b.segs[i], ms = st.ms, lv = st.daily ? 'daily' : st.n;
  A.track('arrow_tap', { level: lv });
  var tb = G.tapBlock(b, ms, i);
  if (tb) {
    // 冰封/上锁：不能点，不扣心
    st.flash[i] = 0.4; st.tapHL = { i: i, t: 0.35 };
    P.play('hit', 0.35);
    if (tb === 'ice') toast('冰封未破：还要 ' + ms.ice[i] + ' 条相邻的线飞走');
    else { toast('铜锁未开：先让同色圈的玉钥匙线飞走'); st.flash[seg.lock] = 1.0; }
    A.track('arrow_blocked', { level: lv, reason: tb });
    return;
  }
  var ex = G.exitOf(b, i, opt || (seg.bi ? 'head' : null), ms);
  var blockAt = G.blockIndex(ex, ms.occ, i);
  if (st.hint === i) st.hint = -1;
  st.tapHL = { i: i, t: 0.35 };
  if (seg.bi) mtutDone('bi');
  if (blockAt < 0) { removeSeg(i, false, ex); return; }
  var blocker = ms.occ[ex.ray[blockAt]], bk = blockAt + 0.28;
  st.anims[i] = { type: 'bump', t: 0, k: bk, v: Math.max(CFG.SLIDE_SPEED, bk / 0.4), blocker: blocker, hit: false, path: buildPath(ex, seg.cells.length), dir: ex.dir };
  A.track('arrow_blocked', { level: lv, reason: 'line' });
}

function midPx(i) { var sg = st.board.segs[i], m = sg.cells[Math.floor(sg.cells.length / 2)]; return cellPx(m[0], m[1]); }
function removeSeg(i, byAssist, ex) {
  var b = st.board, ms = st.ms, seg = b.segs[i], L = seg.cells.length, lv = st.daily ? 'daily' : st.n;
  if (!ms.alive[i]) return;
  var iceBefore = ms.ice.slice();
  if (!byAssist && !ex) ex = G.exitOf(b, i, null, ms);
  var res = G.removeLine(b, ms, i, byAssist ? 'tool' : 'exit');
  st.ver++;
  st.removedCount += res.length;
  res.forEach(function (r) {
    var sg = b.segs[r.i];
    if (r.i === i && !byAssist) {
      var path = buildPath(ex, L), dist = ex.ray.length + L + 2;
      st.anims[i] = { type: 'exit', t: 0, dist: dist, v: Math.max(CFG.SLIDE_SPEED, dist / 0.75), path: path, dir: ex.dir };
    } else {
      st.anims[r.i] = { type: 'dissolve', t: 0, why: r.why };
      var mp = midPx(r.i);
      if (r.why === 'chain') { burst(mp[0], mp[1], 16, 'gold', 260); mtutDone('chain'); }
      else if (r.why === 'bomb') { burst(mp[0], mp[1], 10, 'red', 220); }
      else { sg.cells.forEach(function (cc) { var p = cellPx(cc[0], cc[1]); burst(p[0], p[1], 6, 'ink'); burst(p[0], p[1], 4, 'gold'); }); }
    }
    if (sg.key != null && st.alive[sg.key] === true) {
      var lp = midPx(sg.key); burst(lp[0], lp[1], 22, 'jade', 240); floatText([lp[0], lp[1] - 10], '开锁', '#B8F0C8', 30);
      mtutDone('lock');
    }
    A.track('arrow_removed', { level: lv, why: r.why, tool: byAssist ? 1 : 0 });
  });
  // 冰层碎裂
  for (var j = 0; j < ms.ice.length; j++) if (ms.alive[j] && iceBefore[j] > ms.ice[j]) {
    var ip = midPx(j); burst(ip[0], ip[1], ms.ice[j] === 0 ? 22 : 9, 'ice', ms.ice[j] === 0 ? 260 : 140);
    if (ms.ice[j] === 0) { P.play('unlock', 0.35); mtutDone('ice'); }
  }
  if (seg.bomb && !byAssist) {
    var bc = G.bombCenter(seg), bp = cellPx(bc[0], bc[1]);
    burst(bp[0], bp[1], 40, 'red', 420); burst(bp[0], bp[1], 30, 'gold', 360); burst(bp[0], bp[1], 2, 'blot');
    st.shakeT = 0.35; P.play('remove'); if (save.vib) P.vibrate();
    mtutDone('bomb');
  }
  if (!byAssist && ex && ex.ray.some(function (c) { return G.pmapOf(b)[c] >= 0; })) mtutDone('portal');
  if (byAssist) { P.play('remove'); }
  else {
    if (now - st.lastRemove < 1.6) st.combo++; else st.combo = 1;
    st.lastRemove = now;
    P.play('pluck' + Math.min(7, st.combo - 1));
    st.qishi = Math.min(1.2, st.qishi + 0.06 + 0.03 * Math.min(st.combo, 6));
    if (st.combo >= 3) st.comboShow = { n: st.combo, t: 0 };
    if (st.qishi >= 1) {
      st.qishi = 0.35;
      var qy = Math.min(BL.y - 44, SAFE_T + 215);
      floatText([VW / 2, qy], '气势如虹', '#FFE7A0', 52);
      burst(VW / 2, qy, 40, 'gold', 420);
    }
  }
  if (st.tut >= 0) { st.tut++; A.track('tutorial_step', { step: 'l1_' + st.tut, level: 1 }); }
  if (st.hint >= 0 && !st.alive[st.hint]) st.hint = -1;
}

function updatePlay(dt) {
  if (st.hintT > 0) { st.hintT -= dt; if (st.hintT <= 0) st.hint = -1; }
  st.qishi = Math.max(0, st.qishi - dt * 0.06);
  if (st.shakeT > 0) st.shakeT -= dt;
  if (st.mtut) st.mtut.t += dt;
  if (st.comboShow) { st.comboShow.t += dt; if (st.comboShow.t > 1.4) st.comboShow = null; }
  for (var sk in st.spin) { st.spin[sk].t += dt; if (st.spin[sk].t > 0.2) { delete st.spin[sk]; st.ver++; } }
  for (var k in st.flash) { st.flash[k] -= dt; if (st.flash[k] <= 0) delete st.flash[k]; }
  for (var h = st.heartAnim.length - 1; h >= 0; h--) { st.heartAnim[h].t += dt; if (st.heartAnim[h].t > 0.8) st.heartAnim.splice(h, 1); }
  if (st.tapHL) { st.tapHL.t -= dt; if (st.tapHL.t <= 0) st.tapHL = null; }
  for (var key in st.anims) {
    var a = st.anims[key], i = +key, seg = st.board.segs[i];
    a.t += dt;
    var V = a.v || CFG.SLIDE_SPEED;
    if (a.type === 'exit') {
      var acc = 0.07;
      a.s = a.t < acc ? V * a.t * a.t / (2 * acc) : V * (a.t - acc / 2);
      var hp = pathPoint(a.path, a.s + seg.cells.length - 1), px = cellPx(hp[0], hp[1]);
      var n = 1 + Math.min(3, st.combo);
      if (inVP(px[0], px[1])) for (var q = 0; q < n; q++) spawn(px[0] + (Math.random() - 0.5) * BL.cell * 0.3, px[1] + (Math.random() - 0.5) * BL.cell * 0.3, 'gold', 40);
      if (a.s >= a.dist) delete st.anims[key];
    } else if (a.type === 'bump') {
      var tf = a.k / V;
      if (a.t < tf) { var u = a.t / tf; a.s = a.k * (u * u * (3 - 2 * u)); }
      else if (a.t < tf + 0.32) {
        a.s = a.k;
        if (!a.hit) {
          a.hit = true; st.flash[i] = 0.5; st.flash[a.blocker] = 0.35; st.shakeT = 0.3;
          P.play('hit'); if (save.vib) P.vibrate();
          var hp2 = pathPoint(a.path, a.s + seg.cells.length - 1), p2 = cellPx(hp2[0], hp2[1]);
          burst(p2[0], p2[1], 14, 'red');
          loseHeart();
        }
      } else if (a.t < tf + 0.32 + 0.24) { var u2 = (a.t - tf - 0.32) / 0.24; a.s = a.k * (1 - u2 * u2); }
      else delete st.anims[key];
    } else if (a.type === 'dissolve') {
      if (a.t > 0.5) delete st.anims[key];
    }
  }
  if (T.active(st.timer)) {
    var tev = T.tick(st.timer, dt, timerPaused());
    if (tev.tick) P.play('tick', 0.45);
    if (tev.expired) timeUp();
  }
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
  if (st.failed || st.won) return;
  if (st.n === 1 && !st.daily) { toast('被挡住了！先让前面的箭飞走'); return; }
  st.hearts--; st.misses++;
  st.heartAnim.push({ i: st.hearts, t: 0 });
  if (st.hearts <= 0) {
    st.failed = true; st.mode = null;
    A.track('level_fail', { level: st.daily ? 'daily' : st.n, reason: 'hearts', left: st.board.segs.length - st.removedCount, time: Math.round(st.timer.elapsed) });
    setTimeout(function () { P.play('fail'); modal = { type: 'fail', t: 0 }; }, 650);
  }
}

function timerPaused() {
  return appHidden || P.adShowing() || !!modal || scene !== 'play' || !st || st.won || st.failed || st.removedCount === st.board.segs.length;
}
function timeUp() {
  st.failed = true; st.timeUp = true; st.hint = -1; st.mode = null;
  if (save.vib) P.vibrate();
  A.track('level_fail', { level: st.daily ? 'daily' : st.n, reason: 'time', left: st.board.segs.length - st.removedCount });
  setTimeout(function () { if (st && st.timeUp && st.failed && scene === 'play') { P.play('fail'); modal = { type: 'timeup', t: 0 }; } }, 450);
}
function reviveTime() {
  T.revive(st.timer, CFG.TIMER_REVIVE_SECONDS);
  st.failed = false; st.timeUp = false; st.timeRevived = true; modal = null;
  floatText([VW / 2, SAFE_T + 160], '+' + CFG.TIMER_REVIVE_SECONDS + '秒', '#9EF0C0', 52);
}
// 星级：3★ = 零失误 且 用时达标（前 10 关不看用时）；2★ = 失误不超过心数一半；1★ = 通关。看广告复活心数 → 1★
function computeStars() {
  if (st.heartRevived) return 1;
  var timeOk = !st.starTime || st.timer.elapsed <= st.starTime;
  if (st.misses === 0 && timeOk && !st.timeRevived) return 3;
  if (st.misses <= Math.floor(CFG.HEARTS * 0.5)) return 2;
  return 1;
}
function win() {
  st.won = true; st.winT = 0; st.hint = -1; st.mode = null;
  P.play('win');
  var stars = computeStars(), coins;
  st.stars = stars;
  if (st.daily) {
    var first = !save.daily[st.daily];
    save.daily[st.daily] = Math.max(save.daily[st.daily] || 0, stars);
    coins = first ? CFG.COINS.daily : CFG.COINS.win[0];
    if (first) taskProgress('daily');
  } else {
    var firstClear = !save.stars[st.n];
    coins = firstClear ? CFG.COINS.win[stars - 1] : Math.round(CFG.COINS.win[stars - 1] / 3); // 重玩只给 1/3，防刷
    save.stars[st.n] = Math.max(save.stars[st.n] || 0, stars);
    var bt = save.best[st.n] || {};
    save.best[st.n] = { t: Math.min(bt.t || 1e9, Math.round(st.timer.elapsed)), m: Math.min(bt.m == null ? 99 : bt.m, st.misses) };
    var wasMax = save.maxCleared;
    save.maxCleared = Math.max(save.maxCleared, st.n);
    if (st.n % 10 === 0 && st.n > wasMax) {
      var bi = st.n / 10 - 1;
      if (bi < BEASTS.length) st.unlock = BEASTS[bi];
    }
    save.winsSinceAd++;
    taskProgress('levels');
  }
  if (st.misses === 0) taskProgress('perfect');
  st.coins = coins; addCoins(coins, 'win');
  A.track('level_win', { level: st.daily ? 'daily' : st.n, stars: stars, time: Math.round(st.timer.elapsed), misses: st.misses, coins: coins });
  persist();
}
function showWin() {
  modal = { type: 'win', t: 0 };
  if (st.unlock) setTimeout(function () { P.play('unlock'); }, 900);
}

// ---------------- 道具 ----------------
var ITEM_NAME = { hint: '提示', hammer: '锤子', bomb: '炸弹', swap: '交换' };
var ITEM_DESC = { hint: '点亮一支现在就能飞出的箭', hammer: '直接移走任意一条线', bomb: '清除 3×3 范围内的普通线', swap: '把一条普通线首尾调头' };
var ASSIST_NAME = ITEM_NAME;
function useItem(kind, apply) {
  if (save.assists[kind] > 0) { save.assists[kind]--; persist(); apply(); return; }
  modal = { type: 'buy', kind: kind, t: 0, apply: apply };
}
function cancelMode() { if (st.mode) { st.mode = null; toast('已取消'); } }
function enterMode(kind) {
  if (!st || st.won || st.failed) return;
  if (st.mode === kind) { cancelMode(); return; }
  st.mode = kind;
  toast(kind === 'hammer' ? '点选一条要锤掉的线' : kind === 'bomb' ? '点选要炸开的位置（3×3）' : '点选一条要调头的普通线');
}
function hintCandidates() {
  var b = st.board, ms = st.ms, out = [];
  for (var i = 0; i < b.segs.length; i++) {
    if (!ms.alive[i] || st.anims[i] || G.tapBlock(b, ms, i)) continue;
    var ops = G.optionsOf(b, i, ms, false);
    for (var k = 0; k < ops.length; k++) if (G.blockIndex(G.exitOf(b, i, ops[k], ms), ms.occ, i) < 0) { out.push({ i: i, opt: ops[k] }); break; }
  }
  if (!out.length) for (var j = 0; j < b.segs.length; j++) if (ms.alive[j] && !st.anims[j] && b.segs[j].rot && G.removableOpt(b, ms, j, true)) out.push({ i: j, opt: 'rot' });
  return out;
}
function doHint() {
  if (st.won || st.failed) return;
  var cand = hintCandidates();
  if (!cand.length) { toast('稍等，箭还在飞'); return; }
  if (st.hint >= 0 && st.alive[st.hint]) { toast('先点亮着的那支箭吧'); return; }
  useItem('hint', function () {
    // 优先提示“能解放其他箭”的那支（单调规则下任何可出的线都不会走进死局）
    var b = st.board, best = cand[0], bestScore = -1;
    cand.forEach(function (c) {
      var sc = 0;
      for (var j = 0; j < b.segs.length; j++) if (st.alive[j] && j !== c.i) {
        var ray = G.exitOf(b, j, null, st.ms).ray;
        for (var r = 0; r < ray.length; r++) { var o = st.occ[ray[r]]; if (o >= 0 && o !== j) { if (o === c.i) sc++; break; } }
      }
      if (sc > bestScore) { bestScore = sc; best = c; }
    });
    st.hint = best.i; st.hintOpt = best.opt; st.hintT = 8;
    var hc = b.segs[best.i].cells, hp = best.opt === 'tail' ? hc[0] : hc[hc.length - 1]; panToCell(hp[0], hp[1]);
    taskProgress('hint');
    A.track('hint_used', { level: st.daily ? 'daily' : st.n });
  });
}
function hammerFx(i) { var p = midPx(i); burst(p[0], p[1], 20, 'ink', 200); floatText([p[0], p[1] - 20], '锤！', '#FFE7A0', 36); if (save.vib) P.vibrate(); st.shakeT = 0.2; }
function bombAt(x, y) {
  st.mode = null;
  var v = G.bombVictims(st.board, st.ms, x, y);
  if (!v.length) { toast('这里没有可炸的普通线'); return; }
  useItem('bomb', function () {
    var p = cellPx(x, y); burst(p[0], p[1], 50, 'red', 460); burst(p[0], p[1], 30, 'gold', 380); burst(p[0], p[1], 2, 'blot');
    st.shakeT = 0.4; if (save.vib) P.vibrate();
    v.forEach(function (i) { if (st.alive[i]) removeSeg(i, true); });
  });
}
function swapAt(i) {
  st.mode = null;
  var b = st.board, seg = b.segs[i];
  if (!G.isPlain(seg)) { toast('只能调头普通线'); return; }
  seg.cells.reverse();
  var ex = G.exitOf(b, i, null, st.ms), own = {}, selfHit = false;
  seg.cells.forEach(function (c) { own[c[1] * b.w + c[0]] = 1; });
  ex.ray.forEach(function (c) { if (own[c]) selfHit = true; });
  var ok = !selfHit && G.solve(b, st.ms).solvable;
  seg.cells.reverse();
  if (!ok) { toast(selfHit ? '调头后会撞上自己，换一条吧' : '调头后会成死局，换一条吧'); return; }
  useItem('swap', function () {
    seg.cells.reverse(); st.ver++; st.flash[i] = 0.01; st.tapHL = { i: i, t: 0.6 };
    var p = midPx(i); burst(p[0], p[1], 14, 'gold', 200); P.play('tap');
  });
}
function doReset() {
  if (!st || st.won) return;
  modal = { type: 'reset', t: 0 };
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
  if (type === 'ice') { p.col = Math.random() < 0.5 ? '#E6F7FF' : '#9ED4F5'; p.r = 2 + Math.random() * 4; p.life = 0.6; p.g = 200; }
  if (type === 'jade') { p.col = Math.random() < 0.5 ? '#B8F0C8' : '#5FBF85'; p.vy -= 30; }
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
  drawZoomChip(c);
  drawParts(c);
  drawHUD(c);
  drawAssistBar(c);
  // 教学指引
  var tt = tutTarget(), mt = st.mtut && !st.mtut.done && st.mtut.t < 12 && st.mtut.target ? st.mtut.target : null;
  if (tt >= 0 && st.alive[tt] && !st.anims[tt] && !st.won) {
    var sg = st.board.segs[tt], mid = sg.cells[Math.floor(sg.cells.length / 2)], pp = cellPx(mid[0], mid[1]);
    D.hand(c, pp[0], pp[1], 1.1, now);
  } else if (st.hint >= 0 && st.alive[st.hint] && !st.anims[st.hint]) {
    var sh = st.board.segs[st.hint], hm = st.hintOpt === 'tail' ? sh.cells[0] : sh.cells[sh.cells.length - 1], hp = cellPx(hm[0], hm[1]);
    var hof2 = Math.max(10, BL.cell * VZ.z * 0.35);
    D.hand(c, hp[0] + hof2, hp[1] + hof2, 0.9, now);
    if (st.hintOpt === 'rot') Y.rotArrow(c, hp[0], hp[1], BL.cell * VZ.z * 0.8, 'rgba(255,225,120,0.95)');
  } else if (mt && !st.won && !modal) {
    var tp = null;
    if (mt.cell != null) tp = cellPx(mt.cell % st.board.w, (mt.cell / st.board.w) | 0);
    else if (st.alive[mt.seg] && !st.anims[mt.seg]) {
      var ms2 = st.board.segs[mt.seg], tc = st.mtut.m === 'rot' ? ms2.cells[ms2.cells.length - 1] : st.mtut.m === 'bi' ? ms2.cells[0] : ms2.cells[Math.floor(ms2.cells.length / 2)];
      tp = cellPx(tc[0], tc[1]);
    }
    if (tp) {
      var rr = BL.cell * VZ.z * (0.9 + 0.15 * Math.sin(now * 5));
      c.save(); c.lineWidth = 4; c.strokeStyle = 'rgba(255,230,140,0.95)'; c.beginPath(); c.arc(tp[0], tp[1], Math.max(18, rr), 0, Math.PI * 2); c.stroke(); c.restore();
      var hof = Math.max(14, BL.cell * VZ.z * 0.45);
      D.hand(c, tp[0] + hof, tp[1] + hof, 1.0, now);
    }
  }
  if (st.won && st.unlock == null && st.winT > 0.2) drawWinBeast(c);
  else if (st.won && st.winT > 0.2) drawWinBeast(c);
}

function drawZoomChip(c) {
  if (!st || st.board.w < 12 || st.won) return;
  var zoomed = VZ.z > 1.05, w = 128, h = 40, x = BL.x + BL.w - w - 20, y = BL.y + BL.h + 2; // 放在棋盘框下方，不遮格子
  var pr = isPressed('zoom') ? 0.94 : 1;
  c.save(); c.translate(x + w / 2, y + h / 2); c.scale(pr, pr); c.translate(-x - w / 2, -y - h / 2);
  D.rr(c, x, y, w, h, h / 2); c.fillStyle = zoomed ? 'rgba(126,26,19,0.92)' : 'rgba(58,32,12,0.9)'; c.fill();
  c.lineWidth = 2.5; c.strokeStyle = '#D4A443'; c.stroke();
  if (IMG.ic_zoom) c.drawImage(IMG.ic_zoom, x + 8, y + 4, 32, 32);
  D.text(c, zoomed ? '复原' : '放大', x + 82, y + h / 2 + 1, 24, '#FBE6B0', { title: true });
  c.restore();
  region('zoom', x, y, w, h, function () {
    if (VZ.z > 1.05) setView(1, 0, 0);
    else zoomAt(2.2, VP.x + VP.w / 2, VP.y + VP.h / 2);
  });
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

// 静态线缓存：未在动画/高亮中的线画进离屏画布，按 (缩放, 平移, 局面版本, 动态集合) 失效；每帧只重画动态的线（200 条线也只在局面变化时重画）
var lineCache = null;
function dynamicSet() {
  // 叠加层：动画中/闪烁/提示/点按高亮的线每帧重画在缓存之上
  var d = {};
  for (var k in st.anims) d[k] = 1;
  for (var f in st.flash) d[f] = 1;
  for (var sp in st.spin) d[sp] = 1;
  if (st.hint >= 0) d[st.hint] = 1;
  if (st.tapHL) d[st.tapHL.i] = 1;
  var tt = tutTarget(); if (tt >= 0) d[tt] = 1;
  return d;
}
// 缓存里要排除的线：会在原位“移动”的（撞线回弹、转盘转动）。已移除的线本来就不在缓存里。
function excludedSet() {
  var e = {};
  for (var k in st.anims) if (st.anims[k].type === 'bump') e[k] = 1;
  for (var sp in st.spin) e[sp] = 1;
  return e;
}
function ensureLineCache(excl) {
  var key = VZ.z.toFixed(4) + '|' + VZ.px.toFixed(2) + '|' + VZ.py.toFixed(2) + '|' + st.ver + '|' + Object.keys(excl).join(',') + '|' + st.board.id + st.board.daily;
  var k = scr.dpr * S, W = Math.ceil(VP.w * k), H = Math.ceil(VP.h * k);
  if (!lineCache || lineCache.W !== W || lineCache.H !== H) lineCache = { cv: P.createOffscreen(W, H), W: W, H: H, key: null };
  if (lineCache.key === key) return;
  lineCache.key = key; lineCache.builds = (lineCache.builds || 0) + 1;
  var c = lineCache.cv.getContext('2d');
  c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, W, H);
  c.setTransform(k, 0, 0, k, -VP.x * k, -VP.y * k);
  drawCells(c, excl, false);
}
function visibleCell(p, cs) { return !(p[0] < VP.x - cs || p[1] < VP.y - cs || p[0] > VP.x + VP.w + cs || p[1] > VP.y + VP.h + cs); }
function drawCells(c, dyn, onlyDyn) {
  var b = st.board, cs = BL.cell * VZ.z;
  if (!onlyDyn) {
    c.fillStyle = DOT_COL;
    var r = Math.max(1.2, cs * 0.06), pm = G.pmapOf(b);
    for (var y = 0; y < b.h; y++) for (var x = 0; x < b.w; x++) {
      if (st.occ[y * b.w + x] >= 0 || pm[y * b.w + x] >= 0) continue;
      var p = cellPx(x, y);
      if (!visibleCell(p, cs)) continue;
      c.beginPath(); c.arc(p[0], p[1], r, 0, Math.PI * 2); c.fill();
    }
  }
  var glowAll = st.mode === 'hammer' || st.mode === 'swap' || st.mode === 'bomb';
  for (var i = 0; i < b.segs.length; i++) {
    var a = st.anims[i];
    if (!st.alive[i] && !a) continue;
    if (onlyDyn ? !dyn[i] : (!st.alive[i] || dyn[i])) continue; // 缓存：活着且未排除；叠加层：dyn 集合
    var s = a && a.s ? a.s : 0, alpha = 1, scale = 1;
    if (a && a.type === 'exit') alpha = Math.max(0, Math.min(1, (a.dist - s) / 2));
    if (a && a.type === 'dissolve') { alpha = 1 - a.t / 0.5; scale = 1 + a.t * 0.6; }
    var glow = 0, glowCol = null;
    if (st.hint === i) { glow = 0.55 + 0.45 * Math.sin(now * 7); glowCol = '255,215,90'; }
    else if (glowAll && st.alive[i] && (st.mode === 'hammer' || G.isPlain(b.segs[i]))) { glow = 0.3 + 0.25 * Math.sin(now * 6); glowCol = '255,215,90'; }
    if (st.tapHL && st.tapHL.i === i) { glow = Math.max(glow, st.tapHL.t / 0.35); glowCol = '255,255,255'; }
    drawArrow(c, i, s, alpha, st.flash[i] || 0, glow, glowCol, scale);
  }
  if (!onlyDyn) {
    // 锁链（配对两线交界处）
    for (var l = 0; l < st.links.length; l++) {
      var lk = st.links[l]; if (!st.alive[lk.a] || !st.alive[lk.b]) continue;
      var lp = cellPx(lk.x, lk.y); if (visibleCell(lp, cs)) Y.chain(c, lp[0], lp[1], cs, lk.horiz);
    }
  }
}
function drawPortals(c) {
  var b = st.board; if (!b.portals || !b.portals.length) return;
  var cs = BL.cell * VZ.z;
  b.portals.forEach(function (pp, k) {
    var cols = Y.PORTAL_COLS[k % Y.PORTAL_COLS.length];
    pp.forEach(function (cell) { var p = cellPx(cell % b.w, (cell / b.w) | 0); if (visibleCell(p, cs)) Y.portal(c, p[0], p[1], cs, cols, now); });
  });
}
function drawSegments(c) {
  var dyn = st.mode ? null : dynamicSet();
  c.save();
  c.beginPath(); c.rect(VP.x - 1, VP.y - 1, VP.w + 2, VP.h + 2); c.clip();
  if (dyn) {
    ensureLineCache(excludedSet());
    c.drawImage(lineCache.cv, VP.x, VP.y, VP.w, VP.h);
    drawPortals(c);
    drawCells(c, dyn, true);
  } else {
    drawCells(c, {}, false); // 道具选择模式：全部线都在闪，直接逐帧画
    drawPortals(c);
  }
  c.restore();
}

// 细线 + 圆角折点 + 小而利落的箭头；机关：冰霜/冰牌、铜锁、玉钥、双头、转盘、炸弹
function drawArrow(c, i, s, alpha, flash, glow, glowCol, scale) {
  var seg = st.board.segs[i], a = st.anims[i], ms = st.ms, cell = BL.cell * VZ.z, col = COLORS[seg.color % COLORS.length];
  var L = seg.cells.length, moving = a && a.path && s > 0;
  var runs = moving ? polyRuns(a.path, s, L) : [seg.cells];
  runs = runs.map(function (r) { return r.map(function (p) { return cellPx(p[0], p[1]); }); });
  var lastRun = runs[runs.length - 1], hp = lastRun[lastRun.length - 1];
  var d0 = moving ? a.dir : staticDir(i), ang = Math.atan2(d0[1], d0[0]);
  if (!moving && seg.rot && st.spin[i]) {
    var sp = st.spin[i], u = Math.min(1, sp.t / 0.2), a0 = Math.atan2(G.DIRS[sp.from][1], G.DIRS[sp.from][0]), a1 = Math.atan2(G.DIRS[sp.to][1], G.DIRS[sp.to][0]);
    var da = a1 - a0; while (da < 0) da += Math.PI * 2; while (da > Math.PI * 2) da -= Math.PI * 2;
    ang = a0 + da * (1 - (1 - u) * (1 - u));
  }
  var w = Math.max(1.6, cell * 0.28);
  var locked = seg.lock != null && st.alive[seg.lock], iced = ms.ice[i] > 0;
  c.save(); c.globalAlpha = alpha * (locked && !moving ? 0.82 : 1);
  if (scale !== 1) { var m = runs[0][Math.floor(runs[0].length / 2)]; c.translate(m[0], m[1]); c.scale(scale, scale); c.translate(-m[0], -m[1]); }
  c.lineCap = 'round'; c.lineJoin = 'round';
  function path() {
    c.beginPath();
    for (var r = 0; r < runs.length; r++) { var pts = runs[r]; c.moveTo(pts[0][0], pts[0][1]); for (var k = 1; k < pts.length; k++) c.lineTo(pts[k][0], pts[k][1]); if (pts.length === 1) c.lineTo(pts[0][0] + 0.01, pts[0][1]); }
  }
  var tipL = cell * 0.42, hw = cell * 0.26, back = cell * 0.04;
  function head(px, py, an, g) {
    var dx = Math.cos(an), dy = Math.sin(an), nx = -dy, ny = dx, bx = px - dx * back, by = py - dy * back;
    c.beginPath();
    c.moveTo(px + dx * (tipL + g), py + dy * (tipL + g));
    c.lineTo(bx + nx * (hw + g) - dx * g, by + ny * (hw + g) - dy * g);
    c.lineTo(bx - nx * (hw + g) - dx * g, by - ny * (hw + g) - dy * g);
    c.closePath();
  }
  var tail2 = seg.bi && !moving, tp = null, tang = 0;
  if (tail2) { tp = cellPx(seg.cells[0][0], seg.cells[0][1]); var td = [seg.cells[0][0] - seg.cells[1][0], seg.cells[0][1] - seg.cells[1][1]]; tang = Math.atan2(td[1], td[0]); }
  if (iced && !moving) Y.frost(c, path, w);
  if (glow > 0) {
    c.strokeStyle = 'rgba(' + glowCol + ',' + (0.5 * glow) + ')'; c.lineWidth = w + cell * 0.36; path(); c.stroke();
    c.fillStyle = 'rgba(' + glowCol + ',' + (0.5 * glow) + ')'; head(hp[0], hp[1], ang, cell * 0.16); c.fill();
    if (tail2) { head(tp[0], tp[1], tang, cell * 0.16); c.fill(); }
  }
  var base = col;
  if (flash > 0 && Math.sin(flash * 30) > 0) base = '#FF4A3A';
  // 转盘在箭头之下
  if (seg.rot && !moving) Y.disc(c, hp[0], hp[1], cell * 1.05, st.spin[i] ? st.spin[i].t * 8 : 0);
  c.strokeStyle = base; c.lineWidth = w; path(); c.stroke();
  c.fillStyle = base; c.lineWidth = Math.max(1, cell * 0.05); c.strokeStyle = base;
  if (seg.rot && !moving) {
    // 转盘上的箭头：从盘心指出
    var dx = Math.cos(ang), dy = Math.sin(ang);
    head(hp[0] + dx * cell * 0.05, hp[1] + dy * cell * 0.05, ang, 0); c.fill(); c.stroke();
    c.lineWidth = Math.max(1, cell * 0.06); c.strokeStyle = '#2A1A08'; c.stroke();
  } else { head(hp[0], hp[1], ang, 0); c.fill(); c.stroke(); }
  if (tail2) {
    c.fillStyle = base; c.strokeStyle = base; c.lineWidth = Math.max(1, cell * 0.05); head(tp[0], tp[1], tang, 0); c.fill(); c.stroke();
    // 双头线：两端各加一个小白点，强调“两头都能飞”
    c.fillStyle = 'rgba(255,255,255,0.9)'; c.beginPath(); c.arc(tp[0], tp[1], Math.max(1.2, cell * 0.08), 0, Math.PI * 2); c.arc(hp[0], hp[1], Math.max(1.2, cell * 0.08), 0, Math.PI * 2); c.fill();
  }
  // 机关标记（画在线中段）
  if (!moving && alpha > 0.05) {
    var mc = seg.cells[Math.floor(L / 2)], mp = cellPx(mc[0], mc[1]), pc = Y.PAIR_COLS[(seg.pair || 0) % Y.PAIR_COLS.length];
    if (iced) Y.ice(c, mp[0], mp[1], cell * 0.95, ms.ice[i], seg.ice);
    else if (locked) Y.lock(c, mp[0], mp[1], cell * 0.95, pc);
    else if (seg.key != null && st.alive[seg.key]) Y.key(c, mp[0], mp[1], cell * 0.95, pc);
    else if (seg.bomb) Y.bomb(c, mp[0], mp[1], cell * 0.95, 0);
    else if (seg.chain != null && st.alive[seg.chain]) Y.chainBadge(c, mp[0], mp[1], cell * 0.95, pc);
  }
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
  var hsp = Math.min(54, 162 / CFG.HEARTS), hsc = hsp / 54;
  for (var i = 0; i < CFG.HEARTS; i++) {
    var hx = x + 118 + i * hsp, hy = y + h / 2 - 23, im = i < st.hearts ? IMG.heart : null;
    var ha = null; for (var k = 0; k < st.heartAnim.length; k++) if (st.heartAnim[k].i === i) ha = st.heartAnim[k];
    c.save();
    if (hsc < 1) { c.translate(hx, hy + 23); c.scale(hsc, hsc); c.translate(-hx, -hy - 23); }
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
  if (st.mtut && !st.mtut.done && st.mtut.t < 15) sub = '新机关 · ' + MECH_SHORT[st.mtut.m];
  if (st.mode) sub = { hammer: '锤子：点选一条线移走（点空白处取消）', bomb: '炸弹：点选位置，炸开 3×3 普通线', swap: '交换：点选一条普通线调头' }[st.mode];
  var sy = y + h + 34, cx0 = VW / 2, maxW = LW - 40, fs = 28;
  if (T.active(st.timer)) {
    var tw0 = drawTimer(c, X0 + 18, sy);
    var l = X0 + 18 + tw0 + 12, r = X0 + LW - 18; cx0 = (l + r) / 2; maxW = r - l;
  }
  if (st.comboShow) { maxW -= 180; cx0 -= 90; }
  c.font = '700 ' + fs + 'px ' + D.FONT_T; var tw = c.measureText(sub).width + 50;
  while (tw > maxW && fs > 16) { fs -= 2; c.font = '700 ' + fs + 'px ' + D.FONT_T; tw = c.measureText(sub).width + 44; }
  while (tw > maxW && sub.length > 4) { sub = sub.slice(0, -2) + '…'; tw = c.measureText(sub).width + 44; }
  tw = Math.min(tw, maxW);
  D.rr(c, cx0 - tw / 2, sy - 24, tw, 48, 24); c.fillStyle = st.mode ? 'rgba(126,26,19,0.85)' : (st.mtut && !st.mtut.done && st.mtut.t < 15 ? 'rgba(38,92,70,0.88)' : 'rgba(70,40,15,0.72)'); c.fill();
  D.text(c, sub, cx0, sy + 1, fs, '#FBEBC4', { title: true });
  // 连击：放在副标题条右端（不再飘在棋盘上遮挡线）
  if (st.comboShow) {
    var cu = st.comboShow.t, ca = Math.min(1, cu * 8, (1.4 - cu) * 4), csc = 1 + 0.25 * Math.max(0, 1 - cu * 6);
    var cx2 = X0 + LW - 92, cy2 = sy;
    c.save(); c.globalAlpha = Math.max(0, ca); c.translate(cx2, cy2); c.scale(csc, csc);
    D.rr(c, -78, -26, 156, 52, 26); c.fillStyle = 'rgba(126,26,19,0.95)'; c.fill(); c.lineWidth = 3; c.strokeStyle = '#F3D27E'; c.stroke();
    D.text(c, '连击 ×' + st.comboShow.n, 0, 1, 28, '#FFE7A0', { title: true });
    c.restore();
  }
}

// 倒计时：沙漏圆钮 + mm:ss + 细进度条（最后 10 秒变红、跳动）
function drawTimer(c, x, cy) {
  var t = st.timer, W = 236, H = 48, ratio = t.limit ? Math.max(0, Math.min(1, t.left / t.limit)) : 0;
  var warn = T.warn(t) && !st.won, low = ratio < 0.3;
  var pulse = warn ? 1 + 0.07 * Math.max(0, Math.sin((t.left % 1) * Math.PI)) : 1;
  c.save();
  c.translate(x + W / 2, cy); c.scale(pulse, pulse); c.translate(-x - W / 2, -cy);
  D.rr(c, x, cy - H / 2, W, H, H / 2);
  c.fillStyle = warn ? 'rgba(150,28,18,0.92)' : 'rgba(70,40,15,0.78)'; c.fill();
  c.lineWidth = 2.5; c.strokeStyle = warn ? '#FFB199' : '#D4A443'; c.stroke();
  // 表盘
  var ix = x + 26, iy = cy;
  c.beginPath(); c.arc(ix, iy, 15, 0, Math.PI * 2); c.fillStyle = warn ? '#FFE3D6' : '#FBE6B0'; c.fill();
  c.lineWidth = 2; c.strokeStyle = warn ? '#7A1A10' : '#6B4515'; c.stroke();
  // 剩余扇形
  if (ratio > 0) { c.beginPath(); c.moveTo(ix, iy); c.arc(ix, iy, 11, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ratio); c.closePath(); c.fillStyle = warn ? '#D93A2B' : (low ? '#D9922B' : '#3F8A62'); c.fill(); }
  // 数字
  var col = warn ? '#FFFFFF' : (t.started ? '#FBEBC4' : 'rgba(251,235,196,0.75)');
  D.text(c, T.fmt(t.left), x + 88, cy + 1, 30, col, { weight: '800' });
  // 细进度条
  var bx = x + 134, bw = W - 134 - 18, bh = 8;
  D.rr(c, bx, cy - bh / 2, bw, bh, bh / 2); c.fillStyle = 'rgba(0,0,0,0.35)'; c.fill();
  if (ratio > 0.005) {
    D.rr(c, bx, cy - bh / 2, Math.max(bh, bw * ratio), bh, bh / 2);
    var g = c.createLinearGradient(0, cy - bh / 2, 0, cy + bh / 2);
    if (warn) { g.addColorStop(0, '#FF8A7A'); g.addColorStop(1, '#C8261B'); }
    else if (low) { g.addColorStop(0, '#F7CF7A'); g.addColorStop(1, '#C47E1E'); }
    else { g.addColorStop(0, '#B4E8C8'); g.addColorStop(1, '#3F8A62'); }
    c.fillStyle = g; c.fill();
  }
  c.restore();
  return W;
}

function openBeastPeek(b) {
  var idx = BEASTS.indexOf(b);
  if (beastUnlocked(idx)) openBeast(b); else toast('通关第 ' + (idx + 1) * 10 + ' 关，收服' + b.name);
}

function itemIcon(c, key, cx, cy, size, kind, label, cb, opt) {
  opt = opt || {};
  var pr = isPressed(key) ? 0.92 : 1, sz = size * pr;
  if (kind === 'hint') roundIcon(c, key, cx, cy, size, IMG.ic_hint, label, cb, opt);
  else {
    Y.jade(c, cx, cy, sz); Y.itemGlyph(c, kind, cx, cy, sz, now);
    roundIcon(c, key, cx, cy, size, null, label, cb, opt);
  }
  if (opt.active) { c.lineWidth = 5; c.strokeStyle = 'rgba(255,220,120,' + (0.6 + 0.4 * Math.sin(now * 8)) + ')'; c.beginPath(); c.arc(cx, cy, size / 2 + 10, 0, Math.PI * 2); c.stroke(); }
}
function drawAssistBar(c) {
  var y = VH - SAFE_B - 108, a = save.assists, sz = 104, xs = [];
  for (var k = 0; k < 5; k++) xs.push(X0 + 75 + k * 150);
  function badge(kind) { return a[kind] > 0 ? a[kind] : 'coin'; }
  itemIcon(c, 'hint', xs[0], y, sz, 'hint', '提示', doHint, { badge: badge('hint') });
  itemIcon(c, 'hammer', xs[1], y, sz, 'hammer', '锤子', function () { enterMode('hammer'); }, { badge: badge('hammer'), active: st.mode === 'hammer' });
  itemIcon(c, 'ibomb', xs[2], y, sz, 'bomb', '炸弹', function () { enterMode('bomb'); }, { badge: badge('bomb'), active: st.mode === 'bomb' });
  itemIcon(c, 'swap', xs[3], y, sz, 'swap', '交换', function () { enterMode('swap'); }, { badge: badge('swap'), active: st.mode === 'swap' });
  itemIcon(c, 'reset', xs[4], y, sz, 'reset', '重置', doReset, { badge: '免费' });
}

// ---------------- 弹窗 ----------------
function openDaily() { modal = { type: 'daily', t: 0 }; }
function openSettings() { modal = { type: 'settings', t: 0 }; }
function openCheckin() { modal = { type: 'checkin', t: 0 }; }
function closeModal() { modal = null; }

function drawModal(c) {
  modal.t += 1 / 60;
  c.fillStyle = 'rgba(20,12,5,' + Math.min(0.6, modal.t * 4) + ')'; c.fillRect(0, 0, VW, VH);
  region('modal-bg', 0, 0, VW, VH, function () { if (modal && modal.dismissable !== false && ['beast', 'settings', 'checkin', 'daily', 'tasks'].indexOf(modal.type) >= 0) closeModal(); }, { modal: true });
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
    var w = 600, h = 690 + (st.unlock ? 270 : 0), x = VW / 2 - w / 2, y = VH / 2 - h / 2;
    D.panel(c, x, y, w, h);
    var title = st.daily ? '每日挑战完成' : (st.n % 10 === 0 ? '守关告捷' : '关卡完成');
    D.text(c, title, VW / 2, y + 74, 58, '#7A2A1C', { title: true, shadow: 'rgba(212,164,67,0.6)', sy: 3 });
    D.text(c, st.daily ? st.daily : '第 ' + st.n + ' 关', VW / 2, y + 128, 28, '#6B4A26', { title: true });
    for (var i = 0; i < 3; i++) {
      var tt = modal.t - 0.25 - i * 0.22, sx = VW / 2 + (i - 1) * 130, sy2 = y + 222 - (i === 1 ? 22 : 0);
      if (IMG.star_empty) c.drawImage(IMG.star_empty, sx - 50, sy2 - 50, 100, 100);
      if (i < st.stars && tt > 0) {
        if (!modal['s' + i]) { modal['s' + i] = 1; P.play('pluck' + (3 + i * 2)); burst(sx, sy2, 18, 'gold', 300); }
        var k = Math.min(1, tt / 0.25), sc = 1 + (1 - k) * 1.2;
        c.save(); c.globalAlpha = k; c.translate(sx, sy2); c.scale(sc, sc); if (IMG.star) c.drawImage(IMG.star, -54, -54, 108, 108); c.restore();
      }
    }
    // 用时 / 失误 / 金币
    var ry = y + 300, cw = (w - 80) / 3, tm = st.timer;
    var cols = [
      ['用时', T.active(tm) ? T.fmt(tm.elapsed) : '—', st.starTime ? '三星 ≤ ' + T.fmt(st.starTime) : '不计用时', st.starTime && tm.elapsed > st.starTime ? '#C8372D' : '#2C5B44'],
      ['失误', String(st.misses), st.misses ? '零失误得三星' : '完美！', st.misses ? '#C8372D' : '#2C5B44'],
      ['金币', '+' + (st.coins * (st.doubled ? 2 : 1)), st.doubled ? '已翻倍' : '', '#8A5A10']
    ];
    for (var q = 0; q < 3; q++) {
      var cx = x + 40 + cw * q + cw / 2;
      D.rr(c, cx - cw / 2 + 6, ry, cw - 12, 132, 16); c.fillStyle = 'rgba(122,42,28,0.08)'; c.fill(); c.lineWidth = 2; c.strokeStyle = 'rgba(176,128,48,0.55)'; c.stroke();
      D.text(c, cols[q][0], cx, ry + 26, 24, '#6B4A26', { title: true });
      if (q === 2 && IMG.coin) c.drawImage(IMG.coin, cx - 70, ry + 46, 38, 38);
      D.text(c, cols[q][1], cx + (q === 2 ? 16 : 0), ry + 66, 40, cols[q][3], { title: true });
      if (cols[q][2]) D.text(c, cols[q][2], cx, ry + 108, 19, '#8A6A40');
    }
    var yy = ry + 158;
    if (st.unlock) {
      var b = st.unlock, im = BIMG[b.id];
      D.rr(c, x + 50, yy - 6, w - 100, 240, 22); c.fillStyle = 'rgba(122,42,28,0.1)'; c.fill(); c.lineWidth = 2; c.strokeStyle = 'rgba(176,128,48,0.6)'; c.stroke();
      if (im) { var s3 = 190 / Math.max(im.width, im.height); c.drawImage(im, x + 70 + (190 - im.width * s3) / 2, yy + 18 + (190 - im.height * s3) / 2, im.width * s3, im.height * s3); }
      D.text(c, '收服异兽', x + 400, yy + 50, 30, '#6B4A26', { title: true });
      D.text(c, b.name, x + 400, yy + 110, 60, '#7A2A1C', { title: true });
      D.text(c, '已收入《异兽图鉴》', x + 400, yy + 170, 24, '#6B4A26');
      region('unlockcard', x + 50, yy - 6, w - 100, 240, function () { var bb = st.unlock; modal = { type: 'beast', b: bb, t: 0, back: 'win' }; }, { modal: true });
      yy += 270;
    }
    // 看广告翻倍（自愿，每关一次）
    if (CFG.WIN_AD_DOUBLE && !st.doubled) {
      mbtn(c, 'w-double', VW / 2 - 200, yy, 400, 76, '看广告 金币翻倍', 'jade', function () {
        rewardedAd('win_double').then(function (r) {
          if (r.msg) toast(r.msg);
          if (r.ok && !st.doubled) { st.doubled = true; addCoins(st.coins, 'double'); toast('金币翻倍 +' + st.coins); burst(VW / 2, yy + 38, 30, 'gold', 360); }
        });
      }, { size: 30 });
    } else D.text(c, '金币已翻倍', VW / 2, yy + 38, 26, '#2C5B44', { title: true });
    if (st.daily) {
      mbtn(c, 'w-home', VW / 2 - 170, y + h - 128, 340, 96, '返回主页', 'red', function () { modal = null; scene = 'menu'; });
      return;
    }
    var hasNext = st.n < CFG.TOTAL_LEVELS;
    mbtn(c, 'w-next', VW / 2 - 290, y + h - 128, 300, 96, hasNext ? '下一关' : '全部通关', 'red', function () {
      if (!hasNext) { modal = null; scene = 'menu'; return; }
      var n = st.n + 1;
      if (n >= CFG.INTERSTITIAL_MIN_LEVEL && save.winsSinceAd >= CFG.INTERSTITIAL_EVERY_WINS) { save.winsSinceAd = 0; persist(); P.showInterstitial(); }
      startLevel(n);
    }, { size: 42 });
    mbtn(c, 'w-sel', VW / 2 + 26, y + h - 128, 126, 96, '选关', 'wood', function () { modal = null; openLevels(); }, { size: 28 });
    mbtn(c, 'w-retry', VW / 2 + 164, y + h - 128, 126, 96, '再玩', 'wood', function () { startLevel(st.n, null, true); }, { size: 28 });
  },
  fail: function (c) {
    var w = 580, h = 620, x = VW / 2 - w / 2, y = VH / 2 - h / 2, total = st.board.segs.length, left = total - st.removedCount;
    D.panel(c, x, y, w, h);
    D.text(c, '差一点就成功', VW / 2, y + 80, 58, '#7A2A1C', { title: true });
    D.text(c, '还剩 ' + left + ' 支箭 · ' + cnNum(CFG.HEARTS) + '颗心已用尽', VW / 2, y + 144, 28, '#6B4A26');
    progressBar(c, x + 70, y + 180, w - 140, st.removedCount / total);
    if (!st.heartRevived) {
      if (IMG.heart) { c.save(); c.globalAlpha = 0.9; c.drawImage(IMG.heart, VW / 2 - 92, y + 238, 84, 80); c.restore(); }
      D.text(c, '+' + CFG.REVIVE_HEARTS, VW / 2 + 34, y + 280, 46, '#C8372D', { title: true });
      mbtn(c, 'f-revive', VW / 2 - 210, y + 344, 420, 100, '看广告 继续挑战', 'jade', function () {
        rewardedAd('revive_hearts').then(function (r) {
          if (r.msg) toast(r.msg);
          if (r.ok && st.failed && !st.timeUp) { st.hearts = CFG.REVIVE_HEARTS; st.failed = false; st.heartRevived = true; modal = null; }
        });
      }, { size: 38 });
    } else D.text(c, '本关复活次数已用完', VW / 2, y + 300, 30, '#8A6214', { title: true });
    mbtn(c, 'f-retry', VW / 2 - 210, y + 476, 200, 84, '再试一次', 'red', function () { startLevel(st.n, st.daily, true); }, { size: 32 });
    mbtn(c, 'f-home', VW / 2 + 10, y + 476, 200, 84, '返回主页', 'wood', function () { modal = null; scene = 'menu'; }, { size: 30 });
  },
  timeup: function (c) {
    var t = st.timer, can = T.canRevive(t), left = (CFG.TIMER_REVIVES_PER_LEVEL || 0) - t.revives;
    var w = 580, h = 640, x = VW / 2 - w / 2, y = VH / 2 - h / 2, total = st.board.segs.length;
    D.panel(c, x, y, w, h);
    D.text(c, '时间到', VW / 2, y + 80, 62, '#7A2A1C', { title: true, shadow: 'rgba(212,164,67,0.6)', sy: 3 });
    D.text(c, '差一点就成功 · 还剩 ' + (total - st.removedCount) + ' 支箭', VW / 2, y + 144, 28, '#6B4A26');
    progressBar(c, x + 70, y + 176, w - 140, st.removedCount / total);
    var hx = VW / 2 - (can ? 60 : 0), hy = y + 280, k = 1 + 0.04 * Math.sin(now * 5);
    c.save(); c.translate(hx, hy); c.scale(k, k);
    c.fillStyle = '#7A4A1C'; D.rr(c, -46, -62, 92, 12, 6); c.fill(); D.rr(c, -46, 50, 92, 12, 6); c.fill();
    c.beginPath(); c.moveTo(-36, -50); c.lineTo(36, -50); c.lineTo(6, 0); c.lineTo(36, 50); c.lineTo(-36, 50); c.lineTo(-6, 0); c.closePath();
    c.fillStyle = 'rgba(255,248,230,0.85)'; c.fill(); c.lineWidth = 3; c.strokeStyle = '#B4832E'; c.stroke();
    c.beginPath(); c.moveTo(-30, 46); c.lineTo(30, 46); c.lineTo(0, 16); c.closePath(); c.fillStyle = '#D9A441'; c.fill();
    c.restore();
    if (can) {
      D.text(c, '+' + CFG.TIMER_REVIVE_SECONDS + '秒', VW / 2 + 70, hy + 4, 50, '#2C7A55', { title: true });
      mbtn(c, 'tu-revive', VW / 2 - 220, y + 372, 440, 100, '看广告 +' + CFG.TIMER_REVIVE_SECONDS + '秒 继续', 'jade', function () {
        rewardedAd('revive_time').then(function (r) {
          if (r.msg) toast(r.msg);
          if (r.ok && st && st.timeUp) reviveTime();
        });
      }, { size: 34 });
      D.text(c, '本关还可续时 ' + left + ' 次', VW / 2, y + 496, 24, '#8A6214');
    } else {
      D.text(c, '本关续时次数已用完', VW / 2, y + 420, 30, '#8A6214', { title: true });
    }
    mbtn(c, 'tu-retry', VW / 2 - 210, y + 528, 200, 80, '再试一次', 'red', function () { startLevel(st.n, st.daily, true); }, { size: 32 });
    mbtn(c, 'tu-home', VW / 2 + 10, y + 528, 200, 80, '返回主页', 'wood', function () { modal = null; scene = 'menu'; }, { size: 30 });
  },
  buy: function (c) {
    var w = 580, h = 560, x = VW / 2 - w / 2, y = VH / 2 - h / 2, kind = modal.kind, price = CFG.PRICES[kind], coins = save.coins || 0;
    D.panel(c, x, y, w, h);
    D.text(c, ITEM_NAME[kind] + '已用完', VW / 2, y + 76, 46, '#7A2A1C', { title: true });
    if (kind === 'hint' && IMG.ic_hint) c.drawImage(IMG.ic_hint, VW / 2 - 56, y + 116, 112, 112);
    else { Y.jade(c, VW / 2, y + 172, 112); Y.itemGlyph(c, kind, VW / 2, y + 172, 112, now); }
    D.text(c, ITEM_DESC[kind], VW / 2, y + 262, 26, '#6B4A26');
    if (IMG.coin) c.drawImage(IMG.coin, VW / 2 - 110, y + 290, 32, 32);
    D.text(c, '持有金币 ' + coins, VW / 2 + 16, y + 307, 26, '#8A5A10', { title: true });
    var m = modal;
    mbtn(c, 'buy-coin', VW / 2 - 230, y + 350, 220, 92, price + ' 金币', coins >= price ? 'red' : 'wood', function () {
      if ((save.coins || 0) < price) { toast('金币不足，可以看广告免费获得'); return; }
      save.coins -= price; persist(); modal = null; P.play('unlock', 0.5); m.apply();
    }, { size: 34, sub: '购买 1 次' });
    mbtn(c, 'buy-ad', VW / 2 + 10, y + 350, 220, 92, '看广告', 'jade', function () {
      rewardedAd('item_' + kind).then(function (r) {
        if (r.msg) toast(r.msg);
        modal = null;
        if (r.ok) m.apply();
      });
    }, { size: 34, sub: '免费 1 次' });
    mbtn(c, 'buy-no', VW / 2 - 100, y + 466, 200, 70, '取消', 'wood', function () { modal = null; if (st) st.mode = null; }, { size: 28 });
  },
  reset: function (c) {
    var w = 540, h = 380, x = VW / 2 - w / 2, y = VH / 2 - h / 2;
    D.panel(c, x, y, w, h);
    D.text(c, '重置本关', VW / 2, y + 80, 50, '#7A2A1C', { title: true });
    D.text(c, '恢复初始棋盘与倒计时（免费）', VW / 2, y + 150, 28, '#6B4A26');
    mbtn(c, 'r-yes', VW / 2 - 220, y + 230, 200, 92, '重置', 'red', function () { startLevel(st.n, st.daily, true); toast('已重置'); }, { size: 34 });
    mbtn(c, 'r-no', VW / 2 + 20, y + 230, 200, 92, '继续', 'wood', closeModal, { size: 34 });
  },
  tasks: function (c) {
    var w = 640, h = 640, x = VW / 2 - w / 2, y = VH / 2 - h / 2, t = tasksToday();
    D.panel(c, x, y, w, h);
    D.text(c, '每日任务', VW / 2, y + 76, 54, '#7A2A1C', { title: true });
    if (IMG.coin) c.drawImage(IMG.coin, VW / 2 - 100, y + 112, 32, 32);
    D.text(c, '持有金币 ' + (save.coins || 0), VW / 2 + 20, y + 129, 26, '#8A5A10', { title: true });
    TASKS.forEach(function (tk, i) {
      var ry = y + 170 + i * 108, prog = Math.min(tk.need, t[tk.id] || 0), done = prog >= tk.need, claimed = !!t.claimed[tk.id];
      D.rr(c, x + 36, ry, w - 72, 92, 16); c.fillStyle = claimed ? 'rgba(90,74,48,0.18)' : 'rgba(255,248,230,0.7)'; c.fill(); c.lineWidth = 2; c.strokeStyle = '#B4832E'; c.stroke();
      D.text(c, tk.name, x + 64, ry + 32, 30, '#3A2410', { title: true, align: 'left' });
      progressBar(c, x + 64, ry + 56, 220, prog / tk.need, 16);
      D.text(c, prog + '/' + tk.need, x + 312, ry + 64, 22, '#6B4A26', { align: 'left' });
      if (IMG.coin) c.drawImage(IMG.coin, x + 352, ry + 31, 28, 28);
      D.text(c, '+' + tk.coins, x + 384, ry + 46, 26, '#8A5A10', { title: true, align: 'left' });
      var bx = x + w - 164, key = 'tk-' + tk.id;
      if (claimed) D.text(c, '已领取', bx + 60, ry + 46, 26, '#6E675C', { title: true });
      else mbtn(c, key, bx, ry + 16, 120, 60, done ? '领取' : '未完成', done ? 'red' : 'wood', function () {
        if (!done) { toast('完成后再来领取'); return; }
        t.claimed[tk.id] = 1; addCoins(tk.coins, 'task'); P.play('unlock'); toast('任务完成 +' + tk.coins + ' 金币'); burst(bx + 60, ry + 46, 30, 'gold', 360);
      }, { size: 24 });
    });
    D.text(c, '每天 0 点刷新', VW / 2, y + h - 40, 22, '#8A6A40');
    closeX(c, x + w - 10, y + 10);
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
    D.text(c, got ? '今日已完成 ★' + got + '，可以再挑战' : '每天一局 28×44 机关大阵 · 首次完成 金币×' + CFG.COINS.daily, VW / 2, y + 345, 25, '#5A3A1A');
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
    D.text(c, '《山海一箭》 v4 · 异兽原文出自《山海经》', VW / 2, y + h - 34, 20, '#8A6A40');
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
      var rw = CFG.CHECKIN[i], keys = Object.keys(rw);
      var drawIt = function (kk, ix, iy, sz) { if (kk === 'hint') { if (IMG.ic_hint) c.drawImage(IMG.ic_hint, ix - sz / 2, iy - sz / 2, sz, sz); } else { Y.jade(c, ix, iy, sz); Y.itemGlyph(c, kk, ix, iy, sz, 0); } };
      if (keys.length === 1) {
        drawIt(keys[0], cx + cw / 2, cy + 90, 80);
        D.text(c, ASSIST_NAME[keys[0]] + '×' + rw[keys[0]], cx + cw / 2, cy + 148, 22, '#3A2410', { weight: '700' });
      } else {
        keys.forEach(function (kk, j) { drawIt(kk, cx + 30 + (j % 2) * 70, cy + 66 + Math.floor(j / 2) * 46, 44); });
        D.text(c, '道具大礼包', cx + cw / 2, cy + 148, 22, '#3A2410', { weight: '700' });
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

function progressBar(c, x, y, w, ratio, hh) {
  hh = hh || 22;
  D.rr(c, x, y, w, hh, hh / 2); c.fillStyle = 'rgba(70,45,20,0.25)'; c.fill();
  if (ratio > 0.01) { D.rr(c, x + 2, y + 2, Math.max(hh - 4, (w - 4) * Math.min(1, ratio)), hh - 4, (hh - 4) / 2); var g = c.createLinearGradient(0, y, 0, y + hh); g.addColorStop(0, '#B4E8C8'); g.addColorStop(1, '#3F8A62'); c.fillStyle = g; c.fill(); }
  D.rr(c, x, y, w, hh, hh / 2); c.lineWidth = 2; c.strokeStyle = '#8A6214'; c.stroke();
}
function drawToasts(c) {
  for (var i = 0; i < toasts.length; i++) {
    var t = toasts[i], d = t.d || 2.2, a = Math.min(1, t.t * 6, (d - t.t) * 3);
    c.save(); c.globalAlpha = Math.max(0, a);
    var fs = 30; c.font = '600 ' + fs + 'px ' + D.FONT_B;
    var lines = [t.s];
    if (c.measureText(t.s).width > 640) {
      var cut = t.s.indexOf('：') > 0 ? t.s.indexOf('：') + 1 : Math.ceil(t.s.length / 2);
      lines = [t.s.slice(0, cut), t.s.slice(cut)];
      fs = 28; c.font = '600 ' + fs + 'px ' + D.FONT_B;
    }
    var w = 0; lines.forEach(function (l) { w = Math.max(w, c.measureText(l).width); }); w = Math.min(VW - 20, w + 70);
    var hh = 34 + lines.length * 38, y = (st && scene === 'play' ? SAFE_T + 84 : VH * 0.3) - Math.min(1, t.t * 6) * 20;
    D.rr(c, VW / 2 - w / 2, y - hh / 2, w, hh, Math.min(34, hh / 2)); c.fillStyle = 'rgba(40,24,10,0.9)'; c.fill();
    c.lineWidth = 2; c.strokeStyle = '#D4A443'; c.stroke();
    lines.forEach(function (l, k) { D.text(c, l, VW / 2, y - (lines.length - 1) * 19 + k * 38 + 1, fs, '#FBEBC4'); });
    c.restore();
  }
}

// ---------------- 测试辅助：自动走一步（浏览器调试用） ----------------
function autoSolveStep() {
  if (!st || st.won || st.failed) return false;
  var cand = hintCandidates();
  if (!cand.length) return false;
  var c0 = cand[0];
  if (c0.opt === 'rot') { rotateSeg(c0.i); return true; }
  tapSeg(c0.i, c0.opt === 'tail' ? 'tail' : (c0.opt === 'head' ? 'head' : null));
  return true;
}

module.exports = { start: start };

};
R("main").start();})();
