/**
 * Login page client logic
 *
 * - waliduje email i hasło po stronie klienta
 * - wysyła POST /api/auth/login z credentials: 'include'
 *   (zakładamy, że backend ustawi httpOnly cookie z JWT)
 * - obsługuje stany ładowania i błędów
 * - po sukcesie przekierowuje na /dashboard.html
 */

(function () {
    'use strict';

    const API_LOGIN_URL = '/api/auth/login';
    const REDIRECT_AFTER_LOGIN = '/dashboard.html';

    const form = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const rememberInput = document.getElementById('remember');
    const submitBtn = document.getElementById('submit-btn');
    const formAlert = document.getElementById('form-alert');
    const togglePasswordBtn = document.getElementById('toggle-password');

    // === Pokazywanie / ukrywanie hasła ===
    togglePasswordBtn.addEventListener('click', () => {
        const isPassword = passwordInput.type === 'password';
        passwordInput.type = isPassword ? 'text' : 'password';
        togglePasswordBtn.setAttribute(
            'aria-label',
            isPassword ? 'Ukryj hasło' : 'Pokaż hasło'
        );
    });

    // === Walidacja ===
    function validateEmail(value) {
        if (!value) return 'Email jest wymagany.';
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!re.test(value)) return 'Wprowadź poprawny adres email.';
        return null;
    }

    function validatePassword(value) {
        if (!value) return 'Hasło jest wymagane.';
        if (value.length < 6) return 'Hasło musi mieć co najmniej 6 znaków.';
        return null;
    }

    function setFieldError(input, message) {
        const target = document.querySelector(
            `[data-error-for="${input.id}"]`
        );
        if (message) {
            input.classList.add('invalid');
            input.setAttribute('aria-invalid', 'true');
            if (target) target.textContent = message;
        } else {
            input.classList.remove('invalid');
            input.removeAttribute('aria-invalid');
            if (target) target.textContent = '';
        }
    }

    // czyści błąd, gdy użytkownik zaczyna pisać
    [emailInput, passwordInput].forEach((input) => {
        input.addEventListener('input', () => setFieldError(input, null));
    });

    // === Komunikaty ===
    function showAlert(message, type = 'error') {
        formAlert.textContent = message;
        formAlert.className = `form-alert ${type}`;
        formAlert.hidden = false;
    }

    function hideAlert() {
        formAlert.hidden = true;
        formAlert.textContent = '';
    }

    // === Stan ładowania ===
    function setLoading(isLoading) {
        if (isLoading) {
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;
        } else {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
    }

    // === Submit ===
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        hideAlert();

        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const remember = rememberInput.checked;

        const emailError = validateEmail(email);
        const passwordError = validatePassword(password);

        setFieldError(emailInput, emailError);
        setFieldError(passwordInput, passwordError);

        if (emailError || passwordError) {
            (emailError ? emailInput : passwordInput).focus();
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(API_LOGIN_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                credentials: 'include', // pozwala backendowi ustawić httpOnly cookie
                body: JSON.stringify({ email, password, remember }),
            });

            // backend może odpowiedzieć JSON-em z polem `message`
            let data = {};
            try {
                data = await response.json();
            } catch (_) {
                /* pusty body lub nie-JSON — ignorujemy */
            }

            if (!response.ok) {
                const message =
                    data.message ||
                    (response.status === 401
                        ? 'Niepoprawny email lub hasło.'
                        : response.status === 429
                        ? 'Za dużo prób. Spróbuj ponownie za chwilę.'
                        : 'Wystąpił błąd. Spróbuj ponownie.');
                showAlert(message, 'error');
                return;
            }

            showAlert('Zalogowano. Przekierowuję…', 'success');
            // krótka pauza, żeby użytkownik zobaczył komunikat
            setTimeout(() => {
                window.location.href = data.redirectTo || REDIRECT_AFTER_LOGIN;
            }, 400);
        } catch (err) {
            showAlert(
                'Brak połączenia z serwerem. Sprawdź internet i spróbuj ponownie.',
                'error'
            );
        } finally {
            setLoading(false);
        }
    });
})();
