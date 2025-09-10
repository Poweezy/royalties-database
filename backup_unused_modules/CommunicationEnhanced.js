/**
 * Enhanced Communication Module
 * Advanced messaging, notifications, and collaboration features
 */

import { dbService } from '../services/database.service.js';
import { notificationManager } from './NotificationManager.js';

export class CommunicationEnhanced {
  constructor() {
    this.messages = [];
    this.conversations = [];
    this.templates = new Map();
    this.scheduledMessages = [];
    this.userPresence = new Map();
    this.messageQueue = [];
    this.isOnline = navigator.onLine;
    
    this.initializeTemplates();
    this.setupEventListeners();
    this.startPresenceTracking();
  }

  /**
   * Initialize message templates
   */
  initializeTemplates() {
    this.templates.set('royalty_approval_request', {
      subject: 'Royalty Record Approval Required',
      template: `
        <div class="message-template">
          <h3>Royalty Record Approval Required</h3>
          <p>A new royalty record requires your approval:</p>
          <ul>
            <li><strong>Record ID:</strong> {{recordId}}</li>
            <li><strong>Entity:</strong> {{entityName}}</li>
            <li><strong>Mineral Type:</strong> {{mineralType}}</li>
            <li><strong>Amount:</strong> E {{amount}}</li>
            <li><strong>Submitted By:</strong> {{submittedBy}}</li>
          </ul>
          <p>Please review and approve at your earliest convenience.</p>
        </div>
      `,
      priority: 'high'
    });

    this.templates.set('payment_processed', {
      subject: 'Royalty Payment Processed',
      template: `
        <div class="message-template">
          <h3>Royalty Payment Processed</h3>
          <p>Your royalty payment has been successfully processed:</p>
          <ul>
            <li><strong>Payment ID:</strong> {{paymentId}}</li>
            <li><strong>Amount:</strong> E {{amount}}</li>
            <li><strong>Record ID:</strong> {{recordId}}</li>
            <li><strong>Processing Date:</strong> {{processingDate}}</li>
          </ul>
          <p>The payment will reflect in your account within 2-3 business days.</p>
        </div>
      `,
      priority: 'medium'
    });

    this.templates.set('compliance_reminder', {
      subject: 'Compliance Deadline Reminder',
      template: `
        <div class="message-template">
          <h3>Compliance Deadline Reminder</h3>
          <p>This is a reminder that the following compliance requirement is due:</p>
          <ul>
            <li><strong>Requirement:</strong> {{requirement}}</li>
            <li><strong>Due Date:</strong> {{dueDate}}</li>
            <li><strong>Days Remaining:</strong> {{daysRemaining}}</li>
          </ul>
          <p>Please ensure timely submission to avoid penalties.</p>
        </div>
      `,
      priority: 'high'
    });

    this.templates.set('system_maintenance', {
      subject: 'System Maintenance Notification',
      template: `
        <div class="message-template">
          <h3>System Maintenance Notification</h3>
          <p>The Mining Royalties Manager system will undergo scheduled maintenance:</p>
          <ul>
            <li><strong>Start Time:</strong> {{startTime}}</li>
            <li><strong>End Time:</strong> {{endTime}}</li>
            <li><strong>Duration:</strong> {{duration}}</li>
          </ul>
          <p>During this time, the system will be temporarily unavailable. We apologize for any inconvenience.</p>
        </div>
      `,
      priority: 'medium'
    });
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Online/offline detection
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncPendingMessages();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Visibility change for presence tracking
    document.addEventListener('visibilitychange', () => {
      this.updatePresenceStatus();
    });
  }

  /**
   * Start presence tracking
   */
  startPresenceTracking() {
    // Update presence every 30 seconds
    setInterval(() => {
      this.updatePresenceStatus();
    }, 30000);
  }

  /**
   * Update user presence status
   */
  updatePresenceStatus() {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return;

    const status = document.hidden ? 'away' : 'online';
    const lastSeen = new Date().toISOString();

    this.userPresence.set(currentUser.id, {
      status,
      lastSeen,
      timestamp: Date.now()
    });

    // In real implementation, this would sync with server
    this.broadcastPresenceUpdate(currentUser.id, status);
  }

  /**
   * Send message
   */
  async sendMessage(recipientId, subject, content, options = {}) {
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    const message = {
      id: this.generateMessageId(),
      senderId: currentUser.id,
      senderName: currentUser.name,
      recipientId,
      subject: subject || 'No Subject',
      content,
      priority: options.priority || 'medium',
      messageType: options.messageType || 'direct',
      timestamp: new Date().toISOString(),
      status: 'sent',
      readAt: null,
      attachments: options.attachments || [],
      metadata: options.metadata || {},
      conversationId: options.conversationId || null
    };

    if (this.isOnline) {
      await this.deliverMessage(message);
    } else {
      this.queueMessage(message);
    }

    this.messages.push(message);
    await dbService.create('messages', message);

    // Send real-time notification if recipient is online
    this.notifyRecipient(message);

    return message;
  }

