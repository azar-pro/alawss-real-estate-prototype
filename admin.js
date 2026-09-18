const STORAGE_KEY='alawss_listings_v1';
const COUNTER_KEY='alawss_last_listing_id_v1';
const DEFAULT_IMAGE='https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1000&q=80';
const DEFAULT_LISTINGS=[
 {id:'1053',type:'استراحة',city:'عنيزة',district:'حي الفرعية',deal:'إيجار',price:5450,period:'كل 6 أشهر',features:['عداد كهرباء مستقل','كراج'],status:'متاح',featured:true,img:'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=85'},
 {id:'1061',type:'شقة',city:'عنيزة',district:'حي شيخة',deal:'إيجار',price:10450,period:'كل 6 أشهر',features:['مدخل مستقل','مطبخ ومكيفات راكبة'],status:'متاح',featured:true,img:'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1000&q=85'},
 {id:'1023',type:'استراحة',city:'عنيزة',district:'حي الزاهر',deal:'إيجار',price:7750,period:'كل 6 أشهر',features:['كراج','عداد كهرباء مستقل'],status:'متاح',featured:true,img:'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=85'},
 {id:'1056',type:'شقة',city:'عنيزة',district:'حي البديعة',deal:'إيجار',price:9950,period:'كل 6 أشهر',features:['مدخل مستقل','مكيفات راكبة'],status:'متاح',featured:true,img:'https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1000&q=85'},
 {id:'1042',type:'فيلا',city:'عنيزة',district:'حي اليمامة',deal:'إيجار',price:30450,period:'كل 6 أشهر',features:['موقع مميز','المطبخ والمكيفات راكبة'],status:'متاح',featured:true,img:'https://images.unsplash.com/photo-1600573472592-401b489a3cdc?auto=format&fit=crop&w=1000&q=85'},
 {id:'1034',type:'مكتب',city:'عنيزة',district:'طريق عمر بن الخطاب',deal:'إيجار',price:6450,period:'كل 6 أشهر',features:['عداد كهرباء مستقل','شارع تجاري مميز'],status:'متاح',featured:true,img:'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=85'}
];

function normalizeStatus(status){return status==='غير متاح'?'موقوف':(status||'متاح')}
function normalizeListing(x){return {...x,status:normalizeStatus(x.status),images:Array.isArray(x.images)&&x.images.length?x.images:(x.img?[x.img]:[])}}
function read(){
  try{
    const v=JSON.parse(localStorage.getItem(STORAGE_KEY));
    if(Array.isArray(v)){const normalized=v.map(normalizeListing);localStorage.setItem(STORAGE_KEY,JSON.stringify(normalized));return normalized}
  }catch(e){}
  const initial=DEFAULT_LISTINGS.map(normalizeListing);
  localStorage.setItem(STORAGE_KEY,JSON.stringify(initial));
  return initial
}
function save(){localStorage.setItem(STORAGE_KEY,JSON.stringify(listings))}
function getStoredCounter(){const raw=Number.parseInt(localStorage.getItem(COUNTER_KEY)||'',10);return Number.isFinite(raw)?raw:null}
function getHighestListingId(){const nums=listings.map(x=>Number.parseInt(String(x.id).replace(/\D/g,''),10)).filter(Number.isFinite);return nums.length?Math.max(...nums):0}
function ensureCounter(){const value=Math.max(getHighestListingId(),getStoredCounter()??0);localStorage.setItem(COUNTER_KEY,String(value));return value}
function reserveNextListingId(){const next=ensureCounter()+1;localStorage.setItem(COUNTER_KEY,String(next));return String(next)}
function getNextListingId(){return String(ensureCounter()+1)}

let listings=read();
ensureCounter();
let draftImages=[];
let mainImageIndex=0;

const rows=document.getElementById('propertyRows');
const stats=document.getElementById('stats');
const drawer=document.getElementById('propertyDrawer');
const form=document.getElementById('propertyForm');
const search=document.getElementById('adminSearch');
const statusFilter=document.getElementById('statusFilter');
const uploadInput=document.getElementById('imageUpload');
const thumbs=document.getElementById('imageThumbnails');
const dropzone=document.querySelector('.image-dropzone');
const statusSelect=document.getElementById('propertyStatus');
const statusPreview=document.getElementById('statusPreview');
const money=n=>new Intl.NumberFormat('ar-SA').format(Number(n)||0);

