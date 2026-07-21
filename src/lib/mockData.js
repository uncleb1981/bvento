export const BIKE_TYPES = [
  'Road',
  'Mountain',
  'Gravel',
  'Commuter',
  'BMX',
  'E-Bike',
  'Kids',
  'Cruiser',
];

export const CONDITIONS = ['New', 'Like New', 'Good', 'Fair'];

function unsplash(id) {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80`;
}

// One representative photo per type, used as a fallback when a listing has no photo of its own
// (e.g. freshly posted bikes, which don't have photo upload wired up yet).
export const TYPE_PHOTO = {
  Road: unsplash('1532298229144-0ec0c57515c7'),
  Mountain: unsplash('1534146789009-76ed5060ec70'),
  Gravel: unsplash('1599912925091-0929608dc5b0'),
  Commuter: unsplash('1613773038029-2dd0cdb924aa'),
  BMX: unsplash('1601332053592-13e8ce5ea88a'),
  'E-Bike': unsplash('1558978806-73073843b15e'),
  Kids: unsplash('1583124688426-3128aec007f8'),
  Cruiser: unsplash('1774722396639-a0a6fed00deb'),
};

export function photoForBike(bike) {
  return bike?.photo || TYPE_PHOTO[bike?.type] || TYPE_PHOTO.Road;
}

export const MOCK_USER = {
  id: 'user-1',
  name: 'Ben Rider',
  email: 'bwbuse@gmail.com',
  city: 'Bentonville, AR',
  completedTrades: 2,
};

// Bikes owned by the current user, seeded so the propose-trade flow has something to offer
export const MOCK_MY_BIKES = [
  {
    id: 'my-bike-1',
    ownerId: 'user-1',
    title: 'Trek Marlin 7',
    type: 'Mountain',
    condition: 'Good',
    estimatedValue: 550,
    description: '2022 hardtail, upgraded tires, minor scratches on the frame.',
    city: 'Bentonville, AR',
    photo: unsplash('1506316940527-4d1c138978a0'),
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Other riders' bikes to swipe through
export const MOCK_BIKES = [
  {
    id: 'bike-1',
    ownerId: 'user-2',
    ownerName: 'Casey Fields',
    title: 'Specialized Allez',
    type: 'Road',
    condition: 'Like New',
    estimatedValue: 900,
    description: 'Aluminum road frame, Shimano 105 groupset, ridden less than 500 miles.',
    city: 'Rogers, AR',
    photo: unsplash('1532298229144-0ec0c57515c7'),
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'bike-2',
    ownerId: 'user-3',
    ownerName: 'Jordan Lee',
    title: 'Rad Power RadRunner',
    type: 'E-Bike',
    condition: 'Good',
    estimatedValue: 1100,
    description: '750W motor, extended battery, rear rack included. Great commuter.',
    city: 'Fayetteville, AR',
    photo: unsplash('1558978806-73073843b15e'),
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'bike-3',
    ownerId: 'user-4',
    ownerName: 'Sam Torres',
    title: 'Mongoose Legion L60',
    type: 'BMX',
    condition: 'Fair',
    estimatedValue: 180,
    description: 'Freestyle BMX, some scuffs, pegs included. Great for beginners.',
    city: 'Springdale, AR',
    photo: unsplash('1601332053592-13e8ce5ea88a'),
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'bike-4',
    ownerId: 'user-5',
    ownerName: 'Riley Park',
    title: 'Salsa Journeyman',
    type: 'Gravel',
    condition: 'Like New',
    estimatedValue: 1250,
    description: 'Steel gravel frame, tubeless-ready wheels, bar bag included.',
    city: 'Bentonville, AR',
    photo: unsplash('1599912925091-0929608dc5b0'),
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'bike-5',
    ownerId: 'user-6',
    ownerName: 'Morgan Blake',
    title: 'Electra Cruiser 7D',
    type: 'Cruiser',
    condition: 'Good',
    estimatedValue: 420,
    description: 'Classic beach cruiser, 7-speed, comfy saddle, basket included.',
    city: 'Rogers, AR',
    photo: unsplash('1774722396639-a0a6fed00deb'),
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'bike-6',
    ownerId: 'user-7',
    ownerName: 'Avery Kim',
    title: 'Priority Continuum',
    type: 'Commuter',
    condition: 'New',
    estimatedValue: 1600,
    description: 'Belt drive, internal gear hub, zero maintenance commuter. Barely used.',
    city: 'Fayetteville, AR',
    photo: unsplash('1613773038029-2dd0cdb924aa'),
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'bike-7',
    ownerId: 'user-8',
    ownerName: 'Drew Hayes',
    title: 'Woom 4',
    type: 'Kids',
    condition: 'Good',
    estimatedValue: 260,
    description: 'Lightweight kids bike, ages 6-8, hand brakes, well maintained.',
    city: 'Bentonville, AR',
    photo: unsplash('1583124688426-3128aec007f8'),
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'bike-8',
    ownerId: 'user-9',
    ownerName: 'Taylor Reid',
    title: 'Santa Cruz Chameleon',
    type: 'Mountain',
    condition: 'Like New',
    estimatedValue: 1850,
    description: 'Steel hardtail, dropper post, upgraded fork. Ready to ride.',
    city: 'Springdale, AR',
    photo: unsplash('1534146789009-76ed5060ec70'),
    createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
  },
];
