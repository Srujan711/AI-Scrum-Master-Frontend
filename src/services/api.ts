import axios, { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

const API_BASE_URL = '/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth token interceptor
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  signup: async (data: {
    email: string;
    password: string;
    full_name: string;
    company_name?: string;
  }) => {
    const response = await api.post('/auth/signup', data);
    return response.data;
  },

  logout: async () => {
    await api.post('/auth/logout');
    localStorage.removeItem('auth_token');
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  refreshToken: async (refreshToken: string) => {
    const response = await api.post('/auth/refresh-token', { refresh_token: refreshToken });
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token: string, password: string) => {
    const response = await api.post('/auth/reset-password', { token, password });
    return response.data;
  },
};

// Standup API
export const standupApi = {
  generateSummary: async (data: {
    team_id: number;
    sprint_id?: number;
    date?: string;
    manual_input?: Record<string, any>;
  }) => {
    const response = await api.post('/standups/generate', data);
    return response.data;
  },
  
  getStandup: async (standupId: number) => {
    const response = await api.get(`/standups/${standupId}`);
    return response.data;
  },
  
  updateStandup: async (standupId: number, data: {
    summary_text?: string;
    human_approved?: boolean;
    action_items?: any[];
  }) => {
    const response = await api.put(`/standups/${standupId}`, data);
    return response.data;
  },
  
  getTeamStandups: async (teamId: number, limit = 10, offset = 0) => {
    const response = await api.get(`/standups/team/${teamId}`, {
      params: { limit, offset }
    });
    return response.data;
  },

  getRecentStandups: async (teamId: number) => {
    const response = await api.get(`/standups/team/${teamId}/recent`);
    return response.data;
  },
  
  approveStandup: async (standupId: number) => {
    const response = await api.post(`/standups/${standupId}/approve`);
    return response.data;
  },
  
  postToSlack: async (standupId: number) => {
    const response = await api.post(`/standups/${standupId}/post-to-slack`);
    return response.data;
  },
};

// Backlog API
export const backlogApi = {
  getBacklogItems: async (teamId: number) => {
    const response = await api.get(`/backlog/team/${teamId}`);
    return response.data;
  },

  getUnassignedItems: async (teamId: number) => {
    const response = await api.get(`/backlog/team/${teamId}/unassigned`);
    return response.data;
  },

  createItem: async (data: {
    title: string;
    description?: string;
    priority: string;
    team_id: number;
  }) => {
    const response = await api.post('/backlog/items', data);
    return response.data;
  },

  updateItem: async (itemId: number, updates: any) => {
    const response = await api.put(`/backlog/items/${itemId}`, updates);
    return response.data;
  },

  analyzeItems: async (data: {
    team_id: number;
    item_ids?: number[];
    auto_apply_suggestions?: boolean;
  }) => {
    const response = await api.post('/backlog/analyze', data);
    return response.data;
  },
  
  getTeamBacklog: async (
    teamId: number,
    params?: {
      status?: string;
      priority?: string;
      limit?: number;
      offset?: number;
    }
  ) => {
    const response = await api.get(`/backlog/team/${teamId}`, { params });
    return response.data;
  },
  
  applySuggestions: async (itemId: number, suggestions: string[]) => {
    const response = await api.put(`/backlog/${itemId}/apply-suggestions`, {
      suggestions_to_apply: suggestions
    });
    return response.data;
  },
};

// Sprint API
export const sprintApi = {
  getSprints: async (teamId: number) => {
    const response = await api.get(`/sprints/team/${teamId}`);
    return response.data;
  },

  createSprint: async (data: {
    name: string;
    goal?: string;
    start_date: string;
    end_date: string;
    planned_capacity?: number;
    team_id: number;
    status: string;
  }) => {
    const response = await api.post('/sprints', data);
    return response.data;
  },

  addItemsToSprint: async (sprintId: number, itemIds: number[]) => {
    const response = await api.post(`/sprints/${sprintId}/items`, { item_ids: itemIds });
    return response.data;
  },

  startSprint: async (sprintId: number) => {
    const response = await api.post(`/sprints/${sprintId}/start`);
    return response.data;
  },

  planSprint: async (data: {
    team_id: number;
    sprint_name: string;
    start_date: string;
    end_date: string;
    capacity_points?: number;
    suggested_items?: number[];
  }) => {
    const response = await api.post('/sprints/plan', data);
    return response.data;
  },
  
  getSprint: async (sprintId: number) => {
    const response = await api.get(`/sprints/${sprintId}`);
    return response.data;
  },
  
  getTeamSprints: async (
    teamId: number,
    params?: {
      status?: string;
      limit?: number;
      offset?: number;
    }
  ) => {
    const response = await api.get(`/sprints/team/${teamId}`, { params });
    return response.data;
  },
  
  getBurndownData: async (sprintId: number) => {
    const response = await api.get(`/sprints/${sprintId}/burndown`);
    return response.data;
  },
};

// Integration API
export const integrationApi = {
  getIntegrations: async (teamId: number) => {
    const response = await api.get(`/integrations/team/${teamId}`);
    return response.data;
  },

  updateJiraSettings: async (teamId: number, settings: any) => {
    const response = await api.put(`/integrations/team/${teamId}/jira`, settings);
    return response.data;
  },

  updateSlackSettings: async (teamId: number, settings: any) => {
    const response = await api.put(`/integrations/team/${teamId}/slack`, settings);
    return response.data;
  },

  updateGitHubSettings: async (teamId: number, settings: any) => {
    const response = await api.put(`/integrations/team/${teamId}/github`, settings);
    return response.data;
  },

  testConnection: async (teamId: number, integration: string, data: any) => {
    const response = await api.post(`/integrations/team/${teamId}/${integration}/test`, data);
    return response.data;
  },

  getStatus: async () => {
    const response = await api.get('/integrations/status');
    return response.data;
  },
  
  getJiraAuthUrl: async () => {
    const response = await api.get('/integrations/jira/auth-url');
    return response.data;
  },
  
  getSlackAuthUrl: async () => {
    const response = await api.get('/integrations/slack/auth-url');
    return response.data;
  },
  
  disconnectIntegration: async (service: string) => {
    const response = await api.delete(`/integrations/${service}/disconnect`);
    return response.data;
  },
  
  syncIntegration: async (service: string, teamId: number) => {
    const response = await api.post(`/integrations/sync/${service}`, { team_id: teamId });
    return response.data;
  },
};

// Dashboard API
export const dashboardApi = {
  getAIInsights: async (teamId: number) => {
    const response = await api.get(`/dashboard/insights/${teamId}`);
    return response.data;
  },

  getTeamMetrics: async (teamId: number) => {
    const response = await api.get(`/dashboard/metrics/${teamId}`);
    return response.data;
  },
};

// Billing API
export const billingApi = {
  createCheckoutSession: async (data: {
    plan_id: string;
    billing_cycle: 'monthly' | 'yearly';
    success_url: string;
    cancel_url: string;
  }) => {
    const response = await api.post('/billing/create-checkout-session', data);
    return response.data;
  },

  createPortalSession: async (returnUrl: string) => {
    const response = await api.post('/billing/create-portal-session', {
      return_url: returnUrl,
    });
    return response.data;
  },

  getSubscription: async () => {
    const response = await api.get('/billing/subscription');
    return response.data;
  },

  cancelSubscription: async () => {
    const response = await api.post('/billing/cancel-subscription');
    return response.data;
  },

  getInvoices: async () => {
    const response = await api.get('/billing/invoices');
    return response.data;
  },

  getUsage: async () => {
    const response = await api.get('/billing/usage');
    return response.data;
  },
};

export default api;
