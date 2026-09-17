const DEFAULT_LISTINGS=[
 {id:'1053',type:'استراحة',city:'عنيزة',district:'حي الفرعية',deal:'إيجار',price:5450,period:'كل 6 أشهر',features:['عداد كهرباء مستقل','كراج'],status:'متاح',featured:true,img:'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=85'},
 {id:'1061',type:'شقة علوية',city:'عنيزة',district:'حي شيخة',deal:'إيجار',price:10450,period:'كل 6 أشهر',features:['مدخل مستقل','مطبخ ومكيفات راكبة'],status:'متاح',featured:true,img:'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1000&q=85'},
 {id:'1023',type:'استراحة',city:'عنيزة',district:'حي الزاهر',deal:'إيجار',price:7750,period:'كل 6 أشهر',features:['كراج','عداد كهرباء مستقل'],status:'متاح',featured:true,img:'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=85'},
 {id:'1056',type:'شقة علوية',city:'عنيزة',district:'حي البديعة',deal:'إيجار',price:9950,period:'كل 6 أشهر',features:['مدخل مستقل','مكيفات راكبة'],status:'متاح',featured:true,img:'https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1000&q=85'},
 {id:'1042',type:'فيلا',city:'عنيزة',district:'حي اليمامة',deal:'إيجار',price:30450,period:'كل 6 أشهر',features:['موقع مميز','المطبخ والمكيفات راكبة'],status:'متاح',featured:true,img:'https://images.unsplash.com/photo-1600573472592-401b489a3cdc?auto=format&fit=crop&w=1000&q=85'},
 {id:'1034',type:'مكتب تجاري',city:'عنيزة',district:'طريق عمر بن الخطاب',deal:'إيجار',price:6450,period:'كل 6 أشهر',features:['عداد كهرباء مستقل','شارع تجاري مميز'],status:'متاح',featured:true,img:'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=85'}
];
const STORAGE_KEY='alawss_listings_v1';
function loadListings(){
  try{const saved=JSON.parse(localStorage.getItem(STORAGE_KEY));if(Array.isArray(saved))return saved;}catch(e){}
  localStorage.setItem(STORAGE_KEY,JSON.stringify(DEFAULT_LISTINGS));
  return [...DEFAULT_LISTINGS];
}
let listings=loadListings();
const grid=document.getElementById('listingGrid');
function money(n){return new Intl.NumberFormat('ar-SA').format(Number(n)||0)}
function visibleListings(){return listings.filter(x=>x.status!=='غير متاح')}
function render(items){
  if(!items.length){grid.innerHTML='<div class="empty-state"><strong>لا توجد نتائج مطابقة</strong><span>جرّب تغيير المدينة أو نوع العقار أو السعر.</span></div>';return}
  grid.innerHTML=items.map(x=>`<article class="listing-card"><div class="listing-image" style="background-image:url('${x.img}')"><span class="listing-badge">${x.deal}</span><span class="listing-no">إعلان ${x.id}</span></div><div class="listing-body"><div class="listing-top"><div><h3>${x.type}</h3><span>${x.district} · ${x.city}</span></div></div><div class="listing-price"><strong>${money(x.price)} ر.س</strong><small>${x.period||''}</small></div><div class="listing-features">${(x.features||[]).slice(0,3).map(f=>`<span>${f}</span>`).join('')}</div><button class="card-action" data-open="${x.id}">عرض التفاصيل</button></div></article>`).join('');bindOpen()
}
render(visibleListings().filter(x=>x.featured!==false).slice(0,6));
document.getElementById('propertySearch').addEventListener('submit',e=>{e.preventDefault();const city=document.getElementById('city').value,type=document.getElementById('type').value,deal=document.getElementById('deal').value,price=document.getElementById('price').value;const out=visibleListings().filter(x=>(city==='all'||x.city===city)&&(type==='all'||x.type===type)&&(deal==='all'||x.deal===deal)&&(price==='all'||Number(x.price)<=Number(price)));render(out);document.getElementById('listings').scrollIntoView({behavior:'smooth'})});
document.getElementById('resetFilters').addEventListener('click',()=>{document.getElementById('propertySearch').reset();render(visibleListings())});
const modal=document.getElementById('listingModal');
function openListing(id){const x=listings.find(v=>String(v.id)===String(id))||listings[0];if(!x)return;document.getElementById('modalImage').style.backgroundImage=`url('${x.img}')`;document.getElementById('modalTitle').textContent=`${x.type} — ${x.city}`;document.getElementById('modalTags').innerHTML=`<span>${x.deal}</span><span>${x.district}</span><span>إعلان ${x.id}</span>`;document.getElementById('modalPrice').textContent=`${money(x.price)} ر.س${x.period?' — '+x.period:''}`;document.getElementById('modalFeatures').innerHTML=(x.features||[]).map(f=>`<li>${f}</li>`).join('');const msg=`مرحبًا، أرغب في الاستفسار عن الإعلان رقم ${x.id} — ${x.type} في ${x.city} — السعر ${money(x.price)} ر.س.`;document.getElementById('modalWhatsApp').href=`https://wa.me/966920010307?text=${encodeURIComponent(msg)}`;modal.classList.add('open');modal.setAttribute('aria-hidden','false');document.body.style.overflow='hidden'}
function bindOpen(){document.querySelectorAll('[data-open]').forEach(b=>b.onclick=()=>openListing(b.dataset.open))}bindOpen();
document.querySelectorAll('[data-close]').forEach(el=>el.addEventListener('click',()=>{modal.classList.remove('open');modal.setAttribute('aria-hidden','true');document.body.style.overflow=''}));
document.getElementById('ownerForm').addEventListener('submit',e=>{e.preventDefault();const fd=new FormData(e.currentTarget);const msg=`مرحبًا، لدي عقار وأرغب في التواصل مع الأوس العقارية.\nنوع العقار: ${fd.get('propertyType')}\nالمدينة: ${fd.get('ownerCity')}\nالخدمة المطلوبة: ${fd.get('service')}\nرقم التواصل: ${fd.get('phone')}`;window.open(`https://wa.me/966920010307?text=${encodeURIComponent(msg)}`,'_blank')});
const mt=document.querySelector('.menu-toggle'),nav=document.querySelector('.main-nav');mt.addEventListener('click',()=>{const open=nav.classList.toggle('open');mt.setAttribute('aria-expanded',open)});nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));
window.addEventListener('storage',e=>{if(e.key===STORAGE_KEY){listings=loadListings();render(visibleListings().filter(x=>x.featured!==false).slice(0,6));}});
