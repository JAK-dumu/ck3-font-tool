
"use strict";
const fs = require("fs");
const path = require("path");
const T = require("./fonttool_core.js");

let pass = 0, fail = 0;
function ok(cond, name, extra){
  if (cond) { pass++; console.log("  ok  " + name); }
  else { fail++; console.log("  FAIL " + name + (extra ? "\n       " + extra : "")); }
}
function section(s){ console.log("\n== " + s + " =="); }
function resetState(){
  T.state.fonts = [];
  Object.assign(T.state.slots, {bodyRegular:"vanilla", bodyBold:"vanilla", bodyItalic:"follow", bodyBoldItalic:"follow", title:"vanilla", map:"vanilla"});
  Object.assign(T.state.latinFirst, {bodyRegular:true, bodyBold:true, bodyItalic:true, bodyBoldItalic:true, title:false, map:false});
  T.state.modName = "My_Chinese_Fonts";
}
function simpChainOf(fontsFont, gitanName){
  const re = new RegExp('name = "' + gitanName + '"[\\s\\S]*?l_simp_chinese" \\}\\s*\\n\\t\\tfiles = \\{([^}]*)\\}');
  const mm = fontsFont.match(re);
  return mm ? mm[1].match(/"([^"]+)"/g).map(s => s.slice(1, -1)) : null;
}

section("asciiSlug 文件名清洗");
resetState();
let used = new Set();
let a = T.asciiSlug("Hanyi OuKai.ttf", used);
ok(a.slug === "Hanyi_OuKai" && a.ext === "ttf", "空格转下划线", JSON.stringify(a));
let b = T.asciiSlug("汉仪欧楷.ttf", used);
ok(/^[A-Za-z0-9._-]+$/.test(b.slug + "." + b.ext), "中文名清洗为 ASCII", JSON.stringify(b));
let c = T.asciiSlug("Hanyi OuKai.otf", used);
ok(c.ext === "otf" && (a.slug + "." + a.ext).toLowerCase() !== (c.slug + "." + c.ext).toLowerCase(), "同名不同扩展名不打架", JSON.stringify(c));
let d = T.asciiSlug("hanyi_oukai.TTF", used);
ok((d.slug + "." + d.ext).toLowerCase() !== "hanyi_oukai.ttf", "Windows 大小写不敏感去重", JSON.stringify(d));
ok(used.size === 4, "used 集合记录全部");

section("默认生成 = 原版链");
const def = T.buildFontsFont();
ok((def.match(/\{/g) || []).length === (def.match(/\}/g) || []).length, "花括号配平",
  "open=" + (def.match(/\{/g) || []).length + " close=" + (def.match(/\}/g) || []).length);
