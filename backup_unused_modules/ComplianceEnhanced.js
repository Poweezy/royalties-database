/**
 * Enhanced Compliance and Regulatory Management
 * Comprehensive compliance tracking, automated monitoring, and regulatory updates
 */

import { dbService } from '../services/database.service.js';
import { notificationManager } from './NotificationManager.js';

export class ComplianceEnhanced {
  constructor() {
    this.complianceRequirements = [];
    this.regulations = [];
    this.complianceRecords = [];
    this.violations = [];
    this.assessments = [];
    this.reminders = [];
    this.templates = new Map();
    this.checklistLibrary = new Map();
    this.riskMatrix = new Map();
    this.monitoringInterval = null;
    this.reminderInterval = null;
    
    this.initializeRegulations();
    this.initializeTemplates();
    this.initializeChecklists();
    this.initializeRiskMatrix();
    this.startComplianceMonitoring();
  }

  /**
   * Initialize regulatory framework
   */
  initializeRegulations() {
    this.regulations = [
      {
        id: 'mining_act_2023',
        title: 'Mining Act 2023',
        category: 'Primary Legislation',
        effectiveDate: '2023-01-01',
        lastUpdate: '2023-06-15',
        authority: 'Ministry of Natural Resources',
        sections: [
          {
            section: '15',
            title: 'Royalty Payment Requirements',
            requirements: [
              'Monthly production reports must be submitted by the 15th of following month',
              'Royalty payments must be made within 30 days of production',
              'Supporting documentation must include production records and quality certificates'
            ],
            penalties: 'Fine not exceeding E50,000 or suspension of license'
          },
          {
            section: '23',
            title: 'Environmental Compliance',
            requirements: [
              'Environmental impact assessment required for operations exceeding 10,000 tonnes/month',
              'Monthly environmental monitoring reports',
              'Rehabilitation bond must be maintained'
            ],
            penalties: 'Fine not exceeding E100,000 or license revocation'
          }
        ]
      },
      {
        id: 'tax_act_2022',
        title: 'Tax Administration Act 2022',
        category: 'Tax Legislation',
        effectiveDate: '2022-04-01',
        lastUpdate: '2023-03-01',
        authority: 'Eswatini Revenue Service',
        sections: [
          {
            section: '45',
            title: 'Mining Tax Obligations',
            requirements: [
              'Quarterly tax returns must be filed within 30 days after quarter end',
              'Withholding tax on royalty payments to be remitted monthly',
              'Annual tax clearance certificate required for license renewal'
            ],
            penalties: 'Penalty of 20% of tax due plus interest at prevailing rate'
          }
        ]
      },
      {
        id: 'labor_act_2021',
        title: 'Labour Act 2021',
        category: 'Employment Law',
        effectiveDate: '2021-01-01',
        lastUpdate: '2022-12-01',
        authority: 'Ministry of Labour',
        sections: [
          {
            section: '67',
            title: 'Mining Safety Requirements',
            requirements: [
              'Safety officer certification required for operations with >25 employees',
              'Monthly safety training records must be maintained',
              'Accident reports must be submitted within 24 hours'
            ],
            penalties: 'Fine not exceeding E25,000 per violation'
          }
        ]
      }
    ];
  }

