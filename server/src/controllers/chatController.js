import { Conversation, Message } from '../models/Conversation.js';
import { User } from '../models/User.js';
import { processAIRequest } from '../services/aiAgentOrchestrator.js';

export async function getConversations(req, res, next) {
  try {
    const { spaceId, documentId } = req.query;
    const filter = {};
    if (spaceId) filter.spaceId = spaceId;
    if (documentId) filter.documentId = documentId;

    const conversations = await Conversation.find(filter);
    conversations.sort((a, b) => new Date(b.lastMessageAt || b.createdAt) - new Date(a.lastMessageAt || a.createdAt));

    res.json({ success: true, conversations });
  } catch (err) {
    next(err);
  }
}

export async function getConversationById(req, res, next) {
  try {
    const { id } = req.params;
    const conversation = await Conversation.findById(id);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found.' });
    }

    const messages = await Message.find({ conversationId: id });
    messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    res.json({ success: true, conversation, messages });
  } catch (err) {
    next(err);
  }
}

export async function createConversation(req, res, next) {
  try {
    const { spaceId, documentId, title, mode = 'ask' } = req.body;
    if (!spaceId) {
      return res.status(400).json({ success: false, message: 'Space ID is required.' });
    }

    const conversation = await Conversation.create({
      spaceId,
      documentId: documentId || null,
      userId: req.user._id || req.user.id,
      title: title || 'New Chat',
      mode
    });

    res.status(201).json({ success: true, conversation });
  } catch (err) {
    next(err);
  }
}

export async function sendMessage(req, res, next) {
  try {
    const { conversationId, spaceId, documentId, content, mode = 'ask', selectedText } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Message content cannot be empty.' });
    }

    let activeConversationId = conversationId;

    // Auto-create conversation if none provided
    if (!activeConversationId) {
      const newConv = await Conversation.create({
        spaceId: spaceId || 'general',
        documentId: documentId || null,
        userId: req.user._id || req.user.id,
        title: content.slice(0, 36) + (content.length > 36 ? '...' : ''),
        mode
      });
      activeConversationId = newConv._id || newConv.id;
    }

    // Save user message
    const userMsg = await Message.create({
      conversationId: activeConversationId,
      spaceId: spaceId || 'general',
      role: 'user',
      content: content.trim(),
      mode
    });

    // Check user AI allowance
    const userId = req.user._id || req.user.id;
    const currentUser = await User.findById(userId);
    if (currentUser) {
      await User.findByIdAndUpdate(userId, {
        aiQueryCount: (currentUser.aiQueryCount || 0) + 1
      });
    }

    // Process AI Grounding & Citations
    const aiResult = await processAIRequest({
      spaceId,
      documentId,
      query: content.trim(),
      mode,
      userPreferences: currentUser?.memoryPreferences || {},
      selectedText
    });

    // Save assistant message
    const assistantMsg = await Message.create({
      conversationId: activeConversationId,
      spaceId: spaceId || 'general',
      role: 'assistant',
      content: aiResult.answer,
      mode: aiResult.mode || mode,
      citations: aiResult.citations || [],
      calculationData: aiResult.calculationData || null
    });

    // Update conversation timestamp and title if first message
    await Conversation.findByIdAndUpdate(activeConversationId, {
      lastMessageAt: new Date().toISOString()
    });

    res.json({
      success: true,
      conversationId: activeConversationId,
      userMessage: userMsg,
      assistantMessage: assistantMsg
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteConversation(req, res, next) {
  try {
    const { id } = req.params;
    await Conversation.findByIdAndDelete(id);
    await Message.deleteMany({ conversationId: id });
    res.json({ success: true, message: 'Conversation deleted.' });
  } catch (err) {
    next(err);
  }
}

export async function togglePinConversation(req, res, next) {
  try {
    const { id } = req.params;
    const conv = await Conversation.findById(id);
    if (!conv) {
      return res.status(404).json({ success: false, message: 'Conversation not found.' });
    }
    const updated = await Conversation.findByIdAndUpdate(id, { isPinned: !conv.isPinned }, { new: true });
    res.json({ success: true, conversation: updated });
  } catch (err) {
    next(err);
  }
}
