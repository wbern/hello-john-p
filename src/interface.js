const about = document.querySelector('#about');
const panel = document.querySelector('#about-panel');
about.addEventListener('click', () => panel.togglePopover());
panel.addEventListener('toggle', event => about.setAttribute('aria-expanded', String(event.newState === 'open')));
