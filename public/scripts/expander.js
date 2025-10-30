document.addEventListener('DOMContentLoaded', () => {
  const navLinks = document.querySelectorAll('.navigation a[data-expand]');
  const mainContent = document.querySelector('.main-content');

  navLinks.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const href = link.href;

      // Hide all content inside main-content except nav
      Array.from(mainContent.children).forEach(child => {
        if (!child.classList.contains('navigation')) {
          child.style.display = 'none';
        }
      });

      mainContent.classList.add('expanded');

      setTimeout(() => {
        window.location.href = href;
      }, 600);

      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
});
