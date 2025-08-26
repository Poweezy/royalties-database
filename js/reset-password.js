import { AuthService } from './services/auth.service.js';
import { NotificationManager } from './modules/NotificationManager.js';

document.addEventListener('DOMContentLoaded', () => {
    const authService = new AuthService();
    const notificationManager = new NotificationManager();
    const resetPasswordForm = document.getElementById('reset-password-form');
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (!token) {
        notificationManager.show('Invalid or missing reset token.', 'error');
        setTimeout(() => {
            window.location.href = 'royalties.html';
        }, 3000);
        return;
    }

    document.getElementById('reset-token').value = token;

    resetPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (newPassword !== confirmPassword) {
            notificationManager.show('Passwords do not match.', 'error');
            return;
        }

        if (newPassword.length < 8) {
            notificationManager.show('Password must be at least 8 characters long.', 'error');
            return;
        }

        const success = await authService.resetPassword(token, newPassword);

        if (success) {
            notificationManager.show('Password has been reset successfully. Redirecting to login...', 'success');
            setTimeout(() => {
                window.location.href = 'royalties.html';
            }, 3000);
        } else {
            notificationManager.show('Invalid or expired reset token.', 'error');
        }
    });
});
