/* CGV Experience — shared data and behaviour. Vanilla JS, works from file:// (no fetch). */
(function () {
  'use strict';

  document.documentElement.classList.add('js');

  var BASE = document.body.getAttribute('data-base') || '';
  var IMG = BASE + 'assets/images/';
  var PAGE = document.body.getAttribute('data-page') || '';
  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------ utils */
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function icon(id, cls) { return '<svg class="' + (cls || 'icon') + '" aria-hidden="true"><use href="#i-' + id + '"/></svg>'; }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function vnd(n) { return Number(n).toLocaleString('en-US') + '₫'; }
  function iso(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function parseISO(s) { var p = String(s).split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function today() { var d = new Date(); d.setHours(0, 0, 0, 0); return d; }
  function addDays(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  function longDate(d) { return DAYS[d.getDay()] + ', ' + d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear(); }
  function shortDate(d) { return DAYS[d.getDay()].slice(0, 3) + ' ' + d.getDate() + ' ' + MONTHS[d.getMonth()].slice(0, 3); }
  function dayWord(d) {
    var diff = Math.round((d - today()) / 864e5);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    return DAYS[d.getDay()];
  }
  function timeAgo(isoStr) {
    var s = Math.max(1, Math.round((Date.now() - new Date(isoStr).getTime()) / 1000));
    if (s < 60) return 'Just now';
    var m = Math.round(s / 60); if (m < 60) return m + ' min ago';
    var h = Math.round(m / 60); if (h < 24) return h + ' h ago';
    var dd = Math.round(h / 24); if (dd < 7) return dd + (dd === 1 ? ' day ago' : ' days ago');
    return shortDate(new Date(isoStr));
  }
  function qs(name) { var m = new RegExp('[?&]' + name + '=([^&#]*)').exec(location.search); return m ? decodeURIComponent(m[1].replace(/\+/g, ' ')) : null; }

  var store = {
    get: function (k, d) { try { var v = localStorage.getItem('cgvx.' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem('cgvx.' + k, JSON.stringify(v)); } catch (e) { /* storage unavailable: demo continues in memory */ } }
  };

  /* ------------------------------------------------------------------ data */
  var SERVICES = {
    'escape-room': {
      id: 'escape-room', name: 'Escape Room', code: 'ER', icon: 'lock',
      tagline: 'Discover a thrilling escape challenge',
      blurb: 'Take on puzzle rooms full of suspense, where teamwork and quick thinking are your only way out.',
      duration: 60, durationLabel: '1 hour', price: 149000, max: 6, cap: 12,
      page: 'escape-room.html', img: 'escape-room-puzzle.jpg', thumb: 'escape-room-table.jpg',
      alt: 'Four friends fitting glowing puzzle pieces together in a red-lit escape room'
    },
    'photo-booth': {
      id: 'photo-booth', name: 'Photo Booth', code: 'PB', icon: 'camera',
      tagline: 'Style and artistry in every frame',
      blurb: 'Capture the good times with friends in a modern booth with playful props and perfect light.',
      duration: 45, durationLabel: '45 min', price: 79000, max: 4, cap: 8,
      page: 'photo-booth.html', img: 'photobooth-neon.jpg', thumb: 'photo-strips.jpg',
      alt: 'Friends posing inside a red neon CGV Experience photobooth'
    },
    'combo-experience': {
      id: 'combo-experience', name: 'Combo Experience', code: 'CX', icon: 'layers',
      tagline: 'The full entertainment package',
      blurb: 'Save more and double the fun with a package that pairs an escape room with a photobooth session.',
      duration: 120, durationLabel: '2 hours', price: 199000, max: 6, cap: 12,
      page: 'combo-experience.html', img: 'combo-cards.jpg', thumb: 'combo-collage.jpg',
      alt: 'CGV Experience cards under red light'
    }
  };
  var ORDER = ['escape-room', 'photo-booth', 'combo-experience'];
  var METHODS = { card: 'Card', momo: 'MoMo', vnpay: 'VNPay', counter: 'Pay at counter' };

  var AUTHOR = { name: 'Nguyễn Thị Duyên', avatar: 'avatar-duyen.png' };
  var POSTS = [
    {
      slug: 'escape-room-habits', topic: 'Escape Room', date: '2026-11-04', read: 4, views: 212, likes: 18,
      img: 'escape-room-puzzle.jpg', alt: 'A team assembling glowing puzzle pieces on a dark table',
      title: 'Five habits of teams that escape with time to spare',
      excerpt: 'The teams that walk out early are rarely the cleverest. They talk more, search wider and know when to ask for a hint.',
      body: '<p>Every evening our game masters watch dozens of teams through the room cameras. The groups that walk out with minutes to spare are rarely the ones with the most puzzle experience. They simply play differently from the first second.</p>' +
        '<h2>1. Say everything out loud</h2><p>A number scratched on a drawer means nothing until someone hears it next to a four-digit lock on the other side of the room. Narrate what you find, even when it looks useless.</p>' +
        '<h2>2. Search in pairs, then swap</h2><p>Split the room, but trade areas after five minutes. Fresh eyes catch the panel that the first person leaned on without noticing.</p>' +
        '<h2>3. Keep a discard pile</h2><p>Once a key or a clue has done its job, put it in one corner. A clean table makes the next connection obvious.</p>' +
        '<blockquote>The clock is not your enemy. Silence is.</blockquote>' +
        '<h2>4. Ask for a hint before you are stuck</h2><p>Hints exist to keep the story moving. If the whole team has stared at the same lock for three minutes, call your game master over the radio.</p>' +
        '<h2>5. Celebrate the small wins</h2><p>Every opened lock is a reason to cheer. Teams that keep the energy up stay sharp in the final ten minutes, when most rooms are won or lost.</p>' +
        '<p>Ready to test the theory? <a href="booking.html?service=escape-room">Book an Escape Room slot</a> and bring your loudest friend.</p>'
    },
    {
      slug: 'photobooth-poses', topic: 'Photo Booth', date: '2026-10-30', read: 3, views: 187, likes: 24,
      img: 'photobooth-neon.jpg', alt: 'Friends laughing inside the neon photobooth',
      title: 'Photobooth poses that work every single time',
      excerpt: 'Four frames, a few seconds each. Here is a simple running order that turns a nervous group into a strip worth framing.',
      body: '<p>A photobooth strip is a tiny film: four frames, a few seconds each, and no retakes once the countdown starts. Plan a running order before you step inside and every strip comes out with a story.</p>' +
        '<h2>Frame one: the straight shot</h2><p>Everyone looks into the lens and smiles. It is the photo your parents will ask for, so get it out of the way first.</p>' +
        '<h2>Frame two: the prop swap</h2><p>Grab the props on the wall and swap them around the group. Oversized glasses on the tallest friend always win.</p>' +
        '<h2>Frame three: the reaction</h2><p>Pick one person to pretend they have just heard shocking news. Everyone else reacts to them, not to the camera.</p>' +
        '<h2>Frame four: the closer</h2><p>Lean in tight, arms around each other, and look at someone in the group instead of the lens. It is usually the frame people keep.</p>' +
        '<h3>A note on light</h3><p>Our booths are lit for faces. Stand close to the marked line on the floor so the light falls evenly across the whole group.</p>'
    },
    {
      slug: 'birthday-combo', topic: 'Events', date: '2026-10-26', read: 5, views: 143, likes: 11,
      img: 'combo-collage.jpg', alt: 'A collage of a group solving an escape room and posing in the photobooth',
      title: 'Planning a birthday around the Combo Experience',
      excerpt: 'Two hours, one escape room, one photobooth session and a strip of photos for every guest. A simple plan for a birthday that runs itself.',
      body: '<p>Birthdays for groups of friends tend to stall at the same question: what are we actually going to do? The Combo Experience answers it with two hours that run themselves.</p>' +
        '<h2>Before the day</h2><ul><li>Book the slot early, especially for Friday and Saturday evenings.</li><li>Count your group: up to six people per booking.</li><li>Share the booking code in your group chat so everyone knows the time.</li></ul>' +
        '<h2>On the day</h2><p>Arrive ten minutes early. Your game master briefs the group, then the escape room clock starts. When you get out, or when the hour runs out, you head straight to the photobooth.</p>' +
        '<blockquote>Puzzle first, photos second. Nobody poses better than a team that just escaped.</blockquote>' +
        '<h2>After the session</h2><p>Every guest leaves with a photo strip. Pair it with a film in the cinema next door and the evening is complete.</p>' +
        '<p><a href="combo-experience.html">See what the Combo Experience includes</a>.</p>'
    },
    {
      slug: 'first-visit-guide', topic: 'Guide', date: '2026-10-22', read: 4, views: 256, likes: 9,
      img: 'booking-on-phone.jpg', alt: 'A guest booking a slot on her phone at the CGV Experience entrance',
      title: 'First time at CGV Experience? How your visit runs',
      excerpt: 'From booking on your phone to walking out with a photo strip: what happens at each step, and what to bring.',
      body: '<p>CGV Experience sits on the first floor of the cinema on Nguyen Trai, Dai Mo, Hanoi. Here is how a visit runs from the moment you book.</p>' +
        '<h2>Book online</h2><p>Pick an experience, a date and an open time, then tell us how many people are coming. You get a booking code straight away.</p>' +
        '<h2>Arrive ten minutes early</h2><p>Show your booking code at the counter. If you chose to pay at the counter, this is when you pay.</p>' +
        '<h2>Play</h2><p>Your game master or booth host takes it from there: a short briefing, then the clock or the camera starts.</p>' +
        '<h2>Need to change plans?</h2><p>You can cancel from <a href="my-bookings.html">My bookings</a>. Read the <a href="policies.html#cancellation">cancellation policy</a> for the details.</p>'
    },
    {
      slug: 'red-light-outfits', topic: 'Photo Booth', date: '2026-10-19', read: 3, views: 98, likes: 7,
      img: 'photo-strips.jpg', alt: 'Hands holding a set of CGV Experience photo strips',
      title: 'What to wear under red light',
      excerpt: 'Red light changes colours in ways you might not expect. A short guide to outfits that stay sharp on the strip.',
      body: '<p>Our booths are washed in red, which makes skin glow and turns some colours into something else entirely. A few rules keep your strip sharp.</p>' +
        '<h2>Wear contrast</h2><p>Black, white and denim hold their shape under red light. Bright red clothes disappear into the background.</p>' +
        '<h2>Texture beats pattern</h2><p>Leather, knit and sequins catch the light. Small prints blur together at photo-strip size.</p>' +
        '<h2>Coordinate, do not match</h2><p>Pick one shared detail for the group, a colour or an accessory, rather than identical outfits.</p>'
    },
    {
      slug: 'inside-chamber-of-mysteries', topic: 'Escape Room', date: '2026-10-19', read: 5, views: 164, likes: 15,
      img: 'escape-room-table.jpg', alt: 'A group gathered around a map table in the Chamber of Mysteries room',
      title: 'Inside Chamber of Mysteries',
      excerpt: 'Maps, gears and a locked cabinet: a look at how an escape room is put together, without spoiling a single puzzle.',
      body: '<p>Chamber of Mysteries is a room of old maps, brass gears and locked cabinets. We will not spoil a single puzzle, but we can show you how a room like this is put together.</p>' +
        '<h2>A story first</h2><p>Every room starts as a short story with a clear goal. Each puzzle is a step in that story, so solving it should feel like turning a page.</p>' +
        '<h2>Layers of locks</h2><p>Early puzzles are open to everyone at once. Later ones need two or three earlier answers combined, which is why talking to each other matters so much.</p>' +
        '<h2>The game master</h2><p>Someone is always watching, ready with a hint over the radio. Their job is to keep the story moving, not to hand you the answer.</p>' +
        '<p><a href="escape-room.html">Read more about the Escape Room</a>.</p>'
    }
  ];

  /* ------------------------------------------------------------------ state helpers */
  function getBookings() { return store.get('bookings', []); }
  function saveBookings(b) { store.set('bookings', b); }
  function getUser() { return store.get('user', null); }
  function getNotifs() { return store.get('notifs', []); }
  function addNotif(n) {
    var list = getNotifs();
    list.unshift({ id: 'n' + Date.now() + Math.floor(Math.random() * 1000), type: n.type || 'info', title: n.title, text: n.text, at: new Date().toISOString(), read: false });
    store.set('notifs', list.slice(0, 60));
    updateHeader();
  }

  function bookingStart(b) { var d = parseISO(b.date); d.setHours(parseInt(b.time, 10), 0, 0, 0); return d; }
  function isUpcoming(b) { return b.status === 'confirmed' && bookingStart(b) > new Date(); }

  /* deterministic demo occupancy so the calendar feels alive */
  function seeded(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return ((h >>> 0) % 1000) / 1000;
  }
  function bookedPeople(sid, date, hour) {
    return getBookings().reduce(function (sum, b) {
      return sum + (b.service === sid && b.date === date && parseInt(b.time, 10) === hour && b.status === 'confirmed' ? b.party : 0);
    }, 0);
  }
  function slotsFor(sid, dateStr) {
    var s = SERVICES[sid], d = parseISO(dateStr);
    var weekend = d.getDay() === 0 || d.getDay() === 6;
    var close = weekend ? 22 : 21;
    var last = close - Math.ceil(s.duration / 60);
    var now = new Date(), out = [];
    for (var h = 9; h <= last; h++) {
      var load = 0.55 + (h >= 17 ? 0.45 : 0) + (weekend ? 0.3 : 0);
      var taken = Math.min(s.cap, Math.floor(seeded(sid + dateStr + h) * load * s.cap));
      var left = Math.max(0, s.cap - taken - bookedPeople(sid, dateStr, h));
      var start = parseISO(dateStr); start.setHours(h, 0, 0, 0);
      out.push({ h: h, time: pad(h) + ':00', left: left, past: start <= now });
    }
    return out;
  }
  function nextOpen(sid) {
    for (var i = 0; i < 14; i++) {
      var ds = iso(addDays(today(), i));
      var slots = slotsFor(sid, ds);
      for (var j = 0; j < slots.length; j++) {
        if (!slots[j].past && slots[j].left > 0) return { date: ds, slot: slots[j] };
      }
    }
    return null;
  }
  function hoursToday() {
    var d = new Date(), weekend = d.getDay() === 0 || d.getDay() === 6;
    return { open: 9, close: weekend ? 22 : 21 };
  }
  function bookingUrl(sid, date, h) {
    var u = BASE + 'booking.html?service=' + sid;
    if (date) u += '&date=' + date;
    if (h != null) u += '&time=' + h;
    return u;
  }
  function genCode() {
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', c = '';
    for (var i = 0; i < 6; i++) c += chars[Math.floor(Math.random() * chars.length)];
    return 'CGVX-' + c;
  }

  /* ------------------------------------------------------------------ toast + dialogs */
  var toastHost;
  function toast(msg, ico) {
    if (!toastHost) { toastHost = document.createElement('div'); toastHost.className = 'toasts'; toastHost.setAttribute('role', 'status'); toastHost.setAttribute('aria-live', 'polite'); document.body.appendChild(toastHost); }
    var t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = icon(ico || 'check') + '<span>' + esc(msg) + '</span>';
    toastHost.appendChild(t);
    setTimeout(function () { t.classList.add('is-leaving'); setTimeout(function () { t.remove(); }, 300); }, 3600);
  }

  function makeDialog(html, cls) {
    var d = document.createElement('dialog');
    d.className = 'modal ' + (cls || '');
    d.innerHTML = html;
    document.body.appendChild(d);
    d.addEventListener('click', function (e) { if (e.target === d) d.close(); });
    $$('[data-close]', d).forEach(function (b) { b.addEventListener('click', function () { d.close(); }); });
    return d;
  }
  function confirmDialog(opts) {
    return new Promise(function (resolve) {
      var d = makeDialog(
        '<div class="modal__head"><h2>' + esc(opts.title) + '</h2><button class="icon-btn" type="button" data-close aria-label="Close">' + icon('x') + '</button></div>' +
        '<div class="modal__body"><p>' + esc(opts.text) + '</p><div class="modal__actions">' +
        '<button class="btn btn--ghost" type="button" data-close>' + esc(opts.cancel || 'Keep it') + '</button>' +
        '<button class="btn btn--primary" type="button" data-ok>' + esc(opts.ok || 'Confirm') + '</button></div></div>', 'modal--confirm');
      var ok = false;
      $('[data-ok]', d).addEventListener('click', function () { ok = true; d.close(); });
      d.addEventListener('close', function () { resolve(ok); d.remove(); });
      d.showModal();
    });
  }

  /* ------------------------------------------------------------------ validation */
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  function setError(input, msg) {
    var field = input.closest('.field');
    var err = field && $('.field__error', field);
    if (field) field.classList.toggle('is-invalid', !!msg);
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    if (err) err.textContent = msg || '';
  }
  function checkInput(input) {
    var v = input.value.trim(), label = input.getAttribute('data-label') || 'This field';
    var msg = '';
    if (input.required && !v) msg = label + ' is required.';
    else if (v && input.type === 'email' && !EMAIL_RE.test(v)) msg = 'Enter an email like name@example.com.';
    else if (v && input.getAttribute('data-phone') != null && !/^0?[0-9 ]{9,11}$/.test(v)) msg = 'Enter a Vietnamese mobile number, e.g. 912 345 678.';
    else if (input.minLength > 0 && v && v.length < input.minLength) msg = label + ' needs at least ' + input.minLength + ' characters.';
    setError(input, msg);
    return !msg;
  }
  function validateForm(form) {
    var ok = true, first = null;
    $$('input, textarea', form).forEach(function (i) {
      if (i.type === 'checkbox' || i.type === 'radio' || i.type === 'hidden' || i.closest('[hidden]')) return;
      if (!checkInput(i)) { ok = false; first = first || i; }
    });
    if (first) first.focus();
    return ok;
  }
  function liveValidate(form) {
    form.addEventListener('blur', function (e) {
      if (e.target.matches && e.target.matches('input, textarea') && e.target.value) checkInput(e.target);
    }, true);
    form.addEventListener('input', function (e) {
      if (e.target.getAttribute && e.target.getAttribute('aria-invalid') === 'true') checkInput(e.target);
    });
  }

  /* ------------------------------------------------------------------ header */
  function updateHeader() {
    var upcoming = getBookings().filter(isUpcoming).length;
    $$('[data-count="bookings"]').forEach(function (b) { b.textContent = upcoming; b.hidden = upcoming === 0; });
    var user = getUser();
    var unread = user ? getNotifs().filter(function (n) { return !n.read; }).length : 0;
    $$('[data-count="notifs"]').forEach(function (b) { b.textContent = unread > 9 ? '9+' : unread; b.hidden = unread === 0; });
    $$('[data-account]').forEach(function (btn) {
      if (user) {
        btn.innerHTML = '<span class="avatar-mini" aria-hidden="true">' + esc((user.name || user.email).charAt(0)) + '</span>';
        btn.setAttribute('aria-label', 'Account: ' + user.email);
        btn.setAttribute('title', user.email);
      } else {
        btn.innerHTML = icon('user');
        btn.setAttribute('aria-label', 'Log in or sign up');
        btn.removeAttribute('title');
      }
    });
  }

  function initHeader() {
    var toggle = $('[data-menu-toggle]'), menu = $('#mobile-menu');
    if (toggle && menu) {
      var setOpen = function (open) {
        menu.classList.toggle('is-open', open);
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        toggle.innerHTML = icon(open ? 'x' : 'menu');
        document.body.classList.toggle('menu-open', open);
      };
      toggle.addEventListener('click', function () { setOpen(!menu.classList.contains('is-open')); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) { setOpen(false); toggle.focus(); } });
      window.addEventListener('resize', function () { if (window.innerWidth >= 1100 && menu.classList.contains('is-open')) setOpen(false); });
    }
    $$('[data-account]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (getUser()) location.href = BASE + 'notifications.html';
        else openAuth('login');
      });
    });
    $$('[data-auth]').forEach(function (b) {
      b.addEventListener('click', function (e) { e.preventDefault(); openAuth(b.getAttribute('data-auth')); });
    });
    updateHeader();
  }

  /* ------------------------------------------------------------------ auth */
  var authDialog;
  function openAuth(mode) {
    if (!authDialog) {
      authDialog = makeDialog(
        '<div class="modal__head"><h2 id="auth-title">Sign up</h2><button class="icon-btn" type="button" data-close aria-label="Close">' + icon('x') + '</button></div>' +
        '<form class="modal__body" novalidate aria-labelledby="auth-title">' +
        '<p class="modal__switch" data-auth-switch></p>' +
        '<div class="field"><label class="label" for="auth-email">Email</label><input id="auth-email" name="email" type="email" autocomplete="email" required data-label="Email" placeholder="name@example.com"><p class="field__error"></p></div>' +
        '<div class="field"><label class="label" for="auth-pw">Password</label><div class="pw-wrap"><input id="auth-pw" name="password" type="password" minlength="6" required data-label="Password" autocomplete="current-password"><button class="icon-btn" type="button" data-pw-toggle aria-label="Show password">' + icon('eye') + '</button></div><p class="field__error"></p></div>' +
        '<p class="form-msg is-error" data-auth-msg></p>' +
        '<button class="btn btn--primary btn--block" type="submit" data-auth-submit>Sign up</button>' +
        '<div class="or">or</div>' +
        '<div class="social-btns"><button class="btn btn--ghost btn--block" type="button" data-social="Google">' + icon('google') + 'Continue with Google</button>' +
        '<button class="btn btn--ghost btn--block" type="button" data-social="Facebook">' + icon('facebook') + 'Continue with Facebook</button></div>' +
        '</form>');
      var form = $('form', authDialog);
      liveValidate(form);
      $('[data-pw-toggle]', authDialog).addEventListener('click', function () {
        var pw = $('#auth-pw'), show = pw.type === 'password';
        pw.type = show ? 'text' : 'password';
        this.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
        this.innerHTML = icon(show ? 'eye-off' : 'eye');
      });
      $$('[data-social]', authDialog).forEach(function (b) {
        b.addEventListener('click', function () { toast(b.getAttribute('data-social') + ' sign-in is not connected in this demo. Use email instead.', 'info'); });
      });
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var msg = $('[data-auth-msg]', authDialog);
        msg.textContent = '';
        if (!validateForm(form)) return;
        var email = $('#auth-email').value.trim().toLowerCase(), pw = $('#auth-pw').value;
        var users = store.get('users', []);
        var found = users.filter(function (u) { return u.email === email; })[0];
        var mode = authDialog.getAttribute('data-mode');
        if (mode === 'signup') {
          if (found) { msg.textContent = 'An account with this email already exists. Log in instead.'; return; }
          var name = email.split('@')[0];
          users.push({ email: email, password: pw, name: name });
          store.set('users', users);
          store.set('user', { email: email, name: name });
          addNotif({ type: 'tip', title: 'Weekend evenings fill first', text: 'Friday and Saturday slots after 17:00 go quickest. Book early to get your time.' });
          addNotif({ type: 'welcome', title: 'Welcome to CGV Experience', text: 'Booking confirmations, reminders and news will land here.' });
          authDialog.close();
          toast('Account created. You are signed in.');
        } else {
          if (!found || found.password !== pw) { msg.textContent = 'That email and password do not match an account.'; return; }
          store.set('user', { email: found.email, name: found.name });
          authDialog.close();
          toast('Welcome back, ' + found.name + '.');
        }
        updateHeader();
        document.dispatchEvent(new CustomEvent('cgvx:auth'));
      });
    }
    setAuthMode(mode || 'signup');
    $('[data-auth-msg]', authDialog).textContent = '';
    $$('input', authDialog).forEach(function (i) { setError(i, ''); });
    authDialog.showModal();
    $('#auth-email').focus();
  }
  function setAuthMode(mode) {
    authDialog.setAttribute('data-mode', mode);
    var signup = mode === 'signup';
    $('#auth-title').textContent = signup ? 'Sign up' : 'Log in';
    $('[data-auth-submit]', authDialog).textContent = signup ? 'Sign up' : 'Log in';
    $('#auth-pw').setAttribute('autocomplete', signup ? 'new-password' : 'current-password');
    var sw = $('[data-auth-switch]', authDialog);
    sw.innerHTML = (signup ? 'Already have an account? ' : 'New here? ') + '<button type="button">' + (signup ? 'Log in' : 'Create an account') + '</button>';
    $('button', sw).addEventListener('click', function () { setAuthMode(signup ? 'login' : 'signup'); });
  }
  function logout() {
    store.set('user', null);
    updateHeader();
    toast('You are signed out.');
    document.dispatchEvent(new CustomEvent('cgvx:auth'));
  }

  /* ------------------------------------------------------------------ forms: newsletter + contact */
  function initNewsletter() {
    $$('form[data-newsletter]').forEach(function (form) {
      liveValidate(form);
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var input = $('input[type=email]', form), msg = $('.form-msg', form);
        msg.className = 'form-msg'; msg.textContent = '';
        if (!checkInput(input)) { input.focus(); return; }
        var email = input.value.trim().toLowerCase();
        var list = store.get('newsletter', []);
        if (list.indexOf(email) !== -1) {
          msg.classList.add('is-error');
          msg.textContent = email + ' is already on the list.';
          return;
        }
        list.push(email);
        store.set('newsletter', list);
        input.value = '';
        msg.classList.add('is-ok');
        msg.textContent = 'You are on the list. The next issue goes to ' + email + '.';
        addNotif({ type: 'mail', title: 'Newsletter subscription confirmed', text: email + ' will get new experiences and offers by email.' });
      });
    });
  }

  function initContact() {
    var form = $('form[data-contact]');
    if (!form) return;
    liveValidate(form);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validateForm(form)) return;
      var btn = $('[type=submit]', form);
      btn.classList.add('is-loading'); btn.disabled = true;
      setTimeout(function () {
        var first = form.elements.first.value.trim(), email = form.elements.email.value.trim();
        var box = document.createElement('div');
        box.className = 'empty';
        box.style.cssText = 'justify-items:start;text-align:left;border-style:solid';
        box.innerHTML = '<h3 class="h3" tabindex="-1">Message sent</h3><p>Thanks, ' + esc(first) + '. We will reply to <strong style="color:var(--paper)">' + esc(email) + '</strong>. For anything urgent, call 1900 588 888.</p>' +
          '<button class="btn btn--ghost" type="button">Send another message</button>';
        form.hidden = true;
        form.parentNode.insertBefore(box, form.nextSibling);
        $('h3', box).focus();
        $('button', box).addEventListener('click', function () {
          form.reset(); btn.classList.remove('is-loading'); btn.disabled = false;
          form.hidden = false; box.remove(); form.elements.first.focus();
        });
      }, 700);
    });
  }

  /* ------------------------------------------------------------------ images: graceful fallback */
  function fallbackImg(img) {
    if (img.getAttribute('data-failed')) return;
    img.setAttribute('data-failed', '1');
    var d = document.createElement('div');
    d.className = 'img-fallback';
    d.setAttribute('role', 'img');
    d.setAttribute('aria-label', img.alt || 'Image unavailable');
    d.textContent = img.getAttribute('data-fallback') || 'CGV Experience';
    img.replaceWith(d);
  }
  document.addEventListener('error', function (e) { if (e.target && e.target.tagName === 'IMG') fallbackImg(e.target); }, true);
  function sweepBrokenImages() { $$('img').forEach(function (img) { if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) fallbackImg(img); }); }

  /* ------------------------------------------------------------------ reveal on scroll */
  function initReveal() {
    var els = $$('.reveal');
    if (!els.length) return;
    if (!('IntersectionObserver' in window) || REDUCED) { els.forEach(function (el) { el.classList.add('is-in'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ------------------------------------------------------------------ leader ring markup */
  function leaderRings() {
    return '<svg class="leader__rings" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="46"/><circle cx="50" cy="50" r="36"/><path d="M50 0v100M0 50h100"/></svg>';
  }

  /* ------------------------------------------------------------------ home */
  function initHome() {
    var hero = $('.hero'), ring = $('[data-countdown]');
    var h = hoursToday(), nowH = new Date().getHours();
    var status = nowH < h.open ? 'Opens today 09:00' : nowH >= h.close ? 'Closed now · opens 09:00' : 'Open today until ' + h.close + ':00';
    function finish() {
      if (ring) {
        ring.classList.remove('is-counting');
        ring.classList.add('is-done');
        $('.leader__inner', ring).innerHTML = '<span class="leader__play">' + icon('play') + '<span>' + status + '</span></span>';
      }
      if (hero) hero.classList.add('is-lit');
    }
    var played = false;
    try { played = sessionStorage.getItem('cgvx.countdown') === '1'; } catch (e) { /* ignore */ }
    if (!ring || REDUCED || played) finish();
    else {
      var n = 3, inner = $('.leader__inner', ring);
      ring.classList.add('is-counting');
      inner.innerHTML = '<span class="leader__num">3</span>';
      var timer = setInterval(function () {
        n--;
        if (n > 0) inner.innerHTML = '<span class="leader__num">' + n + '</span>';
        else { clearInterval(timer); finish(); try { sessionStorage.setItem('cgvx.countdown', '1'); } catch (e) { /* ignore */ } }
      }, 1000);
    }

    var list = $('[data-now]');
    if (list) {
      list.innerHTML = ORDER.map(function (sid) {
        var s = SERVICES[sid], n = nextOpen(sid);
        if (!n) return '<li><a class="now__item" href="' + bookingUrl(sid) + '"><span class="now__name">' + s.name + '</span><span class="now__meta">Fully booked this fortnight</span></a></li>';
        var d = parseISO(n.date), low = n.slot.left <= 3;
        return '<li><a class="now__item" href="' + bookingUrl(sid, n.date, n.slot.h) + '" aria-label="Book ' + s.name + ', ' + dayWord(d) + ' at ' + n.slot.time + ', ' + n.slot.left + ' spots left">' +
          '<span class="now__name">' + s.name + '</span>' +
          '<span class="now__time">' + n.slot.time + '</span>' +
          '<span class="now__meta">' + dayWord(d) + ' · <span class="' + (low ? 'spots-low' : '') + '">' + n.slot.left + ' spots left</span> · ' + vnd(s.price) + '/person</span>' +
          '</a></li>';
      }).join('');
    }
    var hrs = $('[data-hours-today]');
    if (hrs) {
      var wd = new Date().getDay(), weekend = wd === 0 || wd === 6;
      $$('[data-hours]', hrs).forEach(function (row) { row.classList.toggle('is-today', (row.getAttribute('data-hours') === 'weekend') === weekend); });
    }
  }

  /* ------------------------------------------------------------------ service pages */
  function initServicePage() {
    var sid = document.body.getAttribute('data-service');
    if (!sid) return;
    var n = nextOpen(sid);
    $$('[data-next-slot]').forEach(function (a) {
      if (!n) { a.innerHTML = '<span>No open slots in the next two weeks</span>'; a.href = bookingUrl(sid); return; }
      var d = parseISO(n.date);
      a.href = bookingUrl(sid, n.date, n.slot.h);
      a.innerHTML = '<span><span class="label" style="margin:0">Next open</span>' + dayWord(d) + ' · ' + n.slot.left + ' spots left</span><strong>' + n.slot.time + '</strong>';
    });
    document.body.classList.add('has-sticky-bar');
  }

  /* ------------------------------------------------------------------ booking */
  function initBooking() {
    var root = $('[data-booking]');
    if (!root) return;
    var user = getUser();
    var st = {
      step: 1, service: null, date: null, hour: null, party: 2,
      first: '', last: '', email: user ? user.email : '', phone: '', notes: '', method: 'card'
    };
    var qService = qs('service');
    if (qService && SERVICES[qService]) {
      st.service = qService; st.step = 2;
      var qDate = qs('date'), qTime = qs('time');
      if (qDate && /^\d{4}-\d{2}-\d{2}$/.test(qDate) && parseISO(qDate) >= today()) {
        st.date = qDate;
        if (qTime != null) {
          var sl = slotsFor(qService, qDate).filter(function (x) { return x.h === parseInt(qTime, 10) && !x.past && x.left > 0; })[0];
          if (sl) st.hour = sl.h;
        }
      }
    }
    if (!st.date) st.date = iso(today());
    var calMonth = parseISO(st.date); calMonth.setDate(1);

    var frames = $$('.bk-frame', root);
    var ticket = $('[data-ticket]');

    function svc() { return st.service ? SERVICES[st.service] : null; }
    function total() { return svc() ? svc().price * st.party : 0; }
    function slotObj() { return st.service && st.hour != null ? slotsFor(st.service, st.date).filter(function (x) { return x.h === st.hour; })[0] : null; }
    function maxParty() { var s = svc(); if (!s) return 6; var so = slotObj(); return Math.max(1, Math.min(s.max, so ? so.left : s.max)); }

    function summary(step) {
      var s = svc();
      if (step === 1) return s ? s.name + ' · ' + s.durationLabel : '';
      if (step === 2) return st.hour != null ? shortDate(parseISO(st.date)) + ' · ' + pad(st.hour) + ':00' : '';
      if (step === 3) return st.first ? st.first + ' ' + st.last + ' · ' + st.party + (st.party === 1 ? ' person' : ' people') : '';
      return '';
    }

    function renderFrames() {
      frames.forEach(function (f) {
        var n = +f.getAttribute('data-step');
        var state = n === st.step ? 'active' : n < st.step ? 'done' : 'locked';
        f.setAttribute('data-state', state);
        var body = $('.bk-frame__body', f), sum = $('.bk-frame__sum', f), change = $('[data-change]', f);
        body.hidden = state !== 'active';
        if (state !== 'active') body.innerHTML = '';
        sum.textContent = state === 'done' ? summary(n) : '';
        sum.hidden = state !== 'done';
        change.hidden = state !== 'done';
      });
      var active = frames[st.step - 1];
      var body = $('.bk-frame__body', active);
      body.innerHTML = [renderService, renderTime, renderDetails, renderPayment][st.step - 1]();
      bindStep(st.step, body);
      renderTicket();
    }

    function go(step) {
      st.step = step;
      renderFrames();
      var f = frames[step - 1];
      var hh = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h'), 10) || 72;
      var r = f.getBoundingClientRect();
      if (r.top < hh || r.top > window.innerHeight * 0.55) window.scrollTo({ top: r.top + window.scrollY - hh - 16, behavior: REDUCED ? 'auto' : 'smooth' });
      var h = $('h2', f); h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true });
    }

    function actions(backStep, nextLabel, nextAttr) {
      return '<div class="bk-actions">' +
        (backStep ? '<button class="btn btn--quiet" type="button" data-back="' + backStep + '">' + icon('arrow-left') + 'Back</button>' : '<span></span>') +
        '<span class="bk-total-inline">Total <strong>' + vnd(total()) + '</strong></span>' +
        '<button class="btn btn--primary" type="button" ' + nextAttr + '>' + nextLabel + icon('arrow-right') + '</button></div>';
    }

    function renderService() {
      return '<fieldset style="border:0;padding:0;margin:0"><legend class="sr-only">Choose an experience</legend><div class="opt-list">' +
        ORDER.map(function (sid) {
          var s = SERVICES[sid];
          return '<label class="opt"><input type="radio" name="bk-service" value="' + sid + '"' + (st.service === sid ? ' checked' : '') + '>' +
            '<span class="frame"><img src="' + IMG + s.img + '" alt="" loading="lazy" data-fallback="' + s.code + '"></span>' +
            '<span><strong>' + s.name + '</strong><span class="muted">' + s.durationLabel + ' · up to ' + s.max + ' people</span></span>' +
            '<span class="price">' + vnd(s.price) + '<small>/person</small></span></label>';
        }).join('') + '</div></fieldset><p class="bk-error" data-err role="alert"></p>' + actions(0, 'Continue', 'data-next="2"');
    }

    function renderCalendar() {
      var y = calMonth.getFullYear(), m = calMonth.getMonth();
      var first = new Date(y, m, 1), startDow = (first.getDay() + 6) % 7;
      var daysIn = new Date(y, m + 1, 0).getDate();
      var t0 = today(), maxD = addDays(t0, 60);
      var prevDisabled = y < t0.getFullYear() || (y === t0.getFullYear() && m <= t0.getMonth());
      var nextDisabled = new Date(y, m + 1, 1) > maxD;
      var html = '<div class="cal"><div class="cal__head">' +
        '<button class="icon-btn" type="button" data-cal="-1" aria-label="Previous month"' + (prevDisabled ? ' disabled' : '') + '>' + icon('chevron-left') + '</button>' +
        '<h3 aria-live="polite">' + MONTHS[m] + ' ' + y + '</h3>' +
        '<button class="icon-btn" type="button" data-cal="1" aria-label="Next month"' + (nextDisabled ? ' disabled' : '') + '>' + icon('chevron-right') + '</button></div>' +
        '<div class="cal__grid" role="group" aria-label="Dates in ' + MONTHS[m] + '">';
      ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].forEach(function (d) { html += '<span class="cal__dow" aria-hidden="true">' + d + '</span>'; });
      for (var i = 0; i < startDow; i++) html += '<span></span>';
      for (var d = 1; d <= daysIn; d++) {
        var dt = new Date(y, m, d), ds = iso(dt);
        var dis = dt < t0 || dt > maxD;
        if (!dis && dt.getTime() === t0.getTime()) dis = !slotsFor(st.service, ds).some(function (x) { return !x.past; });
        html += '<button type="button" class="cal__day' + (dt.getTime() === t0.getTime() ? ' is-today' : '') + '" data-date="' + ds + '" aria-pressed="' + (ds === st.date) + '" aria-label="' + longDate(dt) + '"' + (dis ? ' disabled' : '') + '>' + d + '</button>';
      }
      return html + '</div></div>';
    }

    function renderSlots() {
      var slots = slotsFor(st.service, st.date).filter(function (x) { return !x.past; });
      var d = parseISO(st.date);
      var head = '<div class="slots__head"><h3>' + longDate(d) + '</h3><span class="edge">Indochina Time · GMT+7</span></div>';
      if (!slots.length) return head + '<p class="slots-empty">No more sessions on this day. Pick another date.</p>';
      return head + '<div class="slots" role="group" aria-label="Start times">' + slots.map(function (x) {
        var full = x.left === 0, low = !full && x.left <= 3;
        return '<button type="button" class="slot" data-hour="' + x.h + '" aria-pressed="' + (st.hour === x.h) + '"' + (full ? ' disabled' : '') +
          ' aria-label="' + x.time + (full ? ', full' : ', ' + x.left + ' spots left') + '">' +
          '<span class="slot__time">' + x.time + '</span><span class="slot__left' + (low ? ' is-low' : '') + '">' + (full ? 'Full' : x.left + ' left') + '</span></button>';
      }).join('') + '</div>';
    }

    function renderTime() {
      if (!slotsFor(st.service, st.date).some(function (x) { return !x.past; })) { st.date = iso(addDays(today(), 1)); calMonth = parseISO(st.date); calMonth.setDate(1); }
      return '<div class="cal-wrap"><div data-cal-host>' + renderCalendar() + '</div><div data-slot-host>' + renderSlots() + '</div></div>' +
        '<p class="bk-error" data-err role="alert"></p>' + actions(1, 'Continue', 'data-next="3"');
    }

    function field(id, label, type, val, ac, req, hint) {
      return '<div class="field"><label class="label" for="' + id + '">' + label + (req ? ' <span class="req" aria-hidden="true">*</span>' : '') + '</label>' +
        '<input id="' + id + '" type="' + type + '" autocomplete="' + ac + '"' + (req ? ' required' : '') + ' data-label="' + label + '" value="' + esc(val) + '">' +
        (hint ? '<p class="field__hint">' + hint + '</p>' : '') + '<p class="field__error"></p></div>';
    }
    function renderDetails() {
      var max = maxParty();
      if (st.party > max) st.party = max;
      return '<div class="form-grid form-grid--2" data-details>' +
        field('bk-first', 'First name', 'text', st.first, 'given-name', true) +
        field('bk-last', 'Last name', 'text', st.last, 'family-name', true) +
        field('bk-email', 'Email', 'email', st.email, 'email', true, 'Your booking code is sent here.') +
        '<div class="field"><label class="label" for="bk-phone">Phone <span class="req" aria-hidden="true">*</span></label><div class="input-group"><span class="input-group__pre" aria-hidden="true">+84</span><input id="bk-phone" type="tel" inputmode="numeric" autocomplete="tel-national" required data-phone data-label="Phone" value="' + esc(st.phone) + '" placeholder="912 345 678" aria-describedby="bk-phone-pre"></div><span class="sr-only" id="bk-phone-pre">Vietnam, +84</span><p class="field__error"></p></div>' +
        '<div class="field span-2"><span class="label" id="party-label">People</span><div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap">' +
        '<div class="stepper" role="group" aria-labelledby="party-label"><button type="button" data-party="-1" aria-label="Fewer people">' + icon('minus') + '</button><output aria-live="polite" data-party-out>' + st.party + '</output><button type="button" data-party="1" aria-label="More people">' + icon('plus') + '</button></div>' +
        '<span class="muted">Up to ' + max + ' for this slot · ' + vnd(svc().price) + ' per person</span></div></div>' +
        '<div class="field span-2"><label class="label" for="bk-notes">Notes (optional)</label><textarea id="bk-notes" rows="3" placeholder="Celebrating something? Let us know.">' + esc(st.notes) + '</textarea></div>' +
        '</div>' + actions(2, 'Continue to payment', 'data-next="4"');
    }

    function qrSvg(seed) {
      var n = 25, cells = '';
      function finder(x, y) { return '<path d="M' + x + ' ' + y + 'h7v7h-7zM' + (x + 1) + ' ' + (y + 1) + 'v5h5v-5z" fill-rule="evenodd"/><rect x="' + (x + 2) + '" y="' + (y + 2) + '" width="3" height="3"/>'; }
      for (var y = 0; y < n; y++) for (var x = 0; x < n; x++) {
        var inF = (x < 8 && y < 8) || (x > n - 9 && y < 8) || (x < 8 && y > n - 9);
        if (!inF && seeded(seed + x + ',' + y) > 0.52) cells += '<rect x="' + x + '" y="' + y + '" width="1" height="1"/>';
      }
      return '<svg viewBox="0 0 ' + n + ' ' + n + '" fill="#0b0a0a" shape-rendering="crispEdges" role="img" aria-label="Demo payment QR code">' + cells + finder(0, 0) + finder(n - 7, 0) + finder(0, n - 7) + '</svg>';
    }

    function renderPayment() {
      var opts = [
        ['card', 'credit-card', 'Credit or debit card', 'Visa, Mastercard, JCB'],
        ['momo', 'wallet', 'MoMo', 'Scan with the MoMo app'],
        ['vnpay', 'qr', 'VNPay', 'Scan with your banking app'],
        ['counter', 'store', 'Pay at the counter', 'Slot held until 15 minutes before it starts']
      ];
      return '<fieldset style="border:0;padding:0;margin:0"><legend class="sr-only">Payment method</legend><div class="opt-list">' + opts.map(function (o) {
        return '<label class="opt opt--plain"><input type="radio" name="bk-pay" value="' + o[0] + '"' + (st.method === o[0] ? ' checked' : '') + '>' +
          '<span class="opt__radio" aria-hidden="true"></span><span><strong>' + o[2] + '</strong><span class="muted">' + o[3] + '</span></span>' + icon(o[1]) + '</label>';
      }).join('') + '</div></fieldset>' +
        '<div class="pay-panel" data-pay="card"' + (st.method === 'card' ? '' : ' hidden') + '><div class="form-grid form-grid--2">' +
        '<div class="field span-2"><label class="label" for="cc-num">Card number</label><input id="cc-num" inputmode="numeric" autocomplete="cc-number" placeholder="4242 4242 4242 4242" maxlength="19" data-label="Card number" data-cc></div>' +
        '<div class="field"><label class="label" for="cc-exp">Expiry</label><input id="cc-exp" inputmode="numeric" autocomplete="cc-exp" placeholder="MM/YY" maxlength="5" data-label="Expiry" data-exp></div>' +
        '<div class="field"><label class="label" for="cc-cvc">CVC</label><input id="cc-cvc" inputmode="numeric" autocomplete="cc-csc" placeholder="123" maxlength="4" data-label="CVC" data-cvc></div>' +
        '<p class="field__hint span-2">Demo only: no payment is taken. Any 16-digit number works.</p></div></div>' +
        '<div class="pay-panel" data-pay="momo"' + (st.method === 'momo' ? '' : ' hidden') + '><div class="qr">' + qrSvg('momo') + '<p class="muted">Open MoMo, tap Scan and point it at this code. In this demo, press Pay to continue.</p></div></div>' +
        '<div class="pay-panel" data-pay="vnpay"' + (st.method === 'vnpay' ? '' : ' hidden') + '><div class="qr">' + qrSvg('vnpay') + '<p class="muted">Scan with any banking app that supports VNPay QR. In this demo, press Pay to continue.</p></div></div>' +
        '<div class="pay-panel" data-pay="counter"' + (st.method === 'counter' ? '' : ' hidden') + '><p class="muted">Show your booking code at the counter on Floor 1 and pay by cash or card. Arrive at least 15 minutes early or the slot is released.</p></div>' +
        '<label class="check" style="margin-top:20px"><input type="checkbox" data-agree> <span>I agree to the <a href="policies.html#cancellation" target="_blank" rel="noopener">cancellation policy</a> and <a href="policies.html#terms" target="_blank" rel="noopener">terms of use</a>.</span></label>' +
        '<p class="bk-error" data-err role="alert"></p>' +
        actions(3, st.method === 'counter' ? 'Confirm booking' : 'Pay ' + vnd(total()), 'data-pay-now');
    }

    function bindStep(step, body) {
      var back = $('[data-back]', body);
      if (back) back.addEventListener('click', function () { go(+back.getAttribute('data-back')); });
      var err = $('[data-err]', body);

      if (step === 1) {
        $$('input[name=bk-service]', body).forEach(function (r) {
          r.addEventListener('change', function () {
            if (st.service !== r.value) st.hour = null;
            st.service = r.value; err.textContent = ''; renderTicket();
            $('.bk-total-inline strong', body).textContent = vnd(total());
          });
        });
        $('[data-next]', body).addEventListener('click', function () {
          if (!st.service) { err.textContent = 'Choose an experience to continue.'; return; }
          go(2);
        });
      }

      if (step === 2) {
        var calHost = $('[data-cal-host]', body), slotHost = $('[data-slot-host]', body);
        var bindCal = function () {
          $$('[data-cal]', calHost).forEach(function (b) {
            b.addEventListener('click', function () { calMonth.setMonth(calMonth.getMonth() + +b.getAttribute('data-cal')); calHost.innerHTML = renderCalendar(); bindCal(); });
          });
          $$('[data-date]', calHost).forEach(function (b) {
            b.addEventListener('click', function () {
              st.date = b.getAttribute('data-date'); st.hour = null; err.textContent = '';
              calHost.innerHTML = renderCalendar(); bindCal();
              var nb = $('[data-date="' + st.date + '"]', calHost); if (nb) nb.focus();
              slotHost.innerHTML = renderSlots(); bindSlots(); renderTicket();
            });
          });
        };
        var bindSlots = function () {
          $$('[data-hour]', slotHost).forEach(function (b) {
            b.addEventListener('click', function () {
              st.hour = +b.getAttribute('data-hour'); err.textContent = '';
              $$('[data-hour]', slotHost).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
              renderTicket();
            });
          });
        };
        bindCal(); bindSlots();
        $('[data-next]', body).addEventListener('click', function () {
          if (st.hour == null) { err.textContent = 'Pick a start time to continue.'; return; }
          go(3);
        });
      }

      if (step === 3) {
        var form = $('[data-details]', body);
        liveValidate(form);
        var out = $('[data-party-out]', body);
        var syncParty = function () {
          var max = maxParty();
          out.textContent = st.party;
          $('[data-party="-1"]', body).disabled = st.party <= 1;
          $('[data-party="1"]', body).disabled = st.party >= max;
          $('.bk-total-inline strong', body).textContent = vnd(total());
          renderTicket();
        };
        $$('[data-party]', body).forEach(function (b) {
          b.addEventListener('click', function () { st.party = Math.max(1, Math.min(maxParty(), st.party + +b.getAttribute('data-party'))); syncParty(); });
        });
        syncParty();
        var read = function () {
          st.first = $('#bk-first').value.trim(); st.last = $('#bk-last').value.trim();
          st.email = $('#bk-email').value.trim(); st.phone = $('#bk-phone').value.trim(); st.notes = $('#bk-notes').value.trim();
        };
        form.addEventListener('input', read);
        $('[data-next]', body).addEventListener('click', function () {
          read();
          if (!validateForm(form)) return;
          go(4);
        });
      }

      if (step === 4) {
        $$('input[name=bk-pay]', body).forEach(function (r) {
          r.addEventListener('change', function () {
            st.method = r.value;
            $$('[data-pay]', body).forEach(function (p) { p.hidden = p.getAttribute('data-pay') !== st.method; });
            $('[data-pay-now]', body).innerHTML = (st.method === 'counter' ? 'Confirm booking' : 'Pay ' + vnd(total())) + icon('arrow-right');
            err.textContent = '';
          });
        });
        var cc = $('[data-cc]', body), exp = $('[data-exp]', body), cvc = $('[data-cvc]', body);
        cc.addEventListener('input', function () { cc.value = cc.value.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 '); });
        exp.addEventListener('input', function () { var v = exp.value.replace(/\D/g, '').slice(0, 4); exp.value = v.length > 2 ? v.slice(0, 2) + '/' + v.slice(2) : v; });
        cvc.addEventListener('input', function () { cvc.value = cvc.value.replace(/\D/g, '').slice(0, 4); });
        $('[data-pay-now]', body).addEventListener('click', function () {
          var btn = this;
          err.textContent = '';
          if (st.method === 'card') {
            var bad = [];
            if (cc.value.replace(/\D/g, '').length !== 16) bad.push([cc, 'enter all 16 digits.']);
            var mm = parseInt(exp.value.slice(0, 2), 10);
            if (!/^\d{2}\/\d{2}$/.test(exp.value) || mm < 1 || mm > 12) bad.push([exp, 'use MM/YY.']);
            if (!/^\d{3,4}$/.test(cvc.value)) bad.push([cvc, '3 or 4 digits.']);
            [cc, exp, cvc].forEach(function (i) { i.closest('.field').classList.remove('is-invalid'); i.removeAttribute('aria-invalid'); });
            if (bad.length) {
              bad.forEach(function (b) { b[0].closest('.field').classList.add('is-invalid'); b[0].setAttribute('aria-invalid', 'true'); });
              err.textContent = bad.map(function (b) { return b[0].getAttribute('data-label') + ': ' + b[1]; }).join(' ');
              bad[0][0].focus();
              return;
            }
          }
          if (!$('[data-agree]', body).checked) { err.textContent = 'Tick the box to agree to the cancellation policy and terms.'; $('[data-agree]', body).focus(); return; }
          var so = slotObj();
          if (!so || so.left < st.party) { err.textContent = 'Sorry, that slot just filled up. Go back and pick another time.'; return; }
          btn.classList.add('is-loading'); btn.disabled = true;
          setTimeout(complete, REDUCED ? 100 : 1100);
        });
      }
    }

    function renderTicket(confirmed) {
      if (!ticket) return;
      var s = svc();
      var dateTxt = st.hour != null ? longDate(parseISO(st.date)) : '';
      ticket.innerHTML =
        '<div class="ticket__top"><span class="edge">' + (confirmed ? 'Booking code' : 'Your ticket') + '</span>' +
        (confirmed ? '<div class="ticket__code">' + esc(confirmed.code) + '</div>' : '') +
        '<h2>' + (s ? s.name : 'Pick an experience') + '</h2>' +
        '<dl>' +
        '<div><dt>' + icon('calendar') + '<span class="sr-only">Date</span></dt><dd class="' + (dateTxt ? '' : 'is-empty') + '">' + (dateTxt || 'Date not chosen') + '</dd></div>' +
        '<div><dt>' + icon('clock') + '<span class="sr-only">Time</span></dt><dd class="' + (st.hour != null ? '' : 'is-empty') + '">' + (st.hour != null ? pad(st.hour) + ':00 · ' + s.durationLabel : 'Time not chosen') + '</dd></div>' +
        '<div><dt>' + icon('users') + '<span class="sr-only">People</span></dt><dd>' + st.party + (st.party === 1 ? ' person' : ' people') + '</dd></div>' +
        '<div><dt>' + icon('map-pin') + '<span class="sr-only">Place</span></dt><dd>Floor 1, Nguyen Trai, Dai Mo, Hanoi</dd></div>' +
        '</dl></div><div class="ticket__perf" aria-hidden="true"></div>' +
        '<div class="ticket__bottom">' +
        (s ? '<div class="ticket__row"><span>' + vnd(s.price) + ' × ' + st.party + '</span><span>' + vnd(total()) + '</span></div>' : '') +
        (confirmed ? '<div class="ticket__row"><span>Payment</span><span>' + METHODS[confirmed.method] + (confirmed.method === 'counter' ? ' (due on arrival)' : ' (paid)') + '</span></div>' : '') +
        '<div class="ticket__total"><span>Total</span><strong class="' + (s && (st.step >= 3 || confirmed) ? 'mark' : '') + '">' + vnd(total()) + '</strong></div>' +
        (!confirmed ? '<p class="ticket__note">Prices include VAT. Free cancellation up to 24 hours before your slot.</p>' : '') +
        '</div>';
    }

    function complete() {
      var s = svc();
      var b = {
        code: genCode(), service: st.service, date: st.date, time: pad(st.hour) + ':00', party: st.party,
        total: total(), method: st.method, status: 'confirmed', name: st.first + ' ' + st.last, email: st.email, phone: st.phone,
        createdAt: new Date().toISOString()
      };
      var all = getBookings(); all.push(b); saveBookings(all);
      addNotif({ type: 'booking', title: 'Booking confirmed · ' + b.code, text: s.name + ' on ' + shortDate(parseISO(b.date)) + ' at ' + b.time + ' for ' + b.party + (b.party === 1 ? ' person' : ' people') + '.' });

      var start = bookingStart(b), diffH = Math.max(0, Math.round((start - new Date()) / 36e5));
      var days = diffH >= 48;
      var cdNum = days ? Math.floor(diffH / 24) : diffH;
      var cdText = diffH < 1 ? 'Under an hour' : cdNum + ' ' + (days ? 'days' : (cdNum === 1 ? 'hour' : 'hours'));
      var page = $('[data-booking-page]');
      page.innerHTML = '<div class="wrap"><div class="confirm">' +
        '<div class="confirm__copy">' +
        '<h1 class="h1">You are booked</h1>' +
        '<p class="lede">We sent the details to <strong style="color:var(--paper)">' + esc(b.email) + '</strong>. Show your booking code at the counter on Floor 1, ten minutes before your slot.</p>' +
        '<div class="confirm__countdown"><div class="leader leader--red" aria-hidden="true">' + leaderRings() + '<span class="leader__num">' + (diffH < 1 ? '0' : cdNum) + '</span></div>' +
        '<p><span class="label" style="margin:0">Starts in</span><span class="h3">' + cdText + '</span></p></div>' +
        '<div class="confirm__actions"><a class="btn btn--primary" href="my-bookings.html">' + icon('ticket') + 'My bookings</a>' +
        '<button class="btn btn--ghost" type="button" data-ics>' + icon('download') + 'Add to calendar</button>' +
        '<a class="btn btn--quiet" href="booking.html">Book another</a></div>' +
        (getUser() ? '' : '<p class="muted">Want reminders in one place? <a href="notifications.html" data-auth="signup">Create an account</a> to see your notifications.</p>') +
        '</div><aside class="ticket" data-ticket aria-label="Your ticket"></aside></div></div>';
      ticket = $('[data-ticket]', page);
      st.step = 5;
      renderTicket(b);
      $('[data-ics]', page).addEventListener('click', function () { downloadIcs(b); });
      var a = $('[data-auth]', page); if (a) a.addEventListener('click', function (e) { e.preventDefault(); openAuth('signup'); });
      window.scrollTo({ top: 0, behavior: REDUCED ? 'auto' : 'smooth' });
      var h = $('h1', page); h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true });
      toast('Booking confirmed: ' + b.code, 'ticket');
    }

    frames.forEach(function (f) {
      $('[data-change]', f).addEventListener('click', function () { go(+f.getAttribute('data-step')); });
    });
    renderFrames();
  }

  function downloadIcs(b) {
    if (!b) return;
    var s = SERVICES[b.service], start = bookingStart(b), end = new Date(start.getTime() + s.duration * 6e4);
    function f(d) { return d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + 'T' + pad(d.getHours()) + pad(d.getMinutes()) + '00'; }
    var ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//CGV Experience//Demo//EN', 'BEGIN:VEVENT',
      'UID:' + b.code + '@cgvexperience.vn', 'DTSTAMP:' + f(new Date()), 'DTSTART;TZID=Asia/Ho_Chi_Minh:' + f(start), 'DTEND;TZID=Asia/Ho_Chi_Minh:' + f(end),
      'SUMMARY:' + s.name + ' at CGV Experience', 'LOCATION:Floor 1\\, Nguyen Trai\\, Dai Mo\\, Hanoi',
      'DESCRIPTION:Booking ' + b.code + ' for ' + b.party + ' people. Arrive 10 minutes early.', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
    a.download = b.code + '.ics';
    document.body.appendChild(a); a.click(); a.remove();
    toast('Calendar file downloaded.', 'download');
  }

  /* ------------------------------------------------------------------ my bookings */
  function initMyBookings() {
    var host = $('[data-my-bookings]');
    if (!host) return;
    var tab = 'upcoming';
    function render() {
      var all = getBookings().slice().sort(function (a, b) { return bookingStart(a) - bookingStart(b); });
      var groups = {
        upcoming: all.filter(isUpcoming),
        past: all.filter(function (b) { return b.status === 'confirmed' && !isUpcoming(b); }).reverse(),
        cancelled: all.filter(function (b) { return b.status === 'cancelled'; }).reverse()
      };
      $$('[data-tab]').forEach(function (t) {
        var k = t.getAttribute('data-tab');
        t.setAttribute('aria-pressed', String(k === tab));
        $('.num', t).textContent = groups[k].length;
      });
      var list = groups[tab];
      if (!list.length) {
        var copy = {
          upcoming: ['No reels loaded yet', 'When you book an experience it shows up here, with its code and a countdown to your slot.'],
          past: ['Nothing played yet', 'Sessions you have attended will be listed here.'],
          cancelled: ['No cancellations', 'Bookings you cancel are kept here for your records.']
        }[tab];
        host.innerHTML = '<div class="empty"><div class="leader" aria-hidden="true">' + leaderRings() + '<span class="leader__num">0</span></div><h2 class="h3">' + copy[0] + '</h2><p>' + copy[1] + '</p><a class="btn btn--primary" href="booking.html">' + icon('ticket') + 'Book a slot</a></div>';
        return;
      }
      host.innerHTML = '<ul class="stubs">' + list.map(function (b) {
        var s = SERVICES[b.service], d = parseISO(b.date), off = b.status === 'cancelled', up = isUpcoming(b);
        var st = off ? '<span class="status status--off">Cancelled</span>' : up ? '<span class="status status--ok">Confirmed</span>' : '<span class="status status--past">Played</span>';
        return '<li class="stub' + (off ? ' is-off' : '') + '"><div class="stub__date"><span>' + MONTHS[d.getMonth()].slice(0, 3) + '</span><strong>' + d.getDate() + '</strong><span>' + DAYS[d.getDay()].slice(0, 3) + '</span></div>' +
          '<div class="stub__body">' + st + '<h3>' + s.name + '</h3><div class="stub__meta">' +
          '<span>' + icon('clock') + b.time + ' · ' + s.durationLabel + '</span><span>' + icon('users') + b.party + (b.party === 1 ? ' person' : ' people') + '</span><span>' + icon('ticket') + b.code + '</span></div>' +
          '<div class="stub__meta"><span>' + METHODS[b.method] + (b.method === 'counter' && up ? ', pay on arrival' : '') + '</span></div></div>' +
          '<div class="stub__actions"><span class="stub__total">' + vnd(b.total) + '</span>' +
          (up ? '<button class="btn btn--ghost btn--sm" type="button" data-ics="' + b.code + '">' + icon('download') + 'Calendar</button><button class="btn btn--quiet btn--sm" type="button" data-cancel="' + b.code + '">Cancel booking</button>' : '<a class="btn btn--ghost btn--sm" href="booking.html?service=' + b.service + '">Book again</a>') +
          '</div></li>';
      }).join('') + '</ul>';
      $$('[data-ics]', host).forEach(function (btn) {
        btn.addEventListener('click', function () { downloadIcs(getBookings().filter(function (x) { return x.code === btn.getAttribute('data-ics'); })[0]); });
      });
      $$('[data-cancel]', host).forEach(function (btn) {
        btn.addEventListener('click', function () {
          var code = btn.getAttribute('data-cancel');
          var b = getBookings().filter(function (x) { return x.code === code; })[0];
          var hrs = (bookingStart(b) - new Date()) / 36e5;
          confirmDialog({
            title: 'Cancel booking?',
            text: SERVICES[b.service].name + ' on ' + shortDate(parseISO(b.date)) + ' at ' + b.time + '. ' + (hrs >= 24 ? 'It is more than 24 hours away, so cancelling is free.' : 'It starts within 24 hours, so 50% of the total is kept under the cancellation policy.'),
            ok: 'Cancel booking', cancel: 'Keep booking'
          }).then(function (ok) {
            if (!ok) return;
            saveBookings(getBookings().map(function (x) { if (x.code === code) x.status = 'cancelled'; return x; }));
            addNotif({ type: 'cancel', title: 'Booking cancelled · ' + code, text: SERVICES[b.service].name + ' on ' + shortDate(parseISO(b.date)) + ' at ' + b.time + ' was cancelled.' });
            toast('Booking ' + code + ' cancelled.');
            render(); updateHeader();
          });
        });
      });
    }
    $$('[data-tab]').forEach(function (t) { t.addEventListener('click', function () { tab = t.getAttribute('data-tab'); render(); }); });
    render();
  }

  /* ------------------------------------------------------------------ notifications */
  var NOTIF_ICON = { booking: 'ticket', cancel: 'x', welcome: 'bell', tip: 'info', mail: 'mail', info: 'bell' };
  function initNotifications() {
    var host = $('[data-notifications]');
    if (!host) return;
    function render() {
      var user = getUser();
      if (!user) {
        host.innerHTML = '<div class="gate"><div class="gate__copy"><h2 class="h2">Sign up to get notified</h2>' +
          '<p class="lede">One account keeps your booking confirmations, reminders and member news in one place.</p>' +
          '<div class="gate__actions"><button class="btn btn--primary" type="button" data-open-auth="signup">Sign up</button><button class="btn btn--ghost" type="button" data-open-auth="login">Log in</button></div></div>' +
          '<ul class="gate__list">' +
          '<li><span class="notif__icon">' + icon('ticket') + '</span><span><strong>Booking confirmations</strong><span>Your code, date and time the moment you book.</span></span></li>' +
          '<li><span class="notif__icon">' + icon('clock') + '</span><span><strong>Reminders</strong><span>A nudge before your slot so nobody arrives late.</span></span></li>' +
          '<li><span class="notif__icon">' + icon('mail') + '</span><span><strong>New experiences</strong><span>New rooms, booth frames and member news first.</span></span></li></ul></div>';
        $$('[data-open-auth]', host).forEach(function (b) { b.addEventListener('click', function () { openAuth(b.getAttribute('data-open-auth')); }); });
        return;
      }
      var list = getNotifs(), unread = list.filter(function (n) { return !n.read; }).length;
      var prefs = store.get('prefs', { offers: true, blog: false, email: true });
      function sw(key, title, desc, on, locked) {
        return '<label class="switch"><span><strong>' + title + '</strong><span class="muted">' + desc + '</span></span><input type="checkbox" role="switch" data-pref="' + key + '"' + (on ? ' checked' : '') + (locked ? ' disabled' : '') + '></label>';
      }
      host.innerHTML = '<div class="notif-layout"><div>' +
        '<div class="notif-bar"><p class="muted">Signed in as <strong style="color:var(--paper)">' + esc(user.email) + '</strong> · ' + unread + ' unread</p>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn--ghost btn--sm" type="button" data-read-all' + (unread ? '' : ' disabled') + '>' + icon('check') + 'Mark all as read</button>' +
        '<button class="btn btn--quiet btn--sm" type="button" data-logout>' + icon('log-out') + 'Sign out</button></div></div>' +
        (list.length ? '<ul class="notifs">' + list.map(function (n) {
          return '<li class="notif' + (n.read ? '' : ' is-unread') + '"><span class="notif__icon">' + icon(NOTIF_ICON[n.type] || 'bell') + '</span>' +
            '<div><h3>' + esc(n.title) + '</h3><p>' + esc(n.text) + '</p></div>' +
            '<div class="notif__side"><time datetime="' + n.at + '">' + timeAgo(n.at) + '</time>' + (n.read ? '' : '<span class="notif__dot" role="img" aria-label="Unread"></span>') + '</div></li>';
        }).join('') + '</ul>' :
          '<div class="empty"><div class="leader" aria-hidden="true">' + leaderRings() + '<span class="leader__num">0</span></div><h2 class="h3">All quiet</h2><p>Book an experience and your confirmation lands here.</p><a class="btn btn--primary" href="booking.html">Book a slot</a></div>') +
        '</div><aside class="prefs" aria-labelledby="prefs-title"><h2 class="h3" id="prefs-title">What we send you</h2>' +
        sw('reminders', 'Booking confirmations and reminders', 'Always on while you have a booking.', true, true) +
        sw('offers', 'New experiences and offers', 'New rooms, booth frames and member deals.', prefs.offers) +
        sw('blog', 'Blog digest', 'A monthly round-up of tips and stories.', prefs.blog) +
        sw('email', 'Also send by email', 'Copies of these notifications to ' + esc(user.email) + '.', prefs.email) +
        '</aside></div>';
      var ra = $('[data-read-all]', host);
      if (ra) ra.addEventListener('click', function () {
        store.set('notifs', getNotifs().map(function (n) { n.read = true; return n; }));
        updateHeader(); render(); toast('All notifications marked as read.');
      });
      $('[data-logout]', host).addEventListener('click', logout);
      $$('[data-pref]', host).forEach(function (c) {
        c.addEventListener('change', function () {
          prefs[c.getAttribute('data-pref')] = c.checked; store.set('prefs', prefs);
          toast('Preferences saved.');
        });
      });
    }
    document.addEventListener('cgvx:auth', render);
    render();
  }

  /* ------------------------------------------------------------------ blog */
  function postDate(p) { var d = parseISO(p.date); return d.getDate() + ' ' + MONTHS[d.getMonth()].slice(0, 3) + ' ' + d.getFullYear(); }
  function byline(p) {
    return '<span class="byline"><img src="' + IMG + AUTHOR.avatar + '" alt="" width="32" height="32"><strong>' + AUTHOR.name + '</strong><span class="dot"></span><time datetime="' + p.date + '">' + postDate(p) + '</time><span class="dot"></span><span>' + p.read + ' min read</span></span>';
  }
  function postCard(p) {
    return '<li><a class="post-card" href="post.html?slug=' + p.slug + '"><span class="frame"><img src="' + IMG + p.img + '" alt="' + esc(p.alt) + '" loading="lazy" data-fallback="' + esc(p.topic) + '"></span>' +
      '<span class="topic">' + p.topic + '</span><h3>' + esc(p.title) + '</h3><p>' + esc(p.excerpt) + '</p>' + byline(p) + '</a></li>';
  }
  function initBlog() {
    var host = $('[data-blog]');
    if (!host) return;
    var topic = qs('topic') || 'All';
    function render() {
      var list = POSTS.filter(function (p) { return topic === 'All' || p.topic === topic; });
      $$('[data-topic]').forEach(function (c) { c.setAttribute('aria-pressed', String(c.getAttribute('data-topic') === topic)); });
      if (!list.length) { host.innerHTML = '<p class="no-results">No posts in this topic yet.</p>'; return; }
      var f = list[0];
      host.innerHTML = '<a class="feature" href="post.html?slug=' + f.slug + '"><span class="frame"><img src="' + IMG + f.img + '" alt="' + esc(f.alt) + '" data-fallback="' + esc(f.topic) + '"></span>' +
        '<span class="feature__body"><span class="topic">' + f.topic + '</span><h2>' + esc(f.title) + '</h2><p>' + esc(f.excerpt) + '</p>' + byline(f) + '<span class="link-arrow">Read the post' + icon('arrow-right') + '</span></span></a>' +
        (list.length > 1 ? '<ul class="posts">' + list.slice(1).map(postCard).join('') + '</ul>' : '');
    }
    $$('[data-topic]').forEach(function (c) {
      c.addEventListener('click', function () {
        topic = c.getAttribute('data-topic');
        try { history.replaceState(null, '', topic === 'All' ? location.pathname : '?topic=' + encodeURIComponent(topic)); } catch (e) { /* file:// may refuse */ }
        render();
      });
    });
    render();
  }

  function initPost() {
    var host = $('[data-post]');
    if (!host) return;
    var slug = qs('slug');
    var p = POSTS.filter(function (x) { return x.slug === slug; })[0];
    if (!p) {
      document.title = 'Post not found | CGV Experience';
      host.innerHTML = '<div class="wrap"><div class="notfound"><h1 class="h1">This reel is missing</h1><p class="lede">We could not find that post. It may have moved, or the link is incomplete.</p><a class="btn btn--primary" href="blog.html">' + icon('arrow-left') + 'All posts</a></div></div>';
      return;
    }
    document.title = p.title + ' | CGV Experience';
    var likes = store.get('likes', {}), liked = !!likes[p.slug];
    var comments = store.get('comments', {})[p.slug] || [];
    var user = getUser();
    host.innerHTML = '<article class="article"><div class="wrap wrap--narrow">' +
      '<nav aria-label="Breadcrumb"><ol class="crumbs"><li><a href="blog.html">All posts</a></li><li><a href="blog.html?topic=' + encodeURIComponent(p.topic) + '">' + p.topic + '</a></li></ol></nav>' +
      '<header class="article__head"><h1>' + esc(p.title) + '</h1><p class="lede">' + esc(p.excerpt) + '</p>' + byline(p) + '</header></div>' +
      '<div class="wrap" style="max-width:calc(1000px + var(--gutter) * 2)"><figure class="article__cover"><div class="frame"><img src="' + IMG + p.img + '" alt="' + esc(p.alt) + '" data-fallback="' + esc(p.topic) + '"></div><figcaption class="edge">' + esc(p.alt) + '</figcaption></figure></div>' +
      '<div class="wrap wrap--narrow"><div class="prose">' + p.body + '</div>' +
      '<div class="article__tools"><div class="share"><span class="label">Share</span>' +
      '<a class="icon-btn" href="https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(location.href) + '" target="_blank" rel="noopener" aria-label="Share on Facebook">' + icon('facebook') + '</a>' +
      '<a class="icon-btn" href="https://x.com/intent/post?url=' + encodeURIComponent(location.href) + '&amp;text=' + encodeURIComponent(p.title) + '" target="_blank" rel="noopener" aria-label="Share on X">' + icon('x-logo') + '</a>' +
      '<a class="icon-btn" href="https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(location.href) + '" target="_blank" rel="noopener" aria-label="Share on LinkedIn">' + icon('linkedin') + '</a>' +
      '<button class="icon-btn" type="button" data-copy aria-label="Copy link">' + icon('link') + '</button></div>' +
      '<div class="stats"><span>' + icon('eye') + p.views + ' views</span><span>' + icon('message') + '<span data-ccount>' + comments.length + '</span> comments</span>' +
      '<button class="like-btn" type="button" data-like aria-pressed="' + liked + '">' + icon('heart') + '<span data-lcount>' + (p.likes + (liked ? 1 : 0)) + '</span><span class="sr-only"> likes, like this post</span></button></div></div>' +
      '<section class="comments" aria-labelledby="c-title"><h2 class="h3" id="c-title">Comments</h2>' +
      '<form class="form-grid" data-comment novalidate>' +
      '<div class="field"><label class="label" for="c-name">Name</label><input id="c-name" required data-label="Name" autocomplete="name" value="' + esc(user ? user.name : '') + '"><p class="field__error"></p></div>' +
      '<div class="field"><label class="label" for="c-text">Comment</label><textarea id="c-text" required data-label="Comment" rows="3" placeholder="Write a comment..."></textarea><p class="field__error"></p></div>' +
      '<div><button class="btn btn--primary" type="submit">Post comment</button></div></form>' +
      '<ul class="comment-list" data-clist></ul></section></div></article>' +
      '<section class="recent" aria-labelledby="r-title"><div class="wrap"><div class="section-head"><h2 class="h2" id="r-title">Recent posts</h2><p><a class="link-arrow" href="blog.html">See all posts' + icon('arrow-right') + '</a></p></div>' +
      '<ul class="posts">' + POSTS.filter(function (x) { return x.slug !== p.slug; }).slice(0, 3).map(postCard).join('') + '</ul></div></section>';

    var clist = $('[data-clist]', host);
    function renderComments() {
      clist.innerHTML = comments.length ? comments.map(function (c) {
        return '<li class="comment"><span class="comment__av" aria-hidden="true">' + esc(c.name.charAt(0)) + '</span><div><div class="comment__meta"><strong>' + esc(c.name) + '</strong><time datetime="' + c.at + '">' + timeAgo(c.at) + '</time></div><p>' + esc(c.text) + '</p></div></li>';
      }).join('') : '<li class="comment" style="grid-template-columns:1fr"><p class="muted">No comments yet. Start the conversation.</p></li>';
      $('[data-ccount]', host).textContent = comments.length;
    }
    renderComments();
    var form = $('[data-comment]', host);
    liveValidate(form);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validateForm(form)) return;
      comments.push({ name: $('#c-name').value.trim(), text: $('#c-text').value.trim(), at: new Date().toISOString() });
      var all = store.get('comments', {}); all[p.slug] = comments; store.set('comments', all);
      $('#c-text').value = '';
      renderComments(); toast('Comment posted.', 'message');
    });
    $('[data-like]', host).addEventListener('click', function () {
      liked = !liked;
      var l = store.get('likes', {}); if (liked) l[p.slug] = true; else delete l[p.slug]; store.set('likes', l);
      this.setAttribute('aria-pressed', String(liked));
      $('[data-lcount]', host).textContent = p.likes + (liked ? 1 : 0);
    });
    $('[data-copy]', host).addEventListener('click', function () {
      var url = location.href;
      var done = function () { toast('Link copied.', 'link'); };
      function fallback() { var t = document.createElement('textarea'); t.value = url; document.body.appendChild(t); t.select(); try { document.execCommand('copy'); done(); } catch (err) { toast('Copy failed. Copy the address bar instead.', 'info'); } t.remove(); }
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(done, fallback);
      else fallback();
    });
  }

  /* ------------------------------------------------------------------ policies TOC */
  function initPolicies() {
    var links = $$('.toc a');
    if (!links.length || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) links.forEach(function (a) { a.classList.toggle('is-active', a.getAttribute('href') === '#' + en.target.id); });
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
    $$('.policy section[id]').forEach(function (s) { io.observe(s); });
  }

  /* ------------------------------------------------------------------ boot */
  function boot() {
    sweepBrokenImages();
    initHeader();
    initNewsletter();
    initContact();
    if (PAGE === 'home') initHome();
    initServicePage();
    initBooking();
    initMyBookings();
    initNotifications();
    initBlog();
    initPost();
    initPolicies();
    initReveal();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
