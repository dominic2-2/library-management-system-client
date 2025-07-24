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
  
  // Detect Browser Name & Version
  let browserName = 'Unknown';
  let browserVersion = 'Unknown';
  
  if (userAgent.indexOf('Chrome') > -1) {
    browserName = 'Chrome';
    const match = userAgent.match(/Chrome\/(\d+)/);
    browserVersion = match ? match[1] : 'Unknown';
  } else if (userAgent.indexOf('Firefox') > -1) {
    browserName = 'Firefox';
    const match = userAgent.match(/Firefox\/(\d+)/);
    browserVersion = match ? match[1] : 'Unknown';
  } else if (userAgent.indexOf('Safari') > -1 && userAgent.indexOf('Chrome') === -1) {
    browserName = 'Safari';
    const match = userAgent.match(/Version\/(\d+)/);
    browserVersion = match ? match[1] : 'Unknown';
  } else if (userAgent.indexOf('Edge') > -1) {
    browserName = 'Edge';
    const match = userAgent.match(/Edge\/(\d+)/);
    browserVersion = match ? match[1] : 'Unknown';
  } else if (userAgent.indexOf('Opera') > -1 || userAgent.indexOf('OPR') > -1) {
    browserName = 'Opera';
    const match = userAgent.match(/(?:Opera|OPR)\/(\d+)/);
    browserVersion = match ? match[1] : 'Unknown';
  }
  
  // Detect Operating System
  let operatingSystem = 'Unknown';
  const platform = navigator.platform.toLowerCase();
  
  if (platform.indexOf('win') > -1) {
    operatingSystem = 'Windows';
  } else if (platform.indexOf('mac') > -1) {
    operatingSystem = 'MacOS';
  } else if (platform.indexOf('linux') > -1) {
    operatingSystem = 'Linux';
  } else if (userAgent.indexOf('Android') > -1) {
    operatingSystem = 'Android';
  } else if (userAgent.indexOf('iPhone') > -1 || userAgent.indexOf('iPad') > -1) {
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

// Helper function to get a summary string
export const getBrowserSummary = (browserInfo: BrowserInfo): string => {
  return `${browserInfo.browserName} ${browserInfo.browserVersion} on ${browserInfo.operatingSystem}`;
};

// Helper function to detect if mobile
export const isMobile = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

// Helper function to detect if touch device
export const isTouchDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};