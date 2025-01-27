const firestoreService = require('../realtimeService');

module.exports = async (req, res, next) => {
  try {
    const user = await firestoreService.getUserFirestore(req.user.userId); // Use Firestore to get the user
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    
    next();
  } catch (err) {
    console.error('Error checking admin access:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