function toast(msg){
  const t=document.getElementById('toast');
  t.textContent=msg;
  t.classList.add('show');
  clearTimeout(window.__toast);
  window.__toast=setTimeout(()=>t.classList.remove('show'),3600)
}
function statusClass(s){return s==='متاح'?'available':s==='مؤجر'?'rented':'off'}
function statusBadge(s){return `<span class="status ${statusClass(s)}">${s}</span>`}
function updateStatusPreview(){
  const s=statusSelect.value;
  statusPreview.className=`status-preview status ${statusClass(s)}`;
  statusPreview.innerHTML=`<i></i>${s}`
}
function renderStats(){
  const total=listings.length;
  const available=listings.filter(x=>x.status==='متاح').length;
  const rented=listings.filter(x=>x.status==='مؤجر').length;
  const stopped=listings.filter(x=>x.status==='موقوف').length;
  const featured=listings.filter(x=>x.featured).length;
  stats.innerHTML=`<article class="stat accent"><small>إجمالي العقارات</small><strong>${total}</strong></article><article class="stat"><small>متاح</small><strong>${available}</strong></article><article class="stat"><small>مؤجر</small><strong>${rented}</strong></article><article class="stat"><small>موقوف</small><strong>${stopped}</strong></article><article class="stat"><small>مميز في الرئيسية</small><strong>${featured}</strong></article>`
}
function filtered(){
  const q=search.value.trim().toLowerCase(),s=statusFilter.value;
  return listings.filter(x=>(s==='all'||x.status===s)&&(!q||[x.id,x.type,x.city,x.district,x.area,x.rooms].join(' ').toLowerCase().includes(q)))
}
function renderRows(){
  const data=filtered();
  document.getElementById('propertyCount').textContent=`${data.length} عقار`;
  document.getElementById('adminEmpty').hidden=!!data.length;
  rows.innerHTML=data.map(x=>`<tr>
    <td><div class="property-cell"><img src="${x.img||x.images?.[0]||DEFAULT_IMAGE}" alt=""><span><strong>${x.type}</strong><small>${x.deal}${x.area?` · ${x.area} م²`:''}</small></span></div></td>
    <td>#${x.id}</td>
    <td>${x.district}<br><small>${x.city}</small></td>
    <td><strong>${money(x.price)} ر.س</strong><br><small>${x.period||''}</small></td>
    <td>${statusBadge(x.status)}</td>
    <td><span class="feature-dot ${x.featured?'on':''}" title="${x.featured?'مميز':'غير مميز'}"></span></td>
    <td><div class="row-actions"><button data-edit="${x.id}">تعديل</button><button data-toggle="${x.id}">${x.status==='موقوف'?'تفعيل':'إيقاف'}</button><button class="danger" data-delete="${x.id}">حذف</button></div></td>
  </tr>`).join('');
  bindActions()
}
function render(){renderStats();renderRows()}

function renderImageThumbs(){
  if(!draftImages.length){thumbs.innerHTML='<div class="admin-empty">لم يتم اختيار صور بعد.</div>';return}
  if(mainImageIndex>=draftImages.length)mainImageIndex=0;
  thumbs.innerHTML=draftImages.map((img,i)=>`<div class="image-thumb">
    <img src="${img.src}" alt="">
    <div class="image-thumb-meta">
      <span class="image-thumb-name" title="${img.name||'صورة العقار'}">${img.name||`صورة ${i+1}`}</span>
      <div class="image-thumb-actions">
        <button type="button" class="image-main-btn ${i===mainImageIndex?'active':''}" data-main-image="${i}">${i===mainImageIndex?'الرئيسية':'اجعلها رئيسية'}</button>
        <button type="button" class="image-remove-btn" data-remove-image="${i}">حذف</button>
      </div>
    </div>
  </div>`).join('');
  thumbs.querySelectorAll('[data-main-image]').forEach(b=>b.onclick=()=>{mainImageIndex=Number(b.dataset.mainImage);renderImageThumbs()});
  thumbs.querySelectorAll('[data-remove-image]').forEach(b=>b.onclick=()=>{const i=Number(b.dataset.removeImage);draftImages.splice(i,1);if(mainImageIndex===i)mainImageIndex=0;else if(mainImageIndex>i)mainImageIndex--;renderImageThumbs()})
}
function setDraftFromListing(item){
  const sources=(Array.isArray(item?.images)&&item.images.length?item.images:(item?.img?[item.img]:[]));
  draftImages=sources.map((src,i)=>({src,name:`صورة ${i+1}`,existing:true}));
  const current=item?.img;
  mainImageIndex=Math.max(0,sources.findIndex(src=>src===current));
  renderImageThumbs()
}
function compressFile(file){
  return new Promise((resolve,reject)=>{
    if(!/^image\/(jpeg|png|webp)$/.test(file.type)){reject(new Error('صيغة غير مدعومة'));return}
    const reader=new FileReader();
    reader.onerror=()=>reject(new Error('تعذر قراءة الصورة'));
    reader.onload=()=>{
      const img=new Image();
      img.onerror=()=>reject(new Error('تعذر معالجة الصورة'));
      img.onload=()=>{
        const max=1400,scale=Math.min(1,max/Math.max(img.width,img.height));
        const canvas=document.createElement('canvas');
        canvas.width=Math.round(img.width*scale);canvas.height=Math.round(img.height*scale);
        const ctx=canvas.getContext('2d');ctx.drawImage(img,0,0,canvas.width,canvas.height);
        const mime=file.type==='image/png'?'image/webp':file.type;
        const data=canvas.toDataURL(mime,0.78);
        resolve({src:data,name:file.name,existing:false})
      };
      img.src=reader.result
    };
    reader.readAsDataURL(file)
  })
}
async function addFiles(files){
  const accepted=[...files].filter(f=>/^image\/(jpeg|png|webp)$/.test(f.type));
  if(!accepted.length){toast('اختر صور JPG أو PNG أو WEBP');return}
  for(const file of accepted){
    try{draftImages.push(await compressFile(file))}catch(e){toast(e.message||'تعذر إضافة إحدى الصور')}
  }
  if(draftImages.length>10){draftImages=draftImages.slice(0,10);toast('تم الاحتفاظ بأول 10 صور فقط')}
  renderImageThumbs()
}

