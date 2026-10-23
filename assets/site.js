// Mobile menu
const menuBtn = document.getElementById('menuBtn');
const menu = document.getElementById('menu');
const setMenu = (open) => { menuBtn.setAttribute('aria-expanded', open); menu.dataset.open = open; };
menuBtn.addEventListener('click', () => setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

// Scroll reveal
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
}, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));

document.getElementById('year').textContent = new Date().getFullYear();

// Forms: inline validation, then POST to data-endpoint.
// Until an endpoint (e.g. Formspree) is set, the form shows a call-us notice instead of pretending to send.
const messageFor = (field) => {
  const v = field.validity;
  if (v.valueMissing) return field.type === 'radio' ? 'Please choose an option.' : 'This field is required.';
  if (v.typeMismatch && field.type === 'email') return 'Enter an email address like name@example.com.';
  if (v.patternMismatch) return field.dataset.patternMessage || 'Please check this value.';
  if (field.dataset.maxMb && field.files?.[0]?.size > field.dataset.maxMb * 1048576) return `File must be ${field.dataset.maxMb}MB or smaller.`;
  return '';
};

const showError = (form, field) => {
  const name = field.name;
  const msg = messageFor(field);
  const err = form.querySelector(`[data-error-for="${name}"]`);
  const group = form.querySelectorAll(`[name="${name}"]`);
  group.forEach((f) => f.setAttribute('aria-invalid', msg ? 'true' : 'false'));
  if (err) { err.textContent = msg; err.hidden = !msg; }
  return !msg;
};

document.querySelectorAll('form[data-form]').forEach((form) => {
  form.noValidate = true;
  const fields = () => [...form.querySelectorAll('input, select, textarea')].filter((f) => f.name && f.type !== 'hidden');

  form.addEventListener('change', (e) => { if (e.target.name && e.target.getAttribute('aria-invalid')) showError(form, e.target); });
  form.addEventListener('input', (e) => { if (e.target.getAttribute('aria-invalid') === 'true') showError(form, e.target); });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const seen = new Set();
    let firstBad = null;
    fields().forEach((f) => {
      if (seen.has(f.name)) return;
      seen.add(f.name);
      if (!showError(form, f) && !firstBad) firstBad = f;
    });
    if (firstBad) { firstBad.focus(); return; }

    const status = form.querySelector('[data-form-status]');
    const success = form.parentElement.querySelector('[data-form-success]');
    const submit = form.querySelector('[type="submit"]');
    const endpoint = form.dataset.endpoint;

    if (!endpoint) {
      status.hidden = false;
      status.focus();
      return;
    }

    submit.disabled = true;
    submit.dataset.label = submit.innerHTML;
    submit.textContent = 'Sending...';
    try {
      const res = await fetch(endpoint, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error(res.status);
      form.hidden = true;
      success.hidden = false;
      success.focus();
    } catch {
      status.hidden = false;
      status.focus();
    } finally {
      submit.disabled = false;
      submit.innerHTML = submit.dataset.label;
    }
  });
});

// Service-area map: chips and parishes highlight each other
document.querySelectorAll('[data-parish-chip]').forEach((chip) => {
  const name = chip.dataset.parishChip;
  const shape = document.querySelector(`.area-map [data-parish="${name}"]`);
  if (!shape) return;
  const on = () => { chip.classList.add('is-hot'); shape.classList.add('is-hot'); };
  const off = () => { chip.classList.remove('is-hot'); shape.classList.remove('is-hot'); };
  [chip, shape].forEach((el) => { el.addEventListener('mouseenter', on); el.addEventListener('mouseleave', off); });
  chip.addEventListener('focus', on); chip.addEventListener('blur', off);
});
