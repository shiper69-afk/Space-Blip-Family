import numpy as np, json, math
from PIL import Image, ImageDraw, ImageFilter, ImageFont
from scipy import ndimage
D='/workspace/chars/alan_sleep/'; BR=Image.open('/workspace/bridge/bridge_v5_00_nomug.png').convert('RGBA')
def key(p):
    c=np.array(Image.open(p).convert('RGB')).astype(float); r,g,b=c[...,0],c[...,1],c[...,2]
    gd=g-np.maximum(r,b); al=np.clip(1-(gd-30)/50,0,1); c[...,1]=np.minimum(g,np.maximum(r,b)*1.05+15)
    return Image.fromarray(np.dstack([c,al*255]).clip(0,255).astype('uint8'),'RGBA')
def finish(im):
    a=np.array(im).astype(float); al=a[...,3]; a[...,3]=np.where(al>140,255,np.where(al<60,0,al))
    spr=Image.fromarray(a.astype('uint8'),'RGBA'); m=np.array(spr.getchannel('A'))>0
    ol=np.zeros(m.shape+(4,),'uint8'); ol[...,:3]=(24,18,30); ol[...,3]=np.where(ndimage.binary_dilation(m)&~m,220,0)
    out=Image.new('RGBA',spr.size); out.alpha_composite(Image.fromarray(ol,'RGBA')); out.alpha_composite(spr)
    rgb=out.convert('RGB').filter(ImageFilter.UnsharpMask(0.8,50,1)); rgb.putalpha(out.getchannel('A')); return rgb
HANDS={'sleep_a':[(410,605)],'sleep_b':[(410,605)],'jolt':[],'awake':[(410,575),(540,575)]}
YC=(475,590)
def yoke(k,hands):
    y=Image.new('RGBA',k.size); d=ImageDraw.Draw(y); cx,cy=YC
    d.rounded_rectangle([cx-16,cy,cx+16,cy+95],8,fill=(45,45,52,255),outline=(15,12,20,255),width=6)
    d.ellipse([cx-78,cy-78,cx+78,cy+78],outline=(15,12,20,255),width=34); d.ellipse([cx-74,cy-74,cx+74,cy+74],outline=(60,60,70,255),width=22)
    d.ellipse([cx-24,cy-24,cx+24,cy+24],fill=(70,70,80,255),outline=(15,12,20,255),width=6)
    o=k.copy(); o.alpha_composite(y)
    for hx,hy in hands:
        m=Image.new('L',k.size,0); ImageDraw.Draw(m).ellipse([hx-58,hy-52,hx+58,hy+52],fill=255)
        o.paste(k,(0,0),Image.composite(k.getchannel('A'),Image.new('L',k.size,0),m))
    return o
K={}
for n in ('sleep_a','sleep_b','jolt','awake'):
    k=key(D+f'gen/{n}.jpg')
    K[n]=yoke(k,HANDS[n])
S=116                     # depth model: chair feet y~190 -> scale 1.22 (standing 127px) -> seated ~92px
CX,CY,CW,CH=462,70,144,134   # overlay canvas on bridge
PX,PY=477-CX,84-CY           # where the 106px figure square goes in canvas
def fig(n,sy=1.0,dy=0,rot=0):
    im=K[n]
    if rot: im=im.rotate(rot,Image.BICUBIC,center=(520,880))
    h=int(round(S*sy)); f=finish(im.resize((S*2,h*2),Image.LANCZOS).resize((S,h),Image.LANCZOS))
    c=Image.new('RGBA',(CW,CH)); c.alpha_composite(f,(PX,PY+(S-h)+dy)); return c
# mug prop (painted at 6x)
def mug(rot=0):
    Z=6; m=Image.new('RGBA',(16*Z,16*Z)); d=ImageDraw.Draw(m)
    d.rounded_rectangle([3*Z,4*Z,11*Z,13*Z],Z,fill=(232,222,205,255),outline=(40,30,30,255),width=Z)
    d.ellipse([3*Z,3*Z,11*Z,5.5*Z],fill=(90,55,30,255),outline=(40,30,30,255),width=Z)
    d.arc([9*Z,6*Z,14*Z,11*Z],-90,90,fill=(40,30,30,255),width=int(1.6*Z)); d.arc([9.6*Z,6.6*Z,13.4*Z,10.4*Z],-90,90,fill=(232,222,205,255),width=int(.6*Z))
    d.rectangle([4.5*Z,6*Z,5.5*Z,11*Z],fill=(255,250,240,255))
    m=m.rotate(rot,Image.BICUBIC); return m.resize((16,16),Image.LANCZOS)
# ---- sleep loop
fr_sleep=[]; mugpos_sleep=[]
for i in range(8):
    ph=math.sin(i/8*2*math.pi); sy=1+0.022*ph
    n='sleep_a' if i in (2,3,4,5) else 'sleep_b'
    fr_sleep.append(fig(n,sy)); 
    h=int(round(S*sy)); belly_y=CY+PY+(S-h)+int(0.53*h)   # belly top ~50% down the 1024 src
    mugpos_sleep.append([CX+PX+int(0.565*S)-8, belly_y-12])
