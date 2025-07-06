const isStrongPassword = (password) => {
  // Minimum 8 characters, at least 1 uppercase, 1 lowercase, 1 number and 1 special character
  const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return strongRegex.test(password);
};

module.exports = isStrongPassword;