
"use strict";

const TAIL = {
  bodyRegular:  ["fonts/Noto_Sans_SC/NotoSansSC-Medium.otf","fonts/Open_Sans/OpenSans-SemiBold.ttf","fonts/Korean_fontset/IropkeBatangM.ttf"],
  bodyBold:     ["fonts/Noto_Sans_SC/NotoSansSC-Bold.otf","fonts/Korean_fontset/IropkeBatangB.ttf"],
  bodyItalic:   ["fonts/Noto_Sans_SC/NotoSansSC-Light.otf","fonts/Open_Sans/OpenSans-SemiBoldItalic.ttf","fonts/Korean_fontset/IBMPlexSansKR-Medium.otf"],
  bodyBoldItalic:["fonts/Noto_Sans_SC/NotoSansSC-Bold.otf","fonts/Open_Sans/OpenSans-SemiBoldItalic.ttf","fonts/Korean_fontset/IBMPlexSansKR-SemiBold.otf"],
  title:        ["fonts/Noto_Sans_SC/NotoSansSC-Bold.otf","fonts/Open_Sans/OpenSans-SemiBoldItalic.ttf","fonts/Korean_fontset/ON_YeossiB.ttf"],
  map:          ["fonts/LxgwZhenKai/LXGWZhenKaiGB_alphabet_removed.otf","fonts/mapfont/Paradox_King_Script.otf","fonts/Noto_Sans_SC/NotoSansSC-Medium.otf","fonts/Open_Sans/OpenSans-SemiBoldItalic.ttf","fonts/MonomakhUnicode/MonomakhUnicode.otf","fonts/Korean_fontset/GunglipbakmulgwanClassicB.ttf"],
};

const LATIN = {
  bodyRegular:"fonts/Gitan/GitanLatin-Regular.otf",
  bodyBold:"fonts/Gitan/GitanLatin-Bold.otf",
  bodyItalic:"fonts/Gitan/GitanLatin-Regular.otf",
  bodyBoldItalic:"fonts/Gitan/GitanLatin-Bold-Italic.otf",
  title:null, map:null
};
const SLOTS = [
  {id:"bodyRegular", label:"正文 · 常规", gitan:"Gitan-Regular", follow:null,
   where:"人名、头衔、按钮、事件正文、tooltip —— 游戏里绝大多数文字"},
  {id:"bodyBold", label:"正文 · 加粗", gitan:"Gitan-Bold", follow:null,
   where:"粗体关键词、界面小标题、强调数值"},
  {id:"bodyItalic", label:"正文 · 斜体", gitan:"Gitan-Italic", follow:"bodyRegular",
   where:"斜体引文等风格化文本；默认跟随正文常规（中文斜体字很少单独存在）"},
  {id:"bodyBoldItalic", label:"正文 · 粗斜体", gitan:"Gitan-Bold-Italic", follow:"bodyBold",
   where:"粗斜体文本；默认跟随正文加粗"},
  {id:"title", label:"标题字体", gitan:"Fondamento-Regular", follow:null,
   where:"头衔名称、界面大标题、加载界面文字"},
  {id:"map", label:"地图字体", gitan:"Paradox_King_Script", follow:null,
   where:"地图上的领地名与人物名标签"},
];

const state = {
  fonts: [],            
  slots: {bodyRegular:"vanilla", bodyBold:"vanilla", bodyItalic:"follow", bodyBoldItalic:"follow", title:"vanilla", map:"vanilla"},
  latinFirst: {bodyRegular:true, bodyBold:true, bodyItalic:true, bodyBoldItalic:true, title:false, map:false},
  modName: "My_Chinese_Fonts",
  patchMetrics: true,   
};
let _fid = 0;

function asciiSlug(name, used){
  const m = name.match(/^(.*)\.([^.]+)$/);
  const base = m ? m[1] : name;
  let ext = m ? m[2].toLowerCase() : "ttf";
  if (!/^(ttf|otf)$/.test(ext)) ext = "ttf";
  let s = base.replace(/[^A-Za-z0-9._-]+/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "");
  if (!s) s = "font";
  let out = s, i = 1;
  while (used.has((out + "." + ext).toLowerCase())) out = s + "_" + (++i);
  used.add((out + "." + ext).toLowerCase());
  return {slug: out, ext};
}

function resolveSlot(slot){
  const v = state.slots[slot];
  if (v === "vanilla" || v == null) return null;
  if (v === "follow") return resolveSlot(slot === "bodyItalic" ? "bodyRegular" : "bodyBold");
  return state.fonts.find(f => f.id === v) || null;
}

function chainFor(slot){
  const parts = [];
  const f = resolveSlot(slot);
  const lat = LATIN[slot];
  if (f && lat && state.latinFirst[slot]) parts.push(lat);
  if (f) parts.push("fonts/user/" + f.slug + "." + f.ext);
  parts.push(...TAIL[slot]);
  return parts;
}

