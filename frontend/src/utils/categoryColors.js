export const getCategoryColor = (category) => {
  const colorMap = {
    'Shelter': 'bg-[#FF9D8A]',
    'Food': 'bg-[#A7E6D7]',
    'Healthcare': 'bg-[#FDE68A]',
    'Public Washroom': 'bg-[#BFDBFE]',
    'Community Centre': 'bg-[#DDA7E6]',
    'Free Laundromat': 'bg-[#FFC9E6]',
    'Clothing Bank': 'bg-[#FFE4B5]',
    'Phone Charging': 'bg-[#B5E6D7]',
    'Free WiFi': 'bg-[#C4E6FF]',
    'Water Refill': 'bg-[#B3E5FC]',
    'Free Meals': 'bg-[#FFD7A5]',
    'Harm Reduction': 'bg-[#E6C9FF]',
    'Legal Aid': 'bg-[#D4E6A5]',
    'ID Services': 'bg-[#FFE6D5]',
    'Veterans Services': 'bg-[#C9E4CA]',
    'Pet Services': 'bg-[#FFB3D9]',
    'Transportation': 'bg-[#B5D4FF]',
    'Seasonal Resources': 'bg-[#E6E6C9]',
  };
  
  return colorMap[category] || 'bg-[#FDE68A]';
};
