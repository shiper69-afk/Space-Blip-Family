import numpy as np, json
from PIL import Image, ImageDraw, ImageFilter, ImageFont
D='/workspace/bridge/door/'; br=Image.open('/workspace/bridge/bridge_v5_00.png').convert('RGBA')
X,Y,W,H=180,48,59,163          # door opening (inside the frame recess), bridge px
R=8
def rmask(S=4):
    m=Image.new('L',(W*S,H*S),0); ImageDraw.Draw(m).rounded_rectangle([0,0,W*S-1,H*S-1],R*S,fill=255)
    return m.resize((W,H),Image.LANCZOS)
M=rmask()
panel=br.crop((X,Y,X+W,Y+H))
# kid sticker on the panel: crayon star + smiley
st=Image.new('RGBA',(W*4,H*4)); d=ImageDraw.Draw(st)
import math
cx,cy,ro,ri=35*4,122*4,9*4,4*4
pts=[(cx+(ro if i%2==0 else ri)*math.sin(i*math.pi/5),cy-(ro if i%2==0 else ri)*math.cos(i*math.pi/5)) for i in range(10)]
d.polygon(pts,fill=(255,205,40,255),outline=(40,25,20,255),width=4)
d.ellipse([cx-8,cy-8,cx-2,cy-2],fill=(40,25,20,255)); d.ellipse([cx+4,cy-8,cx+10,cy-2],fill=(40,25,20,255))
d.arc([cx-10,cy-4,cx+12,cy+12],20,160,fill=(40,25,20,255),width=4)
# small crayon heart
hx,hy=50*4,140*4
d.ellipse([hx-12,hy-10,hx,hy+2],fill=(230,70,90,255)); d.ellipse([hx-2,hy-10,hx+10,hy+2],fill=(230,70,90,255)); d.polygon([(hx-12,hy-2),(hx+10,hy-2),(hx-1,hy+14)],fill=(230,70,90,255))
st=st.resize((W,H),Image.LANCZOS).rotate(-6,Image.BICUBIC)
panel.alpha_composite(st)
cor=Image.open(D+'corridor_src.jpg').convert('RGB'); cw,ch=cor.size; tw=int(ch*W/H)
cor=cor.crop(((cw-tw)//2,0,(cw-tw)//2+tw,ch)).resize((W,H),Image.LANCZOS).convert('RGBA')
# darken corridor slightly toward edges (inside the recess)
a=np.array(cor).astype(float); xs=np.linspace(-1,1,W); v=1-0.25*np.abs(xs)**2; a[...,:3]*=v[None,:,None]; fl=np.array(br.convert('RGB').crop((190,222,232,232))).reshape(-1,3).mean(0)
n=30; ys=np.clip((np.arange(H)-(H-n))/n,0,1)**1.3*0.65; a[...,:3]=a[...,:3]*(1-ys[:,None,None])+fl[None,None,:]*ys[:,None,None]
cor=Image.fromarray(a.clip(0,255).astype('uint8'))
cor.save(D+'door_corridor_bg.png')
ease=[0,.06,.2,.4,.6,.8,.94,1.0]
frames=[]
for i,e in enumerate(ease):
    off=int(round(e*(W+2)))
    f=cor.copy()
    if off<W+2:
        p=panel.copy(); sh=Image.new('RGBA',(W,H)); f.alpha_composite(Image.new('RGBA',(W,H),(0,0,0,0)))
        # shadow cast by panel leading edge
        if off>0:
            s=Image.new('RGBA',(W,H)); sd=ImageDraw.Draw(s); sd.rectangle([W-off-1,0,W-off+3,H],fill=(0,0,0,110)); f.alpha_composite(s.filter(ImageFilter.GaussianBlur(1.5)))
        layer=Image.new('RGBA',(W,H)); layer.paste(p,(-off,0))
        if off>0: ImageDraw.Draw(layer).line([(W-off-1,0),(W-off-1,H)],fill=(30,26,34,255))
        f.alpha_composite(layer)
    f.putalpha(M); frames.append(f); f.save(D+f'door_open_{i:02d}.png')
for i,f in enumerate(frames[::-1]): f.save(D+f'door_close_{i:02d}.png')
frames[-1].save(D+'door_open_hold.png'); M.save(D+'door_mask.png')
json.dump({'sprite':'door_open_NN.png','x':X,'y':Y,'w':W,'h':H,'fps':12,'frames_open':[f'door_open_{i:02d}.png' for i in range(8)],
 'frames_close':[f'door_close_{i:02d}.png' for i in range(8)],'close_is_reverse_of_open':True,'open_hold':'door_open_hold.png',
 'fixed_trim':'frame ring + black latch are untouched bridge pixels outside the leaf rect','note':'door_open_00 = closed (original door + kid sticker). Pocket door slides LEFT into the wall. RGBA, alpha=rounded opening mask.',
 'doorway_threshold_y':219,'walk_in_point':[X+W//2,225],'walk_in_note':'character feet baseline just in front of the threshold; enter/exit through doorway centre x',
 'walkable_spot_inside_room':[X+W//2+20,259]},open(D+'door.json','w'),indent=1)
# full-size + indexed
pal=Image.open('/workspace/bridge/bridge_v5_00_256.png')
full=[]
for i,f in enumerate(frames):
    b=br.copy(); b.alpha_composite(f,(X,Y)); full.append(b)
    b.convert('RGB').quantize(palette=pal,dither=Image.Dither.FLOYDSTEINBERG).save(D+f'bridge_door_open_{i:02d}_256.png')
# sheet
Z=3; sh=Image.new('RGBA',(8*(W*Z+6)+6,H*Z+30),(58,60,72,255)); dr=ImageDraw.Draw(sh)
for i,f in enumerate(frames):
    bg=br.crop((X,Y,X+W,Y+H)); bg.alpha_composite(f); sh.alpha_composite(bg.resize((W*Z,H*Z),Image.NEAREST),(6+i*(W*Z+6),6)); dr.text((8+i*(W*Z+6),H*Z+10),f'open_{i:02d}',fill=(230,230,240,255))
sh.save(D+'door_anim_sheet.png')
# preview strip with dad scale check
dad=Image.open('/workspace/chars/dad_idle_v3.png').convert('RGBA'); bb=dad.getbbox(); dad=dad.crop(bb); s=104/dad.height; dad=dad.resize((round(dad.width*s),104),Image.LANCZOS)
cx0,cy0,cx1,cy1=X-40,Y-15,X+W+40,Y+H+30
tiles=[]
for i in (0,2,4,7):
    b=full[i].copy()
    if i==7: b.alpha_composite(dad,(X+W//2-dad.width//2,225-104))
    tiles.append(b.crop((cx0,cy0,cx1,cy1)).resize(((cx1-cx0)*3,(cy1-cy0)*3),Image.NEAREST))
st=Image.new('RGBA',(sum(t.width for t in tiles)+6*5,tiles[0].height+12),(58,60,72,255)); x=6
for t in tiles: st.alpha_composite(t,(x,6)); x+=t.width+6
st.save(D+'door_preview_strip.png')
seqf=[full[i].crop((cx0,cy0,cx1,cy1)).resize(((cx1-cx0)*2,(cy1-cy0)*2),Image.NEAREST).convert('RGB') for i in list(range(8))+[7]*6+list(range(7,-1,-1))+[0]*6]
seqf[0].save(D+'door_open.gif',save_all=True,append_images=seqf[1:],duration=83,loop=0)
print(dad.size)
