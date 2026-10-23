tailwind.config = {
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)', surface: 'var(--surface)', 'surface-2': 'var(--surface-2)',
        ink: 'var(--ink)', 'ink-soft': 'var(--ink-soft)', line: 'var(--line)',
        navy: 'var(--navy)', 'navy-deep': 'var(--navy-deep)', 'on-navy': 'var(--on-navy)',
        'on-navy-soft': 'var(--on-navy-soft)', sun: 'var(--sun)', 'sun-soft': 'var(--sun-soft)',
        'on-sun': 'var(--on-sun)', brand: 'var(--brand-text)',
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'ui-sans-serif', 'sans-serif'],
        body: ['"Atkinson Hyperlegible"', 'ui-sans-serif', 'sans-serif'],
      },
      maxWidth: { page: '1240px' },
    },
  },
};