  /**
   * Send message from template
   */
  async sendTemplateMessage(templateId, recipientId, variables, options = {}) {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    const content = this.renderTemplate(template.template, variables);
    const subject = this.renderTemplate(template.subject, variables);

    return await this.sendMessage(recipientId, subject, content, {
      ...options,
      priority: template.priority,
      messageType: 'template',
      templateId,
      variables
    });
  }

  /**
   * Send broadcast message
   */
  async sendBroadcast(subject, content, recipientGroups, options = {}) {
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    const broadcast = {
      id: this.generateMessageId(),
      senderId: currentUser.id,
      senderName: currentUser.name,
      subject,
      content,
      recipientGroups,
      messageType: 'broadcast',
      priority: options.priority || 'medium',
      timestamp: new Date().toISOString(),
      deliveredTo: [],
      readBy: [],
      metadata: options.metadata || {}
    };

    // Get recipients based on groups
    const recipients = await this.getRecipientsByGroups(recipientGroups);
    
    // Send to each recipient
    const deliveryPromises = recipients.map(recipient => 
      this.sendMessage(recipient.id, subject, content, {
        ...options,
        messageType: 'broadcast',
        broadcastId: broadcast.id
      })
    );

    await Promise.all(deliveryPromises);
    
    broadcast.deliveredTo = recipients.map(r => r.id);
    await dbService.create('broadcasts', broadcast);

    return broadcast;
  }

  /**
   * Schedule message
   */
  async scheduleMessage(recipientId, subject, content, scheduledAt, options = {}) {
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    const scheduledMessage = {
      id: this.generateMessageId(),
      senderId: currentUser.id,
      recipientId,
      subject,
      content,
      scheduledAt: new Date(scheduledAt).toISOString(),
      status: 'scheduled',
      options,
      createdAt: new Date().toISOString()
    };

    this.scheduledMessages.push(scheduledMessage);
    await dbService.create('scheduled_messages', scheduledMessage);

    // Set timeout for delivery (in real app, this would be handled by a job scheduler)
    const delay = new Date(scheduledAt).getTime() - Date.now();
    if (delay > 0) {
      setTimeout(() => {
        this.deliverScheduledMessage(scheduledMessage.id);
      }, delay);
    }

    return scheduledMessage;
  }

  /**
   * Start conversation
   */
  async startConversation(participants, subject, initialMessage = null) {
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    const conversation = {
      id: this.generateConversationId(),
      subject,
      participants: [currentUser.id, ...participants],
      createdBy: currentUser.id,
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      messageCount: 0,
      isActive: true,
      tags: []
    };

    this.conversations.push(conversation);
    await dbService.create('conversations', conversation);

    // Send initial message if provided
    if (initialMessage) {
      for (const participantId of participants) {
        await this.sendMessage(participantId, subject, initialMessage, {
          conversationId: conversation.id,
          messageType: 'conversation'
        });
      }
      conversation.messageCount = participants.length;
      conversation.lastActivity = new Date().toISOString();
    }

    return conversation;
  }

  /**
   * Get user messages
   */
  async getMessages(userId, options = {}) {
    let messages = this.messages.filter(m => 
      m.recipientId === userId || m.senderId === userId
    );

    // Apply filters
    if (options.unreadOnly) {
      messages = messages.filter(m => m.recipientId === userId && !m.readAt);
    }

    if (options.conversationId) {
      messages = messages.filter(m => m.conversationId === options.conversationId);
    }

    if (options.priority) {
      messages = messages.filter(m => m.priority === options.priority);
    }

    if (options.dateFrom) {
      messages = messages.filter(m => new Date(m.timestamp) >= new Date(options.dateFrom));
    }

    if (options.dateTo) {
      messages = messages.filter(m => new Date(m.timestamp) <= new Date(options.dateTo));
    }

    // Sort by timestamp (newest first)
    messages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Apply pagination
    const page = options.page || 1;
    const limit = options.limit || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    return {
      messages: messages.slice(startIndex, endIndex),
      total: messages.length,
      page,
      totalPages: Math.ceil(messages.length / limit),
      hasMore: endIndex < messages.length
    };
  }

  /**
   * Mark message as read
   */
  async markAsRead(messageId, userId) {
    const message = this.messages.find(m => m.id === messageId);
    if (!message) {
      throw new Error('Message not found');
    }

    if (message.recipientId !== userId) {
      throw new Error('Not authorized to mark this message as read');
    }

    if (!message.readAt) {
      message.readAt = new Date().toISOString();
      await dbService.update('messages', messageId, { readAt: message.readAt });

      // Send read receipt if requested
      if (message.metadata.requestReadReceipt) {
        await this.sendReadReceipt(message);
      }
    }

    return message;
  }

