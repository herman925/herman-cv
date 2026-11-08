/* One copy of each source ledger, with an inline edition when dialog is unavailable. */
(function () {
    'use strict';
    const dialog = document.getElementById('research-magazine');
    const reader = document.getElementById('research-media-reader');
    const trigger = document.getElementById('research-magazine-trigger');
    if (!dialog || !reader || !trigger || typeof dialog.showModal !== 'function') return;

    const viewport = dialog.querySelector('.magazine-viewport');
    const chapters = [...reader.querySelectorAll('[data-magazine-chapter]')];
    const buttons = [...dialog.querySelectorAll('[data-magazine-page]')];
    const previous = dialog.querySelector('[data-magazine-previous]');
    const next = dialog.querySelector('[data-magazine-next]');
    const status = dialog.querySelector('[data-magazine-status]');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let current = 0;
    let opener = trigger;
    let restoreHash = '#impact';
    let resumeLenis = false;
    let navigationClose = false;
    viewport.append(reader);
    trigger.setAttribute('aria-haspopup', 'dialog');
    trigger.setAttribute('aria-controls', dialog.id);

    function writeHash(hash) {
        history.replaceState(history.state, '', location.pathname + location.search + hash);
    }

    function selectChapter(index, animate) {
        if (index < 0 || index >= chapters.length) return;
        current = index;
        chapters.forEach((chapter, i) => { chapter.hidden = i !== index; });
        buttons.forEach((button, i) => { button.setAttribute('aria-pressed', String(i === index)); });
        previous.disabled = index === 0;
        next.disabled = index === chapters.length - 1;
        status.textContent = `Chapter ${index + 1} of ${chapters.length}`;
        viewport.scrollTop = 0;
        if (animate && !reduced.matches) {
            chapters[index].getAnimations().forEach(animation => animation.cancel());
            chapters[index].animate([{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 320, easing: 'cubic-bezier(.2,.7,.3,1)' });
        }
    }

    function openReader(target = reader) {
        const chapter = target.closest('[data-magazine-chapter]');
        selectChapter(chapter ? chapters.indexOf(chapter) : 0, false);
        if (!dialog.open) {
            const lenis = window.SPINE?.lenis;
            resumeLenis = Boolean(lenis && !lenis.isStopped);
            if (resumeLenis) lenis.stop();
            document.documentElement.classList.add('magazine-open');
            dialog.showModal();
            if (!reduced.matches) dialog.animate([{ opacity: 0, transform: 'translateY(24px) scale(.98)' }, { opacity: 1, transform: 'translateY(0) scale(1)' }], { duration: 350, easing: 'cubic-bezier(.2,.7,.3,1)' });
        }
        if (target !== reader) {
            let ancestor = target;
            while (ancestor && ancestor !== reader) {
                if (ancestor.tagName === 'DETAILS') ancestor.open = true;
                ancestor = ancestor.parentElement;
            }
            requestAnimationFrame(() => {
                viewport.scrollTop = Math.max(0, target.getBoundingClientRect().top - viewport.getBoundingClientRect().top + viewport.scrollTop - 24);
            });
        }
        writeHash('#' + (target === reader ? chapters[current].id : target.id));
    }

    function hashTarget() {
        let id;
        try { id = decodeURIComponent(location.hash.slice(1)); } catch (_) { return null; }
        const target = document.getElementById(id);
        return target && (target === reader || reader.contains(target)) ? target : null;
    }

    trigger.addEventListener('click', event => {
        if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        opener = trigger;
        restoreHash = location.hash && !hashTarget() ? location.hash : '#impact';
        openReader();
    });
    buttons.forEach((button, index) => button.addEventListener('click', () => {
        selectChapter(index, true);
        writeHash('#' + chapters[current].id);
    }));
    previous.addEventListener('click', () => {
        selectChapter(current - 1, true);
        writeHash('#' + chapters[current].id);
        if (previous.disabled) buttons[current].focus();
    });
    next.addEventListener('click', () => {
        selectChapter(current + 1, true);
        writeHash('#' + chapters[current].id);
        if (next.disabled) buttons[current].focus();
    });
    dialog.addEventListener('keydown', event => {
        if (event.key !== 'Tab') return;
        const focusable = [...dialog.querySelectorAll('a[href], button:not([disabled]), summary, [tabindex="0"]')].filter(element => element.getClientRects().length);
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    });
    dialog.querySelector('[data-magazine-close]').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
        if (event.target !== dialog) return;
        const rect = dialog.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
    });
    dialog.addEventListener('close', () => {
        document.documentElement.classList.remove('magazine-open');
        if (resumeLenis) window.SPINE?.lenis?.start();
        resumeLenis = false;
        if (!navigationClose) {
            writeHash(restoreHash);
            opener.focus({ preventScroll: true });
        }
        navigationClose = false;
    });

    // Close the native top layer before the shared chapter-transition veil appears.
    document.addEventListener('click', event => {
        const anchor = event.target.closest('a[href]');
        if (!anchor || anchor === trigger || event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || anchor.target === '_blank' || anchor.hasAttribute('download')) return;
        const url = new URL(anchor.href, location.href);
        if (url.origin !== location.origin) return;
        if (url.pathname !== location.pathname || url.search !== location.search) {
            if (dialog.open) { navigationClose = true; dialog.close(); }
            return;
        }
        let target;
        try { target = document.getElementById(decodeURIComponent(url.hash.slice(1))); } catch (_) { return; }
        if (target && (target === reader || reader.contains(target))) {
            event.preventDefault();
            if (!dialog.open) { opener = anchor; restoreHash = location.hash && !hashTarget() ? location.hash : '#impact'; }
            openReader(target);
        }
    }, true);
    window.addEventListener('hashchange', () => {
        const target = hashTarget();
        if (target) openReader(target);
        else if (dialog.open) { restoreHash = location.hash; dialog.close(); }
    });
    const initialTarget = hashTarget();
    if (initialTarget) {
        trigger.scrollIntoView({ block: 'center', behavior: 'instant' });
        // The dialog's native top layer must not cover the arriving chapter title.
        const veil = document.getElementById('wipe-veil');
        if (veil && veil.dataset.state !== 'hidden') {
            const observer = new MutationObserver(() => {
                if (veil.dataset.state !== 'hidden') return;
                observer.disconnect();
                openReader(initialTarget);
            });
            observer.observe(veil, { attributes: true, attributeFilter: ['data-state'] });
        } else openReader(initialTarget);
    }
}());
