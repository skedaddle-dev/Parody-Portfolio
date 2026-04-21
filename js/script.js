/*==================== about me expand icon ====================*/
document.addEventListener('DOMContentLoaded', function () {
  const toggleBtn = document.querySelector('.toggle-btn');
  const panels = document.querySelector('#about-panels');
  const aboutText = document.querySelector('.about-text');
  const skillsText = document.querySelector('.skills-text');

  if (!toggleBtn || !panels || !aboutText || !skillsText) {
    return;
  }

  let currentPanel = aboutText;
  let panelObserver = null;

  const setPanelHeight = (panel) => {
    const nextHeight = Math.ceil(panel.scrollHeight + 24);
    panels.style.height = `${nextHeight}px`;
  };

  const observePanel = (panel) => {
    panelObserver?.disconnect();

    panelObserver = new ResizeObserver(() => {
      if (panel === currentPanel) {
        setPanelHeight(panel);
      }
    });

    panelObserver.observe(panel);
  };

  setPanelHeight(currentPanel);
  observePanel(currentPanel);

  window.addEventListener('resize', () => {
    setPanelHeight(currentPanel);
  });

  window.addEventListener('load', () => {
    setPanelHeight(currentPanel);
  });

  if (document.fonts?.ready) {
    document.fonts.ready.then(() => {
      setPanelHeight(currentPanel);
    });
  }

  toggleBtn.addEventListener('click', function () {
    const leavingPanel = currentPanel;
    const nextPanel = currentPanel === aboutText ? skillsText : aboutText;
    const nextLabel = nextPanel === skillsText ? 'About Me' : 'Relevant Skills';

    panels.dataset.view = nextPanel === skillsText ? 'skills' : 'about';

    leavingPanel.classList.add('is-leaving');
    leavingPanel.setAttribute('aria-hidden', 'true');

    nextPanel.classList.add('is-active', 'is-entering');
    nextPanel.setAttribute('aria-hidden', 'false');

    requestAnimationFrame(() => {
      setPanelHeight(nextPanel);
      observePanel(nextPanel);

      requestAnimationFrame(() => {
        nextPanel.classList.remove('is-entering');
      });
    });

    leavingPanel.addEventListener('transitionend', () => {
      leavingPanel.classList.remove('is-active', 'is-leaving');
    }, { once: true });

    currentPanel = nextPanel;
    toggleBtn.textContent = nextLabel;
  });
});



/*==================== toggle icon navbar ====================*/
let menuIcon = document.querySelector('#menu-icon');
let navbar = document.querySelector('.navbar');

menuIcon.onclick = () => {
    menuIcon.classList.toggle('bx-x')
    navbar.classList.toggle('active')
}

/*==================== scroll sections active link ====================*/
let sections = document.querySelectorAll('section');
let navLinks = document.querySelectorAll('header nav a');

window.onscroll = () => {
    sections.forEach(sec => {
        let top = window.scrollY;
        let offset = sec.offsetTop - 150;
        let height = sec.offsetHeight;
        let id = sec.getAttribute('id');

        if (top >= offset && top < offset + height){
            navLinks.forEach(links => {
                links.classList.remove('active');
                document.querySelector('header nav a[href*=' + id + ']').classList.add('active');
            });
        };
    });

    /*==================== sticky navbar ====================*/
    let header = document.querySelector('header');
    header.classList.toggle('sticky', window.scrollY > 100);

    /*==================== remove toggle icon and navbar when click navbar link (scroll) ====================*/
    menuIcon.classList.remove('bx-x')
    navbar.classList.remove('active')
};

/*==================== scroll reveal ====================*/
ScrollReveal({
    //reset: true,
    distance: '80px',
    duration: 2000,
    delay: 200
})

ScrollReveal().reveal('.home-content, .heading', {origin: 'top' });
ScrollReveal().reveal('.home-img, .projects-container, .hobbies-box, .contact form', {origin: 'bottom' });
ScrollReveal().reveal('.home-content h1, .about-img', {origin: 'left' });
ScrollReveal().reveal('.home-content p, .about-content', {origin: 'right' });
ScrollReveal().reveal('.quote-left .quote-card', {origin: 'left' });
ScrollReveal().reveal('.quote-right .quote-card', {origin: 'right' });

/*==================== typed js ====================*/
const typed = new Typed('.multiple-text', {
    strings: ['Gym Rat', 'Serial Procrastinator', 'Space Glider', 'Teamfight Tactician', 'Warcraft Modder', 'Bed War-rior', 'Gojo Glazer', 'Chronic Doomscroller'],
    typeSpeed: 50,
    backSpeed: 50,
    backDelay: 1000,
    loop: true
});

