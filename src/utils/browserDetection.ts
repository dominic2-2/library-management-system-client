export interface BrowserInfo {
  browserName: string;
  browserVersion: string;
  operatingSystem: string;
  language: string;
  timezone: string;
  screenResolution: string;
  userAgent: string;
}

export const getBrowserInfo = (): BrowserInfo => {
  if (typeof window === 'undefined') {
    // Server-side rendering fallback
    return {
      browserName: 'Unknown',
      browserVersion: 'Unknown',
      operatingSystem: 'Unknown',
      language: 'en',
      timezone: 'UTC',
      screenResolution: '0x0',
      userAgent: 'Unknown'
    };
  }

  const userAgent = navigator.userAgent;
  
  // ✅ IMPROVED: Browser detection with correct order (Edge before Chrome)
  let browserName = 'Unknown';
  let browserVersion = 'Unknown';
  
  if (userAgent.includes('Edg/')) {
    browserName = 'Edge';
    const match = userAgent.match(/Edg\/(\d+)/);
    browserVersion = match ? match[1] : 'Unknown';
  } else if (userAgent.includes('OPR/') || userAgent.includes('Opera')) {
    browserName = 'Opera';
    const match = userAgent.match(/(?:OPR|Opera)\/(\d+)/);
    browserVersion = match ? match[1] : 'Unknown';
  } else if (userAgent.includes('Firefox')) {
    browserName = 'Firefox';
    const match = userAgent.match(/Firefox\/(\d+)/);
    browserVersion = match ? match[1] : 'Unknown';
  } else if (userAgent.includes('Chrome')) {
    browserName = 'Chrome';
    const match = userAgent.match(/Chrome\/(\d+)/);
    browserVersion = match ? match[1] : 'Unknown';
  } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    browserName = 'Safari';
    const match = userAgent.match(/Version\/(\d+)/);
    browserVersion = match ? match[1] : 'Unknown';
  }
  
  // ✅ IMPROVED: Operating system detection
  let operatingSystem = 'Unknown';
  
  if (userAgent.includes('Windows NT 10.0')) {
    operatingSystem = 'Windows 10';
  } else if (userAgent.includes('Windows NT 6.3')) {
    operatingSystem = 'Windows 8.1';
  } else if (userAgent.includes('Windows NT 6.2')) {
    operatingSystem = 'Windows 8';
  } else if (userAgent.includes('Windows NT 6.1')) {
    operatingSystem = 'Windows 7';
  } else if (userAgent.includes('Windows')) {
    operatingSystem = 'Windows';
  } else if (userAgent.includes('Macintosh') || userAgent.includes('Mac OS X')) {
    operatingSystem = 'macOS';
  } else if (userAgent.includes('Linux')) {
    operatingSystem = 'Linux';
  } else if (userAgent.includes('Android')) {
    operatingSystem = 'Android';
  } else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
    operatingSystem = 'iOS';
  }
  
  // Get other info
  const language = navigator.language || 'en';
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  const screenResolution = `${screen.width}x${screen.height}`;
  
  return {
    browserName,
    browserVersion,
    operatingSystem,
    language,
    timezone,
    screenResolution,
    userAgent
  };
};

// ✅ Helper function to get a summary string
export const getBrowserSummary = (browserInfo: BrowserInfo): string => {
  return `${browserInfo.browserName} ${browserInfo.browserVersion} on ${browserInfo.operatingSystem}`;
};

// ✅ Helper function to detect if mobile
export const isMobile = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

// ✅ Helper function to detect if touch device
export const isTouchDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};