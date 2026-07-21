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

// One representative photo per type, used as a fallback when a listing has no photo of its own.
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
