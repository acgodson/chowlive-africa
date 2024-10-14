export const sectionColors = [
    'from-[#FCEFDC] to-[#CB302B]',
    'from-[#CB302B] to-[#541413]',
    'from-[#541413] to-[#000000]',
    'from-[#000000] to-[#FCEFDC]',
  ];
  
  export const testimonials = [
    { id: 1, image: '/images/debby.png', name: 'Debby', video: '/videos/derby.mp4' },
    { id: 2, image: '/images/guy.png', name: 'Kwachi', video: '/videos/guy.mp4' },
    { id: 3, image: '/images/buzor.png', name: 'Buzor', video: '/videos/buzor.mp4' },
  ];
  
  export const sections = [
    { title: '', description: '' },
    { title: 'Create & Join Rooms', description: 'Rooms are NFTs on Base' },
    {
      title: 'Cross Chain Harmony',
      description: 'Subscribe from other evm and Superchain networks',
    },
    { title: 'Seamless Integration', description: 'Log in via Spotify and Web3Auth' },
  ];

  export const toastQuotes = [
    'Music brings people together like nothing else!',
    'Chowlive lets me party with friends across the globe!',
    "The future of music is here, and it's social!",
  ];


  export const USER_ROOM_LIMIT = 3;

  export enum PLAYBACK_STATE {
    LOADING = 'loading',
    PLAYING = 'playing',
    PAUSED = 'paused',
    FINISHED = 'finished',
    NONE = 'none',
  }