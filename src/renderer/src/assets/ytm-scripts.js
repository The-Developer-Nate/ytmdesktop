// Initial script injection test
console.log('YTM Enhanced Script Injected Successfully');

// Listen for messages from the backend
if (window.ytmEnhanced) {
  window.ytmEnhanced.onMessage((msg) => {
    console.log('Message from Backend:', msg);
    // visual confirmation
    const alertDiv = document.createElement('div');
    alertDiv.style.cssText =
      'position: fixed; top: 10px; right: 10px; background: #000; color: #fff; padding: 10px; z-index: 9999; border: 1px solid #444; border-radius: 4px;';
    alertDiv.textContent = 'Backend says: ' + msg;
    document.body.appendChild(alertDiv);
    setTimeout(() => alertDiv.remove(), 3000);
  });
}