  /**
   * Initialize compliance templates
   */
  initializeTemplates() {
    this.templates.set('monthly_production_report', {
      name: 'Monthly Production Report',
      category: 'Production Reporting',
      frequency: 'monthly',
      dueDate: '15th of following month',
      requiredFields: [
        'production_volume',
        'mineral_grade',
        'extraction_method',
        'waste_generated',
        'rehabilitation_activities'
      ],
      supportingDocuments: [
        'Daily production logs',
        'Quality certificates',
        'Equipment maintenance records'
      ],
      template: `
        <div class="compliance-template">
          <h3>Monthly Production Report</h3>
          <p><strong>Reporting Period:</strong> {{reportingMonth}} {{reportingYear}}</p>
          <p><strong>Mining Entity:</strong> {{entityName}}</p>
          <p><strong>License Number:</strong> {{licenseNumber}}</p>
          
          <h4>Production Summary</h4>
          <table>
            <tr><td>Total Production Volume:</td><td>{{productionVolume}} tonnes</td></tr>
            <tr><td>Average Mineral Grade:</td><td>{{mineralGrade}}%</td></tr>
            <tr><td>Waste Generated:</td><td>{{wasteGenerated}} tonnes</td></tr>
          </table>
          
          <h4>Compliance Declaration</h4>
          <p>I hereby declare that the information provided is true and accurate to the best of my knowledge.</p>
        </div>
      `
    });

    this.templates.set('environmental_monitoring', {
      name: 'Environmental Monitoring Report',
      category: 'Environmental',
      frequency: 'monthly',
      dueDate: '20th of following month',
      requiredFields: [
        'air_quality_readings',
        'water_quality_tests',
        'noise_level_measurements',
        'rehabilitation_progress'
      ],
      supportingDocuments: [
        'Laboratory test results',
        'Monitoring equipment calibration certificates',
        'Photographic evidence of rehabilitation'
      ]
    });

    this.templates.set('safety_report', {
      name: 'Monthly Safety Report',
      category: 'Health & Safety',
      frequency: 'monthly',
      dueDate: '10th of following month',
      requiredFields: [
        'incident_count',
        'injury_statistics',
        'training_conducted',
        'safety_equipment_status'
      ],
      supportingDocuments: [
        'Incident reports',
        'Training certificates',
        'Safety equipment inspection logs'
      ]
    });
  }

  /**
   * Initialize compliance checklists
   */
  initializeChecklists() {
    this.checklistLibrary.set('license_renewal', {
      name: 'Mining License Renewal Checklist',
      category: 'License Management',
      items: [
        {
          id: 'tax_clearance',
          requirement: 'Current Tax Clearance Certificate',
          status: 'pending',
          dueDate: '30 days before expiry',
          criticality: 'high'
        },
        {
          id: 'environmental_compliance',
          requirement: 'Environmental Compliance Certificate',
          status: 'pending',
          dueDate: '60 days before expiry',
          criticality: 'high'
        },
        {
          id: 'rehabilitation_bond',
          requirement: 'Valid Rehabilitation Bond',
          status: 'pending',
          dueDate: '30 days before expiry',
          criticality: 'medium'
        },
        {
          id: 'production_reports',
          requirement: 'All Production Reports Up-to-Date',
          status: 'pending',
          dueDate: 'Continuous',
          criticality: 'high'
        }
      ]
    });

    this.checklistLibrary.set('new_operation_setup', {
      name: 'New Mining Operation Setup',
      category: 'Operational Setup',
      items: [
        {
          id: 'mining_license',
          requirement: 'Valid Mining License',
          status: 'pending',
          criticality: 'high'
        },
        {
          id: 'eia_approval',
          requirement: 'Environmental Impact Assessment Approval',
          status: 'pending',
          criticality: 'high'
        },
        {
          id: 'safety_certification',
          requirement: 'Safety Officer Certification',
          status: 'pending',
          criticality: 'medium'
        },
        {
          id: 'insurance_coverage',
          requirement: 'Appropriate Insurance Coverage',
          status: 'pending',
          criticality: 'medium'
        }
      ]
    });
  }

  /**
   * Initialize risk assessment matrix
   */
  initializeRiskMatrix() {
    this.riskMatrix.set('financial', {
      category: 'Financial Risk',
      factors: [
        { name: 'Late Payment Penalties', weight: 0.3, impact: 'high' },
        { name: 'License Suspension', weight: 0.4, impact: 'very_high' },
        { name: 'Additional Audit Costs', weight: 0.2, impact: 'medium' },
        { name: 'Reputation Damage', weight: 0.1, impact: 'medium' }
      ]
    });

    this.riskMatrix.set('operational', {
      category: 'Operational Risk',
      factors: [
        { name: 'Production Delays', weight: 0.3, impact: 'high' },
        { name: 'Equipment Downtime', weight: 0.2, impact: 'medium' },
        { name: 'Safety Incidents', weight: 0.4, impact: 'very_high' },
        { name: 'Environmental Violations', weight: 0.1, impact: 'high' }
      ]
    });

    this.riskMatrix.set('regulatory', {
      category: 'Regulatory Risk',
      factors: [
        { name: 'Non-compliance Penalties', weight: 0.4, impact: 'very_high' },
        { name: 'Increased Scrutiny', weight: 0.2, impact: 'medium' },
        { name: 'License Conditions', weight: 0.3, impact: 'high' },
        { name: 'Regulatory Changes', weight: 0.1, impact: 'medium' }
      ]
    });
  }

