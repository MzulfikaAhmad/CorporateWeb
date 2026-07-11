
document.addEventListener('DOMContentLoaded', () => {
  const navToggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.site-nav');
  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(open));
    });
  }
  document.querySelectorAll('.drop-button').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.nav-item');
      const open = item.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(open));
    });
  });
  document.addEventListener('click', e => {
    if (!e.target.closest('.site-header')) document.querySelectorAll('.nav-item.open').forEach(i => i.classList.remove('open'));
  });

  const year = document.querySelector('#year');
  if (year) year.textContent = new Date().getFullYear();
  const back = document.querySelector('.back-to-top');
  if (back) {
    window.addEventListener('scroll', () => back.classList.toggle('show', window.scrollY > 450));
    back.addEventListener('click', () => window.scrollTo({top:0, behavior:'smooth'}));
  }

  // Slider
  const slides = [...document.querySelectorAll('.slide')];
  const dots = [...document.querySelectorAll('.slider-dot')];
  let slideIndex = 0; let timer;
  function showSlide(i){ if(!slides.length) return; slideIndex=(i+slides.length)%slides.length; slides.forEach((s,n)=>s.classList.toggle('active',n===slideIndex)); dots.forEach((d,n)=>d.classList.toggle('active',n===slideIndex)); }
  function restart(){ clearInterval(timer); if(slides.length>1) timer=setInterval(()=>showSlide(slideIndex+1),5500); }
  document.querySelector('.slider-next')?.addEventListener('click',()=>{showSlide(slideIndex+1);restart()});
  document.querySelector('.slider-prev')?.addEventListener('click',()=>{showSlide(slideIndex-1);restart()});
  dots.forEach((d,i)=>d.addEventListener('click',()=>{showSlide(i);restart()})); restart();

  // Quiz
  document.querySelectorAll('.quiz-option').forEach(btn => btn.addEventListener('click', () => {
    const result = document.querySelector('.quiz-result');
    document.querySelectorAll('.quiz-option').forEach(b=>b.disabled=true);
    if (btn.dataset.correct === 'true') { result.textContent='Correct. Always confirm the appeal through an official channel.'; result.className='quiz-result correct'; }
    else { result.textContent='Not the safest choice. Verify the organiser and payment channel first.'; result.className='quiz-result incorrect'; }
    setTimeout(()=>{document.querySelectorAll('.quiz-option').forEach(b=>b.disabled=false)},1000);
  }));

  // Activity flip cards
  document.querySelectorAll('.activity-card').forEach(card => card.addEventListener('click', e => {
    if (!e.target.closest('a')) card.classList.toggle('flipped');
  }));

  // Filters for activities/news
  document.querySelectorAll('[data-filter-group]').forEach(group => {
    const targetSelector = group.dataset.target;
    const items = [...document.querySelectorAll(targetSelector)];
    const search = group.querySelector('input[type="search"]');
    let current='all';
    function apply(){
      const q=(search?.value||'').toLowerCase().trim();
      items.forEach(item=>{
        const cat=item.dataset.category||''; const text=item.textContent.toLowerCase();
        item.classList.toggle('hidden', !((current==='all'||cat.includes(current)) && (!q||text.includes(q))));
      });
    }
    group.querySelectorAll('.filter-btn').forEach(btn=>btn.addEventListener('click',()=>{
      group.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active')); btn.classList.add('active'); current=btn.dataset.filter; apply();
    }));
    search?.addEventListener('input',apply);
  });

  // Accordion
  document.querySelectorAll('.accordion-button').forEach(btn=>btn.addEventListener('click',()=>{
    const item=btn.closest('.accordion-item'); const open=item.classList.toggle('open'); btn.setAttribute('aria-expanded',String(open)); const sign=btn.querySelector('[data-sign]'); if(sign) sign.textContent=open?'−':'+';
  }));

  // Donation planner
  const amountBtns=[...document.querySelectorAll('.amount-btn')]; const custom=document.querySelector('#customAmount'); const frequency=document.querySelector('#frequency'); const total=document.querySelector('#plannedTotal');
  let amount=30;
  function updateDonation(){
    if(!total) return; const factor=frequency?.value==='monthly'?12:frequency?.value==='weekly'?52:1; total.textContent=`RM ${(amount*factor).toLocaleString('en-MY',{minimumFractionDigits:2})}`;
    const label=document.querySelector('#planLabel'); if(label) label.textContent=frequency?.value==='monthly'?'estimated yearly total for a monthly plan':frequency?.value==='weekly'?'estimated yearly total for a weekly plan':'one-time planned contribution';
  }
  amountBtns.forEach(btn=>btn.addEventListener('click',()=>{amountBtns.forEach(b=>b.classList.remove('active'));btn.classList.add('active');amount=Number(btn.dataset.amount);if(custom)custom.value='';updateDonation()}));
  custom?.addEventListener('input',()=>{amountBtns.forEach(b=>b.classList.remove('active'));amount=Math.max(0,Number(custom.value)||0);updateDonation()});
  frequency?.addEventListener('change',updateDonation); updateDonation();

  // Tabs
  document.querySelectorAll('.tabs').forEach(tabs=>{
    const wrap=tabs.parentElement; tabs.querySelectorAll('.tab-btn').forEach(btn=>btn.addEventListener('click',()=>{
      tabs.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active')); wrap.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('active')); btn.classList.add('active'); wrap.querySelector(`#${btn.dataset.tab}`)?.classList.add('active');
    }));
  });

  // Share buttons
  document.querySelectorAll('[data-share]').forEach(btn=>btn.addEventListener('click', async()=>{
    const data={title:document.title,text:'PERKIM Selangor academic information awareness website',url:location.href};
    if(btn.dataset.share==='native' && navigator.share){try{await navigator.share(data)}catch(e){}}
    else if(btn.dataset.share==='facebook'){window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(location.href)}`,'_blank','noopener,noreferrer')}
    else {await navigator.clipboard.writeText(location.href);btn.textContent='Link copied';setTimeout(()=>btn.textContent='Copy link',1500)}
  }));

  // Feedback form + evidence storage
  const form=document.querySelector('#feedbackForm'); const KEY='ims458_perkim_feedback_v1';
  const getData=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch{return[]}};
  function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  function renderFeedback(){
    const data=getData(); const body=document.querySelector('#feedbackRows'); const empty=document.querySelector('#feedbackEmpty'); const count=document.querySelector('#responseCount'); const bar=document.querySelector('#responseBar');
    if(count) count.textContent=data.length; if(bar) bar.style.width=`${Math.min(100,(data.length/4)*100)}%`;
    if(body){body.innerHTML=data.map((r,i)=>`<tr><td>${i+1}</td><td>${esc(r.name)}</td><td>${esc(r.rating)}/5</td><td>${esc(r.page)}</td><td>${esc(r.message)}</td><td>${esc(r.date)}</td></tr>`).join('')}
    if(empty) empty.classList.toggle('hidden',data.length>0);
  }
  form?.addEventListener('submit',e=>{
    e.preventDefault(); if(!form.reportValidity())return;
    const fd=new FormData(form); const data=getData(); data.push({name:fd.get('name'),email:fd.get('email'),visitor:fd.get('visitor'),rating:fd.get('rating'),page:fd.get('page'),message:fd.get('message'),date:new Date().toLocaleString('en-MY')}); localStorage.setItem(KEY,JSON.stringify(data));
    const status=document.querySelector('.form-status'); if(status){status.textContent='Thank you. Your feedback was saved in this browser for assignment evidence.';status.className='form-status success'} form.reset(); renderFeedback();
  });
  document.querySelector('#exportFeedback')?.addEventListener('click',()=>{
    const data=getData(); if(!data.length){alert('No feedback records are available yet.');return;} const rows=[['No','Name','Email','Visitor Type','Rating','Useful Page','Comment','Date'],...data.map((r,i)=>[i+1,r.name,r.email,r.visitor,r.rating,r.page,r.message,r.date])];
    const csv=rows.map(row=>row.map(v=>`"${String(v??'').replaceAll('"','""')}"`).join(',')).join('\n'); const blob=new Blob([csv],{type:'text/csv'}); const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='PERKIM_feedback_evidence.csv';a.click();URL.revokeObjectURL(a.href);
  });
  document.querySelector('#printFeedback')?.addEventListener('click',()=>window.print());
  document.querySelector('#clearFeedback')?.addEventListener('click',()=>{if(confirm('Clear all locally saved feedback records?')){localStorage.removeItem(KEY);renderFeedback()}});
  renderFeedback();
});
