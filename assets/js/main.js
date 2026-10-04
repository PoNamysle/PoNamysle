(() => {
      const brandLogo = document.querySelector('.wordmark .brand-mark img');
      const footerLogo = document.querySelector('[data-footer-logo]');
      if (brandLogo && footerLogo) footerLogo.src = brandLogo.src;
      document.querySelectorAll('[data-seminar-photo]').forEach(thumbnail => {
        const photo = document.getElementById(thumbnail.dataset.seminarPhoto + '-seminar-photo');
        if (photo) thumbnail.src = photo.src;
      });
      // Ustaw true przy publikacji pierwszego filmu, aby odkryć sekcję,
      // jej pozycję w menu oraz podstronę „Czym jest PoNamyśle”.
      const specialistSectionPublished = false;
      const specialistPageIds = new Set(['dla-specjalistow', 'o-ponamysle']);
      function isPagePublished(page) {
        return specialistSectionPublished || !specialistPageIds.has(page);
      }
      document.querySelectorAll('a[href^="#"]').forEach(link => {
        if (specialistPageIds.has(link.getAttribute('href').slice(1))) {
          link.hidden = !specialistSectionPublished;
        }
      });
      const pageTitles = {
        'start': 'PoNamyśle — psychoterapia i dyskursy psychoterapii',
        'seminaria': 'Seminaria — PoNamyśle',
        'seminarium-melanie-klein': 'Melanie Klein wczoraj i dziś — PoNamyśle',
        'seminarium-rosenfeld-kernberg': 'Rosenfeld i Kernberg – różnice i podobieństwa — PoNamyśle',
        'seminarium-patologiczny-narcyzm': 'Psychoterapia skoncentrowana na przeniesieniu w leczeniu patologicznego narcyzmu — PoNamyśle',
        'grupy': 'Nabór do grup — PoNamyśle',
        'warsztaty': 'Grupowa psychoterapia wspierająca — PoNamyśle',
        'dla-specjalistow': 'Dla Specjalistów — PoNamyśle',
        'o-ponamysle': 'Czym jest PoNamyśle — PoNamyśle',
        'psychoterapia': 'Psychoterapia psychodynamiczna — PoNamyśle',
        'specjalisci': 'Specjaliści — PoNamyśle',
        'arkadiusz-gasiorek': 'Arkadiusz Gąsiorek — PoNamyśle',
        'julianna-nowicka': 'Julianna Nowicka — PoNamyśle'
      };
      function organizeSeminars() {
        const overview = document.querySelector('[data-page="seminaria"]');
        if (!overview) return;
        const currentList = overview.querySelector('[data-current-seminars]');
        const pastList = overview.querySelector('[data-past-seminars]');
        const emptyMessage = overview.querySelector('[data-no-current-seminar]');
        if (!currentList || !pastList) return;
        const seminarPages = Array.from(document.querySelectorAll('[data-page^="seminarium-"]'));
        const currentId = overview.dataset.currentSeminar || '';
        const cards = Array.from(overview.querySelectorAll('a.seminar-card'));
        const currentCard = cards.find(card =>
          card.getAttribute('href') === '#' + currentId &&
          seminarPages.some(page => page.dataset.page === currentId)
        );
        cards.sort((a, b) => {
          const dateA = a.querySelector('time')?.getAttribute('datetime') || '';
          const dateB = b.querySelector('time')?.getAttribute('datetime') || '';
          return dateB.localeCompare(dateA);
        });
        cards.forEach(card => (card === currentCard ? currentList : pastList).appendChild(card));
        currentList.hidden = !currentCard;
        if (emptyMessage) emptyMessage.hidden = Boolean(currentCard);
        const archive = pastList.closest('.news-archive');
        if (archive) archive.hidden = pastList.children.length === 0;
        seminarPages.forEach(page => {
          const status = page.querySelector('.seminar-article > header > .eyebrow');
          if (status) status.textContent = currentCard && page.dataset.page === currentId
            ? 'Aktualne seminarium' : 'Seminarium archiwalne';
          const title = page.querySelector('h1');
          if (title) pageTitles[page.dataset.page] = title.textContent.trim() + ' — PoNamyśle';
        });
      }
      organizeSeminars();
      function organizeSpecialistPosts() {
        const page = document.querySelector('[data-page="dla-specjalistow"]');
        if (!page) return;
        const latest = page.querySelector('[data-specialist-latest]');
        const archive = page.querySelector('[data-specialist-archive]');
        if (!latest || !archive) return;
        const latestEmpty = page.querySelector('[data-specialist-latest-empty]');
        const archiveEmpty = page.querySelector('[data-specialist-archive-empty]');
        const construction = page.querySelector('[data-specialist-construction]');
        const posts = Array.from(page.querySelectorAll('[data-specialist-post]'));
        posts.sort((a, b) => {
          const dateA = a.querySelector('time[datetime]')?.getAttribute('datetime') || '';
          const dateB = b.querySelector('time[datetime]')?.getAttribute('datetime') || '';
          return dateB.localeCompare(dateA);
        });
        posts.forEach((post, index) => (index < 3 ? latest : archive).appendChild(post));
        latest.hidden = posts.length === 0;
        archive.hidden = posts.length <= 3;
        if (latestEmpty) latestEmpty.hidden = posts.length > 0;
        if (archiveEmpty) archiveEmpty.hidden = posts.length > 3;
        if (construction) construction.hidden = posts.length > 0;
      }
      organizeSpecialistPosts();
      // Filmy są osadzone w pliku HTML. Profil Instagrama ładuje się z oficjalnego osadzenia.
      // Opcjonalny instagramPostUrl pozwala później wskazać konkretny post lub reel.
      const workshopMedia = Object.freeze({
        instagramProfileUrl: 'https://www.instagram.com/punkt_znaczenia/',
        instagramPostUrl: '',
        phone: '+48 531 302 178'
      });
      function workshopPhone(value) {
        const number = value.replace(/[\s().-]/g, '');
        return /^\+[1-9]\d{7,14}$/.test(number) ? number : '';
      }
      function workshopInstagramURL(value, kind) {
        try {
          const url = new URL(value);
          if (url.protocol !== 'https:' || url.username || url.password || !['instagram.com','www.instagram.com'].includes(url.hostname.toLowerCase())) return '';
          const parts = url.pathname.split('/').filter(Boolean);
          if (kind === 'post' && parts.length === 2 && ['p','reel'].includes(parts[0]) && /^[a-zA-Z0-9_-]+$/.test(parts[1])) return 'https://www.instagram.com/' + parts.join('/') + '/';
          if (kind === 'profile' && parts.length === 1 && /^[a-zA-Z0-9_.]{1,30}$/.test(parts[0]) && !['p','reel','reels','accounts','explore'].includes(parts[0])) return 'https://www.instagram.com/' + parts[0] + '/';
        } catch {}
        return '';
      }
      function createWorkshopCarousel(root) {
        const viewport = root.querySelector('[data-film-viewport]');
        const track = root.querySelector('[data-film-track]');
        const slides = Array.from(track.children);
        // Jeden odtwarzacz zachowuje ustawienia dźwięku i zgodę na odtwarzanie między filmami.
        const player = root.querySelector('[data-film-player]');
        const playButton = root.querySelector('[data-film-play]');
        const dots = Array.from(root.querySelectorAll('[data-film-select]'));
        const counter = root.querySelector('[data-film-counter]');
        const status = root.querySelector('[data-film-status]');
        const error = root.querySelector('[data-film-error]');
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        const total = slides.length;
        let current = 0, loaded = -1, moving = false, pendingDirection = 0, timer = 0;
        let sequencePlaying = false, resumeAfterMove = false, playAttempt = 0;
        let gesture = null, suppressClick = false;
        const wrap = index => (index + total) % total;
        const pageIsVisible = () => !document.hidden && !root.closest('[data-page]')?.hidden;
        function syncPlayButton() {
          playButton.hidden = moving || (!player.paused && !player.ended);
          playButton.setAttribute('aria-label', 'Odtwórz film ' + (current + 1) + ' z ' + total);
        }
        function pausePlayer() { playAttempt++; player.pause(); }
        function requestPlay() {
          if (moving || !pageIsVisible()) return;
          sequencePlaying = true;
          error.hidden = true;
          const attempt = ++playAttempt;
          if (player.ended) player.currentTime = 0;
          if (document.activeElement === playButton) viewport.focus({preventScroll:true});
          const failed = () => {
            if (attempt !== playAttempt) return;
            sequencePlaying = false;
            resumeAfterMove = false;
            syncPlayButton();
            status.textContent = 'Naciśnij przycisk na środku, aby odtworzyć film ' + (current + 1) + '.';
          };
          try {
            const started = player.play();
            if (started?.then) started.then(() => {
              if (attempt === playAttempt) syncPlayButton();
            }, failed);
          } catch { failed(); }
          syncPlayButton();
        }
        function activate(announce = false) {
          const activeSlide = slides.find(slide => Number(slide.dataset.film) === current);
          slides.forEach(slide => {
            const active = slide === activeSlide;
            slide.setAttribute('aria-hidden', String(!active));
            slide.inert = !active;
          });
          if (loaded !== current) {
            activeSlide.appendChild(player);
            player.controls = false;
            player.poster = activeSlide.querySelector('img').getAttribute('src');
            player.setAttribute('aria-label', 'Film ' + (current + 1) + ' z warsztatów');
            player.src = activeSlide.dataset.videoSrc;
            player.preload = 'metadata';
            player.load();
            loaded = current;
          }
          dots.forEach(dot => dot.setAttribute('aria-pressed', String(Number(dot.dataset.filmSelect) === current)));
          counter.textContent = 'Film ' + (current + 1) + ' z ' + total;
          if (announce) status.textContent = 'Wyświetlono film ' + (current + 1) + ' z ' + total + '.';
          error.hidden = true;
          syncPlayButton();
        }
        function finishMove() {
          if (!moving) return;
          window.clearTimeout(timer);
          track.classList.remove('is-animating');
          if (pendingDirection > 0) track.appendChild(track.firstElementChild);
          else track.insertBefore(track.lastElementChild, track.firstElementChild);
          current = wrap(current + pendingDirection);
          track.style.transform = 'translate3d(-100%,0,0)';
          moving = false;
          pendingDirection = 0;
          const continuePlaying = resumeAfterMove && sequencePlaying && pageIsVisible();
          resumeAfterMove = false;
          activate(true);
          if (continuePlaying) requestPlay();
        }
        function move(direction, continuePlaying = sequencePlaying) {
          if (moving || !direction) return;
          moving = true;
          resumeAfterMove = continuePlaying;
          pendingDirection = direction > 0 ? 1 : -1;
          pausePlayer();
          if (document.activeElement === player || document.activeElement === playButton) viewport.focus({preventScroll:true});
          syncPlayButton();
          if (reducedMotion.matches) { finishMove(); return; }
          track.classList.add('is-animating');
          track.style.transform = 'translate3d(' + (pendingDirection > 0 ? '-200%' : '0') + ',0,0)';
          timer = window.setTimeout(finishMove, 420);
        }
        function resetPosition() {
          track.classList.remove('is-animating');
          track.style.transform = 'translate3d(-100%,0,0)';
        }
        function releaseGesture() {
          const previousGesture = gesture;
          gesture = null;
          viewport.classList.remove('is-dragging');
          if (previousGesture && viewport.hasPointerCapture?.(previousGesture.id)) viewport.releasePointerCapture(previousGesture.id);
        }
        function cancelGesture() {
          const resume = gesture?.active && gesture.resume;
          releaseGesture();
          if (moving) return;
          resetPosition();
          if (resume && sequencePlaying) requestPlay();
          else syncPlayButton();
        }
        playButton.addEventListener('click', requestPlay);
        root.querySelector('[data-film-previous]').addEventListener('click', () => move(-1));
        root.querySelector('[data-film-next]').addEventListener('click', () => move(1));
        dots.forEach(dot => dot.addEventListener('click', () => {
          const wanted = Number(dot.dataset.filmSelect);
          if (wanted !== current) move(wrap(current + 1) === wanted ? 1 : -1);
        }));
        track.addEventListener('transitionend', event => {
          if (event.target === track && event.propertyName === 'transform') finishMove();
        });
        viewport.addEventListener('keydown', event => {
          if (event.target !== viewport) return;
          if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            event.preventDefault();
            move(event.key === 'ArrowRight' ? 1 : -1);
          } else if (event.key === ' ' || event.key === 'Enter') {
            event.preventDefault();
            if (moving) return;
            if (player.paused) requestPlay();
            else { sequencePlaying = false; pausePlayer(); syncPlayButton(); }
          }
        });
        viewport.addEventListener('pointerdown', event => {
          suppressClick = false;
          if (moving || event.isPrimary === false || (event.pointerType === 'mouse' && event.button !== 0)) return;
          if (event.target.closest('button,a,input,select,textarea')) return;
          const video = event.target.closest('video');
          if (video?.controls && event.clientY > video.getBoundingClientRect().bottom - 64) return;
          gesture = {id:event.pointerId,x:event.clientX,y:event.clientY,dx:0,active:false,resume:false,width:viewport.clientWidth};
        });
        viewport.addEventListener('pointermove', event => {
          if (!gesture || gesture.id !== event.pointerId || moving) return;
          const dx = event.clientX - gesture.x, dy = event.clientY - gesture.y;
          if (!gesture.active) {
            if (Math.abs(dy) > 12 && Math.abs(dy) > Math.abs(dx)) { releaseGesture(); return; }
            if (Math.abs(dx) < 10 || Math.abs(dx) <= Math.abs(dy) * 1.2) return;
            gesture.active = true;
            gesture.resume = sequencePlaying && !player.paused;
            pausePlayer();
            viewport.setPointerCapture?.(event.pointerId);
            viewport.classList.add('is-dragging');
            track.classList.remove('is-animating');
          }
          event.preventDefault();
          gesture.dx = Math.max(-gesture.width, Math.min(gesture.width, dx));
          track.style.transform = 'translate3d(calc(-100% + ' + gesture.dx + 'px),0,0)';
        }, {passive:false});
        viewport.addEventListener('pointerup', event => {
          if (!gesture || gesture.id !== event.pointerId) return;
          const {active,dx,width,resume} = gesture;
          releaseGesture();
          if (!active) return;
          event.preventDefault();
          suppressClick = true;
          if (Math.abs(dx) >= Math.min(72, width * .18)) move(dx < 0 ? 1 : -1, resume);
          else {
            resetPosition();
            if (resume && sequencePlaying) requestPlay();
            else syncPlayButton();
          }
        });
        function onCarouselResize() {
          if (gesture) cancelGesture();
          if (moving) finishMove();
        }
        window.addEventListener('resize', onCarouselResize, {passive:true});
        viewport.addEventListener('pointercancel', cancelGesture);
        viewport.addEventListener('lostpointercapture', () => { if (gesture) cancelGesture(); });
        viewport.addEventListener('click', event => {
          if (!suppressClick) return;
          event.preventDefault();
          event.stopImmediatePropagation();
          suppressClick = false;
        }, true);
        player.addEventListener('play', () => {
          if (player.paused) return;
          if (!pageIsVisible()) { sequencePlaying = false; pausePlayer(); return; }
          sequencePlaying = true;
          player.controls = true;
          syncPlayButton();
        });
        player.addEventListener('pause', () => {
          if (!player.paused || player.ended || moving || gesture?.active) return;
          sequencePlaying = false;
          syncPlayButton();
        });
        player.addEventListener('ended', () => {
          if (sequencePlaying && !moving && pageIsVisible()) { releaseGesture(); move(1, true); }
          else syncPlayButton();
        });
        player.addEventListener('error', () => {
          if (!player.error) return;
          sequencePlaying = false;
          resumeAfterMove = false;
          pausePlayer();
          syncPlayButton();
          error.hidden = false;
        });
        activate();
        return {
          pause() {
            sequencePlaying = false;
            resumeAfterMove = false;
            pausePlayer();
            releaseGesture();
            if (moving) finishMove(); else resetPosition();
            syncPlayButton();
          }
        };
      }
      let workshopCarousel = null;
      let workshopMediaMounted = false;
      function loadWorkshopMedia() {
        const page = document.querySelector('[data-page="warsztaty"]');
        if (!page || page.hidden || workshopMediaMounted) return;
        workshopMediaMounted = true;
        workshopCarousel = createWorkshopCarousel(page.querySelector('[data-workshops-carousel]'));
        const phone = workshopPhone(workshopMedia.phone);
        if (phone) {
          const number = page.querySelector('[data-workshops-phone-number]');
          number.textContent = workshopMedia.phone;
          number.href = 'tel:' + phone;
          number.hidden = false;
          const pending = page.querySelector('[data-workshops-phone-pending]');
          if (pending) pending.hidden = true;
        }
        const profile = workshopInstagramURL(workshopMedia.instagramProfileUrl, 'profile');
        const post = workshopInstagramURL(workshopMedia.instagramPostUrl, 'post');
        const embed = page.querySelector('[data-workshops-instagram-embed]');
        const quote = embed.querySelector('blockquote');
        quote.setAttribute('data-instgrm-permalink', post || profile);
        const note = page.querySelector('[data-instagram-load-note]');
        if (window.instgrm?.Embeds) window.instgrm.Embeds.process();
        else if (!document.getElementById('workshops-instagram-script')) {
          const script = document.createElement('script');
          script.id = 'workshops-instagram-script';
          script.src = 'https://www.instagram.com/embed.js';
          script.async = true;
          script.addEventListener('load', () => window.instgrm?.Embeds?.process());
          script.addEventListener('error', () => { note.hidden = false; script.remove(); });
          document.body.appendChild(script);
        }
      }
      document.addEventListener('visibilitychange', () => { if (document.hidden) workshopCarousel?.pause(); });
      const main = document.querySelector('main');
      const nav = document.getElementById('main-nav');
      const menuButton = document.querySelector('.mobile-toggle');
      const patients = document.querySelector('.patient-menu');
      function closeMenu() {
        nav.classList.remove('is-open');
        menuButton.setAttribute('aria-expanded', 'false');
        menuButton.setAttribute('aria-label', 'Otwórz menu');
        patients.open = false;
      }
      // Osadzenia dostawców zachowują własny układ; wąska ramka skaluje je w całości.
      function configureResponsiveEmbed(viewport) {
        const stage = viewport.querySelector('.embed-stage');
        const minimumWidth = Number(viewport.dataset.embedMinWidth) || 320;
        if (!stage) return () => {};
        let pending = false;
        function refresh() {
          if (pending) return;
          pending = true;
          window.requestAnimationFrame(() => {
            pending = false;
            const available = viewport.getBoundingClientRect().width;
            if (available < 1) return; // Nie mierzymy ukrytej podstrony.
            const scale = Math.min(1, available / minimumWidth);
            const width = scale < 1 ? minimumWidth + 'px' : '100%';
            if (stage.style.width !== width) stage.style.width = width;
            const transform = scale < 1 ? 'scale(' + scale + ')' : '';
            if (stage.style.transform !== transform) stage.style.transform = transform;
            // Wysokość jest mierzona bez transformacji, także po zmianie wysokości iframe.
            const height = scale < 1 ? Math.ceil(stage.offsetHeight * scale) + 'px' : '';
            if (viewport.style.height !== height) viewport.style.height = height;
          });
        }
        if (window.ResizeObserver) {
          const observer = new window.ResizeObserver(refresh);
          observer.observe(viewport);
          observer.observe(stage);
        } else {
          window.addEventListener('resize', refresh, {passive:true});
          const observer = new MutationObserver(refresh);
          observer.observe(stage, {childList:true,subtree:true,attributes:true,attributeFilter:['style','height','width']});
        }
        stage.addEventListener('load', refresh, true);
        refresh();
        return refresh;
      }
      const responsiveEmbedRefreshers = Array.from(
        document.querySelectorAll('[data-responsive-embed]'), configureResponsiveEmbed
      );
      function refreshEmbeddedLayouts() {
        responsiveEmbedRefreshers.forEach(refresh => refresh());
      }

      let doctorWidgetObserver;
      function loadDoctorWidget() {
        const profile = document.querySelector('[data-page="arkadiusz-gasiorek"]');
        if (!profile || profile.hidden) return;
        const panel = profile.querySelector('.booking-panel--widget');
        if (!panel) return;
        // The provider creates a protocol-relative iframe URL. In a downloaded
        // HTML file that would resolve to file:// instead of the booking service.
        const useHttpsForCalendar = () => {
          panel.querySelectorAll('iframe').forEach(frame => {
            const source = frame.getAttribute('src') || '';
            if (source.startsWith('//www.znanylekarz.pl/')) {
              frame.setAttribute('src', 'https:' + source);
            }
          });
        };
        if (!doctorWidgetObserver) {
          doctorWidgetObserver = new MutationObserver(useHttpsForCalendar);
          doctorWidgetObserver.observe(panel, {
            childList: true, subtree: true,
            attributes: true, attributeFilter: ['src']
          });
        }
        useHttpsForCalendar();
        !function($_x, _s, id) {
          var js, fjs = $_x.getElementsByTagName(_s)[0];
          if (!$_x.getElementById(id)) {
            js = $_x.createElement(_s);
            js.id = id;
            js.src = 'https://platform.docplanner.com/js/widget.js';
            js.async = true;
            js.addEventListener('error', function() { js.remove(); });
            fjs.parentNode.insertBefore(js, fjs);
          }
        }(document, 'script', 'zl-widget-s');
      }
      function loadGoogleBooking() {
        const profile = document.querySelector('[data-page="julianna-nowicka"]');
        if (!profile || profile.hidden) return;
        const frame = profile.querySelector('[data-google-booking]');
        if (frame && !frame.hasAttribute('src')) {
          frame.setAttribute('src', frame.dataset.bookingSrc);
        }
      }
      function render(moveFocus = false) {
        const hash = location.hash.slice(1);
        const requested = hash === 'dla-terapeutow' ? 'dla-specjalistow' : hash;
        if (requested === 'tresc') { main.focus(); return; }
        const page = Object.prototype.hasOwnProperty.call(pageTitles, requested) && isPagePublished(requested)
          ? requested : 'start';
        if (!isPagePublished(requested)) {
          // Bezpośredni oraz dawny adres ukrytej sekcji prowadzą na stronę główną.
          try { window.history.replaceState(null, '', '#start'); } catch (_) {}
        }
        document.querySelectorAll('[data-page]').forEach(el => { el.hidden = el.dataset.page !== page; });
        document.querySelectorAll('[data-nav]').forEach(el => {
          if (el.dataset.nav === page) el.setAttribute('aria-current', 'page');
          else el.removeAttribute('aria-current');
        });
        document.title = pageTitles[page];
        refreshEmbeddedLayouts();
        if (page === 'arkadiusz-gasiorek') requestAnimationFrame(loadDoctorWidget);
        if (page === 'julianna-nowicka') requestAnimationFrame(loadGoogleBooking);
        if (page === 'warsztaty') requestAnimationFrame(loadWorkshopMedia);
        else workshopCarousel?.pause();
        patients.classList.toggle('is-current', ['psychoterapia', 'specjalisci', 'arkadiusz-gasiorek', 'julianna-nowicka'].includes(page));
        closeMenu();
        if (moveFocus) { window.scrollTo({top:0,behavior:'instant'}); main.focus({preventScroll:true}); }
      }
      menuButton.addEventListener('click', () => {
        const expanded = menuButton.getAttribute('aria-expanded') === 'true';
        menuButton.setAttribute('aria-expanded', String(!expanded));
        menuButton.setAttribute('aria-label', expanded ? 'Otwórz menu' : 'Zamknij menu');
        nav.classList.toggle('is-open', !expanded);
      });
      document.addEventListener('click', event => {
        if (!patients.contains(event.target)) patients.open = false;
        if (nav.classList.contains('is-open') && !event.target.closest('.site-header')) closeMenu();
        const link = event.target.closest('a[href^="#"]');
        if (link && link.hash === location.hash) { closeMenu(); if (link.hash !== '#tresc') window.scrollTo({top:0,behavior:'instant'}); }
      });
      document.addEventListener('keydown', event => {
        if (event.key === 'Escape') { const wasOpen = nav.classList.contains('is-open'); const wasDropdownOpen = patients.open; closeMenu(); if (wasOpen) menuButton.focus(); else if (wasDropdownOpen) patients.querySelector('summary').focus(); }
      });
      const desktopNavigation = window.matchMedia('(min-width:64rem)');
      const syncNavigation = event => {
        const navigationHadFocus = nav.contains(document.activeElement);
        closeMenu();
        if (!event.matches && navigationHadFocus) menuButton.focus({preventScroll:true});
      };
      if (desktopNavigation.addEventListener) desktopNavigation.addEventListener('change', syncNavigation);
      else desktopNavigation.addListener(syncNavigation);
      window.addEventListener('hashchange', () => render(true));
      render();
    })();
