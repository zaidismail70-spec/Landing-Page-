const $=(s,c=document)=>c.querySelector(s),$$=(s,c=document)=>[...c.querySelectorAll(s)];
const content={
  ar:{
    pageTitle:"بلازما للعناية بالشعر | Betolla",
    metaDescription:"روتين بلازما المتكامل للعناية بالشعر من Betolla. اختاري البكج المناسب واطلبيه مباشرة عبر واتساب.",
    navPackages:"البكجات",navProducts:"المنتجات",navRoutine:"برنامجك",orderNow:"اطلبي الآن",heroEyebrow:"روتين متكامل لشعر أكثر نعومة وحيوية",heroLine1:"شعرك يستحق",heroLine2:"عناية تُرى وتُحس",heroText:"مجموعة بلازما تجمع التنظيف اللطيف، الترطيب العميق والعناية اليومية في خطوات واضحة وسهلة.",discover:"اكتشفي البكجات",seeRoutine:"شاهدي برنامج الاستخدام",deliveryAll:"توصيل لكل الأردن",cashDelivery:"الدفع عند الاستلام",sulfateFree:"عناية لطيفة بالشعر",completeSet:"البكج الكامل",jod:"د.أ",steps:"خطوات متكاملة",benefitClean:"تنظيف لطيف",benefitCleanText:"يحافظ على رطوبة الشعر الطبيعية",benefitMoisture:"ترطيب متوازن",benefitMoistureText:"للشعر الجاف والمتعب",benefitShine:"نعومة ولمعان",benefitShineText:"روتين يسهل التصفيف اليومي",chooseRoutine:"اختاري روتينك",packagesTitle:"بكجان، وهدف واحد:<br>شعر تحبينه كل يوم",bestValue:"الأكثر توفيرًا",completeTitle:"بكج العناية الكاملة",completeDesc:"روتين من أربع خطوات للتنظيف، الترطيب، العناية واللمسة النهائية.",shampoo:"شامبو بلازما",conditioner:"بلسم بلازما",mask:"ماسك بلازما",serum:"سيروم بلازما",chooseComplete:"اختاري البكج الكامل",duoTitle:"بكج العناية اليومية",duoDesc:"خطوتان أساسيتان لنظافة لطيفة وترطيب يساعد على تقليل التشابك.",chooseDuo:"اختاري البكج الثنائي",deliveryNote:"التوصيل 3 دنانير لجميع محافظات الأردن — الدفع عند الاستلام",insideBottle:"داخل كل عبوة",productsTitle:"اعرفي كل خطوة في روتينك",productsLead:"اضغطي على المنتج لتشاهدي مكوناته، فائدته وطريقة استخدامه.",ingredients:"المكونات المميزة",whySpecial:"لماذا هي مميزة؟",howUse:"طريقة الاستخدام",weeklyPlan:"برنامجك الأسبوعي",routineTitle:"اختاري البكج، ونحن نرتب لكِ الأسبوع",routineLead:"جدول مقترح: أيام الغسيل والعناية والراحة، مع ترتيب المنتجات بكل وضوح. عدّليه حسب حاجة شعرك وتعليمات العبوة.",completeShort:"البكج الرباعي",duoShort:"البكج الثنائي",hairNote:"للشعر الجاف: اغسليه 3–4 مرات أسبوعيًا. للشعر الدهني: استخدمي الشامبو حسب الحاجة، وضعي البلسم والماسك بعيدًا عن الفروة.",easyOrder:"طلبك بخطوات بسيطة",orderTitle:"اختاري، أكّدي، وكمّلي طلبك على واتساب",orderLead:"بعد الضغط على «إرسال الطلب» ستفتح رسالة واتساب جاهزة بكل التفاصيل.",yourChoice:"اختيارك",delivery:"التوصيل",total:"الإجمالي",selectPackage:"اختاري البكج",completeOption:"البكج الرباعي — 30 د.أ",duoOption:"البكج الثنائي — 20 د.أ",fullName:"الاسم الكامل",phone:"رقم الهاتف",governorate:"المحافظة",choose:"اختاري",area:"المنطقة والعنوان",quantity:"الكمية",notes:"ملاحظات ",optional:"(اختياري)",confirmOrder:"تأكدت من معلومات الطلب وأرغب بإرساله عبر واتساب.",sendWhatsapp:"إرسال الطلب عبر واتساب",footerText:"جمال • أمان • ثقة",openMenu:"فتح القائمة",closeMenu:"إغلاق القائمة"
  },
  en:{
    pageTitle:"PLASMA Hair Care | Betolla",
    metaDescription:"Betolla's complete PLASMA hair care routine. Choose your set and order directly on WhatsApp.",
    navPackages:"Sets",navProducts:"Products",navRoutine:"Your plan",orderNow:"Order now",heroEyebrow:"A complete routine for softer, healthier-looking hair",heroLine1:"Your hair deserves",heroLine2:"care you can feel",heroText:"The PLASMA collection brings gentle cleansing, deep moisture and daily care together in simple, clear steps.",discover:"Explore the sets",seeRoutine:"See the weekly plan",deliveryAll:"Delivery across Jordan",cashDelivery:"Cash on delivery",sulfateFree:"Gentle hair care",completeSet:"Complete set",jod:"JOD",steps:"complete steps",benefitClean:"Gentle cleanse",benefitCleanText:"Helps preserve hair's natural moisture",benefitMoisture:"Balanced moisture",benefitMoistureText:"For dry and tired hair",benefitShine:"Softness & shine",benefitShineText:"A routine that makes styling easier",chooseRoutine:"Choose your routine",packagesTitle:"Two sets, one goal:<br>hair you love every day",bestValue:"Best value",completeTitle:"Complete care set",completeDesc:"A four-step routine for cleansing, conditioning, treatment and the finishing touch.",shampoo:"PLASMA Shampoo",conditioner:"PLASMA Conditioner",mask:"PLASMA Hair Mask",serum:"PLASMA Serum",chooseComplete:"Choose complete set",duoTitle:"Daily care duo",duoDesc:"Two essential steps for gentle cleansing and moisture that helps reduce tangles.",chooseDuo:"Choose duo set",deliveryNote:"3 JOD delivery across Jordan — cash on delivery",insideBottle:"Inside every bottle",productsTitle:"Know every step of your routine",productsLead:"Choose a product to see its ingredients, purpose and directions.",ingredients:"Hero ingredients",whySpecial:"Why it stands out",howUse:"How to use",weeklyPlan:"Your weekly plan",routineTitle:"Choose a set, and we'll organize your week",routineLead:"A simple plan that helps you use each product in the right order. Adjust it to your hair's needs.",completeShort:"Complete set",duoShort:"Duo set",hairNote:"Dry hair: wash 3–4 times weekly. Oily hair: shampoo as needed, and keep conditioner and mask away from the scalp.",easyOrder:"A simple order",orderTitle:"Choose, confirm, and finish on WhatsApp",orderLead:"Tap “Send order” to open a ready-to-send WhatsApp message with all your details.",yourChoice:"Your choice",delivery:"Delivery",total:"Total",selectPackage:"Choose your set",completeOption:"Complete set — 30 JOD",duoOption:"Duo set — 20 JOD",fullName:"Full name",phone:"Phone number",governorate:"Governorate",choose:"Choose",area:"Area & address",quantity:"Quantity",notes:"Notes ",optional:"(optional)",confirmOrder:"I checked my order details and want to send them via WhatsApp.",sendWhatsapp:"Send order on WhatsApp",footerText:"Beauty • Safety • Trust",openMenu:"Open menu",closeMenu:"Close menu"
  }
};
const products={
  shampoo:{image:"assets/shampoo-editorial.webp",ar:{name:"شامبو بلازما",desc:"ينظف الشعر والفروة بلطف دون إزالة الرطوبة الطبيعية، ويترك الشعر أكثر نعومة ولمعانًا.",ingredients:["زيت جوز الهند","زيت الخروع المهدرج","زيت بذور دوار الشمس","كيراتين متحلل","فيتامين B5"],benefit:"تنظيف لطيف يساعد على الحد من الجفاف، مع مكونات تدعم نعومة الشعر ولمعانه وسهولة تصفيفه.",use:"بللي الشعر، ضعي كمية صغيرة على الفروة ودلكي لمدة دقيقة ثم اشطفي جيدًا. 3–4 مرات أسبوعيًا للشعر الجاف، أو حسب الحاجة للشعر الدهني."},en:{name:"PLASMA Shampoo",desc:"Gently cleanses hair and scalp without stripping natural moisture, leaving hair softer and shinier.",ingredients:["Coconut oil","Hydrogenated castor oil","Sunflower seed oil","Hydrolyzed keratin","Vitamin B5"],benefit:"A gentle cleanse with ingredients that support softness, shine and easier styling.",use:"Apply a small amount to wet scalp, massage for one minute, then rinse well. Use 3–4 times weekly for dry hair or as needed for oily hair."}},
  conditioner:{image:"assets/conditioner-editorial.webp",ar:{name:"بلسم بلازما",desc:"بلسم مغذٍ يرطب الشعر الجاف أو التالف ويمنحه ملمسًا أكثر نعومة ولمعانًا.",ingredients:["زيت الأرجان","فيتامين B5","بروتين الكولاجين"],benefit:"يساعد على ترطيب الأطراف، تقليل التشابك وتسهيل التمشيط دون إثقال الشعر.",use:"بعد الشامبو، ضعي كمية صغيرة على الأطراف الرطبة، اتركيها 5 دقائق ثم اشطفي جيدًا. استخدميه مع كل غسلة حسب حاجة الشعر."},en:{name:"PLASMA Conditioner",desc:"A nourishing conditioner that moisturizes dry or damaged hair for a softer, shinier feel.",ingredients:["Argan oil","Vitamin B5","Collagen protein"],benefit:"Helps moisturize the lengths, reduce tangles and make combing easier without weighing hair down.",use:"After shampooing, apply a small amount to damp lengths, leave for 5 minutes, then rinse well. Use with each wash as needed."}},
  mask:{image:"assets/mask-editorial.webp",ar:{name:"ماسك بلازما",desc:"ماسك عناية غني للشعر الجاف أو التالف، يمنحه ترطيبًا ونعومة ولمعانًا.",ingredients:["مستخلص الخيزران","زيت الأرجان","زيت المكاديميا","زبدة الشيا","فيتامينا B5 وE"],benefit:"مزيج مغذٍ يدعم مرونة الشعرة ونعومتها، ويمنح الشعر الجاف عناية أسبوعية أعمق.",use:"على شعر نظيف ورطب، وزعيه من الأطراف للأعلى. ابتعدي 3 سم عن الفروة إذا كانت دهنية. اتركيه 15–20 دقيقة ثم اشطفيه. مرة أسبوعيًا."},en:{name:"PLASMA Hair Mask",desc:"A rich treatment mask for dry or damaged hair that adds moisture, softness and shine.",ingredients:["Bamboo extract","Argan oil","Macadamia oil","Shea butter","Vitamins B5 & E"],benefit:"A nourishing blend that supports hair flexibility and softness, giving dry hair deeper weekly care.",use:"Apply to clean, damp hair from lengths upward. Keep 3 cm away from an oily scalp. Leave for 15–20 minutes, then rinse. Use weekly."}},
  serum:{image:"assets/serum-editorial.webp",ar:{name:"سيروم بلازما",desc:"سيروم خفيف لأطوال الشعر الجاف أو التالف يمنح لمعانًا ونعومة دون إحساس ثقيل.",ingredients:["زيت الأرجان","زيت المكاديميا","خلاصة الألوفيرا","بروتين الحرير"],benefit:"يساعد على حفظ الرطوبة وتقليل مظهر التقصف، ويمنح الأطراف لمسة ناعمة ولمعانًا طبيعيًا.",use:"وزعي 2–4 قطرات من منتصف الشعر الرطب أو الجاف إلى الأطراف، بعيدًا عن الفروة. يُترك دون شطف، يوميًا للجاف أو حسب الحاجة."},en:{name:"PLASMA Serum",desc:"A lightweight serum for dry or damaged lengths, adding shine and softness without a heavy feel.",ingredients:["Argan oil","Macadamia oil","Aloe vera extract","Silk protein"],benefit:"Helps retain moisture, soften the look of split ends and give lengths a naturally polished finish.",use:"Apply 2–4 drops from mid-lengths to ends on damp or dry hair, avoiding the scalp. Leave in; use daily for dry hair or as needed."}}
};
const plans={
  complete:{ar:[["السبت","شامبو ← بلسم ← سيروم"],["الأحد","سيروم خفيف على الأطراف"],["الاثنين","شامبو ← بلسم ← سيروم"],["الثلاثاء","راحة أو سيروم حسب الحاجة"],["الأربعاء","شامبو ← ماسك ← سيروم"],["الخميس","راحة أو سيروم على الأطراف"],["الجمعة","شامبو ← بلسم ← سيروم"]],en:[["Saturday","Shampoo → Conditioner → Serum"],["Sunday","Light serum on the ends"],["Monday","Shampoo → Conditioner → Serum"],["Tuesday","Rest or serum as needed"],["Wednesday","Shampoo → Mask → Serum"],["Thursday","Rest or serum on the ends"],["Friday","Shampoo → Conditioner → Serum"]]},
  duo:{ar:[["السبت","شامبو ← بلسم"],["الأحد","راحة"],["الاثنين","شامبو ← بلسم"],["الثلاثاء","راحة"],["الأربعاء","شامبو ← بلسم"],["الخميس","راحة"],["الجمعة","شامبو ← بلسم حسب الحاجة"]],en:[["Saturday","Shampoo → Conditioner"],["Sunday","Rest"],["Monday","Shampoo → Conditioner"],["Tuesday","Rest"],["Wednesday","Shampoo → Conditioner"],["Thursday","Rest"],["Friday","Shampoo → Conditioner as needed"]]}
};
function detectInitialLanguage(){
  const fromUrl=new URLSearchParams(location.search).get("lang");
  if(fromUrl==="ar"||fromUrl==="en")return fromUrl;
  try{
    const stored=localStorage.getItem("betolla-lang");
    if(stored==="ar"||stored==="en")return stored;
  }catch(e){}
  return "ar";
}
let lang=detectInitialLanguage(),activeProduct="shampoo",activePlan="complete";
function setLanguage(next,options){
  options=options||{};
  lang=next;
  document.documentElement.lang=lang;
  document.documentElement.dir=lang==="ar"?"rtl":"ltr";
  $("#langToggle").textContent=lang==="ar"?"EN":"ع";
  $$('[data-i18n]').forEach(el=>{const v=content[lang][el.dataset.i18n];if(v!==undefined)el.innerHTML=v});
  $$('[data-placeholder-ar]').forEach(el=>el.placeholder=el.dataset[lang==="ar"?"placeholderAr":"placeholderEn"]);
  document.title=content[lang].pageTitle;
  const desc=content[lang].metaDescription;
  ["metaDescription","ogTitle","ogDescription","twitterTitle","twitterDescription"].forEach(id=>{
    const el=document.getElementById(id);
    if(!el)return;
    if(id==="ogTitle"||id==="twitterTitle")el.setAttribute("content",content[lang].pageTitle);
    else el.setAttribute("content",desc);
  });
  const toggle=$("#navToggle");
  if(toggle)toggle.setAttribute("aria-label",toggle.getAttribute("aria-expanded")==="true"?content[lang].closeMenu:content[lang].openMenu);
  try{localStorage.setItem("betolla-lang",lang);}catch(e){}
  if(!options.skipUrlUpdate){
    const url=new URL(location.href);
    url.searchParams.set("lang",lang);
    history.replaceState(null,"",url);
  }
  renderProduct(activeProduct);renderPlan(activePlan);updateOrder();syncHero();
}
function renderProduct(key){activeProduct=key;const index=["shampoo","conditioner","mask","serum"].indexOf(key)+1,p=products[key][lang];$("#productImage").src=products[key].image;$("#productImage").alt=p.name;$("#productImage").style.animation="none";requestAnimationFrame(()=>$("#productImage").style.animation="productIn .55s ease");$("#productStep").textContent=`${lang === "ar" ? "الخطوة" : "STEP"} ${index}`;$("#productName").textContent=p.name;$("#productDescription").textContent=p.desc;$("#productBenefit").textContent=p.benefit;$("#productUse").textContent=p.use;$("#ingredientChips").innerHTML=p.ingredients.map(x=>`<span class="chip">${x}</span>`).join("");$$('.product-tab').forEach(b=>{const on=b.dataset.product===key;b.classList.toggle('active',on);b.setAttribute('aria-selected',on)})}
function renderPlan(type){
 activePlan=type;
 const ar=lang==='ar';
 $$('[data-plan]').forEach(b=>{const selected=b.dataset.plan===type;b.classList.toggle('active',selected);b.setAttribute('aria-pressed',String(selected))});
 const days=plans[type][lang];
 const header=`<div class="schedule-heading"><span>${ar?'اليوم':'Day'}</span><span>${ar?'خطوات العناية بالترتيب':'Care steps, in order'}</span><span>${ar?'نوع العناية':'Care type'}</span></div>`;
 $('#weekPlan').innerHTML=header+days.map((d,i)=>{
  const wash=[0,2,4,6].includes(i),mask=type==='complete'&&i===4;
  const label=mask?(ar?'عناية عميقة':'Deep care'):wash?(ar?'يوم الغسيل':'Wash day'):(ar?'راحة / حسب الحاجة':'Rest / as needed');
  const steps=d[1].split(/ ← | → /);
  return `<article class="schedule-row ${mask?'deep-care':''} ${wash?'wash-day':'rest-day'}"><div class="schedule-day"><span class="day-num">${i+1}</span><strong>${d[0]}</strong></div><ol class="care-steps">${steps.map(x=>`<li>${x}</li>`).join('')}</ol><span class="care-label">${label}</span></article>`;
 }).join('');
 $('#routineOrder').textContent=ar?'اطلبي هذا البكج ←':'Order this set →';
}
$('#routineOrder').addEventListener('click',()=>{$('#package').value=activePlan;updateOrder();syncHero()});

