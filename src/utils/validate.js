/*
/!**
 * @param {string} path
 * @returns {Boolean}
 *!/
export function isExternal(path) {
  return /^(https?:|mailto:|tel:)/.test(path)
}

/!**
 * @param {string} str
 * @returns {Boolean}
 *!/
export function validUsername(str) {
  const valid_map = ['admin', 'editor']
  return valid_map.indexOf(str.trim()) >= 0
}
*/

/**
 * @param {string} path
 * @returns {Boolean}
 */
export function isExternal(path) {
  return /^(https?:|mailto:|tel:)/.test(path)
}

/**
 * @param {string} str
 * @returns {Boolean}
 */
export function validUsername(str) {
  // Remove whitespace and check if username is not empty
  return str.trim().length > 0
}

export function validatePassword(password) {
  const minLength = 6;
  return {
    isValid: password.length >= minLength,
    message: password.length >= minLength ? '密码格式正确' : `密码长度至少${minLength}个字符`
  };
}

export function validatePasswordMatch(password, confirmPassword) {
  return password === confirmPassword;
}
