/**
 * PupLume Domain & Subdomain Routing Engine
 * 
 * Enables single-branch (`main`) multi-domain architecture:
 * - Root domain (puplume.pet, www.puplume.pet): Marketing Landing Page + Public Dog Safety Links
 * - Subdomain (app.puplume.pet): Core Web App (Clerk Authentication, Puppy Dashboard, AI, etc.)
 * - Preview / Localhost: Automatic smart fallback with query & path override support
 */

export interface DomainContext {
  isAppDomain: boolean;
  isMarketingDomain: boolean;
  isLocalOrPreview: boolean;
  isProduction: boolean;
  appBaseUrl: string;
  marketingBaseUrl: string;
}

export function getDomainContext(): DomainContext {
  if (typeof window === 'undefined') {
    return {
      isAppDomain: true,
      isMarketingDomain: false,
      isLocalOrPreview: false,
      isProduction: true,
      appBaseUrl: 'https://app.puplume.pet',
      marketingBaseUrl: 'https://puplume.pet',
    };
  }

  const hostname = window.location.hostname.toLowerCase();
  const searchParams = new URLSearchParams(window.location.search);
  const path = window.location.pathname.toLowerCase();

  const isLocalOrPreview = (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.vercel.app') ||
    hostname.includes('ngrok')
  );

  const isProduction = !isLocalOrPreview && (
    hostname === 'puplume.pet' ||
    hostname === 'www.puplume.pet' ||
    hostname === 'app.puplume.pet' ||
    hostname.endsWith('.puplume.pet')
  );

  // 1. Explicit query parameter overrides (testable on any URL: ?view=marketing or ?view=app)
  const viewParam = searchParams.get('view')?.toLowerCase();
  const appParam = searchParams.get('app');
  const marketingParam = searchParams.get('marketing');

  if (viewParam === 'marketing' || marketingParam === 'true') {
    return {
      isAppDomain: false,
      isMarketingDomain: true,
      isLocalOrPreview,
      isProduction,
      appBaseUrl: isLocalOrPreview ? window.location.origin : 'https://app.puplume.pet',
      marketingBaseUrl: isLocalOrPreview ? window.location.origin : 'https://puplume.pet',
    };
  }

  if (viewParam === 'app' || appParam === 'true') {
    return {
      isAppDomain: true,
      isMarketingDomain: false,
      isLocalOrPreview,
      isProduction,
      appBaseUrl: isLocalOrPreview ? window.location.origin : 'https://app.puplume.pet',
      marketingBaseUrl: isLocalOrPreview ? window.location.origin : 'https://puplume.pet',
    };
  }

  // 2. Explicit path overrides
  if (path === '/marketing' || path.startsWith('/marketing/')) {
    return {
      isAppDomain: false,
      isMarketingDomain: true,
      isLocalOrPreview,
      isProduction,
      appBaseUrl: isLocalOrPreview ? window.location.origin : 'https://app.puplume.pet',
      marketingBaseUrl: isLocalOrPreview ? window.location.origin : 'https://puplume.pet',
    };
  }

  if (path === '/app' || path.startsWith('/app/')) {
    return {
      isAppDomain: true,
      isMarketingDomain: false,
      isLocalOrPreview,
      isProduction,
      appBaseUrl: isLocalOrPreview ? window.location.origin : 'https://app.puplume.pet',
      marketingBaseUrl: isLocalOrPreview ? window.location.origin : 'https://puplume.pet',
    };
  }

  // 3. Subdomain matching:
  // e.g. app.puplume.pet, app-staging.puplume.pet, preview URLs starting with app-
  const isAppSubdomain = (
    hostname.startsWith('app.') ||
    hostname.includes('.app.') ||
    hostname.startsWith('app-')
  );

  if (isAppSubdomain) {
    return {
      isAppDomain: true,
      isMarketingDomain: false,
      isLocalOrPreview,
      isProduction,
      appBaseUrl: isLocalOrPreview ? window.location.origin : 'https://app.puplume.pet',
      marketingBaseUrl: isLocalOrPreview ? window.location.origin : 'https://puplume.pet',
    };
  }

  // 4. Marketing domain matching:
  // Production root domain (puplume.pet, www.puplume.pet) or preview branch named marketing
  const isProductionRoot = (
    hostname === 'puplume.pet' ||
    hostname === 'www.puplume.pet' ||
    hostname === 'pupnum.pet' ||
    hostname === 'www.pupnum.pet'
  );

  const isMarketingPreview = isLocalOrPreview && (
    hostname.includes('marketing') ||
    hostname.includes('landing')
  );

  if (isProductionRoot || isMarketingPreview) {
    return {
      isAppDomain: false,
      isMarketingDomain: true,
      isLocalOrPreview,
      isProduction,
      appBaseUrl: isLocalOrPreview ? window.location.origin : 'https://app.puplume.pet',
      marketingBaseUrl: isLocalOrPreview ? window.location.origin : 'https://puplume.pet',
    };
  }

  // 5. Default on neutral localhost or generic preview:
  // Default to App so developers can code on the core product, while retaining marketing previewability
  return {
    isAppDomain: true,
    isMarketingDomain: false,
    isLocalOrPreview,
    isProduction,
    appBaseUrl: window.location.origin,
    marketingBaseUrl: window.location.origin,
  };
}

/**
 * Navigate seamlessly between marketing and app views across environments.
 */
export function navigateToApp(
  mode: 'home' | 'signin' | 'signup' = 'home',
  onLocalSwitch?: (view: string) => void
): void {
  if (typeof window === 'undefined') return;

  const ctx = getDomainContext();

  // If on production marketing domain, redirect to the real app subdomain
  if (ctx.isProduction && ctx.isMarketingDomain) {
    let target = 'https://app.puplume.pet';
    if (mode === 'signin') target = 'https://app.puplume.pet/sign-in';
    if (mode === 'signup') target = 'https://app.puplume.pet/sign-up';
    window.location.href = target;
    return;
  }

  // In preview or local dev, smoothly switch view in-memory without breaking DNS
  if (onLocalSwitch) {
    if (mode === 'signin') {
      window.history.pushState({}, '', '/sign-in');
      onLocalSwitch('auth');
    } else if (mode === 'signup') {
      window.history.pushState({}, '', '/sign-up');
      onLocalSwitch('auth');
    } else {
      window.history.pushState({}, '', '/');
      onLocalSwitch('home');
    }
  } else {
    const targetPath = mode === 'signin' ? '/sign-in' : mode === 'signup' ? '/sign-up' : '/';
    window.location.href = `${window.location.origin}${targetPath}?view=app`;
  }
}

/**
 * Navigate to the marketing landing page across environments.
 */
export function navigateToMarketing(onLocalSwitch?: (view: string) => void): void {
  if (typeof window === 'undefined') return;

  const ctx = getDomainContext();

  if (ctx.isProduction && ctx.isAppDomain) {
    window.location.href = 'https://puplume.pet';
    return;
  }

  if (onLocalSwitch) {
    window.history.pushState({}, '', '/marketing');
    onLocalSwitch('marketing');
  } else {
    window.location.href = `${window.location.origin}/marketing`;
  }
}
