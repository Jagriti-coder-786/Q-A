import { KnowledgeSpace } from '../models/KnowledgeSpace.js';

export function requireSpaceRole(minimumRole = 'viewer') {
  const roleHierarchy = {
    viewer: 1,
    editor: 2,
    admin: 3,
    owner: 4
  };

  return async (req, res, next) => {
    try {
      const spaceId = req.params.spaceId || req.body.spaceId || req.query.spaceId;
      if (!spaceId) {
        return res.status(400).json({ success: false, message: 'Space ID is required.' });
      }

      const space = await KnowledgeSpace.findById(spaceId);
      if (!space) {
        return res.status(404).json({ success: false, message: 'Knowledge space not found.' });
      }

      const userId = req.user._id || req.user.id;

      // Check if user is space owner or system admin
      if (space.ownerId === userId || req.user.role === 'admin') {
        req.space = space;
        req.userSpaceRole = 'owner';
        return next();
      }

      // Check space members list
      const member = space.members?.find(m => m.userId === userId || m.email === req.user.email);
      if (!member) {
        return res.status(403).json({
          success: false,
          message: 'You do not have access to this Knowledge Space.'
        });
      }

      const userRank = roleHierarchy[member.role] || 0;
      const requiredRank = roleHierarchy[minimumRole] || 1;

      if (userRank < requiredRank) {
        return res.status(403).json({
          success: false,
          message: `Permission denied. Requires ${minimumRole} access or higher.`
        });
      }

      req.space = space;
      req.userSpaceRole = member.role;
      next();
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Authorization error: ' + err.message });
    }
  };
}