  /**
   * Start compliance monitoring
   */
  startComplianceMonitoring() {
    // Check compliance status every hour
    this.monitoringInterval = setInterval(() => {
      this.performAutomaticComplianceCheck();
    }, 60 * 60 * 1000); // 1 hour

    // Daily reminder check
    this.reminderInterval = setInterval(() => {
      this.checkDueReminders();
    }, 24 * 60 * 60 * 1000); // 24 hours

    // Initial check
    setTimeout(() => {
      this.performAutomaticComplianceCheck();
      this.checkDueReminders();
    }, 5000);
  }

  /**
   * Cleans up resources to prevent memory leaks.
   */
  destroy() {
    console.log("Destroying ComplianceEnhanced...");

    // Clear intervals
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    if (this.reminderInterval) {
      clearInterval(this.reminderInterval);
    }

    // Clear data arrays and maps
    this.complianceRequirements = [];
    this.regulations = [];
    this.complianceRecords = [];
    this.violations = [];
    this.assessments = [];
    this.reminders = [];
    this.templates.clear();
    this.checklistLibrary.clear();
    this.riskMatrix.clear();
  }

  /**
   * Create compliance requirement
   */
  async createComplianceRequirement(data) {
    const requirement = {
      id: this.generateId('REQ'),
      title: data.title,
      description: data.description,
      category: data.category,
      regulationId: data.regulationId,
      frequency: data.frequency, // monthly, quarterly, annually, ad-hoc
      dueDate: data.dueDate,
      nextDueDate: this.calculateNextDueDate(data.frequency, data.dueDate),
      assignedTo: data.assignedTo,
      priority: data.priority || 'medium',
      status: 'pending',
      checklistId: data.checklistId,
      createdAt: new Date().toISOString(),
      createdBy: data.userId
    };

    this.complianceRequirements.push(requirement);
    await dbService.create('compliance_requirements', requirement);

    // Create reminder schedule
    this.createReminderSchedule(requirement);

    notificationManager.show('Compliance requirement created successfully', 'success');
    return requirement;
  }

  /**
   * Submit compliance record
   */
  async submitComplianceRecord(requirementId, data) {
    const requirement = this.complianceRequirements.find(r => r.id === requirementId);
    if (!requirement) {
      throw new Error('Compliance requirement not found');
    }

    const record = {
      id: this.generateId('REC'),
      requirementId,
      submittedData: data.submittedData,
      supportingDocuments: data.supportingDocuments || [],
      submissionDate: new Date().toISOString(),
      submittedBy: data.userId,
      status: 'submitted',
      reviewStatus: 'pending_review',
      complianceScore: null,
      reviewNotes: [],
      approvedAt: null,
      approvedBy: null
    };

    // Perform automatic validation
    const validation = await this.validateSubmission(requirement, record);
    record.validationResult = validation;
    record.complianceScore = validation.score;

    if (validation.score >= 80) {
      record.reviewStatus = 'auto_approved';
      record.approvedAt = new Date().toISOString();
      record.approvedBy = 'system';
      requirement.status = 'compliant';
    } else if (validation.criticalIssues.length > 0) {
      record.reviewStatus = 'requires_attention';
      requirement.status = 'non_compliant';
    } else {
      record.reviewStatus = 'under_review';
    }

    this.complianceRecords.push(record);
    await dbService.create('compliance_records', record);

    // Update requirement status and next due date
    requirement.lastSubmissionDate = record.submissionDate;
    requirement.nextDueDate = this.calculateNextDueDate(requirement.frequency, requirement.dueDate);
    await dbService.update('compliance_requirements', requirementId, requirement);

    // Send notifications
    this.sendComplianceNotifications(requirement, record);

    return record;
  }

