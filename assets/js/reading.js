/* Page Lecture & Loisirs : bibliothèque, objectifs de lecture, journal et citations */
var KEY='lifeos-reading-v1',F='all',NK='j',Y=String(new Date().getFullYear());
var ST={doing:'En cours',todo:'À lire',done:'Terminé'},ORD={doing:0,todo:1,done:2};

function seed(){var p={};p[dk()]=12;return{nid:7,yg:12,pg:20,pages:p,
 books:[{id:1,t:'Atomic Habits',a:'James Clear',n:320,c:210,s:'doing'},{id:2,t:'Le pouvoir du moment présent',a:'Eckhart Tolle',n:240,c:60,s:'doing'},{id:3,t:'Dune',a:'Frank Herbert',n:700,c:0,s:'todo'},{id:4,t:'Sapiens',a:'Yuval Noah Harari',n:512,c:512,s:'done',f:dk(-1)}],
 notes:[{id:5,k:'j',t:'Le chapitre sur les petites habitudes m’a beaucoup inspiré.',s:'Atomic Habits',d:dk()},{id:6,k:'c',t:'Petit à petit, l’oiseau fait son nid.',s:'Proverbe',d:dk()}]}}
function load(){var d=Store.getJSON(KEY);return d&&d.pages&&Array.isArray(d.books)&&Array.isArray(d.notes)?d:null}
function save(){Store.setJSON(KEY,S)}
var S=load()||seed();
function find(id){return S.books.filter(function(b){return b.id==id})[0]}
function hue(t){var h=0,i;for(i=0;i<t.length;i++)h=(h*31+t.charCodeAt(i))%360;return h}
/* Garde le statut, la page et la date de fin cohérents */
function norm(b){if(b.n>0)b.c=Math.min(b.c,b.n);
 if(b.s==='done'){if(b.n>0)b.c=b.n;if(!b.f)b.f=dk()}
 else{delete b.f;if(b.n>0&&b.c>=b.n){b.s='done';b.f=dk()}else if(b.c>0)b.s='doing'}}

/* ---------- Bibliothèque ---------- */
function renderBooks(){
 var l=S.books.filter(function(b){return F==='all'||b.s===F}).sort(function(a,b){return ORD[a.s]-ORD[b.s]||a.id-b.id});
 $('bkL').innerHTML=l.length?l.map(function(b){var p=b.n>0?Math.round(b.c/b.n*100):0;
  return '<div class="bk" tabindex="0" role="button" data-id="'+b.id+'" aria-label="Modifier '+esc(b.t)+'"><div class="cv" style="background:hsl('+hue(b.t)+',45%,45%)">'+esc(b.t.charAt(0).toUpperCase())+'</div>'
  +'<div class="t"><b>'+esc(b.t)+'</b><span class="a">'+esc(b.a||'Auteur inconnu')+'</span>'+(b.n>0&&b.s!=='todo'?'<div class="bar"><i style="width:'+p+'%"></i></div>':'')+'</div>'
  +'<div class="side"><span class="tag '+b.s+'">'+ST[b.s]+'</span>'+(b.n>0&&b.s!=='todo'?'<span>'+b.c+'/'+b.n+' p.</span>':'')+(b.s!=='done'?'<button type="button" class="go" data-add="10" aria-label="Ajouter 10 pages : '+esc(b.t)+'">+10 p.</button>':'')+'</div></div>'}).join('')
  :'<p class="empty">Aucun livre ici. Clique sur « + Ajouter ».</p>';
 document.querySelectorAll('#bkF .chip').forEach(function(c){var on=c.dataset.f===F;c.classList.toggle('on',on);c.setAttribute('aria-pressed',on)});
 refresh()}
$('bkF').onclick=function(e){var c=e.target.closest('.chip');if(!c)return;F=c.dataset.f;renderBooks()};
$('bkL').onclick=function(e){var row=e.target.closest('.bk');if(!row)return;var a=e.target.closest('[data-add]');
 if(a){addPages(+row.dataset.id,+a.dataset.add);return}openBook(row.dataset.id)};
$('bkL').onkeydown=function(e){if((e.key==='Enter'||e.key===' ')&&e.target.classList.contains('bk')){e.preventDefault();openBook(e.target.dataset.id)}};
function addPages(id,n){var b=find(id);if(!b)return;var before=b.c;
 b.c=b.n>0?Math.min(b.n,b.c+n):b.c+n;S.pages[dk()]=(S.pages[dk()]||0)+(b.c-before);
 if(b.s==='todo')b.s='doing';norm(b);save();renderBooks();renderGoals()}

