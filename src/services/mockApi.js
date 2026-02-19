// Mock API for frontend development - Demo Data Only
// This will be replaced with real API calls once backend is ready

// Demo users database (in-memory)
const DEMO_USERS = [
  {
    id: 1,
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@demo.com',
    phone: '+1234567890',
    country: 'United States',
    residential_address: '123 Main Street',
    account_number: 'ACC0001234',
    is_verified: true,
    has_deposit: true,
    is_basic: false,
    is_premium: true,
    is_business: false,
    is_prime: true,
    balance: 50000,
    transfer_pin: '1234',
  },
  {
    id: 2,
    first_name: 'Jane',
    last_name: 'Smith',
    email: 'jane@demo.com',
    phone: '+1234567891',
    country: 'United Kingdom',
    residential_address: '456 Oak Avenue',
    account_number: 'ACC0001235',
    is_verified: true,
    has_deposit: true,
    is_basic: true,
    is_premium: false,
    is_business: false,
    is_prime: false,
    balance: 25000,
    transfer_pin: '5678',
  },
  {
    id: 3,
    first_name: 'Admin',
    last_name: 'User',
    email: 'admin@demo.com',
    phone: '+1234567892',
    country: 'Canada',
    residential_address: '789 Pine Road',
    account_number: 'ACC0001236',
    is_verified: true,
    has_deposit: true,
    is_basic: false,
    is_premium: true,
    is_business: true,
    is_prime: true,
    balance: 100000,
    transfer_pin: '9999',
    is_admin: true,
  },
];

// Simulate API delay
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

const mockApi = {
  // Login
  login: async (identifier, password) => {
    await delay();

    // Default demo password for all accounts
    const DEMO_PASSWORD = 'demo123';

    const user = DEMO_USERS.find(
      u =>
        (u.email === identifier ||
          u.phone === identifier ||
          u.account_number === identifier) &&
        password === DEMO_PASSWORD
    );

    if (!user) {
      const error = new Error('Invalid credentials');
      error.response = {
        status: 401,
        data: { detail: 'Invalid email/phone/account number or password' },
      };
      throw error;
    }

    // Mock JWT tokens
    const access = `mock_access_token_${user.id}_${Date.now()}`;
    const refresh = `mock_refresh_token_${user.id}_${Date.now()}`;

    return {
      access,
      refresh,
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone,
        account_number: user.account_number,
        is_verified: user.is_verified,
        is_admin: user.is_admin || false,
      },
    };
  },

  // Get current user
  getCurrentUser: async (token) => {
    await delay(300);

    // Extract user ID from mock token (format: mock_access_token_ID_timestamp)
    const userIdMatch = token.match(/mock_access_token_(\d+)_/);
    if (!userIdMatch) {
      const error = new Error('Invalid token');
      error.response = { status: 401, data: { detail: 'Invalid token' } };
      throw error;
    }

    const userId = parseInt(userIdMatch[1]);
    const user = DEMO_USERS.find(u => u.id === userId);

    if (!user) {
      const error = new Error('User not found');
      error.response = { status: 404, data: { detail: 'User not found' } };
      throw error;
    }

    return {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone: user.phone,
      country: user.country,
      residential_address: user.residential_address,
      account_number: user.account_number,
      balance: user.balance,
      is_verified: user.is_verified,
      is_admin: user.is_admin || false,
      is_prime: user.is_prime,
    };
  },

  // Register new user
  register: async (userData) => {
    await delay(800);

    // Check if email already exists
    if (DEMO_USERS.some(u => u.email === userData.email)) {
      const error = new Error('Email already exists');
      error.response = { status: 400, data: { detail: 'Email already in use' } };
      throw error;
    }

    // Create new user
    const newUser = {
      id: DEMO_USERS.length + 1,
      first_name: userData.first_name,
      last_name: userData.last_name,
      email: userData.email,
      phone: userData.phone,
      country: userData.country,
      residential_address: userData.residential_address,
      account_number: `ACC${String(DEMO_USERS.length + 1).padStart(7, '0')}`,
      is_verified: false, // Email verification required
      has_deposit: false,
      is_basic: true,
      is_premium: false,
      is_business: false,
      is_prime: false,
      balance: 0,
      transfer_pin: '0000',
      is_admin: false,
    };

    DEMO_USERS.push(newUser);

    return {
      id: newUser.id,
      email: newUser.email,
      account_number: newUser.account_number,
      message: 'Registration successful! Please check your email to verify your account.',
    };
  },

  // Refresh token
  refreshToken: async (refreshToken) => {
    await delay(200);

    // Extract user ID from mock token
    const userIdMatch = refreshToken.match(/mock_refresh_token_(\d+)_/);
    if (!userIdMatch) {
      const error = new Error('Invalid refresh token');
      error.response = { status: 401, data: { detail: 'Invalid refresh token' } };
      throw error;
    }

    const userId = parseInt(userIdMatch[1]);
    const user = DEMO_USERS.find(u => u.id === userId);

    if (!user) {
      const error = new Error('User not found');
      error.response = { status: 401, data: { detail: 'User not found' } };
      throw error;
    }

    const access = `mock_access_token_${user.id}_${Date.now()}`;

    return { access };
  },

  // Update user profile
  updateProfile: async (updates) => {
    await delay(400);
    return { ...updates, id: 1 };
  },
};

export default mockApi;