  /**
   * Validate compliance submission
   */
  async validateSubmission(requirement, record) {
    const validation = {
      score: 0,
      maxScore: 100,
      issues: [],
      criticalIssues: [],
      warnings: []
    };

    // Get template for validation rules
    const template = this.templates.get(requirement.checklistId);
    if (!template) {
      validation.issues.push('No validation template found for this requirement');
      return validation;
    }

    let fieldScore = 0;
    const requiredFields = template.requiredFields || [];

    // Check required fields
    requiredFields.forEach(field => {
      if (record.submittedData[field] && record.submittedData[field] !== '') {
        fieldScore += 100 / requiredFields.length;
      } else {
        validation.criticalIssues.push(`Missing required field: ${field}`);
      }
    });

    validation.score += fieldScore * 0.6; // 60% weight for fields

    // Check supporting documents
    const requiredDocuments = template.supportingDocuments || [];
    let documentScore = 0;
    requiredDocuments.forEach(doc => {
      const hasDocument = record.supportingDocuments.some(
        submittedDoc => submittedDoc.type === doc || submittedDoc.name.includes(doc)
      );
      if (hasDocument) {
        documentScore += 100 / requiredDocuments.length;
      } else {
        validation.issues.push(`Missing supporting document: ${doc}`);
      }
    });

    validation.score += documentScore * 0.3; // 30% weight for documents

    // Check timeliness
    const dueDate = new Date(requirement.nextDueDate);
    const submissionDate = new Date(record.submissionDate);
    const timelinessScore = submissionDate <= dueDate ? 100 : Math.max(0, 100 - (submissionDate - dueDate) / (24 * 60 * 60 * 1000) * 10);
    
    validation.score += timelinessScore * 0.1; // 10% weight for timeliness

    if (timelinessScore < 100) {
      const daysLate = Math.ceil((submissionDate - dueDate) / (24 * 60 * 60 * 1000));
      if (daysLate > 7) {
        validation.criticalIssues.push(`Submission is ${daysLate} days overdue`);
      } else {
        validation.warnings.push(`Submission is ${daysLate} days late`);
      }
    }

    validation.score = Math.round(validation.score);
    return validation;
  }

  /**
   * Perform automatic compliance check
   */
  async performAutomaticComplianceCheck() {
    const now = new Date();
    const upcomingDeadlines = [];
    const overdueRequirements = [];

    this.complianceRequirements.forEach(requirement => {
      const dueDate = new Date(requirement.nextDueDate);
      const daysUntilDue = Math.ceil((dueDate - now) / (24 * 60 * 60 * 1000));

      // Check for upcoming deadlines (within 30 days)
      if (daysUntilDue <= 30 && daysUntilDue > 0) {
        upcomingDeadlines.push({
          requirement,
          daysUntilDue,
          urgency: daysUntilDue <= 7 ? 'high' : daysUntilDue <= 14 ? 'medium' : 'low'
        });
      }

      // Check for overdue requirements
      if (daysUntilDue < 0) {
        const daysOverdue = Math.abs(daysUntilDue);
        overdueRequirements.push({
          requirement,
          daysOverdue,
          severity: daysOverdue > 30 ? 'critical' : daysOverdue > 7 ? 'high' : 'medium'
        });
      }
    });

    // Process upcoming deadlines
    upcomingDeadlines.forEach(({ requirement, daysUntilDue, urgency }) => {
      this.createDeadlineReminder(requirement, daysUntilDue, urgency);
    });

    // Process overdue requirements
    overdueRequirements.forEach(({ requirement, daysOverdue, severity }) => {
      this.createViolationRecord(requirement, daysOverdue, severity);
    });

    // Update compliance dashboard
    this.updateComplianceDashboard();
  }

