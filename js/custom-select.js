/*
  Replaces every native <select> with a custom-styled dropdown.
  Browsers don't let CSS touch the open <option> list of a native
  select, only the closed control, which is why the trigger looked
  on-brand but the open panel showed plain system UI.

  The original <select> stays in the DOM (visually hidden, not
  display:none) so form submission, name/value, and any other JS
  reading .value still work exactly as before. This is pure
  progressive enhancement: if this script fails to run for any
  reason, the native select is still fully functional underneath.
*/
(function () {
  function enhanceSelect(select) {
    if (select.dataset.enhanced) return;
    select.dataset.enhanced = 'true';

    const wrap = document.createElement('div');
    wrap.className = 'custom-select-wrap';

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'custom-select-trigger';
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', 'false');

    const valueSpan = document.createElement('span');
    valueSpan.className = 'custom-select-value';
    trigger.appendChild(valueSpan);
    const chevron = document.createElement('i');
    chevron.className = 'fa-solid fa-chevron-down';
    trigger.appendChild(chevron);

    const panel = document.createElement('ul');
    panel.className = 'custom-select-panel';
    panel.setAttribute('role', 'listbox');

    const options = Array.from(select.options);
    let activeIndex = select.selectedIndex >= 0 ? select.selectedIndex : 0;

    function renderOptions() {
      panel.innerHTML = '';
      options.forEach((opt, i) => {
        const li = document.createElement('li');
        li.setAttribute('role', 'option');
        li.className = 'custom-select-option';
        li.textContent = opt.textContent;
        li.dataset.index = i;
        if (i === select.selectedIndex) li.classList.add('is-selected');
        li.addEventListener('click', () => selectOption(i));
        panel.appendChild(li);
      });
    }

    function updateTrigger() {
      const opt = options[select.selectedIndex];
      valueSpan.textContent = opt ? opt.textContent : '';
    }

    function selectOption(i) {
      select.selectedIndex = i;
      select.dispatchEvent(new Event('change', { bubbles: true }));
      updateTrigger();
      renderOptions();
      closePanel();
      trigger.focus();
    }

    function openPanel() {
      document.querySelectorAll('.custom-select-wrap.open').forEach((w) => {
        if (w !== wrap) w.classList.remove('open');
      });
      wrap.classList.add('open');
      trigger.setAttribute('aria-expanded', 'true');
      const activeEl = panel.querySelector('.is-selected') || panel.firstElementChild;
      if (activeEl) activeEl.classList.add('is-active');
    }
    function closePanel() {
      wrap.classList.remove('open');
      trigger.setAttribute('aria-expanded', 'false');
      panel.querySelectorAll('.is-active').forEach((el) => el.classList.remove('is-active'));
    }

    trigger.addEventListener('click', () => {
      wrap.classList.contains('open') ? closePanel() : openPanel();
    });

    trigger.addEventListener('keydown', (e) => {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' ', 'Escape'].includes(e.key)) e.preventDefault();
      if (!wrap.classList.contains('open') && (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ')) {
        openPanel();
        return;
      }
      if (!wrap.classList.contains('open')) return;
      const items = Array.from(panel.children);
      let idx = items.findIndex((el) => el.classList.contains('is-active'));
      if (e.key === 'ArrowDown') {
        items[idx]?.classList.remove('is-active');
        idx = Math.min(items.length - 1, idx + 1);
        items[idx]?.classList.add('is-active');
        items[idx]?.scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'ArrowUp') {
        items[idx]?.classList.remove('is-active');
        idx = Math.max(0, idx - 1);
        items[idx]?.classList.add('is-active');
        items[idx]?.scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'Enter' || e.key === ' ') {
        if (idx >= 0) selectOption(Number(items[idx].dataset.index));
      } else if (e.key === 'Escape') {
        closePanel();
      }
    });

    document.addEventListener('click', (e) => {
      if (!wrap.contains(e.target)) closePanel();
    });

    select.parentNode.insertBefore(wrap, select);
    wrap.appendChild(trigger);
    wrap.appendChild(panel);
    wrap.appendChild(select);
    select.classList.add('sr-only-select');

    // the visible trigger lives in `wrap`, not the now-hidden `select`,
    // so any width/flex-sizing utility classes on the original select
    // (e.g. a select meant to sit narrow next to another field, like a
    // country-code picker beside a phone number input) need to carry
    // over to `wrap`, otherwise they're applied to an invisible element
    // and the visible trigger just falls back to filling all available
    // space, everything else (border, padding, text color, etc.) can
    // stay on the hidden select since only `wrap` and `.custom-select-
    // trigger` are ever actually rendered
    const sizingClass = /^(w-|shrink-|flex-shrink-|flex-grow-|grow-|basis-|min-w-|max-w-)/;
    select.className.split(/\s+/).forEach((cls) => {
      if (sizingClass.test(cls)) wrap.classList.add(cls);
    });

    renderOptions();
    updateTrigger();
  }

  function run() {
    document.querySelectorAll('select').forEach(enhanceSelect);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
