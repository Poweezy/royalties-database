/**
 * Royalty Validation Service
 * Comprehensive validation for royalty records
 */

class RoyaltyValidationService {
  constructor() {
    this.businessRules = {
      volume: {
        min: 0.01,
        max: 1000000,
        precision: 2,
      },
      tariff: {
        min: 0.01,
        max: 10000,
        precision: 2,
      },
      payment: {
        min: 0.01,
        max: 100000000,
        precision: 2,
      },
    };

    this.mineralLimits = {
      Coal: { minVolume: 1, maxVolume: 100000, minTariff: 10, maxTariff: 100 },
      "Iron Ore": {
        minVolume: 1,
        maxVolume: 50000,
        minTariff: 20,
        maxTariff: 200,
      },
      Gold: {
        minVolume: 0.01,
        maxVolume: 1000,
        minTariff: 1000,
        maxTariff: 50000,
      },
      Diamond: {
        minVolume: 0.001,
        maxVolume: 100,
        minTariff: 5000,
        maxTariff: 100000,
      },
      "Quarried Stone": {
        minVolume: 1,
        maxVolume: 200000,
        minTariff: 5,
        maxTariff: 50,
      },
      Gravel: { minVolume: 1, maxVolume: 150000, minTariff: 5, maxTariff: 40 },
      Sand: { minVolume: 1, maxVolume: 200000, minTariff: 3, maxTariff: 30 },
      Limestone: {
        minVolume: 1,
        maxVolume: 100000,
        minTariff: 8,
        maxTariff: 60,
      },
    };
  }