function q(arr){ return arr.map(s => '"' + s + '"').join(" "); }

function buildFontsFont(){
  const G = {}; 
  for (const s of SLOTS) G[s.id] = q(chainFor(s.id));
  return [
'### Open Sans',
'fontfiles = {',
'	name = "OpenSans-SemiBold"',
'	always_load = yes',
'',
'	group = {',
'		languages = { "l_english" "l_french" "l_german" "l_russian" "l_spanish" "l_polish"}',
'		files = { "fonts/Open_Sans/OpenSans-SemiBold.ttf" "fonts/Noto_Sans_SC/NotoSansSC-Bold.otf" "fonts/Korean_fontset/IropkeBatangM.ttf" }',
'	}',
'',
'	group = {',
'		languages = { "l_simp_chinese" }',
'		files = { "fonts/Noto_Sans_SC/NotoSansSC-Bold.otf" "fonts/Open_Sans/OpenSans-SemiBold.ttf" "fonts/Korean_fontset/IropkeBatangM.ttf" }',
'	}',
'',
'	group = {',
'		languages = { "l_korean" }',
'		files = { "fonts/Korean_fontset/IropkeBatangM.ttf" "fonts/Open_Sans/OpenSans-SemiBold.ttf" "fonts/Noto_Sans_SC/NotoSansSC-Bold.otf" }',
'	}',
'',
'	group = {',
'		languages = { "l_japanese" }',
'		files = { "fonts/Open_Sans/OpenSans-SemiBold.ttf" "fonts/Genryu_JP/GenRyuMin2JP-B.otf" "fonts/Noto_Sans_SC/NotoSansSC-Bold.otf" "fonts/Korean_fontset/IropkeBatangM.ttf" }',
'	}',
'}',
'',
'fontfiles = {',
'	name = "OpenSans-SemiBoldItalic"',
'	always_load = yes',
'',
'	group = {',
'		languages = { "l_english" "l_french" "l_german" "l_russian" "l_spanish" "l_polish"}',
'		files = { "fonts/Open_Sans/OpenSans-SemiBoldItalic.ttf" "fonts/Noto_Sans_SC/NotoSansSC-Bold.otf" "fonts/Korean_fontset/IBMPlexSansKR-Medium.otf" }',
'	}',
'',
'	group = {',
'		languages = { "l_simp_chinese" }',
'		files = { "fonts/Noto_Sans_SC/NotoSansSC-Bold.otf" "fonts/Open_Sans/OpenSans-SemiBoldItalic.ttf" "fonts/Korean_fontset/IBMPlexSansKR-Medium.otf" }',
'	}',
'',
'	group = {',
'		languages = { "l_korean" }',
'		files = { "fonts/Korean_fontset/IBMPlexSansKR-Medium.otf" "fonts/Open_Sans/OpenSans-SemiBoldItalic.ttf" "fonts/Noto_Sans_SC/NotoSansSC-Bold.otf" }',
'	}',
'',
'	group = {',
'		languages = { "l_japanese" }',
'		files = { "fonts/Open_Sans/OpenSans-SemiBoldItalic.ttf" "fonts/Genryu_JP/GenRyuMin2JP-B.otf" "fonts/Noto_Sans_SC/NotoSansSC-Bold.otf" "fonts/Korean_fontset/IBMPlexSansKR-Medium.otf" }',
'	}',
'}',
'',
'fontfiles = {',
'	name = "OpenSansCondensed-Bold"',
'	always_load = yes',
'',
'	group = {',
'		languages = { "l_english" "l_french" "l_german" "l_russian" "l_spanish" "l_polish"}',
'		files = { "fonts/Open_Sans_Condensed/OpenSansCondensed-Bold.ttf" "fonts/Noto_Sans_SC/NotoSansSC-Bold.otf" "fonts/Korean_fontset/IropkeBatangB.ttf" }',
'	}',
'',
'	group = {',
'		languages = { "l_simp_chinese" }',
'		files = { "fonts/Noto_Sans_SC/NotoSansSC-Bold.otf" "fonts/Open_Sans_Condensed/OpenSansCondensed-Bold.ttf" "fonts/Korean_fontset/IropkeBatangB.ttf" }',
'	}',
'',
'	group = {',
'		languages = { "l_korean" }',
'		files = { "fonts/Korean_fontset/IropkeBatangB.ttf" "fonts/Open_Sans_Condensed/OpenSansCondensed-Bold.ttf" "fonts/Noto_Sans_SC/NotoSansSC-Bold.otf" }',
'	}',
'',
'	group = {',
'		languages = { "l_japanese" }',
'		files = { "fonts/Open_Sans_Condensed/OpenSansCondensed-Bold.ttf" "fonts/Genryu_JP/GenRyuMin2JP-B.otf" "fonts/Noto_Sans_SC/NotoSansSC-Bold.otf" "fonts/Korean_fontset/IropkeBatangB.ttf" }',
'	}',
'}',
'',
'### Gitan',
'fontfiles = {',
'	name = "Gitan-Regular"',
'	always_load = yes',
'',
'	group = {',
'		languages = { "l_english" "l_french" "l_german" "l_spanish" "l_polish"}',
'		files = { "fonts/Gitan/GitanLatin-Regular.otf" "fonts/Open_Sans/OpenSans-SemiBold.ttf" "fonts/Noto_Sans_SC/NotoSansSC-Medium.otf" "fonts/Korean_fontset/IropkeBatangM.ttf" }',
'	}',
'',
'	group = {',
'		languages = { "l_russian" }',
'		files = { "fonts/Open_Sans/OpenSans-SemiBold.ttf" "fonts/Noto_Sans_SC/NotoSansSC-Medium.otf" "fonts/Korean_fontset/IropkeBatangM.ttf" }',
'	}',
'',
'	group = {',
'		languages = { "l_simp_chinese" }',
'		files = { ' + G.bodyRegular + ' }',
'	}',
'',
'	group = {',
'		languages = { "l_korean" }',
'		files = { "fonts/Korean_fontset/IropkeBatangM.ttf" "fonts/Open_Sans/OpenSans-SemiBold.ttf" "fonts/Noto_Sans_SC/NotoSansSC-Medium.otf" }',
'	}',
'',
'	group = {',
'		languages = { "l_japanese" }',
'		files = { "fonts/Gitan/GitanLatin-Regular.otf" "fonts/Genryu_JP/GenRyuMin2JP-B.otf" "fonts/Noto_Sans_SC/NotoSansSC-Medium.otf" "fonts/Open_Sans/OpenSans-SemiBold.ttf" "fonts/Korean_fontset/IropkeBatangM.ttf" }',
'	}',
'}',
'',
'fontfiles = {',
'	name = "Gitan-Bold"',
'	always_load = yes',
'',
'	group = {',
'		languages = { "l_english" "l_french" "l_german" "l_spanish" "l_polish"}',
'		files = { "fonts/Gitan/GitanLatin-Bold.otf" "fonts/Open_Sans/OpenSans-Bold.ttf" "fonts/Noto_Sans_SC/NotoSansSC-Bold.otf" "fonts/Korean_fontset/IropkeBatangB.ttf" }',
'	}',
'',
'	group = {',
'		languages = { "l_russian" }',
'		files = { "fonts/Open_Sans/OpenSans-Bold.ttf" "fonts/Noto_Sans_SC/NotoSansSC-Bold.otf" "fonts/Korean_fontset/IropkeBatangB.ttf" }',
'	}',
'',
'	group = {',
'		languages = { "l_simp_chinese" }',
'		files = { ' + G.bodyBold + ' }',
'	}',
'',
'	group = {',
'		languages = { "l_korean" }',
'		files = { "fonts/Korean_fontset/IropkeBatangB.ttf" "fonts/Open_Sans/OpenSans-Bold.ttf" "fonts/Noto_Sans_SC/NotoSansSC-Bold.otf" }',
'	}',
'',
'	group = {',
'		languages = { "l_japanese" }',
'		files = { "fonts/Gitan/GitanLatin-Bold.otf" "fonts/Genryu_JP/GenRyuMin2JP-B.otf" "fonts/Noto_Sans_SC/NotoSansSC-Bold.otf" "fonts/Open_Sans/OpenSans-Bold.ttf" "fonts/Korean_fontset/IropkeBatangB.ttf" }',
'	}',
'}',
'',
'fontfiles = {',
'	name = "Gitan-Italic"',
'	always_load = yes',
'',
'	group = {',
'		languages = { "l_english" "l_french" "l_german" "l_spanish" "l_polish"}',
'		files = { "fonts/Gitan/GitanLatin-Italic.otf" "fonts/Open_Sans/OpenSans-SemiBoldItalic.ttf" "fonts/Noto_Sans_SC/NotoSansSC-Light.otf" "fonts/Korean_fontset/IBMPlexSansKR-Medium.otf" }',
'	}',
'',
'	group = {',
'		languages = { "l_russian" }',
'		files = { "fonts/Open_Sans/OpenSans-SemiBoldItalic.ttf" "fonts/Noto_Sans_SC/NotoSansSC-Light.otf" "fonts/Korean_fontset/IBMPlexSansKR-Medium.otf" }',
'	}',
'',
'	group = {',
'		languages = { "l_simp_chinese" }',
'		files = { ' + G.bodyItalic + ' }',
'	}',
'',
'	group = {',
'		languages = { "l_korean" }',
'		files = { "fonts/Korean_fontset/IBMPlexSansKR-Medium.otf" "fonts/Open_Sans/OpenSans-SemiBoldItalic.ttf" "fonts/Noto_Sans_SC/NotoSansSC-Light.otf" }',
'	}',
'',
'	group = {',
'		languages = { "l_japanese" }',
'		files = { "fonts/Open_Sans/OpenSans-SemiBoldItalic.ttf" "fonts/Genryu_JP/GenRyuMin2JP-B.otf" "fonts/Noto_Sans_SC/NotoSansSC-Light.otf" "fonts/Open_Sans/OpenSans-SemiBoldItalic.ttf" "fonts/Korean_fontset/IBMPlexSansKR-Medium.otf" }',
'	}',
'}',
'',
'fontfiles = {',
'	name = "Gitan-Bold-Italic"',
'	always_load = yes',
'',
'	group = {',
'		languages = { "l_english" "l_french" "l_german" "l_spanish" "l_polish"}',
'		files = { "fonts/Gitan/GitanLatin-Bold-Italic.otf" "fonts/Open_Sans/OpenSans-SemiBoldItalic.ttf" "fonts/Noto_Sans_SC/NotoSansSC-Bold.otf" "fonts/Korean_fontset/IBMPlexSansKR-SemiBold.otf" }',
'	}',
'',
'	group = {',
'		languages = { "l_russian" }',
'		files = { "fonts/Open_Sans/OpenSans-SemiBoldItalic.ttf" "fonts/Noto_Sans_SC/NotoSansSC-Bold.otf" "fonts/Korean_fontset/IBMPlexSansKR-SemiBold.otf" }',
'	}',
'',
'	group = {',
'		languages = { "l_simp_chinese" }',
'		files = { ' + G.bodyBoldItalic + ' }',
'	}',
'',
'	group = {',
'		languages = { "l_korean" }',
'		files = { "fonts/Korean_fontset/IBMPlexSansKR-SemiBold.otf" "fonts/Open_Sans/OpenSans-SemiBoldItalic.ttf" "fonts/Noto_Sans_SC/NotoSansSC-Bold.otf" }',
'	}',
'',
'	group = {',
'		languages = { "l_japanese" }',
'		files = { "fonts/Gitan/GitanLatin-Bold-Italic.otf" "fonts/Genryu_JP/GenRyuMin2JP-B.otf" "fonts/Noto_Sans_SC/NotoSansSC-Bold.otf" "fonts/Open_Sans/OpenSans-SemiBoldItalic.ttf" "fonts/Korean_fontset/IBMPlexSansKR-SemiBold.otf" }',
'	}',
'}',
'',
'### Fondamento',
'fontfiles = {',
'	name = "Fondamento-Regular"',
'	always_load = yes',
'',
'	group = {',
'		languages = { "l_english" "l_french" "l_german" "l_spanish" "l_polish"}',
'		files = { "fonts/Fondamento/Fondamento-Regular.ttf" "fonts/Open_Sans/OpenSans-SemiBoldItalic.ttf" "fonts/Noto_Sans_SC/NotoSansSC-Bold.otf" "fonts/Korean_fontset/ON_YeossiB.ttf" }',
'	}',
'',
'	group = {',
'		languages = { "l_russian" }',
'		files = { "fonts/Open_Sans/OpenSans-SemiBoldItalic.ttf" "fonts/Noto_Sans_SC/NotoSansSC-Bold.otf" "fonts/Korean_fontset/ON_YeossiB.ttf" }',
'	}',
'',
'	group = {',
'		languages = { "l_simp_chinese" }',
'		files = { ' + G.title + ' }',
'	}',
'',
'	group = {',
'		languages = { "l_korean" }',
'		files = { "fonts/Korean_fontset/ON_YeossiB.ttf" "fonts/Open_Sans/OpenSans-SemiBoldItalic.ttf" "fonts/Noto_Sans_SC/NotoSansSC-Bold.otf" }',
'	}',
'',
'	group = {',
'		languages = { "l_japanese" }',
'		files = { "fonts/Genryu_JP/GenRyuMin2JP-B.otf" "fonts/Noto_Sans_SC/NotoSansSC-Bold.otf" "fonts/Open_Sans/OpenSans-SemiBoldItalic.ttf" "fonts/Korean_fontset/ON_YeossiB.ttf" }',
'	}',
'}',
'',
'### Paradox Kings Script // Missale Lunea custom',
'fontfiles = {',
'	name = "Paradox_King_Script"',
'	always_load = yes',
'',
'	group = {',
'		languages = { "l_english" "l_french" "l_german" "l_spanish" "l_polish"}',
'		files = { "fonts/mapfont/Paradox_King_Script.otf" "fonts/Open_Sans/OpenSans-SemiBoldItalic.ttf" "fonts/MonomakhUnicode/MonomakhUnicode.otf" "fonts/Noto_Sans_SC/NotoSansSC-Medium.otf" "fonts/Korean_fontset/GunglipbakmulgwanClassicB.ttf" "fonts/LxgwZhenKai/LXGWZhenKaiGB_alphabet_removed.otf" }',
'	}',
'',
'	group = {',
'		languages = { "l_russian" }',
'		files = { "fonts/MonomakhUnicode/MonomakhUnicode.otf" "fonts/mapfont/Paradox_King_Script.otf" "fonts/Open_Sans/OpenSans-SemiBoldItalic.ttf" "fonts/Noto_Sans_SC/NotoSansSC-Medium.otf" "fonts/Korean_fontset/GunglipbakmulgwanClassicB.ttf" "fonts/LxgwZhenKai/LXGWZhenKaiGB_alphabet_removed.otf" }',
'	}',
'',
'	group = {',
'		languages = { "l_simp_chinese" }',
'		files = { ' + G.map + ' }',
'	}',
'',
'	group = {',
'		languages = { "l_korean" }',
'		files = { "fonts/Korean_fontset/GunglipbakmulgwanClassicB.ttf" "fonts/mapfont/Paradox_King_Script.otf" "fonts/Open_Sans/OpenSans-SemiBoldItalic.ttf" "fonts/MonomakhUnicode/MonomakhUnicode.otf" "fonts/Noto_Sans_SC/NotoSansSC-Medium.otf" "fonts/LxgwZhenKai/LXGWZhenKaiGB_alphabet_removed.otf" }',
'	}',
'',
'	group = {',
'		languages = { "l_japanese" }',
'		files = { "fonts/mapfont/Paradox_King_Script.otf" "fonts/Genryu_JP/GenRyuMin2JP-B.otf" "fonts/Noto_Sans_SC/NotoSansSC-Medium.otf" "fonts/Open_Sans/OpenSans-SemiBoldItalic.ttf" "fonts/MonomakhUnicode/MonomakhUnicode.otf" "fonts/Korean_fontset/GunglipbakmulgwanClassicB.ttf" }',
'	}',
'}',
'',
'#######################################################################',
'# Each font should specify what it is used for.',
'',
'font = {',
'	name = "Debug"',
'',
'	fontstyle = {',
'		style = regular',
'		fontfiles = "OpenSans-SemiBold"',
'	}',
'}',
'',
'## Font used in-game',
'font = {',
'	name = "StandardGameFont"',
'',
'	fontstyle = {',
'		style = regular',
'		fontfiles = "Gitan-Regular"',
'	}',
'',
'	fontstyle = {',
'		style = bold',
'		fontfiles = "Gitan-Bold"',
'	}',
'',
'	fontstyle = {',
'		style = italic',
'		fontfiles = "Gitan-Italic"',
'	}',
'',
'	fontstyle = {',
'		style = bold|italic',
'		fontfiles = "Gitan-Bold-Italic"',
'	}',
'',
'	underlineformats = {',
'		default = {',
'			thickness = 1',
'			offset = 0.12',
'		}',
'	}',
'}',
'',
'# Title font',
'font = {',
'	name = "TitleFont"',
'',
'	fontstyle = {',
'		style = regular',
'		fontfiles = "Fondamento-Regular"',
'	}',
'}',
'',
'# For map names',
'font = {',
'	name = "MapFont"',
'',
'	fontstyle = {',
'		style = regular',
'		fontfiles = "Paradox_King_Script"',
'	}',
'}',
  ].join("\n");
}

