// Dummy API using Promises to simulate network requests

export const getDashboardStats = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        totalUsers: 14205,
        newUsersToday: 134,
        revenue: '$84,592',
        revenueGrowth: 12.5,
        activeSessions: 1205, // e.g., online right now
      });
    }, 600);
  });
};

export const getRevenueData = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { name: 'Jan', revenue: 4000 },
        { name: 'Feb', revenue: 3000 },
        { name: 'Mar', revenue: 2000 },
        { name: 'Apr', revenue: 2780 },
        { name: 'May', revenue: 1890 },
        { name: 'Jun', revenue: 2390 },
        { name: 'Jul', revenue: 3490 },
        { name: 'Aug', revenue: 4500 },
        { name: 'Sep', revenue: 5100 },
        { name: 'Oct', revenue: 6200 },
        { name: 'Nov', revenue: 7300 },
        { name: 'Dec', revenue: 8400 },
      ]);
    }, 800);
  });
};

export const getUsers = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: 1, name: 'Alice Smith', email: 'alice@example.com', role: 'Admin', status: 'Active' },
        { id: 2, name: 'Bob Jones', email: 'bob@example.com', role: 'User', status: 'Active' },
        { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', role: 'Editor', status: 'Inactive' },
        { id: 4, name: 'Diana Prince', email: 'diana@example.com', role: 'User', status: 'Active' },
        { id: 5, name: 'Evan Peters', email: 'evan@example.com', role: 'User', status: 'Pending' },
        { id: 6, name: 'Fiona Gallagher', email: 'fiona@example.com', role: 'Admin', status: 'Active' },
        { id: 7, name: 'George Costanza', email: 'george@example.com', role: 'User', status: 'Inactive' },
        { id: 8, name: 'Hannah Abbott', email: 'hannah@example.com', role: 'Editor', status: 'Active' },
        { id: 9, name: 'Ian Malcolm', email: 'ian@example.com', role: 'User', status: 'Active' },
        { id: 10, name: 'Julia Roberts', email: 'julia@example.com', role: 'Admin', status: 'Active' },
      ]);
    }, 500);
  });
};

export const loginUser = async (email, password) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (email === 'admin@demo.com' && password === 'admin') {
        resolve({ token: 'fake-jwt-token-12345', user: { name: 'Admin', email } });
      } else {
        reject(new Error('Invalid email or password'));
      }
    }, 800);
  });
};
