import { security } from "./utils/security.js";

document.addEventListener("DOMContentLoaded", () => {
  const addUserForm = document.getElementById("add-user-form");
  if (addUserForm) {
    const createUserBtn = document.getElementById("create-user-btn");
    const requiredFields = [
      "new-username",
      "new-email",
      "new-role",
      "new-department",
      "new-password",
      "confirm-password",
    ];

    const validateForm = () => {
      const isEditMode = createUserBtn.innerHTML.includes("Update");

      let allValid = true;
      const fieldsToValidate = isEditMode
        ? ["new-username", "new-email", "new-role", "new-department"]
        : requiredFields;

      for (const fieldId of fieldsToValidate) {
        const field = document.getElementById(fieldId);
        if (!field || !field.value) {
          allValid = false;
          break;
        }
      }

      if (!isEditMode) {
        const password = document.getElementById("new-password").value;
        const confirmPassword =
          document.getElementById("confirm-password").value;

        const passwordValidation = security.validatePassword(password);

        if (password !== confirmPassword || !passwordValidation.isValid) {
          allValid = false;
        }
      }

      createUserBtn.disabled = !allValid;
    };

    requiredFields.forEach((fieldId) => {
      document.getElementById(fieldId)?.addEventListener("input", validateForm);
    });
  }
});