  /**
   * Create deadline reminder
   */
  createDeadlineReminder(requirement, daysUntilDue, urgency) {
    const reminder = {
      id: this.generateId('REM'),
      requirementId: requirement.id,
      title: `Compliance Deadline Approaching: ${requirement.title}`,
      message: `The compliance requirement "${requirement.title}" is due in ${daysUntilDue} days.`,
      urgency,
      daysUntilDue,
      createdAt: new Date().toISOString(),
      status: 'active',
      recipientId: requirement.assignedTo
    };

    this.reminders.push(reminder);

    // Send notification
    notificationManager.show(reminder.message, urgency === 'high' ? 'warning' : 'info');

    // Dispatch event for UI updates
    window.dispatchEvent(new CustomEvent('complianceDeadline', {
      detail: { reminder, requirement }
    }));
  }

  /**
   * Create violation record
   */
  createViolationRecord(requirement, daysOverdue, severity) {
    const existingViolation = this.violations.find(v => 
      v.requirementId === requirement.id && v.status === 'active'
    );

    if (existingViolation) {
      // Update existing violation
      existingViolation.daysOverdue = daysOverdue;
      existingViolation.severity = severity;
      existingViolation.lastUpdated = new Date().toISOString();
      return existingViolation;
    }

    const violation = {
      id: this.generateId('VIO'),
      requirementId: requirement.id,
      title: `Overdue Compliance: ${requirement.title}`,
      description: `Compliance requirement is ${daysOverdue} days overdue`,
      severity,
      daysOverdue,
      violationType: 'missed_deadline',
      status: 'active',
      discoveredAt: new Date().toISOString(),
      assignedTo: requirement.assignedTo,
      remedialActions: [],
      estimatedPenalty: this.calculatePenalty(requirement, daysOverdue),
      riskAssessment: this.assessComplianceRisk(requirement, severity)
    };

    this.violations.push(violation);

    // Auto-generate remedial actions
    violation.remedialActions = this.generateRemedialActions(requirement, violation);

    // Send critical notification
    notificationManager.show(violation.title, 'error');

    // Dispatch event for immediate attention
    window.dispatchEvent(new CustomEvent('complianceViolation', {
      detail: { violation, requirement }
    }));

    return violation;
  }

  /**
   * Calculate penalty for non-compliance
   */
  calculatePenalty(requirement, daysOverdue) {
    // Base penalty from regulation
    const regulation = this.regulations.find(r => r.id === requirement.regulationId);
    let basePenalty = 5000; // Default base penalty

    if (regulation) {
      // Extract penalty amount from regulation text (simplified)
      const section = regulation.sections.find(s => 
        s.requirements.some(req => req.includes(requirement.category))
      );
      if (section && section.penalties.includes('E')) {
        const match = section.penalties.match(/E([0-9,]+)/);
        if (match) {
          basePenalty = parseInt(match[1].replace(',', ''));
        }
      }
    }

    // Calculate penalty based on days overdue
    let multiplier = 1;
    if (daysOverdue > 30) multiplier = 2;
    else if (daysOverdue > 14) multiplier = 1.5;
    else if (daysOverdue > 7) multiplier = 1.2;

    return {
      estimatedAmount: basePenalty * multiplier,
      basePenalty,
      multiplier,
      daysOverdue,
      currency: 'E' // Emalangeni
    };
  }

  /**
   * Assess compliance risk
   */
  assessComplianceRisk(requirement, severity) {
    const riskCategories = ['financial', 'operational', 'regulatory'];
    const assessment = {
      overallRisk: severity,
      riskFactors: {},
      mitigationStrategies: []
    };

    riskCategories.forEach(category => {
      const riskMatrix = this.riskMatrix.get(category);
      if (riskMatrix) {
        let categoryRisk = 0;
        riskMatrix.factors.forEach(factor => {
          const factorRisk = this.calculateFactorRisk(factor, severity);
          categoryRisk += factorRisk * factor.weight;
        });
        assessment.riskFactors[category] = Math.round(categoryRisk);
      }
    });

    // Generate mitigation strategies
    assessment.mitigationStrategies = this.generateMitigationStrategies(requirement, assessment);

    return assessment;
  }

