const resolveSocketBaseUrl = () => {
  const configuredUrl = import.meta.env.VITE_API_URL?.trim();
  const normalizedApiUrl = configuredUrl
    ? configuredUrl.replace(/\/+$/, '')
    : `${window.location.protocol}//${window.location.host}/api`;

  if (normalizedApiUrl.startsWith('https://')) {
    return normalizedApiUrl.replace('https://', 'wss://');
  }

  if (normalizedApiUrl.startsWith('http://')) {
    return normalizedApiUrl.replace('http://', 'ws://');
  }

  if (normalizedApiUrl.startsWith('/')) {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${wsProtocol}//${window.location.host}${normalizedApiUrl}`;
  }

  return normalizedApiUrl;
};

export const getTelemedicineSocketUrl = () => `${resolveSocketBaseUrl()}/telemedicine/ws`;
