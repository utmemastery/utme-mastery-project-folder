// Helper function
export const formatRelativeTime = (date: string | Date) => {
  try {
    const now = new Date();
    const past = new Date(date);
    const diffInHours = (now.getTime() - past.getTime()) / (1000 * 60 * 60);
    
    if (isNaN(diffInHours)) return 'Unknown time';
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return `${Math.floor(diffInDays / 7)}w ago`;
  } catch {
    return 'Unknown time';
  }
};