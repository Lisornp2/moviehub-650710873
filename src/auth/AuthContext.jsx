
import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

const TOKEN_KEY = 'gamekey_token';
const MEMBER_KEY = 'gamekey_member';
const USERS_KEY = 'gamekey_users';
const ACCOUNT_KEY = 'gamekey_account_overrides';

const demoUser = {
  id: 1,
  email: 'demo@moviehub.test',
  password: '1234',
  displayName: 'Demo User',
  role: 'member'
};

const adminUser = {
  id: 0,
  email: 'admin@gamekey.test',
  password: 'admin123',
  displayName: 'Admin',
  role: 'admin'
};

function getAccountOverrides() {
  return JSON.parse(localStorage.getItem(ACCOUNT_KEY) || '{}');
}

function getAllUsers() {
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  const overrides = getAccountOverrides();

  const updatedDemo = { ...demoUser, ...overrides.demo };
  const updatedAdmin = { ...adminUser, ...overrides.admin };

  return [updatedDemo, updatedAdmin, ...users];
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(
    () => localStorage.getItem(TOKEN_KEY)
  );

  const [member, setMember] = useState(
    () => JSON.parse(localStorage.getItem(MEMBER_KEY) || 'null')
  );

  const [isGuest, setIsGuest] = useState(false);

  function remember(user) {
    const newToken = 'mock-token-' + user.id;

    const memberData = {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role
    };

    setToken(newToken);
    setMember(memberData);
    setIsGuest(false);

    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(MEMBER_KEY, JSON.stringify(memberData));
  }

  async function login(email, password) {
    const allUsers = getAllUsers();

    const user = allUsers.find(
      (item) =>
        item.email.toLowerCase() === email.toLowerCase() &&
        item.password === password
    );

    if (!user) {
      throw new Error('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    }

    remember(user);
  }

  async function register(email, password, displayName) {
    const users = JSON.parse(
      localStorage.getItem(USERS_KEY) || '[]'
    );

    const allUsers = getAllUsers();

    const emailExists = allUsers.some(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );

    if (emailExists) {
      throw new Error('อีเมลนี้ถูกใช้งานแล้ว');
    }

    const newUser = {
      id: Date.now(),
      email,
      password,
      displayName,
      role: 'member'
    };

    users.push(newUser);

    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    remember(newUser);
  }

  function updateProfile(displayName, email, newPassword) {
    if (!member) {
      throw new Error('กรุณาเข้าสู่ระบบก่อน');
    }

    const allUsers = getAllUsers();

    const emailExists = allUsers.some(
      (user) =>
        user.email.toLowerCase() === email.toLowerCase() &&
        String(user.id) !== String(member.id)
    );

    if (emailExists) {
      throw new Error('อีเมลนี้ถูกใช้งานแล้ว');
    }

    const currentUser = allUsers.find(
      (user) => String(user.id) === String(member.id)
    );

    if (!currentUser) {
      throw new Error('ไม่พบบัญชีผู้ใช้');
    }

    const updatedUser = {
      ...currentUser,
      displayName,
      email,
      password: newPassword || currentUser.password
    };

    if (member.id === demoUser.id && member.role === 'member') {
      const overrides = getAccountOverrides();

      overrides.demo = {
        displayName: updatedUser.displayName,
        email: updatedUser.email,
        password: updatedUser.password
      };

      localStorage.setItem(ACCOUNT_KEY, JSON.stringify(overrides));
    } else if (member.id === adminUser.id && member.role === 'admin') {
      const overrides = getAccountOverrides();

      overrides.admin = {
        displayName: updatedUser.displayName,
        email: updatedUser.email,
        password: updatedUser.password
      };

      localStorage.setItem(ACCOUNT_KEY, JSON.stringify(overrides));
    } else {
      const users = JSON.parse(
        localStorage.getItem(USERS_KEY) || '[]'
      );

      const updatedUsers = users.map((user) =>
        String(user.id) === String(member.id) ? updatedUser : user
      );

      localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
    }

    remember(updatedUser);

    return true;
  }

  function loginAsGuest() {
    setToken(null);
    setMember(null);
    setIsGuest(true);

    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(MEMBER_KEY);
  }

  function logout() {
    setToken(null);
    setMember(null);
    setIsGuest(false);

    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(MEMBER_KEY);
  }

  const isAdmin = member?.role === 'admin';

  const value = {
    token,
    member,
    isGuest,
    isLoggedIn: Boolean(token),
    isAdmin,
    login,
    register,
    updateProfile,
    loginAsGuest,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
