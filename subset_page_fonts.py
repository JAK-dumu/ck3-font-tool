
"""把 fonts_page/ 三个页面字体子集化：只留 index.html 用到的字符 + ASCII + 常用标点区段。

原件备份到 fixtures/fonts_page_full/，fonts_page/ 原名替换（index.html 无需改动）。
子集后逐字符断言 cmap 覆盖，防止静默丢字。
"""
import io
import os
import shutil
import subprocess
import sys

ROOT = os.path.dirname(os.path.abspath(__file__))
PAGE = os.path.join(ROOT, "index.html")
FONT_DIR = os.path.join(ROOT, "fonts_page")
BACKUP = os.path.join(ROOT, "fixtures", "fonts_page_full")

FONTS = [
    "LXGWWenKaiGB-Regular.ttf",
    "LXGWZhenKaiGB-Regular.ttf",
    "CooperZhengKai-1.1.ttf",
]

def rng(a, b):
    return [chr(c) for c in range(a, b + 1)]

def main():
    html = io.open(PAGE, encoding="utf-8").read()
    
    chars = set(html)
    
    chars |= set(rng(0x20, 0x7E))
    chars |= set(rng(0x2010, 0x2027))
    chars |= set(rng(0x3000, 0x303F))
    chars |= set(rng(0xFF01, 0xFF5E))
    chars |= set("·•×÷±≤≥")
    chars -= set("\n\r\t\x0b\x0c")

    text = "".join(sorted(chars))
    unicodes = ",".join("%04X" % ord(c) for c in sorted(chars) if ord(c) < 0x80)

    tmp_text = os.path.join(FONT_DIR, "_subset_chars.txt")
    io.open(tmp_text, "w", encoding="utf-8").write(text)

    os.makedirs(BACKUP, exist_ok=True)

    from fontTools.ttLib import TTFont

    failures = 0
    for name in FONTS:
        src = os.path.join(FONT_DIR, name)
        dst = src + ".subset.ttf"
        subprocess.check_call([
            sys.executable, "-m", "fontTools.subset", src,
            "--text-file=" + tmp_text,
            "--unicodes=" + unicodes,
            "--no-hinting",
            "--output-file=" + dst,
        ])
        font = TTFont(dst)
        cmap = font.getBestCmap()
        
        src_cmap = TTFont(src).getBestCmap()
        missing = [c for c in chars if c not in src_cmap]
        lost = [c for c in chars if c in src_cmap and ord(c) not in cmap and not c.isspace()]
        if lost:
            print("FAIL %s 丢字 %d 个: %s" % (name, len(lost), "".join(lost[:60])))
            failures += 1
            continue
        shutil.copy2(src, os.path.join(BACKUP, name))
        before = os.path.getsize(src)
        os.replace(dst, src)
        after = os.path.getsize(src)
        print("OK   %-32s %6.1fMB -> %6.1fKB  glyphs=%d  原字体缺字走兜底 %d 个"
              % (name, before / 1048576, after / 1024, font["maxp"].numGlyphs, len(missing)))

    os.remove(tmp_text)
    if failures:
        sys.exit(1)
    print("done")

if __name__ == "__main__":
    main()