/* ---------- Fenêtre livre ---------- */
var dlg=$('dlgB'),editing=null,delArmed=false;
function openBook(id){var b=id?find(id):null;editing=b?b.id:null;delArmed=false;
 $('bTt').textContent=b?'Modifier le livre':'Nouveau livre';
 $('fT').value=b?b.t:'';$('fA').value=b?b.a:'';$('fN').value=b?b.n:'';$('fC').value=b?b.c:0;$('fS').value=b?b.s:'todo';
 $('fDel').hidden=!b;$('fDel').textContent='Supprimer';dlg.showModal()}
$('addB').onclick=function(){openBook(null)};
dlg.addEventListener('click',function(e){if(e.target===dlg||e.target.closest('[data-close]'))dlg.close()});
$('fDel').onclick=function(){if(!delArmed){delArmed=true;this.textContent='Confirmer ?';return}
 S.books=S.books.filter(function(b){return b.id!==editing});save();dlg.close();renderBooks();renderGoals()};
$('bf').onsubmit=function(e){e.preventDefault();var t=$('fT').value.trim();if(!t)return;
 var d={t:t,a:$('fA').value.trim(),n:Math.max(0,parseInt($('fN').value,10)||0),c:Math.max(0,parseInt($('fC').value,10)||0),s:$('fS').value};
 if(d.s==='todo')d.c=0;
 if(editing){Object.assign(find(editing),d);norm(find(editing))}else{d.id=S.nid++;norm(d);S.books.push(d)}
 save();dlg.close();renderBooks();renderGoals()};

/* ---------- Objectifs de lecture ---------- */
function done(){return S.books.filter(function(b){return b.s==='done'&&b.f&&b.f.slice(0,4)===Y}).length}
function renderGoals(){var d=done(),pg=S.pages[dk()]||0;
 $('yRing').style.setProperty('--p',Math.min(100,Math.round(d/S.yg*100)));$('yTxt').textContent=d+'/'+S.yg;
 $('yLbl').textContent='Livres lus en '+Y;$('ygV').textContent=S.yg;
 $('pgTxt').textContent=pg+'/'+S.pg+' pages';$('pgBar').style.width=Math.min(100,Math.round(pg/S.pg*100))+'%';$('pgV').textContent=S.pg;refresh()}
function step(k,d,lo,hi){S[k]=Math.max(lo,Math.min(hi,S[k]+d));save();renderGoals()}
$('ygM').onclick=function(){step('yg',-1,1,200)};$('ygP').onclick=function(){step('yg',1,1,200)};
$('pgM').onclick=function(){step('pg',-5,5,500)};$('pgP').onclick=function(){step('pg',5,5,500)};

/* ---------- Journal et citations ---------- */
function renderNotes(){
 var l=S.notes.filter(function(n){return n.k===NK}).slice(0,6);
 $('nL').innerHTML=l.length?l.map(function(n){return '<div class="rowi"><span class="tx">'+(NK==='c'?'« '+esc(n.t)+' »':esc(n.t))+'<em>'+(n.s?esc(n.s)+' · ':'')+n.d.slice(8)+'/'+n.d.slice(5,7)+'</em></span><button type="button" class="mini" data-id="'+n.id+'" aria-label="Supprimer cette note">×</button></div>'}).join('')
  :'<p class="empty">'+(NK==='c'?'Aucune citation pour le moment.':'Aucune note pour le moment.')+'</p>';
 document.querySelectorAll('#nK .chip').forEach(function(c){var on=c.dataset.k===NK;c.classList.toggle('on',on);c.setAttribute('aria-pressed',on)});
 $('nI').placeholder=NK==='c'?'Une citation qui t’a marqué…':'Ce que tu penses de ta lecture…'}
$('nK').onclick=function(e){var c=e.target.closest('.chip');if(!c)return;NK=c.dataset.k;renderNotes()};
$('nf').onsubmit=function(e){e.preventDefault();var t=$('nI').value.trim();if(!t)return;
 S.notes.unshift({id:S.nid++,k:NK,t:t,s:$('nS').value.trim(),d:dk()});S.notes=S.notes.slice(0,100);save();$('nI').value='';$('nS').value='';renderNotes()};
$('nL').onclick=function(e){var b=e.target.closest('.mini');if(!b)return;S.notes=S.notes.filter(function(n){return n.id!==+b.dataset.id});save();renderNotes()};

/* ---------- Statistiques ---------- */
function refresh(){
 $('sC').textContent=S.books.filter(function(b){return b.s==='doing'}).length;
 $('sF').textContent=done();
 $('sP').textContent=(S.pages[dk()]||0)+'/'+S.pg}
renderBooks();renderGoals();renderNotes();
