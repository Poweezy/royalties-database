/**
 * Communication Manager
 * Handles messaging, notifications, and stakeholder communication
 */

export class CommunicationManager {
  constructor() {
    this.messages = [];
    this.conversations = [];
    this.templates = [];
    this.contacts = [];
    this.notifications = [];
    this.initialized = false;
  }

  /**
   * Initialize communication system
   */
  async init() {
    if (this.initialized) return;

    await this.loadContacts();
    await this.loadTemplates();
    await this.loadMessages();
    this.setupEventListeners();
    this.initialized = true;

    console.log('Communication Manager initialized');
  }

  /**
   * Load contacts
   */
  async loadContacts() {
    this.contacts = [
      {
        id: 1,
        name: 'John Maseko',
        role: 'Mining Inspector',
        organization: 'Ministry of Natural Resources',
        email: 'j.maseko@mnr.gov.sz',
        phone: '+268-2404-2345',
        category: 'government',
        priority: 'high',
        lastContact: '2024-01-15T10:30:00Z'
      },
      {
        id: 2,
        name: 'Sarah Dlamini',
        role: 'Operations Manager',
        organization: 'Maloma Colliery',
        email: 's.dlamini@maloma.co.sz',
        phone: '+268-2516-7890',
        category: 'operator',
        priority: 'high',
        lastContact: '2024-01-10T14:20:00Z'
      },
      {
        id: 3,
        name: 'Michael Nkomo',
        role: 'Environmental Officer',
        organization: 'Environmental Authority',
        email: 'm.nkomo@environment.gov.sz',
        phone: '+268-2404-5678',
        category: 'regulatory',
        priority: 'medium',
        lastContact: '2024-01-08T09:15:00Z'
      },
      {
        id: 4,
        name: 'Grace Simelane',
        role: 'Community Leader',
        organization: 'Mbabane Community Council',
        email: 'g.simelane@mbabane.council.sz',
        phone: '+268-2505-3456',
        category: 'community',
        priority: 'medium',
        lastContact: '2024-01-05T16:45:00Z'
      }
    ];
  }

  /**
   * Load message templates
   */
  async loadTemplates() {
    this.templates = [
      {
        id: 'royalty-reminder',
        name: 'Royalty Payment Reminder',
        subject: 'Royalty Payment Due - {entity}',
        category: 'payment',
        body: `Dear {contact_name},

This is a reminder that royalty payment for {entity} is due on {due_date}.

Payment Details:
- Amount: E {amount}
- Period: {period}
- Reference: {reference}

Please ensure payment is made by the due date to avoid penalties.

Best regards,
Mining Royalties Management Team`,
        variables: ['contact_name', 'entity', 'due_date', 'amount', 'period', 'reference']
      },
      {
        id: 'compliance-notice',
        name: 'Compliance Notice',
        subject: 'Compliance Review Required - {entity}',
        category: 'compliance',
        body: `Dear {contact_name},

Our records indicate that {entity} requires attention regarding compliance matters.

Issues Identified:
{compliance_issues}

Required Actions:
{required_actions}

Please address these matters within {deadline} days.

Contact us if you need assistance.

Regards,
Compliance Team`,
        variables: ['contact_name', 'entity', 'compliance_issues', 'required_actions', 'deadline']
      },
      {
        id: 'production-report',
        name: 'Production Report Request',
        subject: 'Monthly Production Report Required - {entity}',
        category: 'reporting',
        body: `Dear {contact_name},

Please submit your monthly production report for {entity} for the period {period}.

Required Information:
- Production quantities by mineral type
- Quality assessments
- Environmental compliance data
- Safety incidents (if any)

Submit by: {deadline}

Thank you for your cooperation.

Best regards,
Data Collection Team`,
        variables: ['contact_name', 'entity', 'period', 'deadline']
      }
    ];
  }

