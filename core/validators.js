module.exports.validateRegisterInput = (username, email, password, confirmPassword) => {
    const errors = {};

    if (username.trim() === '') {
        errors.username = "Nazwa nie może być pusta";
    }

    if (email.trim() === '') {
        errors.email = "Email nie może być pusty";
    } else {
        const regEx = /^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,9})$/;
        if (!email.match(regEx)) {
            errors.email = "Niepoprawny adres e-mail";
        }
    }

    if (password.trim() === '') {
        errors.password = "Hasło nie może być puste"
    } else {
        if (password.trim() !== confirmPassword.trim()) {
            errors.confirmPassword = "Wprowadzone hasła nie są takie same";
        }
    }

    return {
        errors,
        valid: Object.keys(errors).length < 1
    }
};

module.exports.validateLoginInput = (username, password) => {
    const errors = {};
    if (username.trim() === '') {
        errors.username = "Nazwa nie może być pusta";
    }

    if (password.trim() === '') {
        errors.password = "Hasło nie może być puste"
    }

    return {
        errors,
        valid: Object.keys(errors).length < 1
    }
};