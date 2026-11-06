/**
 * Universal Clipboard Copy Utility
 * Works in all environments:
 * 1. Modern HTTPS (navigator.clipboard.writeText)
 * 2. Insecure HTTP / LAN testing (document.execCommand('copy') fallback)
 * 3. Mobile Safari, Android Chrome, and embedded WebViews
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false;

  // 1. Try modern async Clipboard API if available and secure
  if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // If permission denied or HTTP context, gracefully try fallback below
    }
  }

  // 2. Reliable fallback for HTTP / LAN IP / older browsers
  if (typeof document !== 'undefined') {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      
      // Keep textarea invisible and off-screen without causing page jump
      textArea.style.position = 'fixed';
      textArea.style.top = '0';
      textArea.style.left = '0';
      textArea.style.width = '2em';
      textArea.style.height = '2em';
      textArea.style.padding = '0';
      textArea.style.border = 'none';
      textArea.style.outline = 'none';
      textArea.style.boxShadow = 'none';
      textArea.style.background = 'transparent';
      textArea.setAttribute('readonly', '');
      
      document.body.appendChild(textArea);
      textArea.select();
      textArea.setSelectionRange(0, 99999); // For mobile devices

      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    } catch (err) {
      console.warn('[Clipboard] execCommand failed:', err);
    }
  }

  return false;
}