function buildDescriptor(asciiName){
  return 'version="1.0.0"\ntags={\n\t"Graphics"\n}\nname="' + asciiName + '"\nsupported_version="1.*.*"\n';
}
function buildOuterMod(asciiName){
  return 'version="1.0.0"\ntags={\n\t"Graphics"\n}\nname="' + asciiName + '"\npath="REPLACE_WITH_ABSOLUTE_PATH"\nsupported_version="1.*.*"\n';
}
function buildReadme(asciiName){
  return [
asciiName + " — CK3 字体 mod（由 CK3 中文字体替换器生成）",
"",
"安装：",
"1. 把本 zip 里的 " + asciiName + " 文件夹和 " + asciiName + ".mod 一起解压到：",
"   文档\\Paradox Interactive\\Crusader Kings III\\mod\\",
"2. 用记事本打开 " + asciiName + '.mod，把 path="REPLACE_WITH_ABSOLUTE_PATH" 改成',
'   该文件夹的实际路径（正斜杠写法），例如：',
'   path="C:/Users/你的用户名/Documents/Paradox Interactive/Crusader Kings III/mod/' + asciiName + '"',
"3. 启动游戏，在启动器的游玩集里勾选本 mod。",
"",
"重要：",
"- fonts.font 是整文件替换，同一时间只能启用一个字体 mod；",
"  请停用 TY's Chinese Fonts / Chinese Fonts 等其他字体 mod。",
"- 若游戏内出现方块（缺字），说明所选字体覆盖不足，回到工具换一个覆盖更全的字体。",
"",
"卸载：启动器取消勾选，或删除上述两个文件。",
  ].join("\n");
}