  /**
   * Calculate risk factor score
   */
  calculateFactorRisk(factor, severity) {
    const severityScores = {
      'low': 25,
      'medium': 50,
      'high': 75,
      'critical': 100
    };

    const impactScores = {
      'low': 25,
      'medium': 50,
      'high': 75,
      'very_high': 100
    };

    const severityScore = severityScores[severity] || 50;
    const impactScore = impactScores[factor.impact] || 50;

    return (severityScore + impactScore) / 2;
  }

  /**
   * Generate remedial actions
   */
  generateRemedialActions(requirement, violation) {
    const actions = [
      {
        action: 'Immediate Submission',
        description: 'Prepare and submit the overdue compliance document immediately',
        priority: 'critical',
        estimatedDays: 1,
        assignedTo: requirement.assignedTo,
        status: 'pending'
      },
      {
        action: 'Penalty Assessment',
        description: 'Calculate and prepare for potential regulatory penalties',
        priority: 'high',
        estimatedDays: 2,
        assignedTo: 'legal_team',
        status: 'pending'
      }
    ];

    if (violation.daysOverdue > 7) {
      actions.push({
        action: 'Regulatory Communication',
        description: 'Formally communicate with regulatory authority about the delay',
        priority: 'high',
        estimatedDays: 1,
        assignedTo: 'compliance_officer',
        status: 'pending'
      });
    }

    if (violation.daysOverdue > 30) {
      actions.push({
        action: 'Legal Consultation',
        description: 'Consult with legal counsel regarding potential consequences',
        priority: 'critical',
        estimatedDays: 3,
        assignedTo: 'legal_team',
        status: 'pending'
      });
    }

    return actions;
  }

  /**
   * Generate mitigation strategies
   */
  generateMitigationStrategies(requirement, riskAssessment) {
    const strategies = [];

    if (riskAssessment.riskFactors.financial > 70) {
      strategies.push({
        strategy: 'Financial Contingency Planning',
        description: 'Set aside funds to cover potential penalties and increased compliance costs',
        timeline: 'Immediate',
        responsibility: 'Finance Team'
      });
    }

    if (riskAssessment.riskFactors.operational > 70) {
      strategies.push({
        strategy: 'Process Automation',
        description: 'Implement automated compliance monitoring and reporting systems',
        timeline: '30 days',
        responsibility: 'IT Department'
      });
    }

    if (riskAssessment.riskFactors.regulatory > 70) {
      strategies.push({
        strategy: 'Regulatory Engagement',
        description: 'Proactive engagement with regulatory authorities to demonstrate commitment',
        timeline: 'Immediate',
        responsibility: 'Compliance Officer'
      });
    }

    return strategies;
  }

  /**
   * Check due reminders
   */
  checkDueReminders() {
    const now = new Date();
    this.reminders.forEach(reminder => {
      if (reminder.status === 'active') {
        const requirement = this.complianceRequirements.find(r => r.id === reminder.requirementId);
        if (requirement) {
          const dueDate = new Date(requirement.nextDueDate);
          const daysUntilDue = Math.ceil((dueDate - now) / (24 * 60 * 60 * 1000));
          
          // Send escalated reminders
          if (daysUntilDue === 7 || daysUntilDue === 3 || daysUntilDue === 1) {
            this.sendEscalatedReminder(requirement, daysUntilDue);
          }
        }
      }
    });
  }

  /**
   * Send escalated reminder
   */
  sendEscalatedReminder(requirement, daysUntilDue) {
    const urgencyMap = {
      7: 'medium',
      3: 'high',
      1: 'critical'
    };

    const urgency = urgencyMap[daysUntilDue] || 'medium';
    const message = `URGENT: Compliance deadline in ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''}: ${requirement.title}`;

    notificationManager.show(message, urgency === 'critical' ? 'error' : 'warning');

    // Send to supervisor if critical
    if (urgency === 'critical') {
      this.escalateToSupervisor(requirement);
    }
  }

