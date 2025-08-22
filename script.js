  const $ = sel => document.querySelector(sel);
  const $$ = sel => Array.from(document.querySelectorAll(sel));

  const fields = {
    name: $('#name'), title: $('#title'), location: $('#location'),
    email: $('#email'), phone: $('#phone'), website: $('#website'), social: $('#social'), summary: $('#summary')
  };

  const out = {
    name: $('#pName'), title: $('#pTitle'), contacts: $('#pContacts'),
    summarySec: $('#pSummarySec'), summary: $('#pSummary'),
    skillsSec: $('#pSkillsSec'), skills: $('#pSkills'),
    expSec: $('#pExpSec'), exp: $('#pExp'),
    eduSec: $('#pEduSec'), edu: $('#pEdu')
  };

  const progressBar = $('#progressBar');
  const skillEntry = $('#skillEntry');
  const eduList = $('#eduList');
  const expList = $('#expList');
  const skillList = document.createElement("div"); // container for repeater skills if needed

  let skills = [];

  /* ---------- Helpers ---------- */
  function sanitize(s){ return (s||'').toString().replace(/[<>]/g, c => ({'<':'&lt;','>':'&gt;'}[c])) }
  function li(text){ return `<li>${sanitize(text)}</li>` }

  function updateHeader(){
    out.name.textContent = fields.name.value || 'Your Name';
    out.title.textContent = fields.title.value || 'Your Title';

    const bits = [fields.email.value, fields.phone.value, fields.location.value, fields.website.value, fields.social.value]
      .map(x => x && sanitize(x)).filter(Boolean);
    out.contacts.innerHTML = bits.map(x => {
    // detect if it's a link
    if (/^https?:\/\//.test(x) || x.includes("linkedin.com") || x.includes("github.com")) {
        return `<a href="${x.startsWith("http") ? x : "https://" + x}" target="_blank">${x}</a>`;
    }
    return x;
    }).join(' · ');

  }

  function updateSummary(){
    const has = fields.summary.value.trim().length > 0;
    out.summarySec.style.display = has ? '' : 'none';
    out.summary.innerHTML = sanitize(fields.summary.value);
  }

  /* ---------- Skills (tags only) ---------- */
  function renderSkills(){
      out.skillsSec.style.display = skills.length ? '' : 'none';
      out.skills.innerHTML = skills.map(s => `<span class="skill">${sanitize(s)}</span>`).join('');
      // Render tags in input box
      const existing = skillsInput.querySelectorAll('.tag'); existing.forEach(el => el.remove());
      skills.forEach((s, i) => {
        const t = document.createElement('span'); t.className='tag'; t.innerHTML = `${sanitize(s)} <button aria-label="remove">×</button>`;
        t.querySelector('button').addEventListener('click', ()=>{ skills.splice(i,1); renderSkills(); updateProgress(); });
        skillsInput.insertBefore(t, skillEntry);
      });
    }
  skillEntry.addEventListener('keydown', e => {
    if(e.key==='Enter'){
      e.preventDefault();
      const v = skillEntry.value.trim();
      if(v && !skills.includes(v)) skills.push(v);
      skillEntry.value='';
      renderSkills(); updateProgress();
    }
  });

  /* ---------- Date options ---------- */
  function populateDateOptions(select){
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const year = new Date().getFullYear();
    for(let y = year; y >= 1970; y--){
      for(let m = 11; m >= 0; m--){
        const val = `${months[m]} ${y}`;
        const opt = document.createElement('option');
        opt.value = val; opt.textContent = val;
        select.appendChild(opt);
      }
    }
  }

  /* ---------- Education ---------- */
  function addEdu(pref={}) {
    const t = document.importNode($('#eduT').content, true);
    const wrap = t.querySelector('.edu');
    const startSel = wrap.querySelector('.i-start');
    populateDateOptions(startSel);
    const endSel = wrap.querySelector('.i-end');   
    const degreeSel = wrap.querySelector('.i-degree');
    const degreeOther = wrap.querySelector('.i-degree-other');
    degreeSel.addEventListener('change', () => {
      if (degreeSel.value === "Other") {
        degreeOther.style.display = "block";
      } else {
        degreeOther.style.display = "none";
        degreeOther.value = "";
      }
      renderEdu(); updateProgress();
    });
    wrap.querySelector('.i-school').value = pref.school||'';
    degreeSel.value = pref.degree||'';
    if (degreeSel.value === "Other" && pref.degreeOther) {
      degreeOther.style.display = "block";
      degreeOther.value = pref.degreeOther;
    }
    wrap.querySelector('.i-specialization').value = pref.specialization||'';
    startSel.value = pref.start||'';
    endSel.value = pref.end||'';
    wrap.querySelector('.i-score').value = pref.score||'';
    wrap.querySelector('.i-highlights').value = pref.highlights||'';
    wrap.querySelector('.remove').addEventListener('click',()=>{ wrap.remove(); renderEdu(); updateProgress(); });
    ['input','change'].forEach(ev=> wrap.addEventListener(ev, ()=>{ renderEdu(); updateProgress(); }));
    eduList.appendChild(wrap);
    renderEdu(); updateProgress();
  }

  function renderEdu(){
    const blocks = $$('.edu').map(w => {
      const s = w.querySelector('.i-school').value; 
      let d = w.querySelector('.i-degree').value;
      const dOther = w.querySelector('.i-degree-other').value;
      if(d === "Other" && dOther) d = dOther;
      const sp = w.querySelector('.i-specialization').value; 
      const st = w.querySelector('.i-start').value; 
      const en = w.querySelector('.i-end').value;
      const sc = w.querySelector('.i-score').value; 
      const hi = w.querySelector('.i-highlights').value;
      const hiItems = hi.split(',').map(x=>x.trim()).filter(Boolean).map(li).join('');
      return `<div class="item"><div class="top"><div>${sanitize(d)} – ${sanitize(s)}</div><div>${sanitize(sp)}</div><div>${sanitize(st)} – ${sanitize(en)}</div></div>
              <div class="sub">${sanitize(sc)}</div>${hiItems?`<ul class="bul">${hiItems}</ul>`:''}</div>`
    }).join('');
    out.edu.innerHTML = blocks;
    out.eduSec.style.display = blocks ? '' : 'none';
  }

  /* ---------- Experience ---------- */
  function addExp(pref={}) {
    const t = document.importNode($('#expT').content, true);
    const wrap = t.querySelector('.exp');
    const startSel = wrap.querySelector('.i-start');
    const endSel = wrap.querySelector('.i-end');
    populateDateOptions(startSel);
    populateDateOptions(endSel);
    const roleSel = wrap.querySelector('.i-role');
    const roleOther = wrap.querySelector('.i-role-other');
    roleSel.addEventListener('change', () => {
      if (roleSel.value === "Other") {
        roleOther.style.display = "block";
      } else {
        roleOther.style.display = "none";
        roleOther.value = "";
      }
      renderExp(); updateProgress();
    });
    roleSel.value = pref.role||'';
    if (roleSel.value === "Other" && pref.roleOther) {
      roleOther.style.display = "block";
      roleOther.value = pref.roleOther;
    }
    startSel.value = pref.start||'';
    endSel.value = pref.end||'';
    wrap.querySelector('.x-company').value = pref.company||'';
    wrap.querySelector('.x-loc').value = pref.loc||'';
    wrap.querySelector('.x-bul').value = pref.bul||'';
    wrap.querySelector('.remove').addEventListener('click',()=>{ wrap.remove(); renderExp(); updateProgress(); });
    ['input','change'].forEach(ev=> wrap.addEventListener(ev, ()=>{ renderExp(); updateProgress(); }));
    expList.appendChild(wrap);
    renderExp(); updateProgress();
  }

  function renderExp(){
    const blocks = $$('.exp').map(w => {
      let r = w.querySelector('.i-role').value;
      const rOther = w.querySelector('.i-role-other').value;
      if (r === "Other" && rOther) r = rOther;
      const c = w.querySelector('.x-company').value;
      const st = w.querySelector('.i-start').value;
      const en = w.querySelector('.i-end').value;
      const lc = w.querySelector('.x-loc').value; 
      const bu = w.querySelector('.x-bul').value;
      const bul = bu.split(/\n+/).map(x=>x.replace(/^•\s*/,'').trim()).filter(Boolean).map(li).join('');
      return `<div class="item"><div class="top"><div>${sanitize(r)} — ${sanitize(c)}</div><div>${sanitize(st)} – ${sanitize(en)}</div></div>
              <div class="sub">${sanitize(lc)}</div>${bul?`<ul class="bul">${bul}</ul>`:''}</div>`
    }).join('');
    out.exp.innerHTML = blocks;
    out.expSec.style.display = blocks ? '' : 'none';
  }

  /* ---------- Progress ---------- */
  function updateProgress(){
    const checks = [fields.name, fields.email, fields.phone, fields.summary];
    let score = checks.filter(el => el.value.trim().length>0).length;
    if(skills.length) score++;
    if($$('.edu').length) score++;
    if($$('.exp').length) score++;
    const total = checks.length + 3;
    const pct = Math.round( (score/total)*100 );
    progressBar.style.width = pct + '%';
    progressBar.title = pct + '% complete';
  }

  /* ---------- Wire up ---------- */
  Object.values(fields).forEach(el => el.addEventListener('input', ()=>{ updateHeader(); updateSummary(); updateProgress(); }));
  $('#addEdu').addEventListener('click', ()=> addEdu());
  $('#addExp').addEventListener('click', ()=> addExp());
  $('#printBtn').addEventListener('click', ()=> window.print());
  $('#clearBtn').addEventListener('click', ()=> {
    skills.length = 0; renderSkills();
    $$('.edu, .exp').forEach(n=> n.remove());
    renderEdu(); renderExp();
    setTimeout(()=>{ updateHeader(); updateSummary(); updateProgress(); }, 0);
  });

 // Initial state
    addEdu({ school:'College / Univertity', degree:'B.Tech / M.Tech / etc.', specialization:'', start:'Start Date', end:'End Date / Present', score:'Percentage / CGPA', highlights:'' });
    addExp({ role:'SDE Intern', company:'Company Name', start:'Start Date', end:'End Date / Present', loc:'City / State', bul:'• Built a full‑stack CRUD app with authentication\n• Improved booking flow and reduced errors\n• Stack: HTML, CSS, JS' });
    ['Java','Data Structures','DBMS'].forEach(s=> skills.push(s));
    renderSkills(); updateHeader(); updateSummary(); updateProgress();
