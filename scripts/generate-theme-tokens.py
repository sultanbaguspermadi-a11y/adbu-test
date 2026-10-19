# Generates src/styles/palette.css (theme + accent colour primitives) and verifies WCAG contrast for every combination.
# Usage: python3 scripts/generate-theme-tokens.py --css   (then copy src/styles/palette.css -> src/styles/palette.css)
# The generated CSS is committed, so this script is only needed when you change a colour.
import colorsys, json, sys

def hx(h): h=h.lstrip('#'); return tuple(int(h[i:i+2],16) for i in (0,2,4))
def lum(c):
    def f(v):
        v/=255; return v/12.92 if v<=0.03928 else ((v+0.055)/1.055)**2.4
    r,g,b=c; return 0.2126*f(r)+0.7152*f(g)+0.0722*f(b)
def cr(a,b):
    la,lb=lum(a),lum(b); 
    if la<lb: la,lb=lb,la
    return (la+0.05)/(lb+0.05)
def trip(c): return ' '.join(str(int(round(v))) for v in c)
def hsl(h,s,l): r,g,b=colorsys.hls_to_rgb(h/360,l,s); return (r*255,g*255,b*255)

# ---------- fixed surfaces ----------
DARK = dict(
 ink={950:'#0A121C',900:'#0F1B29',800:'#16263A',700:'#1E3249',600:'#2C4560',500:'#46627F',400:'#7389A0',300:'#A3B4C6'},
 cream={50:'#FBF8F0',100:'#F3ECDB',200:'#E6DCC3',300:'#CFC3A4',400:'#A89D82'},
 steel={300:'#9DB4CC',400:'#7F9BB8',500:'#5F7F9F'}, good='#6FB58A', bad='#E0745F')
LIGHT = dict(
 ink={950:'#DDD6C3',900:'#E8E2D2',800:'#F4F0E4',700:'#E0D9C6',600:'#C9BFA6',500:'#857A60',400:'#506072',300:'#44566A'},
 cream={50:'#0A121C',100:'#0F1B29',200:'#1E3249',300:'#3A4D63',400:'#4F6074'},
 steel={300:'#2B5A86',400:'#3A6894',500:'#4A77A2'}, good='#27704A', bad='#B3392B')
HC_DARK = dict(
 ink={950:'#000000',900:'#04080D',800:'#0A1420',700:'#14263A',600:'#7F97AE',500:'#AEBFD0',400:'#BCC8D5',300:'#DAE2EA'},
 cream={50:'#FFFFFF',100:'#FFFFFF',200:'#F4F0E4',300:'#E8E2D0',400:'#D6CFBA'},
 steel={300:'#C2D6EA',400:'#A9C3DC',500:'#8FB0CE'}, good='#8FE0AE', bad='#FF9E8A')
HC_LIGHT = dict(
 ink={950:'#EFEFEF',900:'#FFFFFF',800:'#FFFFFF',700:'#E6E6E6',600:'#4A4A4A',500:'#262626',400:'#333333',300:'#1A1A1A'},
 cream={50:'#000000',100:'#000000',200:'#141414',300:'#1F1F1F',400:'#383838'},
 steel={300:'#123A63',400:'#1B4A78',500:'#27578A'}, good='#1B5E37', bad='#8F1F14')
PAPER_BG = {'dark':'#F3ECDB','light':'#FBF8F0','hc-dark':'#FFFFFF','hc-light':'#FFFFFF'}
ON_ACCENT='#0F1B29'

