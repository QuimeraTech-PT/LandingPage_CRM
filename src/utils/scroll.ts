/**
 * Utility for smooth scrolling to sections with header offset and accessibility support.
 */
export const scrollToSection = (targetId: string, options: { behavior?: ScrollBehavior } = {}) => {
  const elem = document.getElementById(targetId);
  if (!elem) return false;

  const isReducedMotion =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    document.documentElement.classList.contains("force-reduced-motion");

  // Calculate offset based on device (mobile vs desktop)
  const isMobile = window.innerWidth < 1024;
  const header = document.querySelector("header");
  const headerHeight = header ? header.offsetHeight : 80;
  const offset = headerHeight;

  window.scrollTo({
    top: elem.offsetTop - offset,
    behavior: isReducedMotion ? "auto" : options.behavior || "smooth",
  });

  // Handle accessibility: set focus to the section or its first heading
  // and manage the focus ring
  elem.setAttribute("tabindex", "-1");
  elem.focus({ preventScroll: true });

  // Optional: remove tabindex after focus to keep DOM clean
  const blurHandler = () => {
    elem.removeAttribute("tabindex");
    elem.removeEventListener("blur", blurHandler);
  };
  elem.addEventListener("blur", blurHandler);

  return true;
};

/**
 * Waits for an element to be present in the DOM and visible.
 * Useful for lazy-loaded sections.
 */
export const waitForElement = (selector: string, timeout = 5000): Promise<HTMLElement | null> => {
  return new Promise((resolve) => {
    const startTime = Date.now();

    const check = () => {
      const element = document.querySelector(selector) as HTMLElement;
      if (element) {
        resolve(element);
        return;
      }

      if (Date.now() - startTime > timeout) {
        resolve(null);
        return;
      }

      requestAnimationFrame(check);
    };

    check();
  });
};
