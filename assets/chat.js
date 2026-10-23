// Autumn Lake chat assistant: answers common questions from site content
// and collects messages for staff. Replaces the Wix Chat widget.
(() => {
  // Set to a form endpoint (e.g. Formspree) to deliver "leave a message" requests.
  const MESSAGE_ENDPOINT = '';

  const root = new URL('../', document.currentScript.src).href; // site root, works at any base path
  const link = (path, label) => `<a href="${root}${path}">${label}</a>`;
  const PHONE = '<a href="tel:+12252462740">(225) 246-2740</a>';
  const EMAIL = '<a href="mailto:info@autumnlakellc.com">info@autumnlakellc.com</a>';

  const MENU = [
    ['services', 'Services we offer'],
    ['area', 'Do you serve my area?'],
    ['appointment', 'Set an appointment'],
    ['payment', 'Insurance and payment'],
    ['referral', 'Make a referral'],
    ['jobs', 'Jobs'],
    ['message', 'Leave a message'],
  ];

  // Each topic: keywords to match typed questions, the answer, and follow-up chips.
  const TOPICS = {
    services: {
      words: ['service', 'care', 'offer', 'provide', 'bath', 'dress', 'groom', 'meal', 'cook', 'housekeep', 'clean', 'medication', 'daily', 'adl', 'homemaker', '24', 'overnight'],
      answer: () => `We provide in-home personal care <b>24 hours a day, 7 days a week</b>, including help with eating and meals, bathing and dressing, using the restroom, walking and transfers, light housekeeping and medication reminders.<br><br>See all programs on our ${link('services-minimalist/', 'Services page')}.`,
      next: ['waivers', 'area', 'appointment'],
    },
    waivers: {
      words: ['waiver', 'now waiver', 'new opportunities', 'children', 'choice', 'community', 'medicaid', 'lt pcs', 'ltpcs', 'long term', 'epsdt', 'bhpcs', 'behavioral', 'program'],
      answer: () => `We work with these Louisiana programs:<ul><li>${link('services-minimalist/#now', 'New Opportunities Waiver (NOW)')}</li><li>${link('services-minimalist/#childrens-choice', "Children's Choice Waiver")}</li><li>${link('services-minimalist/#community-choices', 'Community Choices Waiver')}</li><li>${link('services-minimalist/#lt-pcs', 'Long Term Personal Care (LT-PCS)')}</li><li>${link('services-minimalist/#epsdt', 'EPSDT Personal Care')} (up to age 21)</li><li>${link('services-minimalist/#bhpcs', 'Behavioral Health Personal Care')}</li></ul>`,
      next: ['payment', 'appointment', 'transport'],
    },
    area: {
      words: ['area', 'parish', 'serve', 'location', 'where', 'cover', 'baton rouge', 'feliciana', 'ascension', 'iberville', 'zip', 'near', 'gonzales', 'plaquemine', 'zachary', 'port allen', 'donaldsonville'],
      answer: () => `We serve six parishes: <b>East Baton Rouge, West Baton Rouge, East Feliciana, West Feliciana, Ascension and Iberville</b>.<br><br>See the ${link('services-minimalist/#service-areas', 'service area map')}, or call ${PHONE} if you're not sure you're covered.`,
      next: ['appointment', 'services'],
    },
    payment: {
      words: ['insurance', 'pay', 'cost', 'price', 'afford', ' va ', 'veteran', 'private', 'medicare', 'covered', 'accept', 'free'],
      answer: () => `We work with <b>state-funded programs, VA recipients, private insurance and private pay</b> clients. Many families qualify through a Medicaid waiver.<br><br>Call ${PHONE} and we'll help you figure out what you may qualify for.`,
      next: ['waivers', 'appointment'],
    },
    appointment: {
      words: ['appointment', 'schedule', 'book', 'assessment', 'start', 'sign up', 'enroll', 'get care', 'intake', 'visit', 'consult', 'meet'],
      answer: () => `You can ${link('set-an-appointment/', 'set an appointment online')} or call ${PHONE}. Our Intake Supervisor visits your home to do an assessment and build your care plan.`,
      next: ['area', 'payment', 'contact'],
    },
    referral: {
      words: ['refer', 'referral', 'someone', 'loved one', 'family member', 'case manager', 'social worker', 'client of mine'],
      answer: () => `Thank you for thinking of us. Send their information on our ${link('referrals/', 'referral page')}, or call ${PHONE}.`,
      next: ['services', 'contact'],
    },
    jobs: {
      words: ['job', 'hiring', 'career', 'work for', 'apply', 'employment', 'position', 'caregiver job', 'dsp', 'supervisor', 'resume'],
      answer: () => `We're hiring a <b>DSP Field Supervisor</b>, <b>Direct Care Workers</b> and <b>Homemakers</b>. ${link('careers/', 'See open positions and apply')}.`,
      next: ['contact'],
    },
    housing: {
      words: ['housing', 'house ', 'residence', 'residential', 'live in', 'place to live', 'haven', 'grace', 'sapphire', 'manor', 'group home'],
      answer: () => `We offer supported housing with 24-hour staff at <b>A'Haven Grace House</b> and <b>Sapphire Manor</b> in Baton Rouge. ${link('housing/', 'Learn about our homes')}.`,
      next: ['appointment', 'contact'],
    },
    transport: {
      words: ['ride', 'transport', 'nemt', 'drive', 'pick up', 'doctor appointment', 'van', 'amerihealth', 'healthcare connections'],
      answer: () => `We provide non-emergency rides to scheduled health care appointments for <b>Louisiana Healthcare Connections</b> and <b>AmeriHealth</b> members. Call the number on the back of your insurance card and ask for <b>Autumn Lake Transportation</b>.`,
      next: ['services', 'contact'],
    },
    contact: {
      words: ['contact', 'phone', 'call', 'email', 'address', 'office', 'located', 'directions', 'talk', 'person', 'human', 'someone real', 'reach'],
      answer: () => `Call us at ${PHONE} or email ${EMAIL}.<br><br>Our office is at <b>5516 Superior Dr. Ste. A, Baton Rouge, LA 70816</b> (<a href="https://maps.google.com/?q=5516+Superior+Dr+Ste+A,+Baton+Rouge,+LA+70816" target="_blank" rel="noopener">directions</a>).`,
      next: ['message', 'appointment'],
    },
    resources: {
      words: ['resource', 'covid', 'mental health', 'nami', 'cdc', 'disability resource', 'wellness'],
      answer: () => `Our ${link('wellness-resources/', 'Wellness Resources page')} links to trusted organizations for care, coverage, disability support and health guidance.`,
      next: ['contact'],
    },
    feedback: {
      words: ['survey', 'feedback', 'complaint', 'compliment', ' rate ', 'review'],
      answer: () => `We'd love to hear from you. Please fill out our ${link('client-satisfaction-survey/', 'client satisfaction survey')}, or call ${PHONE}.`,
      next: ['contact'],
    },
  };
  const LABELS = Object.fromEntries([...MENU, ['waivers', 'Medicaid waivers'], ['contact', 'Contact info'], ['transport', 'Rides to appointments']]);
  const EMERGENCY = /\b(911|emergency|can'?t breathe|chest pain|unconscious|overdose|suicid|bleeding|fell and|stroke)\b/i;

  // ---------- markup ----------
  const wrap = document.createElement('div');
  wrap.className = 'chat';
  wrap.innerHTML = `
    <button class="chat-launch" type="button" aria-expanded="false" aria-controls="chatPanel">
      <i class="ph-fill ph-chat-circle-dots" aria-hidden="true"></i><span class="chat-launch-label">Chat with us</span>
    </button>
    <section id="chatPanel" class="chat-panel" role="dialog" aria-modal="false" aria-labelledby="chatTitle" hidden>
      <header class="chat-head">
        <span class="chat-avatar"><img src="${root}brand_assets/logo-mark.png" alt=""></span>
        <span class="flex-1">
          <span id="chatTitle" class="chat-title">Autumn Lake</span>
          <span class="chat-sub">Answers in seconds</span>
        </span>
        <button class="chat-close" type="button" aria-label="Close chat"><i class="ph-bold ph-x" aria-hidden="true"></i></button>
      </header>
      <div class="chat-log" role="log" aria-live="polite" aria-relevant="additions"></div>
      <form class="chat-input" autocomplete="off">
        <label for="chatText" class="sr-only">Type your question</label>
        <input id="chatText" type="text" placeholder="Type your question..." maxlength="500">
        <button type="submit" aria-label="Send"><i class="ph-bold ph-paper-plane-right" aria-hidden="true"></i></button>
      </form>
      <p class="chat-note">For a medical emergency, call 911.</p>
    </section>`;
  document.body.appendChild(wrap);

  const launch = wrap.querySelector('.chat-launch');
  const panel = wrap.querySelector('.chat-panel');
  const log = wrap.querySelector('.chat-log');
  const form = wrap.querySelector('.chat-input');
  const input = wrap.querySelector('#chatText');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let started = false;
  let flow = null; // active "leave a message" flow

  const scroll = () => { log.scrollTop = log.scrollHeight; };

  const addMsg = (who, html) => {
    const el = document.createElement('div');
    el.className = `chat-msg chat-${who}`;
    el.innerHTML = html;
    log.appendChild(el);
    scroll();
    return el;
  };

  const addChips = (keys) => {
    log.querySelectorAll('.chat-chips').forEach((c) => c.remove());
    const row = document.createElement('div');
    row.className = 'chat-chips';
    keys.forEach((k) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = LABELS[k];
      b.addEventListener('click', () => { addMsg('user', escape(LABELS[k])); respond(k); });
      row.appendChild(b);
    });
    log.appendChild(row);
    scroll();
  };

  const botSay = (html, chips) => new Promise((resolve) => {
    const typing = addMsg('bot', '<span class="chat-typing" aria-label="Typing"><i></i><i></i><i></i></span>');
    setTimeout(() => {
      typing.innerHTML = html;
      if (chips) addChips(chips);
      scroll();
      resolve();
    }, reduce ? 0 : 550);
  });

  const escape = (s) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const match = (text) => {
    const t = ` ${text.toLowerCase().replace(/[^a-z0-9' ]+/g, ' ')} `;
    let best = null; let score = 0;
    for (const [key, topic] of Object.entries(TOPICS)) {
      const s = topic.words.reduce((n, w) => n + (t.includes(w) ? w.length : 0), 0);
      if (s > score) { score = s; best = key; }
    }
    return best;
  };

  const respond = (key) => {
    if (key === 'message') return startMessage();
    const topic = TOPICS[key];
    return botSay(topic.answer(), topic.next);
  };

  // ---------- leave a message ----------
  const STEPS = [
    { field: 'name', ask: "Sure, I'll pass a message to our team. What's your name?" },
    { field: 'contact', ask: 'What phone number or email should we use to reach you?', check: (v) => /\d{7,}/.test(v.replace(/\D/g, '')) || /\S+@\S+\.\S+/.test(v), error: "That doesn't look like a phone number or email. Could you try again?" },
    { field: 'message', ask: 'How can we help? Please leave out medical details; we can discuss those by phone.' },
  ];

  const startMessage = () => {
    log.querySelectorAll('.chat-chips').forEach((c) => c.remove());
    flow = { step: 0, data: {} };
    return botSay(STEPS[0].ask);
  };

  const continueMessage = async (text) => {
    const step = STEPS[flow.step];
    if (step.check && !step.check(text)) return botSay(step.error);
    flow.data[step.field] = text;
    flow.step += 1;
    if (flow.step < STEPS.length) return botSay(STEPS[flow.step].ask);

    const data = flow.data; flow = null;
    if (!MESSAGE_ENDPOINT) {
      return botSay(`Thanks, ${escape(data.name)}. Our online messages aren't connected yet, so please call ${PHONE} or email ${EMAIL} and we'll help you right away.`, ['contact', 'appointment']);
    }
    try {
      const res = await fetch(MESSAGE_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ ...data, source: 'Website chat', page: location.href }) });
      if (!res.ok) throw new Error(res.status);
      return botSay(`Thanks, ${escape(data.name)}! Your message was sent. Our team will reach out soon. For anything urgent, call ${PHONE}.`, ['services', 'contact']);
    } catch {
      return botSay(`Sorry, your message didn't go through. Please call ${PHONE} or email ${EMAIL}.`, ['contact']);
    }
  };

  // ---------- open / close ----------
  const open = () => {
    panel.hidden = false;
    requestAnimationFrame(() => panel.classList.add('is-open'));
    launch.setAttribute('aria-expanded', 'true');
    launch.classList.add('is-open');
    launch.querySelector('i').className = 'ph-bold ph-caret-down';
    if (!started) {
      started = true;
      botSay("Hi! Welcome to Autumn Lake Healthcare Services. I can answer questions about our home care services. What can I help you with?", MENU.map(([k]) => k));
    }
    setTimeout(() => input.focus(), reduce ? 0 : 200);
  };
  const close = () => {
    panel.classList.remove('is-open');
    launch.setAttribute('aria-expanded', 'false');
    launch.classList.remove('is-open');
    launch.querySelector('i').className = 'ph-fill ph-chat-circle-dots';
    setTimeout(() => { panel.hidden = true; }, reduce ? 0 : 250);
    launch.focus();
  };

  launch.addEventListener('click', () => (panel.hidden ? open() : close()));
  wrap.querySelector('.chat-close').addEventListener('click', close);
  panel.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    addMsg('user', escape(text));
    if (EMERGENCY.test(text)) return botSay('If this is a medical emergency, please <b>call 911</b> right away. For anything else, call us at ' + PHONE + '.', ['contact']);
    if (flow) return continueMessage(text);
    const key = match(text);
    if (key) return respond(key);
    return botSay(`I'm not sure about that one. You can call us at ${PHONE}, or leave a message and our team will get back to you.`, ['message', 'services', 'contact']);
  });
})();