# ---------- accents ----------
GOLD_D={300:'#EBC77A',400:'#E3B04B',500:'#D9A03A',600:'#B8832A',700:'#8A5F16'}
def make_accent(h, s):
    def tune(l, pred, step, lo=0.05, hi=0.95):
        # move lightness until pred(color) is true
        for _ in range(200):
            c=hsl(h,s,l)
            if pred(c): return c
            l+=step
            if not lo<l<hi: break
        return hsl(h,s,l)
    ink900=hx(DARK['ink'][900]); cream100=hx(DARK['cream'][100]); onacc=hx(ON_ACCENT); lightbg=hx(LIGHT['ink'][900]); lightpanel=hx(LIGHT['ink'][800])
    c500=tune(0.60, lambda c: cr(c,onacc)>=7.0 and True, +0.01)           # fill, readable dark label
    c400=tune(0.66, lambda c: cr(c,ink900)>=7.5, +0.01)                   # text on dark desk
    c300=tune(0.74, lambda c: cr(c,ink900)>=10, +0.01)
    c600=hsl(h,s,0.42)
    c700=tune(0.36, lambda c: cr(c,cream100)>=5.2, -0.01)                 # text on paper
    # light desk: 300/400 must read on light surfaces
    l300=tune(0.40, lambda c: min(cr(c,lightbg),cr(c,lightpanel))>=6.0, -0.01)
    l400=tune(0.44, lambda c: min(cr(c,lightbg),cr(c,lightpanel))>=4.7, -0.01)
    D={300:c300,400:c400,500:c500,600:c600,700:c700}
    L={300:l300,400:l400,500:c500,600:c600,700:c700}
    return D,L
ACCENTS={
 'gold':  (GOLD_D, None),
 'amber': make_accent(28, 0.86),
 'emerald':make_accent(152,0.52),
 'blue':  make_accent(213,0.72),
 'crimson':make_accent(348,0.68),
}
# gold light set derived from gold hue
gh=make_accent(40,0.62)[1]
ACCENTS['gold']=(GOLD_D,{300:hx('#6E4A0E'),400:hx('#7F5710'),500:hx('#D9A03A'),600:hx('#B8832A'),700:hx('#8A5F16')})
def rgb(c): return tuple(c) if isinstance(c,tuple) else hx(c)

def palette_css(P):
    out=[]
    for k,v in P['ink'].items(): out.append(f"--c-ink-{k}: {trip(hx(v))};")
    for k,v in P['cream'].items(): out.append(f"--c-cream-{k}: {trip(hx(v))};")
    for k,v in P['steel'].items(): out.append(f"--c-steel-{k}: {trip(hx(v))};")
    out.append(f"--c-good: {trip(hx(P['good']))};"); out.append(f"--c-bad: {trip(hx(P['bad']))};")
    return out
def accent_css(S): return [f"--c-gold-{k}: {trip(rgb(v))};" for k,v in S.items()]

# ---------- contrast report ----------
rep=[]
def chk(name,a,b,need): 
    v=cr(hx(a) if isinstance(a,str) else a, hx(b) if isinstance(b,str) else b); rep.append((v>=need, name, round(v,2), need))
for tn,P,pb in [('dark',DARK,PAPER_BG['dark']),('light',LIGHT,PAPER_BG['light']),('hc-dark',HC_DARK,PAPER_BG['hc-dark']),('hc-light',HC_LIGHT,PAPER_BG['hc-light'])]:
    for surf in (900,800):
        s=P['ink'][surf]
        chk(f'{tn} cream100/ink{surf}',P['cream'][100],s,7)
        chk(f'{tn} cream300/ink{surf}',P['cream'][300],s,4.5)
        chk(f'{tn} cream400/ink{surf} (labels)',P['cream'][400],s,4.5)
        chk(f'{tn} ink400/ink{surf} (placeholder)',P['ink'][400],s,4.2 if tn=='dark' else 4.5)
        chk(f'{tn} good/ink{surf}',P['good'],s,4.5); chk(f'{tn} bad/ink{surf}',P['bad'],s,4.5)
        chk(f'{tn} steel300/ink{surf}',P['steel'][300],s,4.5)
    chk(f'{tn} ink500 border vs ink800 (3:1 UI)',P['ink'][500],P['ink'][800],3 if tn!='dark' else 2.4)