function openDrawer(item=null){
  form.reset();
  form.editingId.value=item?item.id:'';
  document.getElementById('drawerTitle').textContent=item?'تعديل العقار':'إضافة عقار';
  if(item){
    for(const [k,v] of Object.entries(item)){
      if(['features','featured','img','images','id'].includes(k))continue;
      if(form.elements[k])form.elements[k].value=v??''
    }
    form.elements.id.value=item.id;
    form.elements.status.value=normalizeStatus(item.status);
    form.elements.features.value=(item.features||[]).join('\n');
    form.elements.img.value=(item.img&&/^https?:/i.test(item.img))?item.img:'';
    form.elements.featured.checked=!!item.featured;
    setDraftFromListing(item)
  }else{
    form.elements.id.value=getNextListingId();
    form.elements.status.value='متاح';
    form.elements.featured.checked=true;
    draftImages=[];mainImageIndex=0;renderImageThumbs()
  }
  updateStatusPreview();
  drawer.classList.add('open');
  drawer.setAttribute('aria-hidden','false');
  document.body.style.overflow='hidden'
}
function closeDrawer(){drawer.classList.remove('open');drawer.setAttribute('aria-hidden','true');document.body.style.overflow=''}

document.getElementById('addPropertyBtn').onclick=()=>openDrawer();
document.querySelectorAll('[data-close-drawer]').forEach(b=>b.onclick=closeDrawer);
search.oninput=renderRows;
statusFilter.onchange=renderRows;
statusSelect.onchange=updateStatusPreview;

uploadInput.addEventListener('change',e=>addFiles(e.target.files));
['dragenter','dragover'].forEach(evt=>dropzone.addEventListener(evt,e=>{e.preventDefault();dropzone.classList.add('dragover')}));
['dragleave','drop'].forEach(evt=>dropzone.addEventListener(evt,e=>{e.preventDefault();dropzone.classList.remove('dragover')}));
dropzone.addEventListener('drop',e=>addFiles(e.dataTransfer.files));

form.addEventListener('submit',e=>{
  e.preventDefault();
  const fd=new FormData(form),editing=fd.get('editingId');
  const old=listings.find(x=>String(x.id)===String(editing));
  const finalId=editing?String(editing):reserveNextListingId();
  const external=fd.get('img').trim();
  const images=draftImages.map(x=>x.src);
  const mainImage=images[mainImageIndex]||external||old?.img||DEFAULT_IMAGE;
  if(!images.length&&external)images.push(external);

  const item={
    id:finalId,
    type:fd.get('type'),
    city:fd.get('city'),
    district:fd.get('district').trim(),
    deal:fd.get('deal'),
    area:fd.get('area')?Number(fd.get('area')):null,
    rooms:fd.get('rooms')?Number(fd.get('rooms')):null,
    bathrooms:fd.get('bathrooms')?Number(fd.get('bathrooms')):null,
    price:Number(fd.get('price')),
    period:fd.get('period').trim(),
    features:fd.get('features').split('\n').map(s=>s.trim()).filter(Boolean),
    status:normalizeStatus(fd.get('status')),
    featured:fd.get('featured')==='on',
    img:mainImage,
    images
  };

  if(editing)listings=listings.map(x=>String(x.id)===String(editing)?item:x);
  else listings.unshift(item);

  try{
    save()
  }catch(err){
    if(err?.name==='QuotaExceededError'){toast('الصور كبيرة على التخزين المحلي؛ قلّل عدد الصور أو حجمها');return}
    throw err
  }
  render();
  closeDrawer();
  toast(editing?'تم تحديث العقار بنجاح':'تم حفظ العقار وظهر في الموقع')
});

function bindActions(){
  document.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>openDrawer(listings.find(x=>String(x.id)===b.dataset.edit)));
  document.querySelectorAll('[data-toggle]').forEach(b=>b.onclick=()=>{
    const x=listings.find(v=>String(v.id)===b.dataset.toggle);if(!x)return;
    x.status=x.status==='موقوف'?'متاح':'موقوف';
    save();render();toast(x.status==='متاح'?'تم تفعيل العقار':'تم إيقاف العقار')
  });
  document.querySelectorAll('[data-delete]').forEach(b=>b.onclick=()=>{
    const x=listings.find(v=>String(v.id)===b.dataset.delete);if(!x)return;
    if(confirm(`حذف الإعلان رقم ${x.id}؟`)){listings=listings.filter(v=>String(v.id)!==String(x.id));save();render();toast('تم حذف العقار')}
  })
}
render();
updateStatusPreview();
renderImageThumbs();
