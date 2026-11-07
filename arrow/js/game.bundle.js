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
  // 每关心数（撞线扣 1 颗）。大棋盘若觉得太严苛可调成 4 或 5，界面会自动适配
  HEARTS: 3,
  // 棋盘最大放大倍数（双指捏合 / 滚轮）
  MAX_ZOOM: 3,
  SLIDE_SPEED: 25, // 格/秒（最低速度；长线/远距离会自动加速，保证 0.75 秒内飞出）
  TOTAL_LEVELS: 500,
  // 7 日签到奖励
  CHECKIN: [
    { hint: 1 }, { remove: 1 }, { undo: 1 }, { hint: 2 },
    { remove: 2 }, { undo: 2 }, { hint: 2, remove: 2, undo: 2 }
  ],
  SHARE_TITLE: '上古异兽被困箭阵，你能一箭破局吗？'
};

};
M["levelpick"]=function(module,exports,require){
// 自动生成：tools/precompute.js（第 2..500 关选用的候选种子编号）
module.exports = [0,5,0,6,3,1,3,5,2,5,6,2,5,5,4,2,3,6,4,3,0,3,5,1,5,6,0,2,6,0,7,6,2,0,5,0,0,6,7,5,0,0,2,2,0,6,1,1,3,7,1,0,6,5,4,2,4,0,4,5,1,2,0,1,0,3,0,7,7,7,3,5,1,4,2,2,1,0,0,7,4,2,1,4,4,5,5,3,5,7,1,5,1,0,7,1,6,4,5,0,4,3,5,4,0,1,1,2,5,0,6,6,6,0,4,7,1,7,1,0,3,4,7,5,0,2,0,6,4,3,7,1,7,3,4,2,3,5,7,2,3,0,2,6,5,1,0,4,5,7,4,3,2,2,1,5,2,1,6,3,3,0,4,0,1,5,6,3,5,2,2,4,0,4,7,1,1,5,3,3,3,4,2,1,0,5,1,0,2,1,4,2,0,7,4,0,6,1,6,2,6,5,4,3,5,0,4,4,4,5,0,7,5,2,2,3,0,4,0,3,5,7,4,5,3,1,1,4,0,1,1,2,0,3,3,4,6,4,7,1,4,5,6,0,2,3,4,2,6,1,2,2,1,0,6,7,3,2,7,0,7,2,0,3,3,4,4,7,2,4,0,6,5,2,3,1,5,7,5,0,1,1,0,1,5,6,4,3,1,3,7,4,3,4,4,2,3,3,0,0,0,5,6,4,2,1,2,6,7,0,4,3,4,4,4,1,2,2,2,6,3,0,0,4,1,6,0,6,4,0,1,2,0,0,2,2,2,3,1,4,4,4,7,7,7,7,1,0,5,1,0,7,0,2,3,4,5,3,1,2,0,5,1,1,0,7,6,7,4,5,1,7,4,1,7,6,4,0,3,6,0,7,5,7,2,3,4,3,3,2,4,5,4,5,7,0,6,0,6,0,4,2,7,5,3,4,0,0,2,5,5,3,3,6,0,5,4,2,2,5,3,1,6,1,0,5,4,3,2,0,5,2,4,2,2,1,1,3,4,5,0,6,0,0,7,7,0,1,4,1,4,1,4,7,3,5,0,4,3,1,5,5,1,0,1,2,0,0,6,1,3,2,3,2,4,3,2,6,2,1,4,2,1,0,3,5,0,5,5,0,1,3,7,1,0,5,0,7,7];

};
M["levelgen"]=function(module,exports,require){
// 关卡生成 + 求解/评级（v2：密集长折线）
// 棋盘 w x h；每条线是一条折线，cells[0] 为线尾，cells[len-1] 为箭头。
// 点击后整条线沿箭头方向蛇形滑出；出射线（箭头沿方向到边界的格子）上有别的线就会撞上。
//
// 可解性保证：维护“阻挡依赖图”——A 的出射线上有 B 的格子，则 A 依赖 B（B 先走 A 才能走）。
// 每放入/延长一条线都做增量环检测，图始终是有向无环图（DAG），按拓扑序移除即可清空棋盘。
// 另外禁止出射线穿过自身（那样永远飞不出去）。
// 思路参考：IcedSoul/minigame-everyday day-03-arrow 的“增量放置 + 环检测 + 防孤格 + 端点延长补洞”，
// 此处为独立重写（该仓库未附许可证，未复制其代码）。
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

// ---------------- 生成器 ----------------
// opt: minLen, maxLen, meanLen, turnP, hugP, bias(>0 偏好被挡/向内的线 → 依赖链更深), tries, maxCap
function generate(w, h, rng, opt) {
  var N = w * h;
  var occ = new Int16Array(N).fill(-1);
  var segs = [], deps = [], rays = [];
  var cover = []; for (var i = 0; i < N; i++) cover.push([]);   // cover[c]：出射线经过 c 的线
  var mark = new Int32Array(4096), stamp = 0, stack = [];
  var tmark = new Int32Array(4096), tstamp = 0;
  var maxLen = opt.maxLen, cap = opt.maxCap || maxLen + 6;

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
  // 返回 {ray, blockers} 或 null
  var inPath = new Int32Array(N), pstamp = 0;
  function evaluate(ids, self, addedFrom) {
    var n = ids.length; if (n < 2) return null;
    var hd = ids[n - 1], pv = ids[n - 2];
    var hx = hd % w, hy = (hd / w) | 0, dx = hx - pv % w, dy = hy - ((pv / w) | 0);
    pstamp++;
    for (var i = 0; i < n; i++) inPath[ids[i]] = pstamp;
    var ray = [], blockers = [], x = hx + dx, y = hy + dy;
    tstamp++;
    while (x >= 0 && y >= 0 && x < w && y < h) {
      var c = y * w + x;
      if (inPath[c] === pstamp) return null;          // 出射线穿过自身
      ray.push(c);
      var o = occ[c];
      if (o >= 0 && o !== self && tmark[o] !== tstamp) { tmark[o] = tstamp; blockers.push(o); }
      x += dx; y += dy;
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
  // 延长已有线 si：newIds 为新的完整格子序列，added 为新增格子
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
  // 放入 c 是否会让某个空邻格变成孤格
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
    // 偏长分布：均值 meanLen
    var u = (rng.next() + rng.next() + rng.next()) / 3;
    return Math.max(opt.minLen, Math.min(maxLen, Math.round(opt.minLen + u * 2 * (opt.meanLen - opt.minLen))));
  }

  // 随机游走生成一条折线（格子 id 列表）
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
        // 贴边/贴线走：选空邻格最少的方向（形成回环、螺旋）
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
        // 不行就从箭头端逐步截短
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

  // 把空格 c 接到相邻线的尾或头上
  function tryExtend(c) {
    var nb = rng.shuffle(nbs(c)), opts = [];
    for (var i = 0; i < nb.length; i++) {
      var q = nb[i][0], si = occ[q]; if (si < 0) continue;
      var ids = segs[si]; if (ids.length >= cap) continue;
      if (ids[0] === q) opts.push([si, 0]);
      if (ids[ids.length - 1] === q) opts.push([si, 1]);
    }
    // 优先延长线尾（出射线不变），且优先较短的线
    opts.sort(function (a, b) { return (a[1] - b[1]) * 10 + (segs[a[0]].length - segs[b[0]].length) * 0.1; });
    for (var k = 0; k < opts.length; k++) {
      var s = opts[k][0], old = segs[s], nids;
      if (opts[k][1] === 0) { nids = [c].concat(old); var ev = evaluate(nids, s, 0); if (ev) { commitExtend(s, nids, [c], ev, false); return true; } }
      else { nids = old.concat([c]); var ev2 = evaluate(nids, s, nids.length - 1); if (ev2) { commitExtend(s, nids, [c], ev2, true); return true; } }
    }
    return false;
  }

  // 起点顺序：随机，略偏向四周（四周的线更容易有出口）
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
  // 补洞：先延长邻线，再放短线，再延长
  for (var pass = 0; pass < 3; pass++) {
    var left = 0;
    for (var c1 = 0; c1 < N; c1++) if (occ[c1] < 0 && !tryExtend(c1)) left++;
    if (!left) break;
    for (var c2 = 0; c2 < N; c2++) if (occ[c2] < 0) tryPlace(c2, rng.int(2, 4), 2);
  }
  for (var c3 = 0; c3 < N; c3++) if (occ[c3] < 0) tryExtend(c3);

  var out = [];
  for (var s2 = 0; s2 < segs.length; s2++) out.push({ cells: segs[s2].map(function (id) { return [id % w, (id / w) | 0]; }) });
  return { w: w, h: h, segs: out };
}

// 按当前占用判断某线是否可直接飞出
function isFree(board, occ, si) {
  var ray = rayCells(board.w, board.h, board.segs[si].cells);
  for (var r = 0; r < ray.length; r++) if (occ[ray[r]] >= 0 && occ[ray[r]] !== si) return false;
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

// 贪心逐轮移除（每轮移走所有当前可出的线）：可解性 + 难度
function grade(board) {
  var n = board.segs.length, w = board.w, hh = board.h;
  var occ = buildOcc(board), rays = [], alive = [], left = n, layers = 0, frees = [], order = [];
  for (var i = 0; i < n; i++) { rays.push(rayCells(w, hh, board.segs[i].cells)); alive.push(true); }
  while (left > 0) {
    var free = [];
    for (var s = 0; s < n; s++) {
      if (!alive[s]) continue;
      var ok = true, r = rays[s];
      for (var k = 0; k < r.length; k++) if (occ[r[k]] >= 0) { ok = false; break; }
      if (ok) free.push(s);
    }
    if (!free.length) return { solvable: false, layers: layers, n: n };
    for (var f = 0; f < free.length; f++) {
      var si = free[f]; alive[si] = false; order.push(si);
      var cl = board.segs[si].cells; for (var j = 0; j < cl.length; j++) occ[cl[j][1] * w + cl[j][0]] = -1;
    }
    left -= free.length; frees.push(free.length); layers++;
  }
  var cov = 0, lens = [], long6 = 0;
  for (var q = 0; q < n; q++) { var L = board.segs[q].cells.length; cov += L; lens.push(L); if (L >= 6) long6++; }
  var avgLen = cov / n;
  cov /= (w * hh);
  var avgFree = n / layers;
  var D = layers * 1.0 + (6 - Math.min(6, avgFree)) * 1.5 + n * 0.04;
  return { solvable: true, layers: layers, n: n, avgFree: avgFree, firstFree: frees[0], coverage: cov, avgLen: avgLen, longFrac: long6 / n, maxLen: Math.max.apply(0, lens), D: D, order: order };
}

// 上色：相邻线尽量不同色（8 色）
var NCOLORS = 8;
function colorize(board, rng) {
  var n = board.segs.length, occ = buildOcc(board), adj = [];
  for (var i = 0; i < n; i++) adj.push({});
  for (var y = 0; y < board.h; y++) for (var x = 0; x < board.w; x++) {
    var a = occ[y * board.w + x];
    if (a < 0) continue;
    if (x + 1 < board.w) { var b = occ[y * board.w + x + 1]; if (b >= 0 && b !== a) { adj[a][b] = 1; adj[b][a] = 1; } }
    if (y + 1 < board.h) { var c = occ[(y + 1) * board.w + x]; if (c >= 0 && c !== a) { adj[a][c] = 1; adj[c][a] = 1; } }
  }
  var base = []; for (var k0 = 0; k0 < NCOLORS; k0++) base.push(k0);
  for (var s = 0; s < n; s++) {
    var cand = rng.shuffle(base.slice()), best = cand[0], bestBad = 99;
    for (var k = 0; k < NCOLORS; k++) {
      var bad = 0;
      for (var nb in adj[s]) if (board.segs[nb].color === cand[k]) bad++;
      if (bad < bestBad) { bestBad = bad; best = cand[k]; }
    }
    board.segs[s].color = best;
  }
}

// ---------------- 关卡曲线 ----------------
function lerp(a, b, t) { return a + (b - a) * Math.max(0, Math.min(1, t)); }
function ease(t) { t = Math.max(0, Math.min(1, t)); return 1 - (1 - t) * (1 - t); }

// 尺寸：L2 10x14 → L10 16x24 → L30 20x30 → L80+ 22x34
function sizeFor(n) {
  if (n <= 10) { var t = (n - 2) / 8; return [Math.round(lerp(10, 16, t)), Math.round(lerp(14, 24, t))]; }
  if (n <= 30) { var t2 = (n - 10) / 20; return [Math.round(lerp(16, 20, t2)), Math.round(lerp(24, 30, t2))]; }
  var t3 = (n - 30) / 50; return [Math.round(lerp(20, 22, t3)), Math.round(lerp(30, 34, t3))];
}

function paramsFor(n) {
  var sz = sizeFor(n), w = sz[0], h = sz[1];
  var boss = (n % 10 === 0) && n > 5;     // 每 10 关为守关关：更难
  var rest = (n % 10 === 1) && n > 10;    // 守关后的喘息关
  var p = Math.min(1, n / 150);
  var opt = {
    minLen: 4, maxLen: Math.round(lerp(14, 24, ease(n / 80))), meanLen: lerp(8, 12, ease(n / 80)),
    shortP: 0.04, turnP: lerp(0.35, 0.5, p), hugP: lerp(0.3, 0.45, p),
    bias: lerp(-2, 0.6, ease((n - 2) / 250)) + (boss ? 1.0 : 0) - (rest ? 1.0 : 0),
    lenW: 0.35, tries: 6, edgeFirst: lerp(1.2, 0.3, ease(n / 80))
  };
  return { w: w, h: h, opt: opt, boss: boss, rest: rest };
}

// 目标“移除轮数”：平滑但陡峭的上升曲线 + 守关/喘息波动
function targetRounds(n, p) {
  var base;
  if (n <= 10) base = lerp(5, 12, (n - 2) / 8);
  else if (n <= 30) base = lerp(12, 18, (n - 10) / 20);
  else base = 18 + 17 * (1 - Math.exp(-(n - 30) / 120));
  if (p.boss) base *= 1.2;
  if (p.rest) base *= 0.85;
  return base;
}
function targetD(n, p) { return targetRounds(n, p); }

// 预计算表：第 n 关选用的候选种子编号（由 tools/precompute.js 生成；运行时只需生成 1 次）
var PICK = null;
try { PICK = require('./levelpick'); } catch (e) { PICK = null; }

function candidatesFor(n) { return 8; }

function buildLevel(n, k) {
  var p = paramsFor(n);
  var rng = R.makeRng('shanhai-arrow-v2-L' + n + '-' + k);
  var b = generate(p.w, p.h, rng, p.opt);
  b.grade = grade(b);
  return b;
}

// 在 K 个候选中选最接近目标轮数的（可解是前提；L2 至少 4 轮）
function searchLevel(n) {
  var p = paramsFor(n), T = targetRounds(n, p), best = null, bestErr = 1e9, bestK = -1;
  var K = candidatesFor(n);
  for (var k = 0; k < K || (!best && k < 40); k++) {
    var b = buildLevel(n, k), g = b.grade;
    if (!g.solvable) continue;
    if (n === 2 && g.layers < 4) continue;
    var err = Math.abs(g.layers - T) + (1 - g.coverage) * 40;
    if (err < bestErr) { bestErr = err; best = b; bestK = k; }
  }
  best.pick = bestK;
  return best;
}

function makeTutorial() {
  // 手工设计第 1 关：先点右向的线，再点被它挡住的线
  return {
    w: 3, h: 3,
    segs: [
      { cells: [[0, 0], [1, 0], [2, 0]], color: 0 },           // 第一排 → 直接飞出
      { cells: [[0, 2], [0, 1], [1, 1]], color: 1 },           // L 形，箭头向右：被下面那支挡住
      { cells: [[2, 2], [2, 1]], color: 6 }                    // 向上：被第一排挡住
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

function dailyParams() {
  return { minLen: 5, maxLen: 20, meanLen: 10, shortP: 0.04, turnP: 0.5, hugP: 0.45, bias: 1.2, lenW: 0.35, tries: 6, edgeFirst: 0.3 };
}
function getDaily(dateStr) {
  var key = 'daily-' + dateStr;
  if (cache[key]) return cache[key];
  var best = null, bestErr = 1e9;
  // 每日挑战：22x34 大盘，目标约 40 轮（与守关关相当或更难）
  for (var k = 0; k < 3 || (!best && k < 30); k++) {
    var rng = R.makeRng(key + '-v2-' + k);
    var b = generate(22, 34, rng, dailyParams()), g = grade(b);
    if (!g.solvable) continue;
    var err = Math.abs(g.layers - 40) + (1 - g.coverage) * 40;
    if (err < bestErr) { bestErr = err; best = b; best.grade = g; }
  }
  colorize(best, R.makeRng(key));
  best.id = 'daily';
  best.daily = dateStr;
  cache[key] = best;
  return best;
}

module.exports = {
  DIRS: DIRS, headDir: headDir, rayCells: rayCells, generate: generate, grade: grade,
  isFree: isFree, buildOcc: buildOcc, getLevel: getLevel, getDaily: getDaily, paramsFor: paramsFor,
  targetD: targetD, targetRounds: targetRounds, searchLevel: searchLevel, buildLevel: buildLevel,
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
  P.onResize(function () { var s2 = P.init(); scr = s2; ctx = s2.ctx; layout(); boardCache = null; lineCache = null; if (st) { computeBoardLayout(); setView(1, 0, 0); } });
  save = loadSave();
  P.setSfx(save.sfx); P.audioInit(); P.setMusic(save.music);
  P.adsInit(); P.setupShare();
  P.onPointers(onPtr);
  P.onWheel(onWheel);
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
    if (typeof window !== 'undefined') window.__game = { startLevel: startLevel, state: function () { return st; }, save: function () { return save; }, autoSolve: autoSolveStep, tap: function (i) { tapSeg(i); }, blocked: function () { for (var i = 0; i < st.board.segs.length; i++) if (st.alive[i] && !st.anims[i] && !G.isFree(st.board, st.occ, i)) return i; return -1; }, cellPx: function (x, y) { var p = cellPx(x, y); return [p[0] * S, p[1] * S]; }, openBeast: function (i) { openBeast(BEASTS[i]); }, openSettings: openSettings, openDaily: openDaily, hint: function () { doHint(); }, scene: function () { return scene; }, modal: function () { return modal; }, openCodex: openCodex, openCheckin: openCheckin, view: function () { return { z: VZ.z, px: VZ.px, py: VZ.py, vp: VP }; }, zoomAt: function (z, x, y) { zoomAt(z, x / S, y / S); }, panTo: function (cx, cy) { panToCell(cx, cy); } };
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
    tut: n === 1 && !daily ? 0 : -1, flash: {}, shakeT: 0, heartAnim: [], startT: now, ver: 0, tapHL: null
  };
  st.occ = G.buildOcc(board, st.alive);
  modal = null; scene = 'play'; boardCache = null; parts = [];
  computeBoardLayout(); setView(1, 0, 0); lineCache = null;
  if (!daily && n === 2) toast('撞到其他线会失去 1 颗心');
  else if (!daily && n === 3) toast('双指捏合可放大棋盘，双击空白处复原');
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
  var k = BL.cell * VZ.z;
  var cx = (x - VP.x - VZ.px) / k - 0.5, cy = (y - VP.y - VZ.py) / k - 0.5;
  var best = -1, bd = 0.5; // 点击点 0.5 格以内最近的线
  if (inVP(x, y)) {
    for (var i = 0; i < st.board.segs.length; i++) {
      if (!st.alive[i] || st.anims[i]) continue;
      var cl = st.board.segs[i].cells, d0 = G.headDir(cl), L = cl.length;
      for (var j = 0; j < L; j++) {
        var a = cl[j], b = j + 1 < L ? cl[j + 1] : [a[0] + d0[0] * 0.4, a[1] + d0[1] * 0.4];
        var dd = distSeg(cx, cy, a[0], a[1], b[0], b[1]);
        if (dd < bd) { bd = dd; best = i; }
      }
    }
  }
  if (best < 0) {
    if (st.removeMode) { st.removeMode = false; toast('已取消去除'); return; }
    // 双击空白处：放大 ↔ 复原
    if (lastEmptyTap && now - lastEmptyTap.t < 0.38 && Math.hypot(x - lastEmptyTap.x, y - lastEmptyTap.y) < 50) {
      if (VZ.z > 1.05) setView(1, 0, 0); else zoomAt(2.2, x, y);
      lastEmptyTap = null;
    } else lastEmptyTap = { t: now, x: x, y: y };
    return;
  }
  lastEmptyTap = null;
  if (st.removeMode) { st.removeMode = false; useAssist('remove', function () { removeSeg(best, true); }); return; }
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
  st.tapHL = { i: i, t: 0.35 };
  if (blockAt < 0) { removeSeg(i, false); return; }
  // 撞击
  var blocker = st.occ[ray[blockAt]], bk = blockAt + 0.28;
  st.anims[i] = { type: 'bump', t: 0, k: bk, v: Math.max(CFG.SLIDE_SPEED, bk / 0.4), blocker: blocker, hit: false };
}

function removeSeg(i, byAssist) {
  var seg = st.board.segs[i], L = seg.cells.length;
  var ray = G.rayCells(st.board.w, st.board.h, seg.cells);
  st.alive[i] = false; st.occ = G.buildOcc(st.board, st.alive); st.ver++;
  st.removedCount++;
  if (byAssist) {
    st.anims[i] = { type: 'dissolve', t: 0 };
    P.play('remove');
    seg.cells.forEach(function (cc) { var p = cellPx(cc[0], cc[1]); burst(p[0], p[1], 10, 'ink'); burst(p[0], p[1], 6, 'gold'); });
  } else {
    var dist = ray.length + L + 2;
    st.anims[i] = { type: 'exit', t: 0, dist: dist, v: Math.max(CFG.SLIDE_SPEED, dist / 0.75) };
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
  if (st.tapHL) { st.tapHL.t -= dt; if (st.tapHL.t <= 0) st.tapHL = null; }
  for (var key in st.anims) {
    var a = st.anims[key], i = +key, seg = st.board.segs[i];
    a.t += dt;
    var V = a.v || CFG.SLIDE_SPEED;
    if (a.type === 'exit') {
      var acc = 0.07;
      a.s = a.t < acc ? V * a.t * a.t / (2 * acc) : V * (a.t - acc / 2);
      // 金色墨迹拖尾
      var hp = segPoint(seg, a.s + seg.cells.length - 1), px = cellPx(hp[0], hp[1]);
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
    var hc = st.board.segs[bestI].cells; panToCell(hc[hc.length - 1][0], hc[hc.length - 1][1]);
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
  drawZoomChip(c);
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

// 静态线缓存：未在动画/高亮中的线画进离屏画布，按 (缩放, 平移, 局面版本, 动态集合) 失效；每帧只重画动态的线
var lineCache = null;
function dynamicSet() {
  var d = {};
  for (var k in st.anims) d[k] = 1;
  for (var f in st.flash) d[f] = 1;
  if (st.hint >= 0) d[st.hint] = 1;
  if (st.tapHL) d[st.tapHL.i] = 1;
  var tt = tutTarget(); if (tt >= 0) d[tt] = 1;
  return d;
}
function ensureLineCache(dyn) {
  var key = VZ.z.toFixed(4) + '|' + VZ.px.toFixed(2) + '|' + VZ.py.toFixed(2) + '|' + st.ver + '|' + Object.keys(dyn).join(',') + '|' + st.board.id + st.board.daily;
  var k = scr.dpr * S, W = Math.ceil(VP.w * k), H = Math.ceil(VP.h * k);
  if (!lineCache || lineCache.W !== W || lineCache.H !== H) lineCache = { cv: P.createOffscreen(W, H), W: W, H: H, key: null };
  if (lineCache.key === key) return;
  lineCache.key = key;
  var c = lineCache.cv.getContext('2d');
  c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, W, H);
  c.setTransform(k, 0, 0, k, -VP.x * k, -VP.y * k);
  drawCells(c, dyn, false);
}
function drawCells(c, dyn, onlyDyn) {
  var b = st.board, cs = BL.cell * VZ.z;
  if (!onlyDyn) {
    // 空格的小墨点
    c.fillStyle = DOT_COL;
    var r = Math.max(1.2, cs * 0.06);
    for (var y = 0; y < b.h; y++) for (var x = 0; x < b.w; x++) {
      if (st.occ[y * b.w + x] >= 0) continue;
      var p = cellPx(x, y);
      if (p[0] < VP.x - cs || p[1] < VP.y - cs || p[0] > VP.x + VP.w + cs || p[1] > VP.y + VP.h + cs) continue;
      c.beginPath(); c.arc(p[0], p[1], r, 0, Math.PI * 2); c.fill();
    }
  }
  for (var i = 0; i < b.segs.length; i++) {
    var a = st.anims[i];
    if (!st.alive[i] && !a) continue;
    if (!!dyn[i] !== !!onlyDyn) continue;
    var s = a && a.s ? a.s : 0, alpha = 1, scale = 1;
    if (a && a.type === 'exit') alpha = Math.max(0, Math.min(1, (a.dist - s) / 2));
    if (a && a.type === 'dissolve') { alpha = 1 - a.t / 0.5; scale = 1 + a.t * 0.6; }
    var glow = 0, glowCol = null;
    if (st.hint === i) { glow = 0.55 + 0.45 * Math.sin(now * 7); glowCol = '255,215,90'; }
    else if (st.removeMode && st.alive[i]) { glow = 0.3 + 0.25 * Math.sin(now * 6); glowCol = '255,215,90'; }
    if (st.tapHL && st.tapHL.i === i) { glow = Math.max(glow, st.tapHL.t / 0.35); glowCol = '255,255,255'; }
    drawArrow(c, b.segs[i], s, alpha, st.flash[i] || 0, glow, glowCol, scale);
  }
}
function drawSegments(c) {
  var dyn = st.removeMode ? null : dynamicSet();
  c.save();
  c.beginPath(); c.rect(VP.x - 1, VP.y - 1, VP.w + 2, VP.h + 2); c.clip();
  if (dyn) {
    ensureLineCache(dyn);
    c.drawImage(lineCache.cv, VP.x, VP.y, VP.w, VP.h);
    drawCells(c, dyn, true);
  } else {
    drawCells(c, {}, false); // 去除模式：全部线都在闪，直接逐帧画
  }
  c.restore();
}

// 细线 + 圆角折点 + 小而利落的箭头
function drawArrow(c, seg, s, alpha, flash, glow, glowCol, scale) {
  var cell = BL.cell * VZ.z, col = COLORS[seg.color % COLORS.length];
  var pts = segPoly(seg, s).map(function (p) { return cellPx(p[0], p[1]); }), L = pts.length;
  var d0 = G.headDir(seg.cells), dx = d0[0], dy = d0[1];
  var hp = pts[L - 1], w = Math.max(1.6, cell * 0.27);
  c.save(); c.globalAlpha = alpha;
  if (scale !== 1) { var m = pts[Math.floor(L / 2)]; c.translate(m[0], m[1]); c.scale(scale, scale); c.translate(-m[0], -m[1]); }
  c.lineCap = 'round'; c.lineJoin = 'round';
  function path() {
    c.beginPath(); c.moveTo(pts[0][0], pts[0][1]);
    for (var i = 1; i < L; i++) c.lineTo(pts[i][0], pts[i][1]);
  }
  var tipL = cell * 0.4, hw = cell * 0.25, back = cell * 0.04, nx = -dy, ny = dx;
  function head(g) {
    var bx = hp[0] - dx * back, by = hp[1] - dy * back;
    c.beginPath();
    c.moveTo(hp[0] + dx * (tipL + g), hp[1] + dy * (tipL + g));
    c.lineTo(bx + nx * (hw + g) - dx * g, by + ny * (hw + g) - dy * g);
    c.lineTo(bx - nx * (hw + g) - dx * g, by - ny * (hw + g) - dy * g);
    c.closePath();
  }
  if (glow > 0) {
    c.strokeStyle = 'rgba(' + glowCol + ',' + (0.5 * glow) + ')'; c.lineWidth = w + cell * 0.36; path(); c.stroke();
    c.fillStyle = 'rgba(' + glowCol + ',' + (0.5 * glow) + ')'; head(cell * 0.16); c.fill();
  }
  var base = col;
  if (flash > 0 && Math.sin(flash * 30) > 0) base = '#FF4A3A';
  c.strokeStyle = base; c.lineWidth = w; path(); c.stroke();
  c.fillStyle = base; c.lineWidth = Math.max(1, cell * 0.05); c.strokeStyle = base; head(0); c.fill(); c.stroke();
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
    D.text(c, cnNum(CFG.HEARTS) + '颗心已用尽，异兽仍被困阵中', VW / 2, y + 150, 28, '#6B4A26');
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
