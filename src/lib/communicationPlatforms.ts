// Comprehensive communication and chat platforms catalog used in USA and globally
// Ordered by popularity with Top 3 (WhatsApp, iMessage/SMS, Instagram) and 4th as External URL

export interface CommunicationPlatform {
  id: string;
  name: string;
  category: 'most_used' | 'messaging' | 'social' | 'work' | 'payments' | 'pet_safety' | 'other';
  color: string;
  bgColor: string;
  domain?: string;
  placeholder: string;
  buildUrl: (value: string) => string;
}

export const COMMUNICATION_PLATFORMS: CommunicationPlatform[] = [
  // 1. WhatsApp (Top 1)
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    category: 'most_used',
    color: '#25D366',
    bgColor: '#E7FCE9',
    domain: 'whatsapp.com',
    placeholder: '+1 (555) 123-4567 or wa.me/link',
    buildUrl: (val) => {
      const trimmed = val.trim();
      if (trimmed.startsWith('http')) return trimmed;
      const clean = trimmed.replace(/[^0-9]/g, '');
      return `https://wa.me/${clean}?text=${encodeURIComponent('Hi! I scanned your pet\'s PupLume collar tag.')}`;
    },
  },

  // 2. iMessage / SMS (Top 2)
  {
    id: 'imessage',
    name: 'iMessage / SMS',
    category: 'most_used',
    color: '#007AFF',
    bgColor: '#E6F2FF',
    domain: 'apple.com',
    placeholder: '+1 (555) 123-4567',
    buildUrl: (val) => {
      const trimmed = val.trim();
      if (trimmed.startsWith('sms:') || trimmed.startsWith('tel:')) return trimmed;
      const clean = trimmed.replace(/[^0-9+]/g, '');
      return `sms:${clean}?body=${encodeURIComponent('Hi! I found your puppy through their PupLume collar tag.')}`;
    },
  },

  // 3. Instagram (Top 3)
  {
    id: 'instagram',
    name: 'Instagram',
    category: 'most_used',
    color: '#E1306C',
    bgColor: '#FDEEF3',
    domain: 'instagram.com',
    placeholder: '@username or instagram.com/...',
    buildUrl: (val) => {
      const trimmed = val.trim();
      if (trimmed.startsWith('http')) return trimmed;
      return `https://instagram.com/${trimmed.replace(/^@/, '')}`;
    },
  },

  // 4. External URL (4th position as requested)
  {
    id: 'external',
    name: 'External URL / Website',
    category: 'most_used',
    color: '#8B5E3C',
    bgColor: '#FAF6F0',
    placeholder: 'https://yourwebsite.com/contact',
    buildUrl: (val) => {
      const trimmed = val.trim();
      if (!trimmed) return '#';
      if (/^[a-zA-Z]+:\/\//.test(trimmed)) return trimmed;
      return `https://${trimmed}`;
    },
  },

  // 5+ Major Chat & Communication Apps
  {
    id: 'telegram',
    name: 'Telegram',
    category: 'messaging',
    color: '#229ED9',
    bgColor: '#E5F5FD',
    domain: 'telegram.org',
    placeholder: '@username or t.me/...',
    buildUrl: (val) => {
      const trimmed = val.trim();
      if (trimmed.startsWith('http')) return trimmed;
      return `https://t.me/${trimmed.replace(/^@/, '')}`;
    },
  },
  {
    id: 'signal',
    name: 'Signal',
    category: 'messaging',
    color: '#3A76F0',
    bgColor: '#EAF1FD',
    domain: 'signal.org',
    placeholder: 'signal.me/#p/... or phone',
    buildUrl: (val) => {
      const trimmed = val.trim();
      if (trimmed.startsWith('http')) return trimmed;
      return `https://signal.me/#p/${trimmed}`;
    },
  },
  {
    id: 'messenger',
    name: 'Facebook Messenger',
    category: 'messaging',
    color: '#0084FF',
    bgColor: '#E6F3FF',
    domain: 'messenger.com',
    placeholder: 'm.me/username or facebook.com/...',
    buildUrl: (val) => {
      const trimmed = val.trim();
      if (trimmed.startsWith('http')) return trimmed;
      return `https://m.me/${trimmed.replace(/^@/, '')}`;
    },
  },
  {
    id: 'slack',
    name: 'Slack',
    category: 'work',
    color: '#4A154B',
    bgColor: '#F5ECF5',
    domain: 'slack.com',
    placeholder: 'Slack workspace link or @handle',
    buildUrl: (val) => {
      const trimmed = val.trim();
      if (trimmed.startsWith('http')) return trimmed;
      return `https://slack.com`;
    },
  },
  {
    id: 'discord',
    name: 'Discord',
    category: 'messaging',
    color: '#5865F2',
    bgColor: '#EEEEFD',
    domain: 'discord.com',
    placeholder: 'discord.gg/... or username',
    buildUrl: (val) => {
      const trimmed = val.trim();
      if (trimmed.startsWith('http')) return trimmed;
      if (trimmed.startsWith('discord.gg/')) return `https://${trimmed}`;
      return `https://discord.com/users/${trimmed}`;
    },
  },
  {
    id: 'snapchat',
    name: 'Snapchat',
    category: 'social',
    color: '#FFFC00',
    bgColor: '#FFFDE5',
    domain: 'snapchat.com',
    placeholder: 'snapchat.com/add/... or username',
    buildUrl: (val) => {
      const trimmed = val.trim();
      if (trimmed.startsWith('http')) return trimmed;
      return `https://snapchat.com/add/${trimmed.replace(/^@/, '')}`;
    },
  },
  {
    id: 'twitter',
    name: 'X / Twitter',
    category: 'social',
    color: '#000000',
    bgColor: '#F0F0F0',
    domain: 'x.com',
    placeholder: '@handle or x.com/...',
    buildUrl: (val) => {
      const trimmed = val.trim();
      if (trimmed.startsWith('http')) return trimmed;
      return `https://x.com/${trimmed.replace(/^@/, '')}`;
    },
  },
  {
    id: 'facebook',
    name: 'Facebook Profile',
    category: 'social',
    color: '#1877F2',
    bgColor: '#EBF3FF',
    domain: 'facebook.com',
    placeholder: 'facebook.com/username',
    buildUrl: (val) => {
      const trimmed = val.trim();
      if (trimmed.startsWith('http')) return trimmed;
      return `https://facebook.com/${trimmed.replace(/^@/, '')}`;
    },
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    category: 'work',
    color: '#0A66C2',
    bgColor: '#E7F1FB',
    domain: 'linkedin.com',
    placeholder: 'linkedin.com/in/username',
    buildUrl: (val) => {
      const trimmed = val.trim();
      if (trimmed.startsWith('http')) return trimmed;
      return `https://linkedin.com/in/${trimmed.replace(/^@/, '')}`;
    },
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    category: 'social',
    color: '#000000',
    bgColor: '#F5F5F5',
    domain: 'tiktok.com',
    placeholder: '@username or tiktok.com/@...',
    buildUrl: (val) => {
      const trimmed = val.trim();
      if (trimmed.startsWith('http')) return trimmed;
      return `https://tiktok.com/@${trimmed.replace(/^@/, '')}`;
    },
  },
  {
    id: 'wechat',
    name: 'WeChat',
    category: 'messaging',
    color: '#07C160',
    bgColor: '#E6F9F0',
    domain: 'wechat.com',
    placeholder: 'WeChat ID',
    buildUrl: (val) => `weixin://dl/chat?${val.trim()}`,
  },
  {
    id: 'line',
    name: 'LINE',
    category: 'messaging',
    color: '#00B900',
    bgColor: '#E5F8E5',
    domain: 'line.me',
    placeholder: 'line.me/ti/p/... or LINE ID',
    buildUrl: (val) => {
      const trimmed = val.trim();
      if (trimmed.startsWith('http')) return trimmed;
      return `https://line.me/R/ti/p/~${trimmed}`;
    },
  },
  {
    id: 'viber',
    name: 'Viber',
    category: 'messaging',
    color: '#7360F2',
    bgColor: '#F0EEFD',
    domain: 'viber.com',
    placeholder: 'viber://chat?number=...',
    buildUrl: (val) => {
      const clean = val.replace(/[^0-9+]/g, '');
      return `viber://chat?number=${clean}`;
    },
  },
  {
    id: 'skype',
    name: 'Skype',
    category: 'messaging',
    color: '#00AFF0',
    bgColor: '#E6F7FD',
    domain: 'skype.com',
    placeholder: 'skype:username?chat',
    buildUrl: (val) => {
      const trimmed = val.trim();
      if (trimmed.startsWith('http') || trimmed.startsWith('skype:')) return trimmed;
      return `skype:${trimmed}?chat`;
    },
  },
  {
    id: 'reddit',
    name: 'Reddit',
    category: 'social',
    color: '#FF4500',
    bgColor: '#FFEEEC',
    domain: 'reddit.com',
    placeholder: 'reddit.com/user/username',
    buildUrl: (val) => {
      const trimmed = val.trim();
      if (trimmed.startsWith('http')) return trimmed;
      return `https://reddit.com/user/${trimmed.replace(/^u\//, '')}`;
    },
  },
  {
    id: 'threads',
    name: 'Threads',
    category: 'social',
    color: '#000000',
    bgColor: '#F0F0F0',
    domain: 'threads.net',
    placeholder: 'threads.net/@username',
    buildUrl: (val) => {
      const trimmed = val.trim();
      if (trimmed.startsWith('http')) return trimmed;
      return `https://threads.net/@${trimmed.replace(/^@/, '')}`;
    },
  },
  {
    id: 'google_chat',
    name: 'Google Meet / Chat',
    category: 'work',
    color: '#00AC47',
    bgColor: '#E6F8EE',
    domain: 'google.com',
    placeholder: 'chat.google.com or email',
    buildUrl: (val) => val.startsWith('http') ? val : `mailto:${val}`,
  },
  {
    id: 'teams',
    name: 'Microsoft Teams',
    category: 'work',
    color: '#464EB8',
    bgColor: '#EDEEF8',
    domain: 'teams.microsoft.com',
    placeholder: 'teams.microsoft.com/l/chat/...',
    buildUrl: (val) => val.startsWith('http') ? val : `https://teams.microsoft.com`,
  },
  {
    id: 'zoom',
    name: 'Zoom',
    category: 'work',
    color: '#2D8CFF',
    bgColor: '#EBF4FF',
    domain: 'zoom.us',
    placeholder: 'zoom.us/j/... Personal meeting link',
    buildUrl: (val) => val.startsWith('http') ? val : `https://zoom.us`,
  },
  {
    id: 'matrix',
    name: 'Matrix / Element',
    category: 'messaging',
    color: '#0DBD8B',
    bgColor: '#E7F9F3',
    domain: 'matrix.org',
    placeholder: '@username:matrix.org',
    buildUrl: (val) => val.startsWith('http') ? val : `https://matrix.to/#/${val}`,
  },
  {
    id: 'kakaotalk',
    name: 'KakaoTalk',
    category: 'messaging',
    color: '#FEE500',
    bgColor: '#FFFCE5',
    domain: 'kakaocorp.com',
    placeholder: 'KakaoTalk ID',
    buildUrl: (val) => `https://open.kakao.com/o/${val.trim()}`,
  },
  {
    id: 'keybase',
    name: 'Keybase',
    category: 'messaging',
    color: '#FF6F21',
    bgColor: '#FFF1E8',
    domain: 'keybase.io',
    placeholder: 'keybase.io/username',
    buildUrl: (val) => val.startsWith('http') ? val : `https://keybase.io/${val.replace(/^@/, '')}`,
  },
  {
    id: 'pinterest',
    name: 'Pinterest',
    category: 'social',
    color: '#E60023',
    bgColor: '#FDE7EA',
    domain: 'pinterest.com',
    placeholder: 'pinterest.com/username',
    buildUrl: (val) => val.startsWith('http') ? val : `https://pinterest.com/${val.replace(/^@/, '')}`,
  },
  {
    id: 'youtube',
    name: 'YouTube',
    category: 'social',
    color: '#FF0000',
    bgColor: '#FFEBEB',
    domain: 'youtube.com',
    placeholder: 'youtube.com/@username',
    buildUrl: (val) => val.startsWith('http') ? val : `https://youtube.com/@${val.replace(/^@/, '')}`,
  },
  {
    id: 'twitch',
    name: 'Twitch',
    category: 'social',
    color: '#9146FF',
    bgColor: '#F4EDFF',
    domain: 'twitch.tv',
    placeholder: 'twitch.tv/username',
    buildUrl: (val) => val.startsWith('http') ? val : `https://twitch.tv/${val.replace(/^@/, '')}`,
  },
  {
    id: 'github',
    name: 'GitHub',
    category: 'work',
    color: '#181717',
    bgColor: '#F0F0F0',
    domain: 'github.com',
    placeholder: 'github.com/username',
    buildUrl: (val) => val.startsWith('http') ? val : `https://github.com/${val.replace(/^@/, '')}`,
  },
  {
    id: 'mastodon',
    name: 'Mastodon',
    category: 'social',
    color: '#6364FF',
    bgColor: '#F0F0FF',
    domain: 'joinmastodon.org',
    placeholder: 'mastodon.social/@username',
    buildUrl: (val) => val.startsWith('http') ? val : `https://mastodon.social/@${val.replace(/^@/, '')}`,
  },
  {
    id: 'bluesky',
    name: 'Bluesky',
    category: 'social',
    color: '#0285FF',
    bgColor: '#E6F3FF',
    domain: 'bsky.app',
    placeholder: 'bsky.app/profile/username.bsky.social',
    buildUrl: (val) => val.startsWith('http') ? val : `https://bsky.app/profile/${val.replace(/^@/, '')}`,
  },
  {
    id: 'bereal',
    name: 'BeReal',
    category: 'social',
    color: '#000000',
    bgColor: '#F5F5F5',
    domain: 'bereal.com',
    placeholder: 'bere.al/username',
    buildUrl: (val) => val.startsWith('http') ? val : `https://bere.al/${val.replace(/^@/, '')}`,
  },
  {
    id: 'clubhouse',
    name: 'Clubhouse',
    category: 'social',
    color: '#FFCC00',
    bgColor: '#FFFBE6',
    domain: 'clubhouse.com',
    placeholder: 'clubhouse.com/@username',
    buildUrl: (val) => val.startsWith('http') ? val : `https://clubhouse.com/@${val.replace(/^@/, '')}`,
  },
  {
    id: 'tumblr',
    name: 'Tumblr',
    category: 'social',
    color: '#36465D',
    bgColor: '#EBEFF4',
    domain: 'tumblr.com',
    placeholder: 'username.tumblr.com',
    buildUrl: (val) => val.startsWith('http') ? val : `https://${val.replace(/^@/, '')}.tumblr.com`,
  },
  {
    id: 'kik',
    name: 'Kik',
    category: 'messaging',
    color: '#82BC23',
    bgColor: '#F2F8E9',
    domain: 'kik.com',
    placeholder: 'Kik username',
    buildUrl: (val) => `https://kik.me/${val.trim()}`,
  },
  {
    id: 'groupme',
    name: 'GroupMe',
    category: 'messaging',
    color: '#00AFF0',
    bgColor: '#E6F7FD',
    domain: 'groupme.com',
    placeholder: 'groupme.com/join_group/...',
    buildUrl: (val) => val.startsWith('http') ? val : `https://groupme.com`,
  },
  {
    id: 'mewe',
    name: 'MeWe',
    category: 'social',
    color: '#B51B27',
    bgColor: '#F8E8E9',
    domain: 'mewe.com',
    placeholder: 'mewe.com/i/username',
    buildUrl: (val) => val.startsWith('http') ? val : `https://mewe.com/i/${val}`,
  },
  {
    id: 'wire',
    name: 'Wire',
    category: 'messaging',
    color: '#000000',
    bgColor: '#F5F5F5',
    domain: 'wire.com',
    placeholder: 'wire.com/... or @handle',
    buildUrl: (val) => val.startsWith('http') ? val : `https://wire.com`,
  },
  {
    id: 'threema',
    name: 'Threema',
    category: 'messaging',
    color: '#1A1A1A',
    bgColor: '#EFEFEF',
    domain: 'threema.ch',
    placeholder: 'threema.id/8-digit-ID',
    buildUrl: (val) => val.startsWith('http') ? val : `https://threema.id/${val.trim()}`,
  },
  {
    id: 'session',
    name: 'Session',
    category: 'messaging',
    color: '#00E887',
    bgColor: '#E6FCF3',
    domain: 'getsession.org',
    placeholder: 'Session ID',
    buildUrl: (val) => `https://getsession.org`,
  },
  {
    id: 'zalo',
    name: 'Zalo',
    category: 'messaging',
    color: '#0068FF',
    bgColor: '#E6F0FF',
    domain: 'zalo.me',
    placeholder: 'zalo.me/phone-or-id',
    buildUrl: (val) => val.startsWith('http') ? val : `https://zalo.me/${val.trim()}`,
  },
  {
    id: 'tango',
    name: 'Tango',
    category: 'messaging',
    color: '#FF2A42',
    bgColor: '#FFEAEB',
    domain: 'tango.me',
    placeholder: 'tango.me/username',
    buildUrl: (val) => val.startsWith('http') ? val : `https://tango.me`,
  },
  {
    id: 'imo',
    name: 'IMO',
    category: 'messaging',
    color: '#00A4E4',
    bgColor: '#E6F6FC',
    domain: 'imo.im',
    placeholder: 'IMO Phone number',
    buildUrl: (val) => `https://imo.im`,
  },
  {
    id: 'venmo',
    name: 'Venmo',
    category: 'payments',
    color: '#008CFF',
    bgColor: '#E6F4FF',
    domain: 'venmo.com',
    placeholder: 'venmo.com/username or @handle',
    buildUrl: (val) => val.startsWith('http') ? val : `https://venmo.com/${val.replace(/^@/, '')}`,
  },
  {
    id: 'cashapp',
    name: 'Cash App',
    category: 'payments',
    color: '#00D632',
    bgColor: '#E6FBEB',
    domain: 'cash.app',
    placeholder: 'cash.app/$cashtag or $handle',
    buildUrl: (val) => val.startsWith('http') ? val : `https://cash.app/$${val.replace(/^\$/, '')}`,
  },
  {
    id: 'paypal',
    name: 'PayPal.Me',
    category: 'payments',
    color: '#003087',
    bgColor: '#E6EBF3',
    domain: 'paypal.me',
    placeholder: 'paypal.me/username',
    buildUrl: (val) => val.startsWith('http') ? val : `https://paypal.me/${val.replace(/^@/, '')}`,
  },
  {
    id: 'zelle',
    name: 'Zelle',
    category: 'payments',
    color: '#7414CA',
    bgColor: '#F1E7FA',
    domain: 'zellepay.com',
    placeholder: 'Zelle Phone or Email',
    buildUrl: (val) => `mailto:${val}`,
  },
  {
    id: 'revolut',
    name: 'Revolut',
    category: 'payments',
    color: '#19B4F0',
    bgColor: '#E8F7FD',
    domain: 'revolut.me',
    placeholder: 'revolut.me/username',
    buildUrl: (val) => val.startsWith('http') ? val : `https://revolut.me/${val.replace(/^@/, '')}`,
  },
  {
    id: 'monzo',
    name: 'Monzo',
    category: 'payments',
    color: '#FF365D',
    bgColor: '#FFEBEE',
    domain: 'monzo.me',
    placeholder: 'monzo.me/username',
    buildUrl: (val) => val.startsWith('http') ? val : `https://monzo.me/${val.replace(/^@/, '')}`,
  },
  {
    id: 'wise',
    name: 'Wise',
    category: 'payments',
    color: '#2ED06E',
    bgColor: '#EAF9F1',
    domain: 'wise.com',
    placeholder: 'wise.com/pay/me/username',
    buildUrl: (val) => val.startsWith('http') ? val : `https://wise.com`,
  },
  {
    id: 'apple_cash',
    name: 'Apple Pay / Cash',
    category: 'payments',
    color: '#000000',
    bgColor: '#F5F5F5',
    domain: 'apple.com',
    placeholder: 'Apple Pay phone number or Apple ID',
    buildUrl: (val) => `sms:${val.replace(/[^0-9+]/g, '')}`,
  },
  {
    id: 'google_pay',
    name: 'Google Pay',
    category: 'payments',
    color: '#4285F4',
    bgColor: '#ECF3FE',
    domain: 'pay.google.com',
    placeholder: 'Google Pay phone or Gmail',
    buildUrl: (val) => val.startsWith('http') ? val : `mailto:${val}`,
  },
  {
    id: 'email',
    name: 'Direct Email',
    category: 'messaging',
    color: '#EA4335',
    bgColor: '#FDECEB',
    placeholder: 'yourname@example.com',
    buildUrl: (val) => `mailto:${val}?subject=Found%20Your%20Puppy`,
  },
  {
    id: 'linktree',
    name: 'Linktree',
    category: 'social',
    color: '#43E660',
    bgColor: '#ECFDF0',
    domain: 'linktr.ee',
    placeholder: 'linktr.ee/username',
    buildUrl: (val) => val.startsWith('http') ? val : `https://linktr.ee/${val.replace(/^@/, '')}`,
  },
  {
    id: 'beacons',
    name: 'Beacons',
    category: 'social',
    color: '#6E3FF3',
    bgColor: '#F1ECFE',
    domain: 'beacons.ai',
    placeholder: 'beacons.ai/username',
    buildUrl: (val) => val.startsWith('http') ? val : `https://beacons.ai/${val}`,
  },
  {
    id: 'bento',
    name: 'Bento',
    category: 'social',
    color: '#FF6433',
    bgColor: '#FFF0EB',
    domain: 'bento.me',
    placeholder: 'bento.me/username',
    buildUrl: (val) => val.startsWith('http') ? val : `https://bento.me/${val}`,
  },
  {
    id: 'carrd',
    name: 'Carrd',
    category: 'social',
    color: '#222222',
    bgColor: '#F0F0F0',
    domain: 'carrd.co',
    placeholder: 'username.carrd.co',
    buildUrl: (val) => val.startsWith('http') ? val : `https://${val}.carrd.co`,
  },
  {
    id: 'calendly',
    name: 'Calendly',
    category: 'work',
    color: '#006BFF',
    bgColor: '#E6F0FF',
    domain: 'calendly.com',
    placeholder: 'calendly.com/username',
    buildUrl: (val) => val.startsWith('http') ? val : `https://calendly.com/${val}`,
  },
  {
    id: 'strava',
    name: 'Strava',
    category: 'social',
    color: '#FC4C02',
    bgColor: '#FFEDE6',
    domain: 'strava.com',
    placeholder: 'strava.com/athletes/...',
    buildUrl: (val) => val.startsWith('http') ? val : `https://strava.com/athletes/${val}`,
  },
  {
    id: 'nextdoor',
    name: 'Nextdoor',
    category: 'pet_safety',
    color: '#00B247',
    bgColor: '#E6F7ED',
    domain: 'nextdoor.com',
    placeholder: 'nextdoor.com/profile/...',
    buildUrl: (val) => val.startsWith('http') ? val : `https://nextdoor.com`,
  },
  {
    id: 'ring',
    name: 'Ring Neighbors App',
    category: 'pet_safety',
    color: '#1A73E8',
    bgColor: '#E8F1FC',
    domain: 'ring.com',
    placeholder: 'neighbors.ring.com post link',
    buildUrl: (val) => val.startsWith('http') ? val : `https://neighbors.ring.com`,
  },
  {
    id: 'citizen',
    name: 'Citizen App',
    category: 'pet_safety',
    color: '#000000',
    bgColor: '#F5F5F5',
    domain: 'citizen.com',
    placeholder: 'citizen.com post link',
    buildUrl: (val) => val.startsWith('http') ? val : `https://citizen.com`,
  },
  {
    id: 'rover',
    name: 'Rover Pet Profile',
    category: 'pet_safety',
    color: '#00A499',
    bgColor: '#E6F6F5',
    domain: 'rover.com',
    placeholder: 'rover.com/members/...',
    buildUrl: (val) => val.startsWith('http') ? val : `https://rover.com`,
  },
  {
    id: 'wag',
    name: 'Wag! Dog Walking',
    category: 'pet_safety',
    color: '#00AEEF',
    bgColor: '#E6F7FD',
    domain: 'wagwalking.com',
    placeholder: 'wagwalking.com/...',
    buildUrl: (val) => val.startsWith('http') ? val : `https://wagwalking.com`,
  },
  {
    id: 'homeagain',
    name: 'HomeAgain Pet Safety',
    category: 'pet_safety',
    color: '#D8232A',
    bgColor: '#FBE9EA',
    domain: 'homeagain.com',
    placeholder: 'homeagain.com pet ID link',
    buildUrl: (val) => val.startsWith('http') ? val : `https://homeagain.com`,
  },
  {
    id: 'petwatch',
    name: '24Petwatch',
    category: 'pet_safety',
    color: '#0083CA',
    bgColor: '#E6F3FA',
    domain: '24petwatch.com',
    placeholder: '24petwatch.com pet link',
    buildUrl: (val) => val.startsWith('http') ? val : `https://24petwatch.com`,
  },
  {
    id: 'petlink',
    name: 'PetLink Microchip',
    category: 'pet_safety',
    color: '#00843D',
    bgColor: '#E6F3EC',
    domain: 'petlink.net',
    placeholder: 'petlink.net microchip ID',
    buildUrl: (val) => val.startsWith('http') ? val : `https://petlink.net`,
  },
  {
    id: 'akcreunite',
    name: 'AKC Reunite',
    category: 'pet_safety',
    color: '#002B49',
    bgColor: '#E6EAED',
    domain: 'akcreunite.org',
    placeholder: 'akcreunite.org collar ID link',
    buildUrl: (val) => val.startsWith('http') ? val : `https://akcreunite.org`,
  },
  {
    id: 'fb_group',
    name: 'Lost Pet Facebook Group',
    category: 'pet_safety',
    color: '#1877F2',
    bgColor: '#EBF3FF',
    domain: 'facebook.com',
    placeholder: 'facebook.com/groups/local-lost-pets',
    buildUrl: (val) => val.startsWith('http') ? val : `https://facebook.com`,
  },
  {
    id: 'google_photos',
    name: 'Google Photos Album',
    category: 'other',
    color: '#4285F4',
    bgColor: '#ECF3FE',
    domain: 'photos.google.com',
    placeholder: 'photos.app.goo.gl/... puppy photo album',
    buildUrl: (val) => val.startsWith('http') ? val : `https://photos.google.com`,
  },
  {
    id: 'icloud_photos',
    name: 'iCloud Shared Album',
    category: 'other',
    color: '#333333',
    bgColor: '#F5F5F5',
    domain: 'icloud.com',
    placeholder: 'share.icloud.com/... shared photo album',
    buildUrl: (val) => val.startsWith('http') ? val : `https://icloud.com`,
  },
  {
    id: 'dropbox',
    name: 'Dropbox Folder',
    category: 'other',
    color: '#0061FF',
    bgColor: '#E6EFFF',
    domain: 'dropbox.com',
    placeholder: 'dropbox.com/sh/... vet records folder',
    buildUrl: (val) => val.startsWith('http') ? val : `https://dropbox.com`,
  },
  {
    id: 'google_drive',
    name: 'Google Drive Records',
    category: 'other',
    color: '#0F9D58',
    bgColor: '#E7F5EE',
    domain: 'drive.google.com',
    placeholder: 'drive.google.com/drive/folders/...',
    buildUrl: (val) => val.startsWith('http') ? val : `https://drive.google.com`,
  },
  {
    id: 'vet_portal',
    name: 'Veterinary Patient Portal',
    category: 'pet_safety',
    color: '#007B88',
    bgColor: '#E6F2F3',
    placeholder: 'https://vetclinic.com/portal/pet',
    buildUrl: (val) => val.startsWith('http') ? val : `https://${val}`,
  },
];

