//Email validation 
export const validateEmail = (email: string): string | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!email.trim()) return 'Email không được để trống';
    if(!emailRegex.test(email)) return 'Định dạng email không hợp lệ';
    return null;
};

// Password validation
export const validatePassword = (password: string): string | null => {
    if(!password) return 'Mật khẩu không được để trống';
    if(password.length < 6) return 'Mật khẩu phải có ít nhất 6 ký tự';
    if(password.length > 50) return 'Mật khẩu không được quá 50 ký tự';
    // Check for spaces
    if(/\s/.test(password)) return 'Mật khẩu không được chứa khoảng trắng';
    // Check for at least one letter and one number
    if(!/(?=.*[a-zA-Z])(?=.*\d)/.test(password)) return 'Mật khẩu phải chứa ít nhất 1 chữ cái và 1 số';
    return null;
}

// Username validation
export const validateUsername = (username: string): string | null => {
  if (!username.trim()) return 'Tên đăng nhập không được để trống';
  if (username.length < 3) return 'Tên đăng nhập phải có ít nhất 3 ký tự';
  if (username.length > 20) return 'Tên đăng nhập không được quá 20 ký tự';
  if (!/^[a-zA-Z0-9_]+$/.test(username)) return 'Tên đăng nhập chỉ được chứa chữ, số và dấu gạch dưới';
  return null;
};

// Phone validation
export const validatePhone = (phone: string): string | null => {
  if (!phone.trim()) return 'Số điện thoại không được để trống';
  
  // Normalize: remove spaces and dashes
  const normalizedPhone = phone.replace(/\s|-/g, '');
  
  // Validate Vietnamese phone format with exact length check
  const phoneRegex = /^(\+84[3-9]\d{8}|0[3-9]\d{8})$/;
  if (!phoneRegex.test(normalizedPhone)) {
    return 'Số điện thoại không hợp lệ. Định dạng đúng: 0901234567 hoặc +84901234567';
  }
  
  return null;
};

// Full name validation
export const validateFullName = (fullName: string): string | null => {
  if (!fullName.trim()) return 'Họ và tên không được để trống';
  if (fullName.length < 2) return 'Họ và tên phải có ít nhất 2 ký tự';
  if (fullName.length > 50) return 'Họ và tên không được quá 50 ký tự';
  return null;
};

// Address validation
export const validateAddress = (address: string): string | null => {
  if (!address.trim()) return 'Địa chỉ không được để trống';
  if (address.length < 5) return 'Địa chỉ phải có ít nhất 5 ký tự';
  if (address.length > 200) return 'Địa chỉ không được quá 200 ký tự';
  return null;
};

export const validateUsernameOrEmail = (input: string): string | null => {
  if (!input.trim()) return 'Tên đăng nhập hoặc email không được để trống';
  
  // Check if it's email format
  const isEmail = input.includes('@');
  
  if (isEmail) {
    return validateEmail(input);
  } else {
    return validateUsername(input);
  }
};
