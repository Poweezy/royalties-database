import { ErrorHandler } from "../utils/error-handler.js";

export class PasswordPolicyManager {
  constructor(userManager) {
    this.userManager = userManager;
    this.policyList = document.getElementById("password-policy-list");
    this.policyEditorForm = document.getElementById("policy-editor-form");
    this.policyIdField = document.getElementById("policy-id");
    this.policyNameField = document.getElementById("policy-name");
    this.policyMinLengthField = document.getElementById("policy-minLength");
    this.policyMaxAgeField = document.getElementById("policy-maxAge");
    this.policyPreventReuseField = document.getElementById("policy-preventReuse");
    this.policyRequireUppercaseField = document.getElementById("policy-requireUppercase");
    this.policyRequireLowercaseField = document.getElementById("policy-requireLowercase");
    this.policyRequireNumbersField = document.getElementById("policy-requireNumbers");
    this.policyRequireSymbolsField = document.getElementById("policy-requireSymbols");
    this.newPolicyBtn = document.getElementById("new-policy-btn");
    this.deletePolicyBtn = document.getElementById("delete-policy-btn");
    this.selectedPolicy = null;
  }

  async init() {
    this.renderPolicyList();
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.policyList.addEventListener("click", (e) => {
      if (e.target.tagName === "LI") {
        const policyName = e.target.dataset.policyName;
        this.selectPolicy(policyName);
      }
    });

    this.newPolicyBtn.addEventListener("click", () => {
      this.selectPolicy(null);
    });

    this.policyEditorForm.addEventListener("submit", (e) => {
      e.preventDefault();
      this.savePolicy();
    });

    this.deletePolicyBtn.addEventListener("click", () => {
      if (this.selectedPolicy) {
        this.deletePolicy(this.selectedPolicy.id);
      }
    });
  }

  renderPolicyList() {
    const policies = this.userManager.getPasswordPolicies();
    this.policyList.innerHTML = "";
    policies.forEach((policy) => {
      const li = document.createElement("li");
      li.textContent = policy.name;
      li.dataset.policyName = policy.name;
      if (this.selectedPolicy && this.selectedPolicy.name === policy.name) {
        li.classList.add("active");
      }
      this.policyList.appendChild(li);
    });
  }

  selectPolicy(policyName) {
    if (policyName) {
      this.selectedPolicy = this.userManager.getPasswordPolicies().get(policyName);
      this.populateForm(this.selectedPolicy);
      this.deletePolicyBtn.style.display = "inline-block";
    } else {
      this.selectedPolicy = null;
      this.policyEditorForm.reset();
      this.policyIdField.value = "";
      this.deletePolicyBtn.style.display = "none";
    }
    this.renderPolicyList();
  }

  populateForm(policy) {
    this.policyIdField.value = policy.id;
    this.policyNameField.value = policy.name;
    this.policyMinLengthField.value = policy.minLength;
    this.policyMaxAgeField.value = policy.maxAge;
    this.policyPreventReuseField.value = policy.preventReuse;
    this.policyRequireUppercaseField.checked = policy.requireUppercase;
    this.policyRequireLowercaseField.checked = policy.requireLowercase;
    this.policyRequireNumbersField.checked = policy.requireNumbers;
    this.policyRequireSymbolsField.checked = policy.requireSymbols;
  }

  async savePolicy() {
    const policy = {
      id: this.policyIdField.value ? parseInt(this.policyIdField.value) : null,
      name: this.policyNameField.value,
      minLength: parseInt(this.policyMinLengthField.value),
      maxAge: parseInt(this.policyMaxAgeField.value),
      preventReuse: parseInt(this.policyPreventReuseField.value),
      requireUppercase: this.policyRequireUppercaseField.checked,
      requireLowercase: this.policyRequireLowercaseField.checked,
      requireNumbers: this.policyRequireNumbersField.checked,
      requireSymbols: this.policyRequireSymbolsField.checked,
    };

    try {
      const savedPolicy = await this.userManager.savePasswordPolicy(policy);
      this.selectPolicy(savedPolicy.name);
      this.userManager.showNotification("Password policy saved successfully.", "success");
    } catch (error) {
      this.userManager.showNotification("Failed to save password policy.", "error");
    }
  }

  async deletePolicy(policyId) {
    if (confirm("Are you sure you want to delete this policy?")) {
      try {
        await this.userManager.deletePasswordPolicy(policyId);
        this.selectPolicy(null);
        this.userManager.showNotification("Password policy deleted successfully.", "success");
      } catch (error) {
        this.userManager.showNotification("Failed to delete password policy.", "error");
      }
    }
  }
}