for an,(D,L) in ACCENTS.items():
    onacc=hx(ON_ACCENT)
    chk(f'{an} fill500 / on-accent',rgb(D[500]),onacc,7)
    for tn,P,S in [('dark',DARK,D),('light',LIGHT,L)]:
        for surf in (900,800):
            chk(f'{an} {tn} gold400 text/ink{surf}',rgb(S[400]),P['ink'][surf],4.5)
            chk(f'{an} {tn} gold300 text/ink{surf}',rgb(S[300]),P['ink'][surf],4.5)
    chk(f'{an} paper gold700 / paper(dark)',rgb(D[700]),PAPER_BG['dark'],4.5)
    chk(f'{an} paper gold700 / paper(light)',rgb(D[700]),PAPER_BG['light'],4.5)
bad=[r for r in rep if not r[0]]
print('checks',len(rep),'failing',len(bad))
for r in bad: print('FAIL',r)
if '--css' in sys.argv:
    css=[]
    css.append("/* GENERATED by theme token script — primitives. Edit the generator, not these values. */")
    css.append(":root {\n  "+"\n  ".join(palette_css(DARK)+accent_css(ACCENTS['gold'][0]))+"\n  --c-coral: 184 69 42;\n  --c-on-accent: "+trip(hx(ON_ACCENT))+";\n  --c-paper: "+trip(hx(PAPER_BG['dark']))+";\n}")
    css.append(":root[data-theme='light'] {\n  "+"\n  ".join(palette_css(LIGHT)+accent_css(ACCENTS['gold'][1]))+"\n  --c-paper: "+trip(hx(PAPER_BG['light']))+";\n}")
    css.append("[data-accent='gold'] {\n  "+"\n  ".join(accent_css(ACCENTS['gold'][0]))+"\n}")  # lets a swatch show gold even when another accent is active
    for an,(D,L) in ACCENTS.items():
        if an=='gold': continue
        css.append(f"[data-accent='{an}'] {{\n  "+"\n  ".join(accent_css(D))+"\n}")
        css.append(f":root[data-accent='{an}'][data-theme='light'] {{\n  "+"\n  ".join(accent_css(L))+"\n}")
    css.append(":root[data-contrast='high'] {\n  "+"\n  ".join(palette_css(HC_DARK))+"\n  --c-paper: "+trip(hx(PAPER_BG['hc-dark']))+";\n}")
    css.append(":root[data-contrast='high'][data-theme='light'] {\n  "+"\n  ".join(palette_css(HC_LIGHT))+"\n  --c-paper: "+trip(hx(PAPER_BG['hc-light']))+";\n}")
    # paper scope: classic navy ink on cream, in every theme (accent shade 300..700 = dark-desk set so it reads on paper)
    css.append("/* Paper is always cream stock with navy ink, whatever the desk theme is. */")
    css.append(".paper, .on-paper {\n  "+"\n  ".join(palette_css(DARK))+"\n}")
    css.append(".paper, .on-paper {\n  "+"\n  ".join(accent_css(ACCENTS['gold'][0]))+"\n}")
    for an,(D,L) in ACCENTS.items():
        if an=='gold': continue
        css.append(f":root[data-accent='{an}'] :is(.paper, .on-paper) {{\n  "+"\n  ".join(accent_css(D))+"\n}")
    css.append(":root[data-contrast='high'] :is(.paper, .on-paper) {\n  "+"\n  ".join(palette_css(dict(HC_DARK, ink={950:'#000000',900:'#000000',800:'#0A1420',700:'#14263A',600:'#333333',500:'#1A1A1A',400:'#2B2B2B',300:'#111111'}, cream={50:'#FFFFFF',100:'#FFFFFF',200:'#F6F1E3',300:'#E6DFC9',400:'#6B6350'})))+"\n}")
    open('src/styles/palette.css','w').write("\n\n".join(css)+"\n")
    print('wrote palette.css', len("\n\n".join(css)))
