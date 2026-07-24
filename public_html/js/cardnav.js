(function () {
    'use strict';

    function init() {
        var navEl     = document.getElementById('cardNav');
        var hamburger = document.getElementById('hamburger');
        var contentEl = document.getElementById('cardNavContent');
        if (!navEl || !hamburger || !contentEl) return;

        var cards      = Array.from(navEl.querySelectorAll('.nav-card'));
        var isExpanded = false;
        var tl         = null;

        function calcHeight() {
            if (!window.matchMedia('(max-width: 768px)').matches) return 260;
            var prev = {
                visibility:    contentEl.style.visibility,
                pointerEvents: contentEl.style.pointerEvents,
                position:      contentEl.style.position,
                height:        contentEl.style.height
            };
            contentEl.style.visibility    = 'visible';
            contentEl.style.pointerEvents = 'auto';
            contentEl.style.position      = 'static';
            contentEl.style.height        = 'auto';
            void contentEl.offsetHeight;
            var h = 60 + contentEl.scrollHeight + 16;
            contentEl.style.visibility    = prev.visibility;
            contentEl.style.pointerEvents = prev.pointerEvents;
            contentEl.style.position      = prev.position;
            contentEl.style.height        = prev.height;
            return h;
        }

        function build() {
            if (tl) tl.kill();
            gsap.set(navEl, { height: 60, overflow: 'hidden' });
            gsap.set(cards, { y: 40, opacity: 0 });
            tl = gsap.timeline({ paused: true });
            tl.to(navEl, { height: calcHeight, duration: 0.42, ease: 'power3.out' });
            tl.to(cards, { y: 0, opacity: 1, duration: 0.38, ease: 'power3.out', stagger: 0.07 }, '-=0.12');
            return tl;
        }

        function toggle() {
            if (!tl) return;
            if (!isExpanded) {
                isExpanded = true;
                hamburger.classList.add('open');
                hamburger.setAttribute('aria-label', 'Fechar menu');
                hamburger.setAttribute('aria-expanded', 'true');
                navEl.classList.add('open');
                contentEl.setAttribute('aria-hidden', 'false');
                tl.play(0);
            } else {
                hamburger.classList.remove('open');
                hamburger.setAttribute('aria-label', 'Abrir menu');
                hamburger.setAttribute('aria-expanded', 'false');
                contentEl.setAttribute('aria-hidden', 'true');
                tl.eventCallback('onReverseComplete', function () {
                    isExpanded = false;
                    navEl.classList.remove('open');
                });
                tl.reverse();
            }
        }

        build();

        hamburger.addEventListener('click', toggle);
        hamburger.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
        });

        window.addEventListener('resize', function () {
            if (isExpanded) {
                gsap.set(navEl, { height: calcHeight() });
                build().progress(1);
            } else {
                build();
            }
        });

        document.addEventListener('click', function (e) {
            if (isExpanded && !navEl.contains(e.target)) toggle();
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
