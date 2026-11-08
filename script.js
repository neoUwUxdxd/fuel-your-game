/* FUEL YOUR GAME — site interactions */
(function () {
  'use strict';

  /* ---------- Mobile navigation ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');

  function setNav(open) {
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('open', open);
  }
  toggle.addEventListener('click', function () {
    setNav(toggle.getAttribute('aria-expanded') !== 'true');
  });
  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) setNav(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setNav(false);
      toggle.focus();
    }
  });
  document.addEventListener('click', function (e) {
    if (nav.classList.contains('open') && !e.target.closest('.site-header')) setNav(false);
  });

  /* ---------- Active section in the menu ---------- */
  var links = Array.prototype.slice.call(nav.querySelectorAll('a'));
  var sections = links.map(function (a) { return document.querySelector(a.getAttribute('href')); });
  function markActive() {
    var y = window.scrollY + window.innerHeight * 0.3;
    var current = -1;
    sections.forEach(function (s, i) { if (s && s.offsetTop <= y) current = i; });
    links.forEach(function (a, i) {
      if (i === current) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
  }
  window.addEventListener('scroll', markActive, { passive: true });
  window.addEventListener('resize', markActive);
  markActive();

  /* ---------- Fact sheet tabs ---------- */
  var tablist = document.querySelector('.fs-tabs');
  var tabs = Array.prototype.slice.call(tablist.querySelectorAll('[role="tab"]'));
  var panels = tabs.map(function (t) { return document.getElementById(t.getAttribute('aria-controls')); });
  tablist.hidden = false;

  function selectTab(index, focus) {
    tabs.forEach(function (t, i) {
      var on = i === index;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      panels[i].hidden = !on;
    });
    if (focus) tabs[index].focus();
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { selectTab(i, false); });
    t.addEventListener('keydown', function (e) {
      var n = tabs.length, next = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (i + 1) % n;
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (i - 1 + n) % n;
      else if (e.key === 'Home') next = 0;
      else if (e.key === 'End') next = n - 1;
      if (next !== null) { e.preventDefault(); selectTab(next, true); }
    });
  });
  selectTab(0, false);

  // Links in the summary table open the matching tab
  document.querySelectorAll('[data-tab]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      var idx = tabs.findIndex(function (t) { return t.id === 'tab-' + a.getAttribute('data-tab'); });
      selectTab(idx, false);
      var explorer = document.getElementById('fs-explorer');
      explorer.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
      setTimeout(function () { tabs[idx].focus({ preventScroll: true }); }, 400);
    });
  });
  // Deep link like #fs-cte
  if (/^#fs-/.test(location.hash)) {
    var di = tabs.findIndex(function (t) { return '#' + t.getAttribute('aria-controls') === location.hash; });
    if (di > -1) selectTab(di, false);
  }

  /* ---------- Hashtags: copy to clipboard ---------- */
  var toast = document.getElementById('toast');
  var toastTimer;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 2200);
  }
  document.querySelectorAll('.hashtag').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-copy');
      var done = function () {
        btn.classList.add('copied');
        btn.querySelector('small').textContent = 'Copied!';
        showToast(text + ' copied. Share your healthy meal!');
        setTimeout(function () {
          btn.classList.remove('copied');
          btn.querySelector('small').textContent = 'Tap to copy';
        }, 2200);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () { showToast(text); });
      } else {
        showToast(text);
      }
    });
  });

  /* ---------- Quiz ---------- */
  var QUESTIONS = [
    { cat: 'Game day fuel', q: 'How long before a match should a young player eat a full meal?',
      opts: ['Right before kickoff', 'About 30 minutes before', 'At least 3 hours before', 'No food on game day'], a: 2,
      exp: 'The Canadian Paediatric Society advises a meal at least three hours before an event, so the body has time to digest it.' },
    { cat: 'Hydration', q: 'During a match, how much should a player drink every 15 to 20 minutes?',
      opts: ['150 to 300 mL', '1 litre', 'Only when very thirsty', 'Nothing until half-time'], a: 0,
      exp: 'Small, regular drinks of about 150 to 300 mL keep players hydrated without feeling heavy.' },
    { cat: 'Recovery', q: 'When is the best time for a recovery snack with protein and carbohydrates?',
      opts: ['The next morning', 'Within 30 minutes after playing', 'Only before bed', 'Recovery snacks are not needed'], a: 1,
      exp: 'A snack within 30 minutes after exercise helps muscles refuel and repair.' },
    { cat: 'Food first', q: 'What does the UEFA expert group recommend for football nutrition?',
      opts: ['Supplements first', 'Energy drinks before every game', 'A ‘food first’ philosophy', 'Skipping meals to stay light'], a: 2,
      exp: 'UEFA experts recommend “a ‘food first’ philosophy (ie, food over supplements)” (Collins et al., 2021).' },
    { cat: 'Key vocabulary', q: 'Which nutrient is the body’s main source of energy during exercise?',
      opts: ['Carbohydrates', 'Vitamins', 'Fibre', 'Water'], a: 0,
      exp: 'Carbohydrates such as rice, pasta, tortillas and fruit are the main fuel for running and staying focused.' },
    { cat: 'Key vocabulary', q: 'What is glycogen?',
      opts: ['A type of protein shake', 'The form in which the body stores carbohydrates in the muscles and liver', 'A mineral lost in sweat', 'A vitamin found in milk'], a: 1,
      exp: 'Muscles use stored glycogen as fuel during a match, which is why carbohydrates matter before and after playing.' },
    { cat: 'Disease · HCM', q: 'Which test shows how well the heart’s chambers and valves are pumping in hypertrophic cardiomyopathy?',
      opts: ['A blood sugar test', 'An X-ray of the knee', 'An echocardiogram', 'A urine test'], a: 2,
      exp: 'Mayo Clinic explains that an echocardiogram shows how the heart pumps and can reveal a thickened heart muscle.' },
    { cat: 'Disease · CTE', q: 'How can chronic traumatic encephalopathy (CTE) be definitively diagnosed?',
      opts: ['With a simple blood test', 'Only after death, during an autopsy of the brain', 'With a vision test', 'By measuring body weight'], a: 1,
      exp: 'According to Mayo Clinic, the only way to definitively diagnose CTE is after death during an autopsy of the brain.' },
    { cat: 'Disease · Mononucleosis', q: 'How does the virus that causes mononucleosis spread most commonly?',
      opts: ['Through bodily fluids, especially saliva', 'Through sunlight', 'By eating too much sugar', 'Through sweat on the ball'], a: 0,
      exp: 'The CDC says it spreads mostly through saliva, so players should not share water bottles.' },
    { cat: 'Disorder · Rhabdomyolysis', q: 'Which is a warning sign of rhabdomyolysis?',
      opts: ['Better sleep', 'Dark, red or cola-colored urine', 'Stronger muscles', 'A runny nose'], a: 1,
      exp: 'MedlinePlus lists dark, red or cola-colored urine because damaged muscle releases myoglobin into the blood.' },
    { cat: 'Disorder · PFPS', q: 'Where do people with patellofemoral pain syndrome feel pain?',
      opts: ['In the lower back', 'In the ankle', 'In the front of the knee, around or behind the kneecap', 'In the chest'], a: 2,
      exp: 'Mayo Clinic describes it as pain felt in the front of the knee, around or behind the kneecap.' },
    { cat: 'Disorder · Anorexia nervosa', q: 'Compared with the general population, about how much higher is the mortality rate of people with anorexia nervosa?',
      opts: ['It is the same', 'About 2 times higher', 'Almost 6 times higher', 'It is lower'], a: 2,
      exp: 'A meta-analysis of 36 studies found a standardized mortality ratio of 5.86 for anorexia nervosa (Arcelus et al., 2011).' }
  ];
  var LETTERS = ['A', 'B', 'C', 'D'];
  var body = document.getElementById('quiz-body');
  var sbQ = document.getElementById('sb-q');
  var sbScore = document.getElementById('sb-score');
  var sbCat = document.getElementById('sb-cat');
  var bar = document.getElementById('quiz-progress');
  var live = document.getElementById('quiz-live');
  var current = 0, score = 0, answers = [];

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function setProgress(done) {
    bar.setAttribute('aria-valuenow', String(done));
    bar.firstElementChild.style.width = (done / QUESTIONS.length * 100) + '%';
  }

  function render(focus) {
    var item = QUESTIONS[current];
    body.innerHTML = '';
    sbQ.textContent = (current + 1) + ' / ' + QUESTIONS.length;
    sbScore.textContent = String(score);
    sbCat.textContent = item.cat.split(' · ')[0];
    setProgress(current);

    body.appendChild(el('span', 'q-cat', item.cat));
    var h = el('h3', 'q-text', 'Question ' + (current + 1) + ' of ' + QUESTIONS.length + ': ' + item.q);
    h.id = 'q-heading';
    h.tabIndex = -1;
    body.appendChild(h);

    var list = el('ul', 'options');
    list.setAttribute('aria-labelledby', 'q-heading');
    item.opts.forEach(function (text, i) {
      var li = el('li');
      var b = el('button', 'opt');
      b.type = 'button';
      b.appendChild(el('span', 'letter', LETTERS[i])).setAttribute('aria-hidden', 'true');
      var t = el('span', 'opt-txt', text);
      b.appendChild(t);
      b.setAttribute('aria-label', LETTERS[i] + ') ' + text);
      b.addEventListener('click', function () { choose(i); });
      li.appendChild(b);
      list.appendChild(li);
    });
    body.appendChild(list);
    if (focus) h.focus();
  }

  function choose(i) {
    var item = QUESTIONS[current];
    var right = i === item.a;
    if (right) score++;
    answers.push({ chosen: i, right: right });
    sbScore.textContent = String(score);
    setProgress(current + 1);

    var btns = body.querySelectorAll('.opt');
    btns.forEach(function (b, j) {
      b.disabled = true;
      if (j === item.a) {
        b.classList.add('correct');
        b.appendChild(el('span', 'tag', 'Correct answer'));
        b.setAttribute('aria-label', LETTERS[j] + ') ' + item.opts[j] + ' — correct answer');
      } else if (j === i) {
        b.classList.add('wrong');
        b.appendChild(el('span', 'tag', 'Your answer'));
        b.setAttribute('aria-label', LETTERS[j] + ') ' + item.opts[j] + ' — your answer, incorrect');
      } else {
        b.classList.add('dim');
      }
    });

    var fb = el('div', 'feedback ' + (right ? 'good' : 'bad'));
    fb.appendChild(el('strong', null, right ? 'Correct! Goal!' : 'Not quite: the answer is ' + LETTERS[item.a] + '.'));
    fb.appendChild(el('p', null, item.exp));
    body.appendChild(fb);

    var actions = el('div', 'quiz-actions');
    var last = current === QUESTIONS.length - 1;
    var next = el('button', 'btn btn-dark', last ? 'See my final score' : 'Next question →');
    next.type = 'button';
    next.addEventListener('click', function () {
      if (last) finish(); else { current++; render(true); }
    });
    actions.appendChild(next);
    body.appendChild(actions);

    live.textContent = (right ? 'Correct. ' : 'Incorrect. The correct answer is ' + LETTERS[item.a] + ', ' + item.opts[item.a] + '. ') + item.exp;
    next.focus({ preventScroll: true });
  }

  function finish() {
    var pct = Math.round(score / QUESTIONS.length * 100);
    var title, grade;
    if (score >= 11) { title = 'Pro level! You eat like a pro.'; grade = 'Excellent'; }
    else if (score >= 9) { title = 'Great game! Almost a pro.'; grade = 'Very good'; }
    else if (score >= 6) { title = 'Good effort: keep training!'; grade = 'Good'; }
    else { title = 'Back to training camp!'; grade = 'Keep practising'; }

    body.innerHTML = '';
    sbQ.textContent = 'Full time';
    sbCat.textContent = 'Result';
    setProgress(QUESTIONS.length);

    var wrap = el('div', 'result');
    var h = el('h3', null, 'Final score');
    h.tabIndex = -1;
    wrap.appendChild(h);
    var fin = el('p', 'final');
    fin.innerHTML = score + '<small> / ' + QUESTIONS.length + '</small>';
    wrap.appendChild(fin);
    wrap.appendChild(el('p', 'grade', grade + ' · ' + pct + '%'));
    wrap.appendChild(el('p', null, title + ' Review your answers below, and visit the fact sheet and vocabulary sections to learn more.'));

    var review = el('ol', 'review');
    QUESTIONS.forEach(function (q, i) {
      var a = answers[i];
      var li = el('li', a.right ? 'ok' : 'no');
      li.appendChild(el('span', 'mark', a.right ? '✓' : '✗')).setAttribute('aria-label', a.right ? 'Correct' : 'Incorrect');
      var d = el('div');
      d.appendChild(el('span', null, (i + 1) + '. ' + q.q));
      var s = el('small', null, a.right
        ? 'Your answer: ' + q.opts[a.chosen]
        : 'Your answer: ' + q.opts[a.chosen] + ' · Correct: ' + q.opts[q.a]);
      d.appendChild(s);
      li.appendChild(d);
      review.appendChild(li);
    });
    wrap.appendChild(review);

    var row = el('div', 'btn-row');
    var again = el('button', 'btn btn-gold', 'Play again');
    again.type = 'button';
    again.addEventListener('click', function () {
      current = 0; score = 0; answers = [];
      render(true);
    });
    row.appendChild(again);
    var link = el('a', 'btn btn-dark', 'Review the fact sheet');
    link.href = '#fact-sheet';
    row.appendChild(link);
    wrap.appendChild(row);

    body.appendChild(wrap);
    live.textContent = 'Quiz finished. Your score is ' + score + ' out of ' + QUESTIONS.length + ', ' + pct + ' percent.';
    h.focus({ preventScroll: true });
    document.getElementById('quiz-app').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  render(false);
})();