// Helper: Auto-detect communication platform from pasted/typed URL or string
export function detectPlatformFromInput(input: string): string | null {
  const clean = input.trim().toLowerCase();
  if (!clean) return null;

  // WhatsApp
  if (clean.includes('wa.me') || clean.includes('whatsapp.com')) return 'whatsapp';

  // Telegram
  if (clean.includes('t.me') || clean.includes('telegram.me') || clean.includes('telegram.org')) return 'telegram';

  // Instagram
  if (clean.includes('instagram.com') || clean.includes('instagr.am')) return 'instagram';

  // Messenger / Facebook
  if (clean.includes('m.me') || clean.includes('messenger.com')) return 'messenger';
  if (clean.includes('facebook.com') || clean.includes('fb.com') || clean.includes('fb.me')) return 'facebook';

  // Signal
  if (clean.includes('signal.me') || clean.includes('signal.org')) return 'signal';

  // Slack
  if (clean.includes('slack.com')) return 'slack';

  // Discord
  if (clean.includes('discord.gg') || clean.includes('discord.com')) return 'discord';

  // X / Twitter
  if (clean.includes('x.com') || clean.includes('twitter.com')) return 'twitter';

  // Snapchat
  if (clean.includes('snapchat.com')) return 'snapchat';

  // TikTok
  if (clean.includes('tiktok.com')) return 'tiktok';

  // LinkedIn
  if (clean.includes('linkedin.com')) return 'linkedin';

  // YouTube
  if (clean.includes('youtube.com') || clean.includes('youtu.be')) return 'youtube';

  // Reddit
  if (clean.includes('reddit.com')) return 'reddit';

  // Threads
  if (clean.includes('threads.net')) return 'threads';

  // WeChat
  if (clean.includes('wechat.com') || clean.includes('weixin.qq.com')) return 'wechat';

  // LINE
  if (clean.includes('line.me')) return 'line';

  // Viber
  if (clean.includes('viber.com')) return 'viber';

  // Skype
  if (clean.includes('skype.com') || clean.startsWith('skype:')) return 'skype';

  // Payments
  if (clean.includes('venmo.com')) return 'venmo';
  if (clean.includes('cash.app')) return 'cashapp';
  if (clean.includes('paypal.me') || clean.includes('paypal.com')) return 'paypal';
  if (clean.includes('revolut.me')) return 'revolut';
  if (clean.includes('monzo.me')) return 'monzo';
  if (clean.includes('wise.com')) return 'wise';

  // Link-in-bio
  if (clean.includes('linktr.ee')) return 'linktree';
  if (clean.includes('beacons.ai')) return 'beacons';
  if (clean.includes('bento.me')) return 'bento';
  if (clean.includes('carrd.co')) return 'carrd';
  if (clean.includes('calendly.com')) return 'calendly';

  // Pet & Community
  if (clean.includes('nextdoor.com')) return 'nextdoor';
  if (clean.includes('ring.com')) return 'ring';
  if (clean.includes('rover.com')) return 'rover';
  if (clean.includes('wagwalking.com')) return 'wag';
  if (clean.includes('homeagain.com')) return 'homeagain';
  if (clean.includes('24petwatch.com')) return 'petwatch';
  if (clean.includes('akcreunite.org')) return 'akcreunite';

  // Generic website / URL
  if (clean.startsWith('http://') || clean.startsWith('https://') || clean.startsWith('www.')) {
    return 'external';
  }

  // Pure international phone format (e.g. +1 555-1234)
  if (/^\+?[0-9\s\-\(\)\.]{7,20}$/.test(clean)) {
    return 'whatsapp';
  }

  return null;
}

// Helper: Extract domain name from custom URL
export function extractDomainFromUrl(url: string): string {
  try {
    const raw = url.trim();
    const withProtocol = /^[a-zA-Z]+:\/\//.test(raw) ? raw : `https://${raw}`;
    const parsed = new URL(withProtocol);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

// Helper: Get best favicon image URL
export function getPlatformFaviconUrl(platformId: string, customUrl?: string): string {
  const platform = COMMUNICATION_PLATFORMS.find(p => p.id === platformId);
  
  if (platformId === 'external' && customUrl) {
    const domain = extractDomainFromUrl(customUrl);
    if (domain) {
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    }
  }

  if (platform?.domain) {
    return `https://www.google.com/s2/favicons?domain=${platform.domain}&sz=64`;
  }

  return `https://www.google.com/s2/favicons?domain=google.com&sz=64`;
}