  /**
   * Validate complete royalty record
   */
  validateRoyaltyRecord(record) {
    const errors = [];
    const warnings = [];

    // Required field validation
    const requiredFields = [
      "entity",
      "mineral",
      "volume",
      "tariff",
      "paymentDate",
    ];
    requiredFields.forEach((field) => {
      if (!record[field] && record[field] !== 0) {
        errors.push(`${field} is required`);
      }
    });

    if (errors.length > 0) {
      return { isValid: false, errors, warnings };
    }

    // Individual field validation
    const entityValidation = this.validateEntity(record.entity);
    const mineralValidation = this.validateMineral(record.mineral);
    const volumeValidation = this.validateVolume(record.volume, record.mineral);
    const tariffValidation = this.validateTariff(record.tariff, record.mineral);
    const dateValidation = this.validatePaymentDate(record.paymentDate);

    // Collect all errors and warnings
    [
      entityValidation,
      mineralValidation,
      volumeValidation,
      tariffValidation,
      dateValidation,
    ].forEach((validation) => {
      if (validation.errors) errors.push(...validation.errors);
      if (validation.warnings) warnings.push(...validation.warnings);
    });

    // Business rule validations
    const businessRuleValidation = this.validateBusinessRules(record);
    if (businessRuleValidation.errors)
      errors.push(...businessRuleValidation.errors);
    if (businessRuleValidation.warnings)
      warnings.push(...businessRuleValidation.warnings);

    // Cross-field validation
    const crossFieldValidation = this.validateCrossFields(record);
    if (crossFieldValidation.errors)
      errors.push(...crossFieldValidation.errors);
    if (crossFieldValidation.warnings)
      warnings.push(...crossFieldValidation.warnings);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      severity:
        errors.length > 0
          ? "error"
          : warnings.length > 0
            ? "warning"
            : "success",
    };
  }

  /**
   * Validate entity name
   */
  validateEntity(entity) {
    const errors = [];
    const warnings = [];

    if (!entity || typeof entity !== "string") {
      errors.push("Entity name must be a valid string");
      return { errors, warnings };
    }

    if (entity.length < 2) {
      errors.push("Entity name must be at least 2 characters long");
    }

    if (entity.length > 100) {
      errors.push("Entity name cannot exceed 100 characters");
    }

    // Check for valid entity format
    if (!/^[a-zA-Z0-9\s\-&.'(),]+$/.test(entity)) {
      errors.push("Entity name contains invalid characters");
    }

    // Known entities validation
    const knownEntities = [
      "Kwalini Quarry",
      "Maloma Colliery",
      "Mbabane Quarry",
      "Ngwenya Mine",
      "Sidvokodvo Quarry",
      "Piggs Peak Quarry",
      "Matsapha Stone",
      "Havelock Mine",
    ];

    if (
      !knownEntities.some(
        (known) =>
          known.toLowerCase().includes(entity.toLowerCase()) ||
          entity.toLowerCase().includes(known.toLowerCase()),
      )
    ) {
      warnings.push("Entity not found in registered mining entities");
    }

    return { errors, warnings };
  }

  /**
   * Validate mineral type
   */
  validateMineral(mineral) {
    const errors = [];
    const warnings = [];

    if (!mineral || typeof mineral !== "string") {
      errors.push("Mineral type must be specified");
      return { errors, warnings };
    }

    const validMinerals = Object.keys(this.mineralLimits);
    if (!validMinerals.includes(mineral)) {
      warnings.push(
        `Mineral type '${mineral}' is not in the standard list. Valid types: ${validMinerals.join(", ")}`,
      );
    }

    return { errors, warnings };
  }

  /**
   * Validate volume with mineral-specific limits
   */
  validateVolume(volume, mineral) {
    const errors = [];
    const warnings = [];

    // Basic volume validation
    if (volume === undefined || volume === null) {
      errors.push("Volume is required");
      return { errors, warnings };
    }

    const numericVolume = parseFloat(volume);
    if (isNaN(numericVolume)) {
      errors.push("Volume must be a valid number");
      return { errors, warnings };
    }

    if (numericVolume <= 0) {
      errors.push("Volume must be greater than 0");
    }

    if (numericVolume > this.businessRules.volume.max) {
      errors.push(
        `Volume cannot exceed ${this.businessRules.volume.max.toLocaleString()}`,
      );
    }

    // Mineral-specific validation
    if (mineral && this.mineralLimits[mineral]) {
      const limits = this.mineralLimits[mineral];

      if (numericVolume < limits.minVolume) {
        warnings.push(
          `Volume ${numericVolume} is below typical minimum for ${mineral} (${limits.minVolume})`,
        );
      }

      if (numericVolume > limits.maxVolume) {
        warnings.push(
          `Volume ${numericVolume} is above typical maximum for ${mineral} (${limits.maxVolume})`,
        );
      }
    }

    // Precision validation
    const decimalPlaces = (numericVolume.toString().split(".")[1] || "").length;
    if (decimalPlaces > this.businessRules.volume.precision) {
      warnings.push(
        `Volume has more than ${this.businessRules.volume.precision} decimal places`,
      );
    }

    return { errors, warnings };
  }

  /**
   * Validate tariff with mineral-specific ranges
   */
  validateTariff(tariff, mineral) {
    const errors = [];
    const warnings = [];

    if (tariff === undefined || tariff === null) {
      errors.push("Tariff is required");
      return { errors, warnings };
    }

    const numericTariff = parseFloat(tariff);
    if (isNaN(numericTariff)) {
      errors.push("Tariff must be a valid number");
      return { errors, warnings };
    }

    if (numericTariff <= 0) {
      errors.push("Tariff must be greater than 0");
    }

    if (numericTariff > this.businessRules.tariff.max) {
      errors.push(
        `Tariff cannot exceed E${this.businessRules.tariff.max.toLocaleString()}`,
      );
    }

    // Mineral-specific validation
    if (mineral && this.mineralLimits[mineral]) {
      const limits = this.mineralLimits[mineral];

      if (numericTariff < limits.minTariff) {
        warnings.push(
          `Tariff E${numericTariff} is below typical range for ${mineral} (E${limits.minTariff} - E${limits.maxTariff})`,
        );
      }

      if (numericTariff > limits.maxTariff) {
        warnings.push(
          `Tariff E${numericTariff} is above typical range for ${mineral} (E${limits.minTariff} - E${limits.maxTariff})`,
        );
      }
    }

    return { errors, warnings };
  }

  /**
   * Validate payment date
   */
  validatePaymentDate(paymentDate) {
    const errors = [];
    const warnings = [];

    if (!paymentDate) {
      errors.push("Payment date is required");
      return { errors, warnings };
    }

    const date = new Date(paymentDate);
    if (isNaN(date.getTime())) {
      errors.push("Payment date must be a valid date");
      return { errors, warnings };
    }

    const today = new Date();
    const oneYearAgo = new Date(
      today.getFullYear() - 1,
      today.getMonth(),
      today.getDate(),
    );
    const oneYearFromNow = new Date(
      today.getFullYear() + 1,
      today.getMonth(),
      today.getDate(),
    );

    if (date < oneYearAgo) {
      warnings.push("Payment date is more than one year in the past");
    }

    if (date > oneYearFromNow) {
      warnings.push("Payment date is more than one year in the future");
    }

    if (date > today) {
      warnings.push("Payment date is in the future");
    }

    return { errors, warnings };
  }

  /**
   * Validate business rules
   */
  validateBusinessRules(record) {
    const errors = [];
    const warnings = [];

    // Calculate expected royalty payment
    if (record.volume && record.tariff) {
      const expectedPayment =
        parseFloat(record.volume) * parseFloat(record.tariff);
      const actualPayment = parseFloat(
        record.royaltyPayment || expectedPayment,
      );
      const difference = Math.abs(expectedPayment - actualPayment);
      const tolerance = expectedPayment * 0.01; // 1% tolerance

      if (difference > tolerance) {
        warnings.push(
          `Royalty payment E${actualPayment.toFixed(2)} differs from calculated amount E${expectedPayment.toFixed(2)}`,
        );
      }
    }

    // Status validation
    if (record.status) {
      const validStatuses = [
        "Draft",
        "Pending",
        "Paid",
        "Overdue",
        "Disputed",
        "Cancelled",
      ];
      if (!validStatuses.includes(record.status)) {
        errors.push(
          `Invalid status '${record.status}'. Valid options: ${validStatuses.join(", ")}`,
        );
      }

      // Date vs status consistency
      if (record.paymentDate && record.status) {
        const paymentDate = new Date(record.paymentDate);
        const today = new Date();

        if (record.status === "Paid" && paymentDate > today) {
          warnings.push('Status is "Paid" but payment date is in the future');
        }

        if (record.status === "Overdue" && paymentDate >= today) {
          warnings.push('Status is "Overdue" but payment date is not past due');
        }
      }
    }

    return { errors, warnings };
  }

  /**
   * Cross-field validation
   */
  validateCrossFields(record) {
    const errors = [];
    const warnings = [];

    // Entity-mineral combination validation
    const validCombinations = {
      "Kwalini Quarry": ["Quarried Stone", "Gravel"],
      "Maloma Colliery": ["Coal"],
      "Mbabane Quarry": ["Gravel", "Sand"],
      "Ngwenya Mine": ["Iron Ore"],
      "Sidvokodvo Quarry": ["Gravel", "Sand"],
      "Piggs Peak Quarry": ["Quarried Stone"],
      "Matsapha Stone": ["Quarried Stone", "Gravel"],
      "Havelock Mine": ["Gold"],
    };

    if (record.entity && record.mineral && validCombinations[record.entity]) {
      if (!validCombinations[record.entity].includes(record.mineral)) {
        warnings.push(
          `${record.entity} typically processes ${validCombinations[record.entity].join(" or ")}, not ${record.mineral}`,
        );
      }
    }

    // Volume-tariff relationship validation
    if (record.volume && record.tariff && record.mineral) {
      const volume = parseFloat(record.volume);
      const tariff = parseFloat(record.tariff);

      // High volume should typically have lower per-unit rates
      if (volume > 10000 && tariff > 50) {
        warnings.push(
          "High volume orders typically qualify for reduced tariff rates",
        );
      }

      // Small volume with very low tariff might be suspicious
      if (volume < 10 && tariff < 5) {
        warnings.push(
          "Very small volume with very low tariff - please verify amounts",
        );
      }
    }

    return { errors, warnings };
  }

  /**
   * Validate against contract terms
   */
  async validateAgainstContract(record, contracts) {
    const errors = [];
    const warnings = [];

    if (!contracts || !Array.isArray(contracts)) {
      return { errors, warnings };
    }

    const matchingContract = contracts.find(
      (contract) =>
        contract.entity === record.entity &&
        contract.mineral === record.mineral,
    );

    if (!matchingContract) {
      warnings.push(
        `No active contract found for ${record.entity} - ${record.mineral}`,
      );
      return { errors, warnings };
    }

    // Contract date validation
    if (matchingContract.startDate) {
      const contractStart = new Date(matchingContract.startDate);
      const paymentDate = new Date(record.paymentDate);

      if (paymentDate < contractStart) {
        errors.push(
          `Payment date is before contract start date (${matchingContract.startDate})`,
        );
      }
    }

    if (matchingContract.endDate) {
      const contractEnd = new Date(matchingContract.endDate);
      const paymentDate = new Date(record.paymentDate);

      if (paymentDate > contractEnd) {
        errors.push(
          `Payment date is after contract end date (${matchingContract.endDate})`,
        );
      }
    }

    // Validate calculation method matches
    if (
      matchingContract.calculationType === "fixed" &&
      matchingContract.calculationParams.rate &&
      record.tariff !== matchingContract.calculationParams.rate
    ) {
      warnings.push(
        `Tariff E${record.tariff} differs from contract rate E${matchingContract.calculationParams.rate}`,
      );
    }

    return { errors, warnings };
  }

  /**
   * Get validation summary
   */
  getValidationSummary(validationResult) {
    const { isValid, errors, warnings } = validationResult;

    let summary = "";
    let cssClass = "";

    if (!isValid) {
      summary = `${errors.length} error${errors.length > 1 ? "s" : ""} found`;
      cssClass = "validation-error";
    } else if (warnings.length > 0) {
      summary = `${warnings.length} warning${warnings.length > 1 ? "s" : ""} found`;
      cssClass = "validation-warning";
    } else {
      summary = "All validations passed";
      cssClass = "validation-success";
    }

    return { summary, cssClass };
  }

  /**
   * Format validation messages for display
   */
  formatValidationMessages(validationResult) {
    const { errors, warnings } = validationResult;
    let html = "";

    if (errors.length > 0) {
      html += '<div class="validation-errors">';
      html += '<h4><i class="fas fa-exclamation-triangle"></i> Errors:</h4>';
      html += "<ul>";
      errors.forEach((error) => {
        html += `<li class="error-message">${error}</li>`;
      });
      html += "</ul></div>";
    }

    if (warnings.length > 0) {
      html += '<div class="validation-warnings">';
      html += '<h4><i class="fas fa-exclamation-circle"></i> Warnings:</h4>';
      html += "<ul>";
      warnings.forEach((warning) => {
        html += `<li class="warning-message">${warning}</li>`;
      });
      html += "</ul></div>";
    }

    return html;
  }
}

export const royaltyValidationService = new RoyaltyValidationService();
