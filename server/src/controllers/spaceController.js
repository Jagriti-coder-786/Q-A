import { KnowledgeSpace } from '../models/KnowledgeSpace.js';
import { Document } from '../models/Document.js';
import { DocumentChunk } from '../models/DocumentChunk.js';
import { ActivityLog } from '../models/Note.js';

export async function getSpaces(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    const allSpaces = await KnowledgeSpace.find();
    
    // Filter spaces where user is owner or member
    const userSpaces = allSpaces.filter(space => {
      if (space.ownerId === userId) return true;
      return space.members?.some(m => m.userId === userId || m.email === req.user.email);
    });

    res.json({ success: true, spaces: userSpaces });
  } catch (err) {
    next(err);
  }
}

export async function getSpaceById(req, res, next) {
  try {
    const space = await KnowledgeSpace.findById(req.params.id);
    if (!space) {
      return res.status(404).json({ success: false, message: 'Knowledge Space not found.' });
    }
    res.json({ success: true, space });
  } catch (err) {
    next(err);
  }
}

export async function createSpace(req, res, next) {
  try {
    const { name, description, icon, color, tags, aiInstructions } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Space name is required.' });
    }

    const userId = req.user._id || req.user.id;
    const space = await KnowledgeSpace.create({
      name: name.trim(),
      description: description || '',
      icon: icon || 'Folder',
      color: color || 'indigo',
      ownerId: userId,
      tags: tags || ['Workspace'],
      aiInstructions: aiInstructions || '',
      members: [{
        userId,
        email: req.user.email,
        name: req.user.name,
        role: 'owner'
      }],
      documentCount: 0,
      conversationCount: 0
    });

    await ActivityLog.create({
      spaceId: space._id || space.id,
      userId,
      userName: req.user.name,
      action: 'create_space',
      details: `Created Knowledge Space "${space.name}"`
    });

    res.status(201).json({ success: true, space });
  } catch (err) {
    next(err);
  }
}

export async function updateSpace(req, res, next) {
  try {
    const { name, description, icon, color, tags, aiInstructions, isArchived, isFavorite } = req.body;
    const spaceId = req.params.id;

    const update = {};
    if (name) update.name = name.trim();
    if (description !== undefined) update.description = description;
    if (icon) update.icon = icon;
    if (color) update.color = color;
    if (tags) update.tags = tags;
    if (aiInstructions !== undefined) update.aiInstructions = aiInstructions;
    if (isArchived !== undefined) update.isArchived = isArchived;
    if (isFavorite !== undefined) update.isFavorite = isFavorite;

    const updated = await KnowledgeSpace.findByIdAndUpdate(spaceId, update, { new: true });
    res.json({ success: true, space: updated });
  } catch (err) {
    next(err);
  }
}

export async function deleteSpace(req, res, next) {
  try {
    const spaceId = req.params.id;
    await KnowledgeSpace.findByIdAndDelete(spaceId);
    await Document.deleteMany({ spaceId });
    await DocumentChunk.deleteMany({ spaceId });

    res.json({ success: true, message: 'Knowledge Space and associated files deleted.' });
  } catch (err) {
    next(err);
  }
}

export async function inviteMember(req, res, next) {
  try {
    const { email, role = 'editor' } = req.body;
    const spaceId = req.params.id;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Member email is required.' });
    }

    const space = await KnowledgeSpace.findById(spaceId);
    if (!space) {
      return res.status(404).json({ success: false, message: 'Knowledge space not found.' });
    }

    const members = space.members || [];
    const existingIdx = members.findIndex(m => m.email.toLowerCase() === email.toLowerCase());

    if (existingIdx !== -1) {
      members[existingIdx].role = role;
    } else {
      members.push({
        email: email.toLowerCase(),
        name: email.split('@')[0],
        role
      });
    }

    const updated = await KnowledgeSpace.findByIdAndUpdate(spaceId, { members }, { new: true });

    await ActivityLog.create({
      spaceId,
      userId: req.user._id || req.user.id,
      userName: req.user.name,
      action: 'invite_member',
      details: `Invited ${email} with ${role} access.`
    });

    res.json({ success: true, members: updated.members });
  } catch (err) {
    next(err);
  }
}

export async function updateMemberRole(req, res, next) {
  try {
    const { id: spaceId, memberId } = req.params;
    const { role } = req.body;

    if (!role || !['viewer', 'editor', 'admin', 'owner'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Valid role is required (viewer, editor, admin, owner).' });
    }

    const space = await KnowledgeSpace.findById(spaceId);
    if (!space) {
      return res.status(404).json({ success: false, message: 'Knowledge space not found.' });
    }

    const members = space.members || [];
    const member = members.find(m => m.userId === memberId || m.email === memberId || m._id === memberId);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found in this space.' });
    }

    if (member.role === 'owner' && space.ownerId === (member.userId || memberId) && role !== 'owner') {
      return res.status(400).json({ success: false, message: 'Primary space owner role cannot be downgraded.' });
    }

    member.role = role;
    const updated = await KnowledgeSpace.findByIdAndUpdate(spaceId, { members }, { new: true });

    await ActivityLog.create({
      spaceId,
      userId: req.user._id || req.user.id,
      userName: req.user.name,
      action: 'update_role',
      details: `Updated ${member.email || member.name} role to ${role}.`
    });

    res.json({ success: true, members: updated.members });
  } catch (err) {
    next(err);
  }
}

export async function removeMember(req, res, next) {
  try {
    const { id: spaceId, memberId } = req.params;
    const space = await KnowledgeSpace.findById(spaceId);
    if (!space) {
      return res.status(404).json({ success: false, message: 'Knowledge space not found.' });
    }

    const members = space.members || [];
    const targetIdx = members.findIndex(m => m.userId === memberId || m.email === memberId || m._id === memberId);
    if (targetIdx === -1) {
      return res.status(404).json({ success: false, message: 'Member not found in this space.' });
    }

    const targetMember = members[targetIdx];
    if (targetMember.role === 'owner' || space.ownerId === (targetMember.userId || memberId)) {
      return res.status(400).json({ success: false, message: 'Cannot remove the primary space owner.' });
    }

    members.splice(targetIdx, 1);
    const updated = await KnowledgeSpace.findByIdAndUpdate(spaceId, { members }, { new: true });

    await ActivityLog.create({
      spaceId,
      userId: req.user._id || req.user.id,
      userName: req.user.name,
      action: 'remove_member',
      details: `Removed ${targetMember.email || targetMember.name} from space.`
    });

    res.json({ success: true, members: updated.members, message: 'Member removed successfully.' });
  } catch (err) {
    next(err);
  }
}

