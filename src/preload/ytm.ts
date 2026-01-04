import { contextBridge } from 'electron';
import { createSharedApi } from './sharedApiYtm';

const shared = createSharedApi();

contextBridge.exposeInMainWorld('ytmEnhanced', {
  shared
});

function updateLoggedInState() {
  const navBar = document.querySelector('ytmusic-nav-bar');
  const isLoggedIn = navBar?.hasAttribute('user-logged-in') || false;
  console.log(`[YTM Preload] Navbar found: ${!!navBar}, isLoggedIn: ${isLoggedIn}`);
  shared.set('user-logged-in', isLoggedIn);
}

function updateUserIcon() {
  try {
    const img = document.querySelector(
      'ytmusic-nav-bar ytmusic-settings-button > yt-icon-button > button img'
    );
    shared.set('user-icon', img?.getAttribute('src') || '');
  } catch (error) {
    console.error('[YTM Preload] Error updating user icon:', error);
  }
}

function bodyUpdate() {
  updateUserIcon();
}

window.addEventListener('DOMContentLoaded', () => {
  const navBar = document.querySelector('ytmusic-nav-bar');

  if (navBar) {
    const observer = new MutationObserver(updateLoggedInState);
    observer.observe(navBar, { attributes: true });
    updateLoggedInState();
  } else {
    // If nav bar doesn't exist yet, watch body for its appearance
    const bodyObserver = new MutationObserver(() => {
      const nav = document.querySelector('ytmusic-nav-bar');
      if (nav) {
        bodyObserver.disconnect();
        const observer = new MutationObserver(updateLoggedInState);
        observer.observe(nav, { attributes: true });
        updateLoggedInState();
      }
    });
    bodyObserver.observe(document.body, { childList: true, subtree: true });
  }

  const observer = new MutationObserver(bodyUpdate);
  observer.observe(document.body, { childList: true, subtree: true });
  bodyUpdate();
});

shared.register('ytm.openSettings', () => {
  const settingsButton = document.querySelector(
    'ytmusic-nav-bar ytmusic-settings-button button'
  ) as HTMLButtonElement | null;
  if (settingsButton) {
    settingsButton.click();
  }
});

shared.register('ytm.signIn', () => {
  const signInButton = document.querySelector(
    'ytmusic-nav-bar a.sign-in-link'
  ) as HTMLAnchorElement | null;
  if (signInButton) {
    signInButton.click();
  }
});

shared.register('ytm.toggleGuide', () => {
  const guide = document.querySelector('#guide-button button') as HTMLButtonElement | null;
  if (guide) {
    guide.click();
  }
});