  /**
   * Escalate to supervisor
   */
  escalateToSupervisor(requirement) {
    // In real implementation, this would send to supervisor/manager
    console.log(`Escalating critical compliance issue to supervisor: ${requirement.title}`);
    
    window.dispatchEvent(new CustomEvent('complianceEscalation', {
      detail: { requirement, level: 'supervisor' }
    }));
  }

  /**
   * Update compliance dashboard
   */
  updateComplianceDashboard() {
    const dashboard = {
      totalRequirements: this.complianceRequirements.length,
      compliantCount: this.complianceRequirements.filter(r => r.status === 'compliant').length,
      overdueCount: this.violations.filter(v => v.status === 'active').length,
      upcomingDeadlines: this.getUpcomingDeadlines(),
      complianceRate: 0,
      riskLevel: 'low'
    };

    dashboard.complianceRate = dashboard.totalRequirements > 0 ? 
      Math.round((dashboard.compliantCount / dashboard.totalRequirements) * 100) : 100;

    // Determine risk level
    if (dashboard.overdueCount > 5 || dashboard.complianceRate < 70) {
      dashboard.riskLevel = 'high';
    } else if (dashboard.overdueCount > 2 || dashboard.complianceRate < 85) {
      dashboard.riskLevel = 'medium';
    }

    // Dispatch dashboard update event
    window.dispatchEvent(new CustomEvent('complianceDashboardUpdate', {
      detail: dashboard
    }));

    return dashboard;
  }