let _crcTable = null;
function crc32(u8){
  if (!_crcTable){
    _crcTable = new Uint32Array(256);
    for (let n = 0; n < 256; n++){
      let c = n;
      for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      _crcTable[n] = c >>> 0;
    }
  }
  let c = 0xFFFFFFFF;
  for (let i = 0; i < u8.length; i++) c = _crcTable[(c ^ u8[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}

function buildZip(entries){
  const enc = new TextEncoder();
  const chunks = [], central = [];
  let offset = 0;
  const now = new Date();
  const dosTime = ((now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1)) & 0xFFFF;
  const dosDate = (((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate()) & 0xFFFF;
  for (const e of entries){
    const nameU8 = enc.encode(e.path);
    const data = e.data;
    const crc = crc32(data);
    const lh = new Uint8Array(30), dv = new DataView(lh.buffer);
    dv.setUint32(0, 0x04034b50, true);
    dv.setUint16(4, 20, true);
    dv.setUint16(6, 0x0800, true);        
    dv.setUint16(8, 0, true);             
    dv.setUint16(10, dosTime, true);
    dv.setUint16(12, dosDate, true);
    dv.setUint32(14, crc, true);
    dv.setUint32(18, data.length, true);
    dv.setUint32(22, data.length, true);
    dv.setUint16(26, nameU8.length, true);
    chunks.push(lh, nameU8, data);
    central.push({nameU8, crc, size: data.length, offset});
    offset += 30 + nameU8.length + data.length;
  }
  const cdStart = offset;
  let cdSize = 0;
  for (const c of central){
    const ch = new Uint8Array(46), dv = new DataView(ch.buffer);
    dv.setUint32(0, 0x02014b50, true);
    dv.setUint16(4, 20, true);
    dv.setUint16(6, 20, true);
    dv.setUint16(8, 0x0800, true);
    dv.setUint16(12, dosTime, true);
    dv.setUint16(14, dosDate, true);
    dv.setUint32(16, c.crc, true);
    dv.setUint32(20, c.size, true);
    dv.setUint32(24, c.size, true);
    dv.setUint16(28, c.nameU8.length, true);
    dv.setUint32(42, c.offset, true);
    chunks.push(ch, c.nameU8);
    cdSize += 46 + c.nameU8.length;
  }
  const eocd = new Uint8Array(22), dv = new DataView(eocd.buffer);
  dv.setUint32(0, 0x06054b50, true);
  dv.setUint16(8, central.length, true);
  dv.setUint16(10, central.length, true);
  dv.setUint32(12, cdSize, true);
  dv.setUint32(16, cdStart, true);
  chunks.push(eocd);
  let total = 0; for (const c of chunks) total += c.length;
  const out = new Uint8Array(total);
  let p = 0; for (const c of chunks){ out.set(c, p); p += c.length; }
  return out;
}

const METRIC_REF_EM = {
  noto:   { hheaAsc: 1.160, hheaDesc: 0.320, winAsc: 1.160, winDesc: 0.320 },  
  wenkai: { hheaAsc: 0.928, hheaDesc: 0.256, winAsc: 1.032, winDesc: 0.285 },  
};
const SLOT_METRIC_REF = {
  bodyRegular:"noto", bodyBold:"noto", bodyItalic:"noto", bodyBoldItalic:"noto",
  title:"noto", map:"wenkai",
};

function sfntTables(u8){
  if (u8.length < 12) return null;
  const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
  const ver = dv.getUint32(0);
  if (ver !== 0x00010000 && ver !== 0x4F54544F && ver !== 0x74727565) return null;
  const n = dv.getUint16(4);
  const tables = {};
  for (let i = 0; i < n; i++){
    const rec = 12 + i * 16;
    if (rec + 16 > u8.length) return null;
    const tag = String.fromCharCode(u8[rec], u8[rec+1], u8[rec+2], u8[rec+3]);
    tables[tag] = { off: dv.getUint32(rec + 8), len: dv.getUint32(rec + 12), rec };
  }
  return { dv, tables };
}

function readVerticalMetrics(u8){
  const t = sfntTables(u8);
  if (!t || !t.tables.hhea || !t.tables.head) return null;
  const { dv, tables } = t;
  const h = tables.hhea, o = tables["OS/2"];
  const m = {
    upm: dv.getUint16(tables.head.off + 18),
    hheaAsc: dv.getInt16(h.off + 4), hheaDesc: dv.getInt16(h.off + 6), hheaGap: dv.getInt16(h.off + 8),
    typoAsc: null, typoDesc: null, typoGap: null, winAsc: null, winDesc: null,
  };
  if (o && o.len >= 78){
    m.typoAsc = dv.getInt16(o.off + 68); m.typoDesc = dv.getInt16(o.off + 70); m.typoGap = dv.getInt16(o.off + 72);
    m.winAsc = dv.getUint16(o.off + 74); m.winDesc = dv.getUint16(o.off + 76);
  }
  return m;
}

function tableChecksum(u8, off, len){
  let sum = 0;
  for (let i = 0; i < len; i += 4){
    const b0 = u8[off + i];
    const b1 = i + 1 < len ? u8[off + i + 1] : 0;
    const b2 = i + 2 < len ? u8[off + i + 2] : 0;
    const b3 = i + 3 < len ? u8[off + i + 3] : 0;
    sum = (sum + (((b0 << 24) | (b1 << 16) | (b2 << 8) | b3) >>> 0)) >>> 0;
  }
  return sum;
}

function patchVerticalMetrics(u8, slot){
  if (!state.patchMetrics) return null;
  const ref = METRIC_REF_EM[SLOT_METRIC_REF[slot]];
  const t = sfntTables(u8);
  if (!ref || !t || !t.tables.hhea || !t.tables.head) return null;
  const out = u8.slice();
  const dv = new DataView(out.buffer, out.byteOffset, out.byteLength);
  const { tables } = t;
  const upm = dv.getUint16(tables.head.off + 18);
  const ha = Math.round(ref.hheaAsc * upm), hd = Math.round(ref.hheaDesc * upm);
  const wa = Math.round(ref.winAsc * upm),  wd = Math.round(ref.winDesc * upm);
  const h = tables.hhea;
  dv.setInt16(h.off + 4, ha); dv.setInt16(h.off + 6, -hd); dv.setInt16(h.off + 8, 0);
  
  dv.setUint32(h.rec + 4, tableChecksum(out, h.off, h.len));
  if (tables["OS/2"] && tables["OS/2"].len >= 78){
    const o = tables["OS/2"];
    dv.setInt16(o.off + 68, ha); dv.setInt16(o.off + 70, -hd); dv.setInt16(o.off + 72, 0);
    dv.setUint16(o.off + 74, wa); dv.setUint16(o.off + 76, wd);
    dv.setUint32(o.rec + 4, tableChecksum(out, o.off, o.len));
  }
  
  const headOff = tables.head.off;
  dv.setUint32(headOff + 8, 0);
  let fsum = 0;
  const flen = out.length;
  for (let i = 0; i < flen; i += 4){
    const b0 = out[i];
    const b1 = i + 1 < flen ? out[i+1] : 0;
    const b2 = i + 2 < flen ? out[i+2] : 0;
    const b3 = i + 3 < flen ? out[i+3] : 0;
    fsum = (fsum + (((b0 << 24) | (b1 << 16) | (b2 << 8) | b3) >>> 0)) >>> 0;
  }
  dv.setUint32(headOff + 8, (0xB1B0AFBA - fsum) >>> 0);
  return { data: out, ref: SLOT_METRIC_REF[slot], upm, hheaAsc: ha, hheaDesc: -hd, winAsc: wa, winDesc: wd };
}

function readCmapLookup(u8){
  const t = sfntTables(u8);
  if (!t || !t.tables.cmap) return null;
  const { dv } = t;
  const c = t.tables.cmap;
  const numSub = dv.getUint16(c.off + 2);
  let best = null, bestScore = -1;
  for (let i = 0; i < numSub; i++){
    const r = c.off + 4 + i * 8;
    if (r + 8 > c.off + c.len) break;
    const pid = dv.getUint16(r), eid = dv.getUint16(r + 2), off = dv.getUint32(r + 4);
    let fmt = -1;
    try { fmt = dv.getUint16(c.off + off); } catch (e) { continue; }
    let score = -1;
    if ((pid === 3 && eid === 10) || (pid === 0 && (eid === 4 || eid === 6))) score = fmt === 12 ? 100 : -1;
    else if (pid === 3 && eid === 1) score = fmt === 4 ? 80 : -1;
    else if (pid === 0 && eid <= 3) score = fmt === 4 ? 60 : (fmt === 12 ? 90 : -1);
    if (score > bestScore){ bestScore = score; best = { off: c.off + off, fmt }; }
  }
  if (!best) return null;
  const s = best.off;
  if (best.fmt === 4){
    const segCount = dv.getUint16(s + 6) / 2;
    const endBase = s + 14;
    const startBase = endBase + segCount * 2 + 2;
    const deltaBase = startBase + segCount * 2;
    const rangeBase = deltaBase + segCount * 2;
    return (cp) => {
      if (cp > 0xFFFF) return false;
      let lo = 0, hi = segCount - 1, i = -1;
      while (lo <= hi){
        const mid = (lo + hi) >> 1;
        if (dv.getUint16(endBase + mid * 2) >= cp){ i = mid; hi = mid - 1; } else lo = mid + 1;
      }
      if (i < 0) return false;
      const start = dv.getUint16(startBase + i * 2);
      if (cp < start) return false;
      const ro = dv.getUint16(rangeBase + i * 2);
      try {
        if (ro === 0) return ((dv.getInt16(deltaBase + i * 2) + cp) & 0xFFFF) !== 0;
        return dv.getUint16(rangeBase + i * 2 + ro + (cp - start) * 2) !== 0;
      } catch (e) { return false; }
    };
  }
  if (best.fmt === 12){
    const n = dv.getUint32(s + 12);
    const gBase = s + 16;
    return (cp) => {
      let lo = 0, hi = n - 1;
      while (lo <= hi){
        const mid = (lo + hi) >> 1;
        const gs = dv.getUint32(gBase + mid * 12), ge = dv.getUint32(gBase + mid * 12 + 4);
        if (cp < gs) hi = mid - 1;
        else if (cp > ge) lo = mid + 1;
        else return dv.getUint32(gBase + mid * 12 + 8) + (cp - gs) !== 0;
      }
      return false;
    };
  }
  return null;
}

function buildEntries(){
  const folder = state.modName;
  const entries = [];
  const fontsUsed = new Map();
  for (const s of SLOTS){
    const f = resolveSlot(s.id);
    if (f) fontsUsed.set(f.slug, f);
  }
  entries.push({path: folder + "/fonts/fonts.font", data: new TextEncoder().encode(buildFontsFont())});
  for (const f of fontsUsed.values()){
    let data = f.data;
    if (state.patchMetrics){
      
      const slot = SLOTS.find(s => resolveSlot(s.id) === f);
      const patched = slot ? patchVerticalMetrics(f.data, slot.id) : null;
      if (patched) data = patched.data;
    }
    entries.push({path: folder + "/fonts/user/" + f.slug + "." + f.ext, data});
  }
  entries.push({path: folder + "/descriptor.mod", data: new TextEncoder().encode(buildDescriptor(folder))});
  entries.push({path: folder + ".mod", data: new TextEncoder().encode(buildOuterMod(folder))});
  entries.push({path: "README.txt", data: new TextEncoder().encode(buildReadme(folder))});
  return entries;
}

function loadFontFromBuffer(origName, buffer){
  const used = new Set(state.fonts.map(f => (f.slug + "." + f.ext).toLowerCase()));
  const {slug, ext} = asciiSlug(origName, used);
  const data = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  const f = {id: "f" + (++_fid), origName, slug, ext, data};
  state.fonts.push(f);
  autoAssign(f);
  return f;
}

function autoAssign(f){
  const n = f.origName;
  const empty = (s) => state.slots[s] === "vanilla" || state.slots[s] == null;
  if (/臻楷|zhenkai/i.test(n)){                       
    if (empty("bodyBold")) state.slots.bodyBold = f.id;
    return;
  }
  if (/cooper|汇迹|huiji/i.test(n)){                  
    if (empty("title")) state.slots.title = f.id;
    if (empty("map")) state.slots.map = f.id;
    return;
  }
  if (/欧楷|歐楷|oukai|okai/i.test(n)){               
    if (empty("bodyBold")) state.slots.bodyBold = f.id;
    if (empty("title")) state.slots.title = f.id;
    if (empty("map")) state.slots.map = f.id;
    return;
  }
  if (/文楷|正楷|wenkai/i.test(n) && empty("bodyRegular")) state.slots.bodyRegular = f.id;
  if (/黑体|黑體|heiti|sans|gothic/i.test(n) && empty("bodyBold")) state.slots.bodyBold = f.id;
}

const CK3FontTool = {state, SLOTS, TAIL, LATIN, METRIC_REF_EM, SLOT_METRIC_REF,
  asciiSlug, resolveSlot, chainFor, buildFontsFont, readVerticalMetrics, patchVerticalMetrics, readCmapLookup,
  buildDescriptor, buildOuterMod, buildReadme, buildZip, crc32, buildEntries, loadFontFromBuffer, autoAssign};

if (typeof module !== "undefined" && module.exports) module.exports = CK3FontTool;
if (typeof globalThis !== "undefined") globalThis.CK3FontTool = CK3FontTool;