  /**
   * Send read receipt
   */
  async sendReadReceipt(originalMessage) {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return;

    const receiptMessage = {
      id: this.generateMessageId(),
      senderId: currentUser.id,
      senderName: currentUser.name,
      recipientId: originalMessage.senderId,
      subject: `Read Receipt: ${originalMessage.subject}`,
      content: `Your message "${originalMessage.subject}" has been read.`,
      messageType: 'read_receipt',
      priority: 'low',
      timestamp: new Date().toISOString(),
      status: 'sent',
      metadata: {
        originalMessageId: originalMessage.id,
        readAt: originalMessage.readAt
      }
    };

    await this.deliverMessage(receiptMessage);
    this.messages.push(receiptMessage);
    await dbService.create('messages', receiptMessage);
  }

  /**
   * Get conversation messages
   */
  async getConversationMessages(conversationId) {
    return this.messages.filter(m => m.conversationId === conversationId)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }

  /**
   * Add participants to conversation
   */
  async addParticipantsToConversation(conversationId, newParticipants) {
    const conversation = this.conversations.find(c => c.id === conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    const currentUser = this.getCurrentUser();
    if (!conversation.participants.includes(currentUser.id)) {
      throw new Error('Not authorized to modify this conversation');
    }

    // Add new participants
    newParticipants.forEach(participantId => {
      if (!conversation.participants.includes(participantId)) {
        conversation.participants.push(participantId);
      }
    });

    conversation.lastActivity = new Date().toISOString();
    await dbService.update('conversations', conversationId, conversation);

    // Notify new participants
    for (const participantId of newParticipants) {
      await this.sendMessage(participantId, 
        `Added to conversation: ${conversation.subject}`,
        `You have been added to the conversation "${conversation.subject}".`,
        { 
          conversationId,
          messageType: 'system'
        }
      );
    }

    return conversation;
  }

  /**
   * Search messages
   */
  async searchMessages(query, userId, options = {}) {
    const searchTerm = query.toLowerCase();
    let messages = this.messages.filter(m => 
      (m.recipientId === userId || m.senderId === userId) &&
      (m.subject.toLowerCase().includes(searchTerm) || 
       m.content.toLowerCase().includes(searchTerm))
    );

    // Apply additional filters
    if (options.dateFrom) {
      messages = messages.filter(m => new Date(m.timestamp) >= new Date(options.dateFrom));
    }

    if (options.dateTo) {
      messages = messages.filter(m => new Date(m.timestamp) <= new Date(options.dateTo));
    }

    if (options.priority) {
      messages = messages.filter(m => m.priority === options.priority);
    }

    if (options.sender) {
      messages = messages.filter(m => m.senderId === options.sender);
    }

    return messages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  /**
   * Get message statistics
   */
  getMessageStatistics(userId) {
    const userMessages = this.messages.filter(m => 
      m.recipientId === userId || m.senderId === userId
    );

    const sent = userMessages.filter(m => m.senderId === userId).length;
    const received = userMessages.filter(m => m.recipientId === userId).length;
    const unread = userMessages.filter(m => m.recipientId === userId && !m.readAt).length;
    const conversations = new Set(userMessages.map(m => m.conversationId).filter(Boolean)).size;

    const priorityStats = {
      high: userMessages.filter(m => m.priority === 'high').length,
      medium: userMessages.filter(m => m.priority === 'medium').length,
      low: userMessages.filter(m => m.priority === 'low').length
    };

    return {
      total: userMessages.length,
      sent,
      received,
      unread,
      conversations,
      priorityStats,
      responseTime: this.calculateAverageResponseTime(userId)
    };
  }

  /**
   * Calculate average response time
   */
  calculateAverageResponseTime(userId) {
    const userConversations = this.conversations.filter(c => 
      c.participants.includes(userId)
    );

    let totalResponseTime = 0;
    let responseCount = 0;

    userConversations.forEach(conversation => {
      const messages = this.getConversationMessages(conversation.id);
      for (let i = 1; i < messages.length; i++) {
        const currentMessage = messages[i];
        const previousMessage = messages[i - 1];
        
        if (currentMessage.senderId === userId && previousMessage.senderId !== userId) {
          const responseTime = new Date(currentMessage.timestamp) - new Date(previousMessage.timestamp);
          totalResponseTime += responseTime;
          responseCount++;
        }
      }
    });

    return responseCount > 0 ? Math.round(totalResponseTime / responseCount / (1000 * 60)) : 0; // in minutes
  }

  /**
   * Deliver message
   */
  async deliverMessage(message) {
    // In real implementation, this would send to message broker/API
    console.log(`Delivering message: ${message.subject} to ${message.recipientId}`);
    
    // Simulate delivery delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    message.deliveredAt = new Date().toISOString();
    message.status = 'delivered';
  }

  /**
   * Queue message for offline delivery
   */
  queueMessage(message) {
    message.status = 'queued';
    this.messageQueue.push(message);
    console.log(`Message queued for offline delivery: ${message.subject}`);
  }

  /**
   * Sync pending messages when online
   */
  async syncPendingMessages() {
    if (this.messageQueue.length === 0) return;

    console.log(`Syncing ${this.messageQueue.length} pending messages...`);
    
    const messagesToSync = [...this.messageQueue];
    this.messageQueue = [];

    for (const message of messagesToSync) {
      try {
        await this.deliverMessage(message);
      } catch (error) {
        console.error(`Failed to sync message ${message.id}:`, error);
        this.messageQueue.push(message); // Re-queue failed messages
      }
    }
  }

  /**
   * Deliver scheduled message
   */
  async deliverScheduledMessage(scheduledMessageId) {
    const scheduledMessage = this.scheduledMessages.find(m => m.id === scheduledMessageId);
    if (!scheduledMessage || scheduledMessage.status !== 'scheduled') {
      return;
    }

    try {
      await this.sendMessage(
        scheduledMessage.recipientId,
        scheduledMessage.subject,
        scheduledMessage.content,
        scheduledMessage.options
      );

      scheduledMessage.status = 'delivered';
      scheduledMessage.deliveredAt = new Date().toISOString();
      
      await dbService.update('scheduled_messages', scheduledMessageId, scheduledMessage);
    } catch (error) {
      scheduledMessage.status = 'failed';
      scheduledMessage.error = error.message;
      console.error(`Failed to deliver scheduled message ${scheduledMessageId}:`, error);
    }
  }

  /**
   * Notify recipient of new message
   */
  notifyRecipient(message) {
    const recipientPresence = this.userPresence.get(message.recipientId);
    if (recipientPresence && recipientPresence.status === 'online') {
      // Send real-time notification
      window.dispatchEvent(new CustomEvent('newMessage', {
        detail: {
          messageId: message.id,
          senderId: message.senderId,
          senderName: message.senderName,
          subject: message.subject,
          priority: message.priority,
          timestamp: message.timestamp
        }
      }));
    }
  }

  /**
   * Broadcast presence update
   */
  broadcastPresenceUpdate(userId, status) {
    window.dispatchEvent(new CustomEvent('presenceUpdate', {
      detail: { userId, status, timestamp: new Date().toISOString() }
    }));
  }

  /**
   * Render template with variables
   */
  renderTemplate(template, variables) {
    let rendered = template;
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      rendered = rendered.replace(regex, value);
    }
    return rendered;
  }

  /**
   * Get recipients by groups
   */
  async getRecipientsByGroups(groups) {
    // In real implementation, this would fetch from user service
    const allUsers = await this.getAllUsers();
    
    return allUsers.filter(user => 
      groups.some(group => user.groups && user.groups.includes(group))
    );
  }

  /**
   * Get current user (mock implementation)
   */
  getCurrentUser() {
    // In real implementation, this would get from auth service
    return { id: 'user1', name: 'Current User' };
  }

  /**
   * Get all users (mock implementation)
   */
  async getAllUsers() {
    // In real implementation, this would fetch from user service
    return [
      { id: 'user1', name: 'Admin User', groups: ['admin', 'finance'] },
      { id: 'user2', name: 'Reviewer', groups: ['reviewer'] },
      { id: 'user3', name: 'Operator', groups: ['operator'] }
    ];
  }

  /**
   * Generate unique message ID
   */
  generateMessageId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique conversation ID
   */
  generateConversationId() {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get user presence
   */
  getUserPresence(userId) {
    return this.userPresence.get(userId) || { status: 'offline', lastSeen: null };
  }

  /**
   * Delete message
   */
  async deleteMessage(messageId, userId) {
    const messageIndex = this.messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) {
      throw new Error('Message not found');
    }

    const message = this.messages[messageIndex];
    if (message.recipientId !== userId && message.senderId !== userId) {
      throw new Error('Not authorized to delete this message');
    }

    this.messages.splice(messageIndex, 1);
    await dbService.delete('messages', messageId);
    
    return true;
  }

  /**
   * Archive conversation
   */
  async archiveConversation(conversationId, userId) {
    const conversation = this.conversations.find(c => c.id === conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    if (!conversation.participants.includes(userId)) {
      throw new Error('Not authorized to archive this conversation');
    }

    conversation.isActive = false;
    conversation.archivedAt = new Date().toISOString();
    conversation.archivedBy = userId;

    await dbService.update('conversations', conversationId, conversation);
    return conversation;
  }
}