function updateOrder(){const type=$("#package").value,qty=+$("#quantity").value||1,price=type==="complete"?30:20,total=price*qty+3;$("#orderImage").src=type==="complete"?"assets/complete.webp":"assets/duo.webp";$("#orderPackageName").textContent=lang==="ar"?(type==="complete"?"بكج بلازما الكامل":"بكج بلازما الثنائي"):(type==="complete"?"PLASMA Complete Set":"PLASMA Duo Set");$("#orderPackagePrice").textContent=`${price*qty} ${content[lang].jod}`;$("#orderTotal").textContent=`${total} ${content[lang].jod}`}
$("#langToggle").addEventListener("click",()=>setLanguage(lang==="ar"?"en":"ar"));
$$('.product-tab').forEach(b=>b.addEventListener('click',()=>renderProduct(b.dataset.product)));
$$('.detail-toggle').forEach(b=>b.addEventListener('click',()=>{b.classList.toggle('open');b.nextElementSibling.classList.toggle('open');b.setAttribute('aria-expanded',String(b.classList.contains('open')))}));
$$('[data-plan]').forEach(b=>b.addEventListener('click',()=>renderPlan(b.dataset.plan)));
$$('.choose-package').forEach(b=>b.addEventListener('click',()=>{$("#package").value=b.dataset.value;updateOrder();syncHero();$("#order").scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});renderPlan(b.dataset.value);setTimeout(()=>showToast(lang==="ar"?"تم اختيار البكج — كمّلي بيانات التوصيل":"Set selected — enter your delivery details"),500)}));
$$('[data-scroll]').forEach(b=>b.addEventListener('click',()=>revealDestination(b.dataset.scroll)));
$("#package").addEventListener("change",()=>{updateOrder();syncHero();renderPlan($("#package").value)});$$('[data-qty]').forEach(b=>b.addEventListener('click',()=>{const q=$("#quantity");q.value=Math.max(1,Math.min(10,+q.value+(b.dataset.qty==="plus"?1:-1)));updateOrder()}));
function clampQuantity(){const q=$("#quantity");const n=Math.round(+q.value);q.value=Number.isFinite(n)&&n>=1?Math.min(10,n):1;updateOrder();}
$("#quantity").addEventListener("input",()=>{if($("#quantity").value!=="")updateOrder();});
$("#quantity").addEventListener("blur",clampQuantity);
$("#quantity").addEventListener("change",clampQuantity);