  /**
   * Get upcoming deadlines
   */
  getUpcomingDeadlines(days = 30) {
    const now = new Date();
    const futureDate = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));

    return this.complianceRequirements
      .filter(requirement => {
        const dueDate = new Date(requirement.nextDueDate);
        return dueDate >= now && dueDate <= futureDate;
      })
      .map(requirement => ({
        requirement,
        daysUntilDue: Math.ceil((new Date(requirement.nextDueDate) - now) / (24 * 60 * 60 * 1000)),
        urgency: this.calculateUrgency(requirement)
      }))
      .sort((a, b) => a.daysUntilDue - b.daysUntilDue);
  }

  /**
   * Calculate urgency level
   */
  calculateUrgency(requirement) {
    const now = new Date();
    const dueDate = new Date(requirement.nextDueDate);
    const daysUntilDue = Math.ceil((dueDate - now) / (24 * 60 * 60 * 1000));

    if (daysUntilDue <= 3) return 'critical';
    if (daysUntilDue <= 7) return 'high';
    if (daysUntilDue <= 14) return 'medium';
    return 'low';
  }

  /**
   * Calculate next due date
   */
  calculateNextDueDate(frequency, baseDueDate) {
    const now = new Date();
    const base = new Date(baseDueDate);

    switch (frequency) {
      case 'monthly':
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, base.getDate());
        return nextMonth.toISOString();
      
      case 'quarterly':
        const nextQuarter = new Date(now.getFullYear(), now.getMonth() + 3, base.getDate());
        return nextQuarter.toISOString();
      
      case 'annually':
        const nextYear = new Date(now.getFullYear() + 1, base.getMonth(), base.getDate());
        return nextYear.toISOString();
      
      default:
        return baseDueDate;
    }
  }

  /**
   * Create reminder schedule
   */
  createReminderSchedule(requirement) {
    const dueDate = new Date(requirement.nextDueDate);
    const reminderDays = [30, 14, 7, 3, 1]; // Days before due date to send reminders

    reminderDays.forEach(days => {
      const reminderDate = new Date(dueDate.getTime() - (days * 24 * 60 * 60 * 1000));
      if (reminderDate > new Date()) {
        setTimeout(() => {
          this.createDeadlineReminder(requirement, days, this.calculateUrgency({
            nextDueDate: dueDate.toISOString()
          }));
        }, reminderDate.getTime() - Date.now());
      }
    });
  }

  /**
   * Generate compliance report
   */
  generateComplianceReport(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const periodRequirements = this.complianceRequirements.filter(req => {
      const reqDate = new Date(req.createdAt);
      return reqDate >= start && reqDate <= end;
    });

    const periodRecords = this.complianceRecords.filter(rec => {
      const recDate = new Date(rec.submissionDate);
      return recDate >= start && recDate <= end;
    });

    const periodViolations = this.violations.filter(vio => {
      const vioDate = new Date(vio.discoveredAt);
      return vioDate >= start && vioDate <= end;
    });

    return {
      period: { startDate, endDate },
      summary: {
        totalRequirements: periodRequirements.length,
        submittedRecords: periodRecords.length,
        violations: periodViolations.length,
        complianceRate: periodRequirements.length > 0 ? 
          Math.round((periodRecords.length / periodRequirements.length) * 100) : 100
      },
      requirementsByCategory: this.groupByCategory(periodRequirements),
      recordsByStatus: this.groupByStatus(periodRecords),
      violationsBySeverity: this.groupBySeverity(periodViolations),
      trends: this.calculateComplianceTrends(start, end),
      recommendations: this.generateComplianceRecommendations(periodViolations, periodRecords)
    };
  }

  /**
   * Group items by category
   */
  groupByCategory(items) {
    return items.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {});
  }

  /**
   * Group items by status
   */
  groupByStatus(items) {
    return items.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {});
  }

  /**
   * Group items by severity
   */
  groupBySeverity(items) {
    return items.reduce((acc, item) => {
      acc[item.severity] = (acc[item.severity] || 0) + 1;
      return acc;
    }, {});
  }

  /**
   * Calculate compliance trends
   */
  calculateComplianceTrends(startDate, endDate) {
    // This would analyze historical data to show trends
    // For now, returning mock trend data
    return {
      complianceRateChange: '+5%',
      violationTrend: '-12%',
      averageResponseTime: '2.3 days',
      riskLevelChange: 'stable'
    };
  }

  /**
   * Generate compliance recommendations
   */
  generateComplianceRecommendations(violations, records) {
    const recommendations = [];

    if (violations.length > 0) {
      const criticalViolations = violations.filter(v => v.severity === 'critical');
      if (criticalViolations.length > 0) {
        recommendations.push({
          priority: 'high',
          category: 'Risk Management',
          recommendation: 'Implement automated compliance monitoring to prevent critical violations',
          impact: 'High reduction in compliance risk'
        });
      }
    }

    const lowScoreRecords = records.filter(r => r.complianceScore < 70);
    if (lowScoreRecords.length > records.length * 0.2) {
      recommendations.push({
        priority: 'medium',
        category: 'Process Improvement',
        recommendation: 'Enhance compliance training and documentation standards',
        impact: 'Improved submission quality'
      });
    }

    return recommendations;
  }

  /**
   * Generate unique ID
   */
  generateId(prefix) {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  }

  /**
   * Get compliance requirements
   */
  getComplianceRequirements(filters = {}) {
    let requirements = [...this.complianceRequirements];

    if (filters.category) {
      requirements = requirements.filter(r => r.category === filters.category);
    }

    if (filters.status) {
      requirements = requirements.filter(r => r.status === filters.status);
    }

    if (filters.assignedTo) {
      requirements = requirements.filter(r => r.assignedTo === filters.assignedTo);
    }

    return requirements.sort((a, b) => new Date(a.nextDueDate) - new Date(b.nextDueDate));
  }

  /**
   * Get compliance records
   */
  getComplianceRecords(filters = {}) {
    let records = [...this.complianceRecords];

    if (filters.requirementId) {
      records = records.filter(r => r.requirementId === filters.requirementId);
    }

    if (filters.status) {
      records = records.filter(r => r.status === filters.status);
    }

    return records.sort((a, b) => new Date(b.submissionDate) - new Date(a.submissionDate));
  }

  /**
   * Get active violations
   */
  getActiveViolations() {
    return this.violations
      .filter(v => v.status === 'active')
      .sort((a, b) => {
        const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      });
  }
}
