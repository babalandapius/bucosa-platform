import axiosInstance from './axiosInstance';

export const loginUser = async ({ identifier, username, email, password, role = 'student' }) => {
  const normalizedRole = String(role || 'student').toLowerCase();
  const providedIdentifier = identifier || username || email || '';

  const endpoint = normalizedRole === 'admin' ? '/auth/admin/login' : '/auth/student/login';
  const payload =
    normalizedRole === 'admin'
      ? { username: providedIdentifier || username || email || '', password }
      : { email: providedIdentifier || email || username || '', password };

  const response = await axiosInstance.post(endpoint, payload);

  if (response?.data?.token) {
    localStorage.setItem('jwt_token', response.data.token);
  }

  return response.data;
};

export const getUserProfile = async () => {
  const response = await axiosInstance.get('/auth/me');
  return response.data;
};

export const submitMembershipApplication = async (application, submittedByStaff = false) => {
  const endpoint = submittedByStaff ? '/auth/admin/applications' : '/auth/student/signup';
  const response = await axiosInstance.post(endpoint, application);
  return response.data;
};

export const getMembershipApplicationStatus = async (activationCode) => {
  const response = await axiosInstance.post('/auth/student/application-status', { activationCode });
  return response.data;
};

export const completeStudentRegistration = async (activationCode, password) => {
  const response = await axiosInstance.post('/auth/student/complete-registration', {
    activationCode,
    password,
  });
  return response.data;
};

export const getPendingMembershipApplications = async () => {
  const response = await axiosInstance.get('/auth/admin/applications');
  return response.data;
};

export const reviewMembershipApplication = async (applicationId, decision) => {
  const response = await axiosInstance.patch(`/auth/admin/applications/${applicationId}`, { decision });
  return response.data;
};

export const logoutUser = () => {
  localStorage.removeItem('jwt_token');
};