const navToggle=$("#navToggle"),mobileNav=$("#mobileNav");
function setMobileNavOpen(open){
  navToggle.setAttribute("aria-expanded",String(open));
  navToggle.setAttribute("aria-label",open?content[lang].closeMenu:content[lang].openMenu);
  mobileNav.classList.toggle("open",open);
  document.body.classList.toggle("no-scroll",open);
}
navToggle.addEventListener("click",()=>setMobileNavOpen(navToggle.getAttribute("aria-expanded")!=="true"));
$$('.mobile-nav-links a').forEach(a=>a.addEventListener("click",()=>setMobileNavOpen(false)));
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&navToggle.getAttribute("aria-expanded")==="true")setMobileNavOpen(false)});
document.addEventListener("click",e=>{if(navToggle.getAttribute("aria-expanded")==="true"&&!mobileNav.contains(e.target)&&!navToggle.contains(e.target))setMobileNavOpen(false)});
function showToast(msg){const t=$("#toast");t.textContent=msg;t.classList.add("show");clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>t.classList.remove("show"),2600)}
function buildOrderMessage(d) {
  const complete = d.get("package") === "complete";
  const qty = Number(d.get("quantity"));
  const unit = complete ? 30 : 20;
  const clean = key => String(d.get(key) || "").trim();
  return [
    "*طلب جديد | BETOLLA PLASMA*",
    "",
    "*بيانات العميل*",
    "الاسم: " + clean("name"),
    "الهاتف: " + clean("phone"),
    "",
    "*تفاصيل الطلب*",
    "البكج: " + (complete ? "بكج بلازما الرباعي" : "بكج بلازما الثنائي"),
    "المحتويات: " + (complete ? "شامبو + بلسم + ماسك + سيروم" : "شامبو + بلسم"),
    "الكمية: " + qty,
    "سعر البكج بعد الخصم: " + unit + " د.أ",
    "",
    "*عنوان التوصيل*",
    "المحافظة: " + clean("governorate"),
    "العنوان: " + clean("area"),
    "ملاحظات: " + (clean("notes") || "لا يوجد"),
    "",
    "*ملخص الحساب*",
    "مجموع المنتجات: " + (unit * qty) + " د.أ",
    "رسوم التوصيل: 3 د.أ",
    "*الإجمالي: " + (unit * qty + 3) + " د.أ*",
    "طريقة الدفع: نقداً عند الاستلام",
    "",
    "يرجى تأكيد الطلب وموعد التوصيل. شكراً لكم."
  ].join("\n");
}
$("#orderForm").addEventListener("submit", e => {
  e.preventDefault();
  const f = e.currentTarget, err = $("#formError");
  if (!f.checkValidity()) {
    err.textContent = lang === "ar" ? "رجاءً كمّلي الحقول المطلوبة وأكدي الطلب." : "Please complete the required fields and confirm your order.";
    f.reportValidity();
    return;
  }
  err.textContent = "";
  const message = buildOrderMessage(new FormData(f));
  window.open("https://wa.me/962798153370?text=" + encodeURIComponent(message), "_blank", "noopener");
});
const observer=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target)}}),{threshold:.12});$$('.reveal').forEach(e=>observer.observe(e));
addEventListener('scroll',()=>{const h=document.documentElement;$("#progress").style.width=`${h.scrollTop/(h.scrollHeight-h.clientHeight)*100}%`},{passive:true});
// Progressive disclosure: links also open the matching panel before scrolling.
function revealDestination(hash){
 const target=$(hash);if(!target)return;
 const panel=target.closest('details');if(panel)panel.open=true;
 target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
}
$$('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{const hash=a.getAttribute('href');if(hash.length>1&&$(hash)){e.preventDefault();revealDestination(hash)}}));
window.addEventListener('hashchange',()=>{if(location.hash)revealDestination(location.hash)});
function syncHero(){
 const type=$('#package').value;
 $$('[data-select-set]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.selectSet===type)));
 const name=lang==='ar'?(type==='complete'?'بكج بلازما الرباعي':'بكج بلازما الثنائي'):(type==='complete'?'PLASMA Complete Set':'PLASMA Duo Set');
 $('#heroSetImage').src=type==='complete'?'assets/complete.webp':'assets/duo.webp';
 $('#heroSetImage').alt=name;$('.hero-visual').setAttribute('aria-label',name);
 $('.card-price strong').textContent=(type==='complete'?30:20)+' '+content[lang].jod;
 $('.card-price del').textContent=(type==='complete'?40:25)+' '+content[lang].jod;
 $('.card-count strong').textContent=type==='complete'?'4':'2';
 $('.card-price small').textContent=name;
}
$$('[data-select-set]').forEach(b=>b.addEventListener('click',()=>{$('#package').value=b.dataset.selectSet;updateOrder();syncHero();renderPlan(b.dataset.selectSet)}));
content.ar.productsInfo='المنتجات والمكونات والفوائد';content.en.productsInfo='Products, ingredients & benefits';
content.ar.orderTitle='كمّلي طلبك بكل سهولة';content.en.orderTitle='Your order, simply';
content.ar.orderLead='راجعي المجموع وعبّي بيانات التوصيل. بنجهّز رسالة واتساب؛ اضغطي إرسال داخل التطبيق لإتمام الطلب.';
content.en.orderLead='Review your total and delivery details. We prepare your WhatsApp message; press Send in WhatsApp to place the order.';
const motionQuery=matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
const halo=document.createElement('div');halo.className='cursor-halo';halo.setAttribute('aria-hidden','true');document.body.append(halo);
let pointerFrame=0;
document.addEventListener('pointermove',e=>{
 if(!motionQuery.matches||e.pointerType==='touch')return;
 cancelAnimationFrame(pointerFrame);pointerFrame=requestAnimationFrame(()=>{halo.style.transform=`translate3d(${e.clientX-16}px,${e.clientY-16}px,0)`;halo.classList.add('active')});
},{passive:true});
document.addEventListener('pointerleave',()=>halo.classList.remove('active'));
function resetSurface(el){el.style.removeProperty('--shift-x');el.style.removeProperty('--shift-y');el.style.removeProperty('--pointer-x');el.style.removeProperty('--pointer-y')}
$$('.pointer-surface').forEach(el=>{
 el.addEventListener('pointermove',e=>{if(!motionQuery.matches)return;const r=el.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;el.style.setProperty('--pointer-x',x+'px');el.style.setProperty('--pointer-y',y+'px');el.style.setProperty('--shift-x',((x/r.width-.5)*10)+'px');el.style.setProperty('--shift-y',((y/r.height-.5)*10)+'px')},{passive:true});
 el.addEventListener('pointerleave',()=>resetSurface(el));
});
motionQuery.addEventListener('change',()=>{halo.classList.remove('active');$$('.pointer-surface').forEach(resetSurface)});
// Keyboard operation for the existing product tab interface.
$$('.product-tab').forEach((b,i)=>b.addEventListener('keydown',e=>{const tabs=$$('.product-tab');let n=i;if(e.key==='Home')n=0;else if(e.key==='End')n=tabs.length-1;else if(e.key==='ArrowRight')n=(i+(lang==='ar'?-1:1)+tabs.length)%tabs.length;else if(e.key==='ArrowLeft')n=(i+(lang==='ar'?1:-1)+tabs.length)%tabs.length;else return;e.preventDefault();tabs[n].focus();tabs[n].click()}));
setLanguage(lang,{skipUrlUpdate:true});
if(location.hash)revealDestination(location.hash);