# ---- wake jolt
spec=[('sleep_a',1.0,-2,0),('jolt',1.0,-7,0),('jolt',1.0,-5,3),('jolt',1.0,-2,-2),('awake',1.0,-1,0),('awake',1.0,0,0)]
fr_wake=[fig(*s) for s in spec]
start=mugpos_sleep[0]; end=[598,128]
mug_wake=[]
for i in range(6):
    t=i/5; x=start[0]+(end[0]-start[0])*t; y=start[1]+(end[1]-start[1])*t-38*4*t*(1-t)
    mug_wake.append({'x':int(x),'y':int(y),'rot':int(-140*t) if i<5 else -25,'sprite':f'mug_wake_{i:02d}.png'})
for i,mw in enumerate(mug_wake): mug(mw['rot']).save(D+f'mug_wake_{i:02d}.png')
mug(0).save(D+'mug_prop.png'); mug(-25).save(D+'mug_stuck_console.png')
# ---- zzz overlay (separate)
fnt=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',40)
zz=[]
for i in range(8):
    z=Image.new('RGBA',(36*4,40*4)); d=ImageDraw.Draw(z)
    for j,(ox,oy,sz) in enumerate(((0,110,.5),(40,60,.7),(80,0,.9))):
        a=int(255*max(0,min(1,1-abs(((i/8+j/3)%1)-.5)*1.6)))
        f2=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',int(60*sz))
        yy=oy-int(((i/8+j/3)%1)*20)
        d.text((ox,yy+20),'Z',font=f2,fill=(240,240,255,a),stroke_width=5,stroke_fill=(30,30,60,a))
    z=z.resize((36,40),Image.LANCZOS); z.save(D+f'zzz_{i:02d}.png'); zz.append(z)
ZX,ZY=540,66
for i,f in enumerate(fr_sleep): f.save(D+f'alan_frames_sleep_chair_{i:02d}.png')
for i,f in enumerate(fr_wake): f.save(D+f'alan_frames_wake_jolt_{i:02d}.png')
json.dump({'x':CX,'y':CY,'w':CW,'h':CH,'layer_note':'draw ABOVE bridge (chair is in bridge bg); no chair front layer needed. use /workspace/bridge/bridge_v5_00_nomug.png (armrest mug painted out; patch layer bridge_v5_mugpatch.png at 500,135). Yoke is baked into each frame at a fixed spot (bridge ~531,150).',
 'sleep_chair':{'frames':[f'alan_frames_sleep_chair_{i:02d}.png' for i in range(8)],'fps':6,'loop':True,'mug_sprite':'mug_prop.png','mug_pos':mugpos_sleep,
   'zzz':{'frames':[f'zzz_{i:02d}.png' for i in range(8)],'x':ZX,'y':ZY,'fps':6}},
 'wake_jolt':{'frames':[f'alan_frames_wake_jolt_{i:02d}.png' for i in range(6)],'fps':10,'loop':False,'mug_path':mug_wake,
   'final_prop':{'sprite':'mug_stuck_console.png','x':end[0],'y':end[1]},'line':"I'M AWAKE! I'M DRIVING!"}},open(D+'alan_sleep.json','w'),indent=1)
# composites
def comp(f,mp=None,ms=None,z=None):
    b=BR.copy(); b.alpha_composite(f,(CX,CY))
    if mp: b.alpha_composite(ms,tuple(mp))
    if z is not None: b.alpha_composite(z,(ZX,ZY))
    return b
full=[comp(f,mugpos_sleep[i],mug(0),zz[i]) for i,f in enumerate(fr_sleep)]
fullw=[comp(f,(mug_wake[i]['x'],mug_wake[i]['y']),Image.open(D+mug_wake[i]['sprite'])) for i,f in enumerate(fr_wake)]
_d=Image.open('/workspace/chars/dad_idle_v3.png').convert('RGBA'); _d=_d.crop(_d.getbbox()); _h=round(104*1.26); _d=_d.resize((round(_d.width*_h/_d.height),_h),Image.LANCZOS)
_door=Image.open('/workspace/bridge/door/door_open_07.png')
def wd(b):
    b=b.copy(); b.alpha_composite(_door,(180,48)); b.alpha_composite(_d,(209-_d.width//2,225-_h)); return b
crop=(150,30,650,236); z3=lambda b:wd(b).crop(crop).resize((1500,618),Image.NEAREST)
z3(full[3]).save(D+'bridge_alan_sleep_zoom3x.png'); z3(fullw[5]).save(D+'bridge_alan_awake_zoom3x.png')
# sheet
T=[b.crop((440,60,640,210)).resize((300,225),Image.LANCZOS) for b in full+fullw]
sh=Image.new('RGB',(8*306+6,2*245+6),(58,60,72)); dr=ImageDraw.Draw(sh)
for i,t in enumerate(T):
    r,cc=(0,i) if i<8 else (1,i-8); sh.paste(t.convert('RGB'),(6+cc*306,6+r*245)); dr.text((8+cc*306,234+r*245),('sleep_chair' if r==0 else 'wake_jolt')+f'_{cc:02d}',fill=(230,230,240))
sh.save(D+'alan_sleep_sheet.png')
g=[b.crop((440,50,660,215)).resize((660,495),Image.NEAREST).convert('RGB') for b in full*3+fullw+[fullw[-1]]*8]
g[0].save(D+'alan_sleep_to_jolt.gif',save_all=True,append_images=g[1:],duration=[166]*24+[100]*6+[125]*8,loop=0)