  /**
   * Load existing messages
   */
  async loadMessages() {
    this.messages = [
      {
        id: 1,
        from: 'system',
        to: 's.dlamini@maloma.co.sz',
        subject: 'Royalty Payment Due - Maloma Colliery',
        body: 'This is a reminder that royalty payment is due...',
        template: 'royalty-reminder',
        status: 'sent',
        priority: 'high',
        createdAt: '2024-01-15T08:30:00Z',
        sentAt: '2024-01-15T08:31:00Z',
        readAt: '2024-01-15T10:15:00Z'
      },
      {
        id: 2,
        from: 's.dlamini@maloma.co.sz',
        to: 'system',
        subject: 'Re: Royalty Payment Due',
        body: 'Payment has been processed. Please confirm receipt.',
        status: 'received',
        priority: 'normal',
        createdAt: '2024-01-15T11:00:00Z',
        conversationId: 1
      }
    ];

    this.conversations = this.groupMessagesByConversation();
  }

  /**
   * Send message
   */
  async sendMessage(messageData) {
    try {
      const message = {
        id: this.generateId(),
        from: messageData.from || 'system',
        to: messageData.to,
        subject: messageData.subject,
        body: messageData.body,
        template: messageData.template,
        status: 'sending',
        priority: messageData.priority || 'normal',
        createdAt: new Date().toISOString(),
        metadata: messageData.metadata || {}
      };

      // Simulate sending
      setTimeout(() => {
        message.status = 'sent';
        message.sentAt = new Date().toISOString();
        this.updateMessage(message);
      }, 1000);

      this.messages.unshift(message);
      this.updateConversations();

      // Log activity
      this.logActivity('message_sent', {
        messageId: message.id,
        to: message.to,
        subject: message.subject
      });

      return message;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  /**
   * Send bulk messages
   */
  async sendBulkMessages(recipients, template, variables) {
    const results = [];
    
    for (const recipient of recipients) {
      try {
        const messageBody = this.processTemplate(template.body, { 
          ...variables, 
          contact_name: recipient.name 
        });
        const messageSubject = this.processTemplate(template.subject, { 
          ...variables, 
          contact_name: recipient.name 
        });

        const message = await this.sendMessage({
          to: recipient.email,
          subject: messageSubject,
          body: messageBody,
          template: template.id,
          priority: recipient.priority || 'normal',
          metadata: {
            recipientId: recipient.id,
            bulkSend: true
          }
        });

        results.push({ recipient, message, status: 'success' });
      } catch (error) {
        results.push({ recipient, error: error.message, status: 'failed' });
      }
    }

    return {
      total: recipients.length,
      successful: results.filter(r => r.status === 'success').length,
      failed: results.filter(r => r.status === 'failed').length,
      results
    };
  }

  /**
   * Process template variables
   */
  processTemplate(template, variables) {
    let processed = template;
    
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{${key}}`, 'g');
      processed = processed.replace(regex, value);
    });

    return processed;
  }

  /**
   * Create notification
   */
  createNotification(type, title, message, data = {}) {
    const notification = {
      id: this.generateId(),
      type, // info, warning, error, success
      title,
      message,
      data,
      timestamp: new Date().toISOString(),
      read: false,
      dismissed: false
    };

    this.notifications.unshift(notification);
    
    // Keep only recent notifications
    this.notifications = this.notifications.slice(0, 100);

    // Dispatch event
    window.dispatchEvent(new CustomEvent('notificationCreated', {
      detail: notification
    }));

    return notification;
  }

  /**
   * Schedule messages
   */
  scheduleMessage(messageData, scheduleTime) {
    const scheduledMessage = {
      ...messageData,
      id: this.generateId(),
      scheduledFor: scheduleTime,
      status: 'scheduled'
    };

    // In a real application, this would use a proper job scheduler
    const delay = new Date(scheduleTime).getTime() - new Date().getTime();
    
    if (delay > 0) {
      setTimeout(() => {
        this.sendMessage(scheduledMessage);
      }, delay);

      this.createNotification(
        'info',
        'Message Scheduled',
        `Message scheduled to be sent at ${new Date(scheduleTime).toLocaleString()}`
      );
    }

    return scheduledMessage;
  }

  /**
   * Get conversation history
   */
  getConversationHistory(contactId) {
    return this.messages.filter(msg => 
      msg.from === contactId || 
      msg.to === contactId ||
      msg.metadata?.contactId === contactId
    ).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }

  /**
   * Search messages
   */
  searchMessages(query, filters = {}) {
    let results = this.messages;

    // Text search
    if (query) {
      const searchTerm = query.toLowerCase();
      results = results.filter(msg => 
        msg.subject.toLowerCase().includes(searchTerm) ||
        msg.body.toLowerCase().includes(searchTerm) ||
        msg.from.toLowerCase().includes(searchTerm) ||
        msg.to.toLowerCase().includes(searchTerm)
      );
    }

    // Apply filters
    if (filters.status) {
      results = results.filter(msg => msg.status === filters.status);
    }

    if (filters.priority) {
      results = results.filter(msg => msg.priority === filters.priority);
    }

    if (filters.template) {
      results = results.filter(msg => msg.template === filters.template);
    }

    if (filters.dateFrom) {
      results = results.filter(msg => new Date(msg.createdAt) >= new Date(filters.dateFrom));
    }

    if (filters.dateTo) {
      results = results.filter(msg => new Date(msg.createdAt) <= new Date(filters.dateTo));
    }

    return results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  /**
   * Get communication statistics
   */
  getCommunicationStats() {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const thisMonthMessages = this.messages.filter(msg => 
      new Date(msg.createdAt) >= thisMonth
    );

    const lastMonthMessages = this.messages.filter(msg => 
      new Date(msg.createdAt) >= lastMonth && new Date(msg.createdAt) < thisMonth
    );

    return {
      total: this.messages.length,
      thisMonth: thisMonthMessages.length,
      lastMonth: lastMonthMessages.length,
      sent: this.messages.filter(msg => msg.status === 'sent').length,
      pending: this.messages.filter(msg => msg.status === 'sending').length,
      failed: this.messages.filter(msg => msg.status === 'failed').length,
      byPriority: {
        high: this.messages.filter(msg => msg.priority === 'high').length,
        normal: this.messages.filter(msg => msg.priority === 'normal').length,
        low: this.messages.filter(msg => msg.priority === 'low').length
      },
      responseRate: this.calculateResponseRate(),
      averageResponseTime: this.calculateAverageResponseTime()
    };
  }

  /**
   * Calculate response rate
   */
  calculateResponseRate() {
    const outgoingMessages = this.messages.filter(msg => msg.from === 'system');
    const conversationsWithResponses = new Set();

    this.messages.forEach(msg => {
      if (msg.to === 'system' && msg.conversationId) {
        conversationsWithResponses.add(msg.conversationId);
      }
    });

    return outgoingMessages.length > 0 ? 
      (conversationsWithResponses.size / outgoingMessages.length * 100).toFixed(1) : 0;
  }

  /**
   * Calculate average response time
   */
  calculateAverageResponseTime() {
    const responses = this.messages.filter(msg => 
      msg.to === 'system' && msg.conversationId
    );

    if (responses.length === 0) return 0;

    let totalTime = 0;
    let validResponses = 0;

    responses.forEach(response => {
      const originalMessage = this.messages.find(msg => 
        msg.id === response.conversationId && msg.sentAt
      );
      
      if (originalMessage) {
        const responseTime = new Date(response.createdAt) - new Date(originalMessage.sentAt);
        totalTime += responseTime;
        validResponses++;
      }
    });

    return validResponses > 0 ? Math.round(totalTime / validResponses / (1000 * 60 * 60)) : 0; // hours
  }

  /**
   * Update message
   */
  updateMessage(updatedMessage) {
    const index = this.messages.findIndex(msg => msg.id === updatedMessage.id);
    if (index !== -1) {
      this.messages[index] = { ...this.messages[index], ...updatedMessage };
    }
  }

  /**
   * Group messages by conversation
   */
  groupMessagesByConversation() {
    const conversations = {};
    
    this.messages.forEach(msg => {
      const key = msg.conversationId || 
        (msg.from === 'system' ? msg.to : msg.from);
      
      if (!conversations[key]) {
        conversations[key] = [];
      }
      conversations[key].push(msg);
    });

    return Object.entries(conversations).map(([key, messages]) => ({
      id: key,
      messages: messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)),
      lastMessage: messages[messages.length - 1],
      unreadCount: messages.filter(msg => !msg.readAt && msg.to === 'system').length
    }));
  }

  /**
   * Update conversations
   */
  updateConversations() {
    this.conversations = this.groupMessagesByConversation();
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Listen for data updates that might require notifications
    window.addEventListener('royaltyCalculated', (event) => {
      this.handleRoyaltyCalculation(event.detail);
    });

    window.addEventListener('complianceIssue', (event) => {
      this.handleComplianceIssue(event.detail);
    });

    window.addEventListener('paymentOverdue', (event) => {
      this.handleOverduePayment(event.detail);
    });
  }

  /**
   * Handle royalty calculation events
   */
  handleRoyaltyCalculation(data) {
    this.createNotification(
      'success',
      'Royalty Calculated',
      `Royalty calculation completed for ${data.entity}: E ${data.amount.toFixed(2)}`
    );
  }

  /**
   * Handle compliance issues
   */
  handleComplianceIssue(data) {
    this.createNotification(
      'warning',
      'Compliance Issue',
      `Compliance issue detected for ${data.entity}: ${data.issue}`
    );

    // Auto-send compliance notice if configured
    const template = this.templates.find(t => t.id === 'compliance-notice');
    const contact = this.contacts.find(c => c.organization === data.entity);
    
    if (template && contact) {
      this.sendMessage({
        to: contact.email,
        subject: this.processTemplate(template.subject, { entity: data.entity }),
        body: this.processTemplate(template.body, {
          contact_name: contact.name,
          entity: data.entity,
          compliance_issues: data.issue,
          required_actions: 'Please review and provide corrective action plan',
          deadline: '14'
        }),
        template: template.id,
        priority: 'high'
      });
    }
  }

  /**
   * Handle overdue payments
   */
  handleOverduePayment(data) {
    this.createNotification(
      'error',
      'Payment Overdue',
      `Payment overdue for ${data.entity}: E ${data.amount.toFixed(2)}`
    );
  }

  /**
   * Log activity
   */
  logActivity(action, data) {
    console.log(`Communication activity: ${action}`, data);
  }

  /**
   * Generate unique ID
   */
  generateId() {
    return Date.now() + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Get contacts
   */
  getContacts(category = null) {
    return category ? 
      this.contacts.filter(contact => contact.category === category) :
      this.contacts;
  }

  /**
   * Get templates
   */
  getTemplates(category = null) {
    return category ?
      this.templates.filter(template => template.category === category) :
      this.templates;
  }

  /**
   * Get messages
   */
  getMessages(limit = null) {
    return limit ? this.messages.slice(0, limit) : this.messages;
  }

  /**
   * Get notifications
   */
  getNotifications(unreadOnly = false) {
    return unreadOnly ? 
      this.notifications.filter(n => !n.read) :
      this.notifications;
  }

  /**
   * Mark notification as read
   */
  markNotificationRead(id) {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
      notification.readAt = new Date().toISOString();
    }
  }

  /**
   * Dismiss notification
   */
  dismissNotification(id) {
    const index = this.notifications.findIndex(n => n.id === id);
    if (index !== -1) {
      this.notifications.splice(index, 1);
    }
  }
}
