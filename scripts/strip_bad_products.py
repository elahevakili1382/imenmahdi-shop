from pathlib import Path

p = Path(r"c:\Users\Elahe\Desktop\imenmahdi-shop-vue\src\data\catalog.js")
s = p.read_text(encoding="utf-8")
marker = "id: 'p-patan-brown'"
a = s.find(marker)
b = s.find("].map((product) => ({")
if a < 0 or b < 0:
    raise SystemExit(f"markers not found: {a=} {b=}")
start = s.rfind("{", 0, a)
# include the comma/newline before the object: walk back past whitespace to previous comma
prefix = s[:start].rstrip()
if not prefix.endswith(","):
    # keep last product closing
    pass
else:
    # remove trailing comma before ].map — actually we need comma removed before ]
    pass
# Better: cut from the comma after earplug product
# Find "p-earplug" block end — start points at `{` of p-patan-brown
# We want to remove `,\n  { ... }` for all bad products, leaving earplug's `}` then `]`
cut_from = s.rfind(",", 0, start)
s2 = s[:cut_from] + "\n" + s[b:]
p.write_text(s2, encoding="utf-8")
print(f"removed chars {b - cut_from}")