/*==================== lanyard widgets ====================*/
const DISCORD_USER_ID = '863872053848703046';
const DISCORD_FALLBACK_AVATAR = 'https://cdn.discordapp.com/avatars/863872053848703046/1af6767b4808903c59698fd4be4105bc.webp?size=256';
const SPOTIFY_PROFILE_URL = 'https://open.spotify.com/user/31mg44m2nylxylspauarkyxfqepa?si=5f420f3edbb94238&nd=1&dlsi=550aa7e073ba41e9';
const SPOTIFY_PLACEHOLDER_ART = 'data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAA=';

const spotifyWidget = document.querySelector('#spotify-widget');
const spotifyArt = document.querySelector('#spotify-art');
const spotifySong = document.querySelector('#spotify-song');
const spotifyArtist = document.querySelector('#spotify-artist');
const spotifyLink = document.querySelector('#spotify-link');
const spotifyProgressBar = document.querySelector('#spotify-progress-bar');
const spotifyElapsed = document.querySelector('#spotify-elapsed');
const spotifyDuration = document.querySelector('#spotify-duration');

const discordWidget = document.querySelector('#discord-widget');
const discordAvatar = document.querySelector('#discord-avatar');
const discordDecoration = document.querySelector('#discord-decoration');
const discordStatusLabel = document.querySelector('#discord-status-label');
const discordActivityTitle = document.querySelector('#discord-activity-title');
const discordActivityDetails = document.querySelector('#discord-activity-details');
const discordCustomStatus = document.querySelector('#discord-custom-status');

const lanyardState = {
    heartbeatId: null,
    reconnectId: null,
    spotifyProgressId: null,
    presenceTimeoutId: null,
    didReceivePresence: false
};