ok((def.match(/"/g) || []).length % 2 === 0, "引号配平");
ok(!def.includes("fonts/user/"), "无用户字体引用");
const regDef = simpChainOf(def, "Gitan-Regular");
ok(JSON.stringify(regDef) === JSON.stringify([
  "fonts/Noto_Sans_SC/NotoSansSC-Medium.otf","fonts/Open_Sans/OpenSans-SemiBold.ttf","fonts/Korean_fontset/IropkeBatangM.ttf"
]), "Gitan-Regular 简中 = 原版链", JSON.stringify(regDef));
const boldDef = simpChainOf(def, "Gitan-Bold");
ok(!boldDef.includes("OpenSans-Bold.ttf"), "Gitan-Bold 不含原版死引用 OpenSans-Bold.ttf", JSON.stringify(boldDef));
const mapDef = simpChainOf(def, "Paradox_King_Script");
ok(mapDef[0] === "fonts/LxgwZhenKai/LXGWZhenKaiGB_alphabet_removed.otf", "地图默认链首 = 原版霞鹜文楷", JSON.stringify(mapDef));
ok(def.includes('name = "StandardGameFont"') && def.includes('name = "MapFont"') && def.includes('name = "TitleFont"') && def.includes('name = "Debug"'), "底部四个用途位齐全");
ok(def.split("l_simp_chinese").length - 1 === 9, "9 个简中组（3 OpenSans + 4 正文 + 标题 + 地图）");
ok(!def.includes("\r"), "输出为 LF 换行");

section("字体分配与链生成");
const f1 = T.loadFontFromBuffer("TestKai.ttf", new Uint8Array(8));
ok(f1.slug === "TestKai" && T.state.fonts.length === 1, "loadFontFromBuffer 存入 state");
const f2 = T.loadFontFromBuffer("文楷 body.ttf", new Uint8Array(16));
ok(T.state.slots.bodyRegular === f2.id, "文件名含「文楷」→ 自动分配正文常规");
ok(T.state.slots.title === "vanilla", "不含「欧楷」不动标题槽");
ok(T.state.slots.bodyItalic === "follow", "斜体默认跟随");
const f3 = T.loadFontFromBuffer("LXGWZhenKaiGB-Regular.ttf", new Uint8Array(8));
ok(T.state.slots.bodyBold === f3.id && T.state.slots.bodyRegular !== f3.id, "臻楷(zhenkai) → 加粗而非正文");
const f4 = T.loadFontFromBuffer("CooperZhengKai.ttf", new Uint8Array(8));
ok(T.state.slots.title === f4.id && T.state.slots.map === f4.id, "汇迹(Cooper) → 标题+地图");

T.state.slots.bodyBold = f1.id;
const out1 = T.buildFontsFont();
const boldChain = simpChainOf(out1, "Gitan-Bold");
ok(boldChain[0] === "fonts/Gitan/GitanLatin-Bold.otf", "拉丁保真开启时链首 = 原版拉丁");
ok(boldChain.includes("fonts/Noto_Sans_SC/NotoSansSC-Bold.otf"), "Noto 兜底仍在");
const itChain = simpChainOf(out1, "Gitan-Italic");
ok(itChain.includes("fonts/user/body.ttf"), "斜体跟随正文常规的用户字体(文楷)", JSON.stringify(itChain));

section("开关与解析");
T.state.latinFirst.bodyBold = false;
let chain = simpChainOf(T.buildFontsFont(), "Gitan-Bold");
ok(chain[0] === "fonts/user/TestKai.ttf", "关掉拉丁保真后用户字体顶到链首", JSON.stringify(chain));
T.state.latinFirst.bodyBold = true;

T.state.slots.title = f1.id;
T.state.slots.map = f1.id;
const out3 = T.buildFontsFont();
const titleChain = simpChainOf(out3, "Fondamento-Regular");
ok(titleChain[0] === "fonts/user/TestKai.ttf", "标题槽生效（拉丁保真默认关 → 字体直接链首）", JSON.stringify(titleChain));
const mapChain = simpChainOf(out3, "Paradox_King_Script");
ok(mapChain[0] === "fonts/user/TestKai.ttf", "地图槽生效");
ok(mapChain.includes("fonts/mapfont/Paradox_King_Script.otf"), "地图链保留原版 King_Script 兜底");

ok(T.resolveSlot("bodyItalic") === T.resolveSlot("bodyRegular"), "resolveSlot: 斜体跟随常规");
T.state.slots.bodyItalic = "vanilla";
ok(T.resolveSlot("bodyItalic") === null, "resolveSlot: 斜体改原版 → null");

section("mod 打包");
const entries = T.buildEntries();
const paths = entries.map(e => e.path);
ok(paths.includes("My_Chinese_Fonts/fonts/fonts.font"), "zip 含 fonts.font");
ok(paths.includes("My_Chinese_Fonts/descriptor.mod"), "zip 含内层描述符");
ok(paths.includes("My_Chinese_Fonts.mod"), "zip 含外层 .mod");
ok(paths.includes("README.txt"), "zip 含 README");
ok(paths.includes("My_Chinese_Fonts/fonts/user/TestKai.ttf"), "zip 含用户字体文件");
ok(paths.filter(p => p.includes("fonts/user/")).length === 2, "两个字体各打一份（不按槽位重复）");
const ffEntry = entries.find(e => e.path.endsWith("fonts.font"));
ok(new TextDecoder().decode(ffEntry.data) === T.buildFontsFont(), "zip 内 fonts.font 与生成器输出一致");
const outer = new TextDecoder().decode(entries.find(e => e.path.endsWith(".mod") && !e.path.includes("/")).data);
ok(outer.includes('path="REPLACE_WITH_ABSOLUTE_PATH"') && !outer.includes("\r"), "外层 .mod 为 LF 且含 path 占位");
const inner = new TextDecoder().decode(entries.find(e => e.path.endsWith("descriptor.mod")).data);
ok(inner.includes('"Graphics"') && !inner.includes("path="), "内层描述符无 path 行");
ok(entries.find(e => e.path === "README.txt").data.length > 100, "README 非空");

const zip = T.buildZip(entries);
ok(zip[0] === 0x50 && zip[1] === 0x4b && zip[2] === 0x03 && zip[3] === 0x04, "zip 本地文件头签名");
const eocdSig = zip.length - 22;
ok(zip[eocdSig] === 0x50 && zip[eocdSig+1] === 0x4b && zip[eocdSig+2] === 0x05 && zip[eocdSig+3] === 0x06, "EOCD 签名");
fs.writeFileSync(path.join(__dirname, "test_output.zip"), Buffer.from(zip));
ok(true, "test_output.zip 已写出（供 python zipfile 复验 CRC 与目录）");

section("行距度量补丁（垂直度量对齐原版）");
resetState();
const kaiBytes = fs.readFileSync(path.join(__dirname, "fixtures", "sample_kai.ttf"));
const kf = T.loadFontFromBuffer("sample_kai.ttf", new Uint8Array(kaiBytes));
const m0 = T.readVerticalMetrics(kf.data);
ok(m0 && m0.upm === 1000 && m0.hheaAsc === 928 && m0.hheaDesc === -256, "夹具字体可解析（文楷子集 928/-256）", JSON.stringify(m0));
T.state.slots.bodyRegular = kf.id;
T.state.slots.bodyItalic = "follow";
const pEntry = T.buildEntries().find(e => e.path.endsWith(kf.slug + "." + kf.ext));
const m1 = T.readVerticalMetrics(pEntry.data);
ok(m1.hheaAsc === 1160 && m1.hheaDesc === -320 && m1.hheaGap === 0, "正文槽 hhea → Noto 参照 1160/-320", JSON.stringify(m1));
ok(m1.winAsc === 1160 && m1.winDesc === 320 && m1.typoAsc === 1160 && m1.typoDesc === -320, "OS/2 win/typo 同步");
ok(T.readVerticalMetrics(kf.data).hheaAsc === 928, "原始字体 buffer 未被修改");
const tagsOf = u8 => { const n = new DataView(u8.buffer, u8.byteOffset, u8.byteLength).getUint16(4); const a = []; for (let i = 0; i < n; i++){ const r = 12 + i * 16; a.push(String.fromCharCode(u8[r], u8[r+1], u8[r+2], u8[r+3])); } return a; };
ok(JSON.stringify(tagsOf(pEntry.data)) === JSON.stringify(tagsOf(kf.data)), "表目录记录未被破坏（checksum 写对位置）");
const adjOf = u8 => { const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength); const n = dv.getUint16(4); for (let i = 0; i < n; i++){ const r = 12 + i * 16; if (String.fromCharCode(u8[r], u8[r+1], u8[r+2], u8[r+3]) === "head") return dv.getUint32(dv.getUint32(r + 8) + 8); } return null; };
ok(adjOf(pEntry.data) !== 0, "checkSumAdjustment 已重算（非 0，CK3 校验需要）");
const chk = u8 => { const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength); let s = 0; const L = u8.length; for (let i = 0; i < L; i += 4){ const a = u8[i], b = i+1<L?u8[i+1]:0, c = i+2<L?u8[i+2]:0, d = i+3<L?u8[i+3]:0; s = (s + (((a<<24)|(b<<16)|(c<<8)|d)>>>0))>>>0; } return s; };
ok(chk(pEntry.data) >>> 0 === 0xB1B0AFBA, "全文件校验和自洽（含 adjustment 恰为 0xB1B0AFBA）");
resetState();

const hj = T.loadFontFromBuffer("HuijiLatinSubset.ttf", new Uint8Array(fs.readFileSync(path.join(__dirname, "fixtures", "HuijiLatinSubset.ttf"))));
T.state.slots.title = "vanilla";   
T.state.slots.map = hj.id;
const m2v = T.readVerticalMetrics(T.buildEntries().find(e => e.path.endsWith(hj.slug + "." + hj.ext)).data);
ok(m2v.hheaAsc === 928 && m2v.hheaDesc === -256 && m2v.winAsc === 1032 && m2v.winDesc === 285, "地图槽 → 文楷参照 928/-256 win 1032/285", JSON.stringify(m2v));
resetState();
T.state.patchMetrics = false;
const kf3 = T.loadFontFromBuffer("sample_kai.ttf", new Uint8Array(kaiBytes));
T.state.slots.bodyRegular = kf3.id;
const rawEntry = T.buildEntries().find(e => e.path.endsWith(kf3.slug + "." + kf3.ext));
ok(Buffer.from(rawEntry.data).equals(kaiBytes), "patchMetrics=false 时原样打包");
T.state.patchMetrics = true;
ok(T.patchVerticalMetrics(new Uint8Array([1,2,3,4,5]), "map") === null, "非 sfnt 数据返回 null 不崩溃");

section("cmap 缺字查询");
const lkKai = T.readCmapLookup(new Uint8Array(kaiBytes));
ok(typeof lkKai === "function", "sample_kai cmap 可解析（format 4）");
ok(lkKai("历".codePointAt(0)) === true && lkKai("史".codePointAt(0)) === true, "format4 命中：历/史");
ok(lkKai("永".codePointAt(0)) === false, "format4 未命中：永");
ok(lkKai("A".codePointAt(0)) === false, "拉丁未命中：A");
const hjBytes = fs.readFileSync(path.join(__dirname, "fixtures", "HuijiLatinSubset.ttf"));
const lkHuiji = T.readCmapLookup(new Uint8Array(hjBytes));
ok(lkHuiji("A".codePointAt(0)) === true && lkHuiji("%".codePointAt(0)) === true, "拉丁子集命中 A/%");
ok(lkHuiji("永".codePointAt(0)) === false, "拉丁子集无汉字");
function fakeCmap12(){
  const sub = Buffer.alloc(16 + 24);
  sub.writeUInt16BE(12, 0); sub.writeUInt16BE(0, 2);
  sub.writeUInt32BE(40, 4); sub.writeUInt32BE(0, 8);
  sub.writeUInt32BE(2, 12);
  sub.writeUInt32BE(0x41, 16); sub.writeUInt32BE(0x5A, 20); sub.writeUInt32BE(1, 24);
  sub.writeUInt32BE(0x4E00, 28); sub.writeUInt32BE(0x4E01, 32); sub.writeUInt32BE(100, 36);
  const cmap = Buffer.alloc(12 + sub.length);
  cmap.writeUInt16BE(0, 0); cmap.writeUInt16BE(1, 2);
  cmap.writeUInt16BE(3, 4); cmap.writeUInt16BE(10, 6); cmap.writeUInt32BE(12, 8);
  sub.copy(cmap, 12);
  const sfnt = Buffer.alloc(28 + cmap.length);
  sfnt.writeUInt32BE(0x00010000, 0); sfnt.writeUInt16BE(1, 4);
  sfnt.write("cmap", 12, "latin1"); sfnt.writeUInt32BE(0, 16);
  sfnt.writeUInt32BE(28, 20); sfnt.writeUInt32BE(cmap.length, 24);
  cmap.copy(sfnt, 28);
  return sfnt;
}
const lk12 = T.readCmapLookup(new Uint8Array(fakeCmap12()));
ok(typeof lk12 === "function", "format12 cmap 可解析");
ok(lk12(0x41) === true && lk12(0x5A) === true && lk12(0x4E00) === true && lk12(0x4E01) === true, "format12 组内命中");
ok(lk12(0x4E02) === false && lk12(0x30) === false, "format12 区间外未命中");
ok(T.readCmapLookup(new Uint8Array([1,2,3])) === null, "无 cmap 返回 null 不崩溃");

console.log("\n==== " + pass + " passed, " + fail + " failed ====");
process.exit(fail ? 1 : 0);
