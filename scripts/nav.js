document.addEventListener('DOMContentLoaded', function () {
   
    const supportsHover = window.matchMedia('(hover: hover)').matches;
    const CLOSE_DELAY = 100; // ms grace period so moving into the submenu doesn't prematurely close it

    const dropdowns = document.querySelectorAll('ul.navigation li.dropdown');
    const closeTimers = new WeakMap();

    function clearTimer(li) {
        const timer = closeTimers.get(li);
        if (timer) {
            clearTimeout(timer);
            closeTimers.delete(li);
        }
    }

    function openDropdown(li) {
        clearTimer(li);
        closeSiblings(li);
        li.classList.add('open');
        const trigger = li.querySelector(':scope > a');
        if (trigger) {
            trigger.setAttribute('aria-expanded', 'true');
        }
    }

    function closeDropdownNow(li) {
        clearTimer(li);
        li.classList.remove('open');
        const trigger = li.querySelector(':scope > a');
        if (trigger) {
            trigger.setAttribute('aria-expanded', 'false');
        }
        li.querySelectorAll(':scope li.dropdown.open').forEach(closeDropdownNow);
    }

    function scheduleClose(li) {
        clearTimer(li);
        closeTimers.set(li, setTimeout(() => closeDropdownNow(li), CLOSE_DELAY));
    }

    function closeSiblings(li) {
        const parentUl = li.parentElement;
        if (!parentUl) return;
        parentUl.querySelectorAll(':scope > li.dropdown.open').forEach(sibling => {
            if (sibling !== li) {
                closeDropdownNow(sibling);
            }
        });
    }

    function closeAll() {
        dropdowns.forEach(closeDropdownNow);
    }

    dropdowns.forEach(li => {
        const trigger = li.querySelector(':scope > a');
        if (!trigger) return;

        trigger.setAttribute('aria-expanded', 'false');

        if (supportsHover) {
            li.addEventListener('mouseenter', () => openDropdown(li));
            li.addEventListener('mouseleave', () => scheduleClose(li));
            trigger.addEventListener('focus', () => openDropdown(li));
        } else {
            trigger.addEventListener('click', function (event) {
                const isOpen = li.classList.contains('open');

                if (!isOpen) {
                    event.preventDefault();
                    openDropdown(li);
                } else if (!trigger.getAttribute('href')) {
                    event.preventDefault();
                    closeDropdownNow(li);
                }

                event.stopPropagation();
            });
        }
    });


    document.querySelectorAll('ul.navigation').forEach(nav => {
        nav.addEventListener('focusout', function (event) {
            const li = event.target.closest('li.dropdown');
            if (!li) return;
            if (li.contains(event.relatedTarget)) return;
            scheduleClose(li);
        });
    });

    document.addEventListener('click', function (event) {
        if (!event.target.closest('ul.navigation')) {
            closeAll();
        }
    });

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            closeAll();
        }
    });
});