function formatClock(ms) {
    if (!Number.isFinite(ms) || ms <= 0) {
        return '0:00';
    }

    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function capitalize(word) {
    if (!word) {
        return 'Offline';
    }

    if (word === 'unavailable') {
        return 'Unavailable';
    }

    return word.charAt(0).toUpperCase() + word.slice(1);
}

function stopSpotifyProgress() {
    clearInterval(lanyardState.spotifyProgressId);
    lanyardState.spotifyProgressId = null;
    spotifyProgressBar.style.width = '0%';
    spotifyElapsed.textContent = '0:00';
    spotifyDuration.textContent = '0:00';
}

function startSpotifyProgress(start, end) {
    stopSpotifyProgress();

    function renderProgress() {
        const duration = Math.max(end - start, 0);
        const elapsed = Math.min(Math.max(Date.now() - start, 0), duration);
        const progress = duration ? (elapsed / duration) * 100 : 0;

        spotifyProgressBar.style.width = `${progress}%`;
        spotifyElapsed.textContent = formatClock(elapsed);
        spotifyDuration.textContent = formatClock(duration);
    }

    renderProgress();
    lanyardState.spotifyProgressId = setInterval(renderProgress, 1000);
}

function setSpotifyInactive(message, subtext) {
    spotifyWidget.dataset.active = 'false';
    spotifyArt.src = SPOTIFY_PLACEHOLDER_ART;
    spotifySong.textContent = message;
    spotifyArtist.textContent = subtext;
    spotifyLink.href = SPOTIFY_PROFILE_URL;
    stopSpotifyProgress();
}

function setDiscordFallback(title, details, state = 'offline') {
    discordWidget.dataset.state = state;
    discordWidget.dataset.decoration = 'false';
    discordAvatar.src = DISCORD_FALLBACK_AVATAR;
    discordDecoration.src = '';
    discordStatusLabel.textContent = capitalize(state);
    discordActivityTitle.textContent = title;
    discordActivityDetails.textContent = details;
    discordCustomStatus.textContent = 'No custom status set right now';
}

function getDiscordAvatarUrl(user) {
    if (!user || !user.avatar || !user.id) {
        return DISCORD_FALLBACK_AVATAR;
    }

    return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=256`;
}

function getPreferredActivity(activities) {
    if (!Array.isArray(activities)) {
        return null;
    }

    return activities.find(activity => activity.name !== 'Spotify' && activity.type !== 4)
        || activities.find(activity => activity.type === 4)
        || null;
}

function getCustomStatus(activities) {
    if (!Array.isArray(activities)) {
        return null;
    }

    return activities.find(activity => activity.type === 4) || null;
}

function getAvatarDecorationUrl(user) {
    const asset = user?.avatar_decoration_data?.asset;

    if (!asset) {
        return '';
    }

    return `https://cdn.discordapp.com/avatar-decoration-presets/${asset}.png`;
}

function formatActivity(activity, status) {
    if (!activity) {
        return {
            title: status === 'offline' ? 'Offline arc' : 'No active app',
            details: status === 'offline' ? 'Probably AFK or pretending to be productive' : 'Discord is open but the side quest is hidden'
        };
    }

    if (activity.type === 4) {
        const emoji = activity.emoji?.name ? `${activity.emoji.name} ` : '';

        return {
            title: `${emoji}${activity.state || 'Custom status'}`.trim(),
            details: 'Custom status'
        };
    }

    return {
        title: activity.name || 'Discord activity',
        details: activity.details || activity.state || `${capitalize(status)} on Discord`
    };
}

function applyPresence(presence) {
    if (!presence) {
        return;
    }

    lanyardState.didReceivePresence = true;
    clearTimeout(lanyardState.presenceTimeoutId);

    const status = presence.discord_status || 'offline';
    const activity = formatActivity(getPreferredActivity(presence.activities), status);
    const customStatus = getCustomStatus(presence.activities);
    const decorationUrl = getAvatarDecorationUrl(presence.discord_user);

    discordWidget.dataset.state = status;
    discordWidget.dataset.decoration = decorationUrl ? 'true' : 'false';
    discordAvatar.src = getDiscordAvatarUrl(presence.discord_user);
    discordDecoration.src = decorationUrl;
    discordStatusLabel.textContent = capitalize(status);
    discordActivityTitle.textContent = activity.title;
    discordActivityDetails.textContent = activity.details;
    discordCustomStatus.textContent = customStatus?.state || 'No custom status set right now';

    if (presence.listening_to_spotify && presence.spotify) {
        const spotify = presence.spotify;

        spotifyWidget.dataset.active = 'true';
        spotifyArt.src = spotify.album_art_url || SPOTIFY_PLACEHOLDER_ART;
        spotifySong.textContent = spotify.song || 'Unknown track';
        spotifyArtist.textContent = spotify.artist || spotify.album || 'Unknown artist';
        spotifyLink.href = spotify.track_id ? `https://open.spotify.com/track/${spotify.track_id}` : SPOTIFY_PROFILE_URL;
        startSpotifyProgress(spotify.timestamps?.start || 0, spotify.timestamps?.end || 0);
    } else {
        setSpotifyInactive('Not listening right now', 'Queue is currently in witness protection');
    }
}

function scheduleReconnect() {
    clearTimeout(lanyardState.reconnectId);
    lanyardState.reconnectId = setTimeout(connectLanyard, 5000);
}

function connectLanyard() {
    clearTimeout(lanyardState.reconnectId);
    clearTimeout(lanyardState.presenceTimeoutId);

    const socket = new WebSocket('wss://api.lanyard.rest/socket');

    lanyardState.presenceTimeoutId = setTimeout(() => {
        if (!lanyardState.didReceivePresence) {
            setDiscordFallback('Presence unavailable', 'Public status tracking is not synced for this profile right now', 'unavailable');
            setSpotifyInactive('Spotify status unavailable', 'Public presence tracking is not synced for this profile right now');
        }
    }, 8000);

    socket.addEventListener('message', event => {
        const payload = JSON.parse(event.data);

        if (payload.op === 1) {
            clearInterval(lanyardState.heartbeatId);
            lanyardState.heartbeatId = setInterval(() => {
                socket.send(JSON.stringify({ op: 3 }));
            }, payload.d.heartbeat_interval);

            socket.send(JSON.stringify({
                op: 2,
                d: {
                    subscribe_to_id: DISCORD_USER_ID
                }
            }));
        }

        if (payload.op === 0) {
            if (payload.t === 'INIT_STATE') {
                applyPresence(payload.d);
            }

            if (payload.t === 'PRESENCE_UPDATE') {
                applyPresence(payload.d);
            }
        }
    });

    socket.addEventListener('close', () => {
        clearInterval(lanyardState.heartbeatId);
        lanyardState.heartbeatId = null;

        if (!lanyardState.didReceivePresence) {
            setDiscordFallback('Presence unavailable', 'Public status tracking is not synced for this profile right now', 'unavailable');
            setSpotifyInactive('Spotify status unavailable', 'Public presence tracking is not synced for this profile right now');
        }

        scheduleReconnect();
    });

    socket.addEventListener('error', () => {
        socket.close();
    });
}

if (spotifyWidget && discordWidget) {
    setSpotifyInactive('Loading Spotify status...', 'Waiting for live Discord presence');
    setDiscordFallback('Loading presence...', 'Waiting for public presence sync', 'unavailable');
    connectLanyard();
}
