export interface User {
    id: number;
    email: string;
    full_name: string;
    is_active: boolean;
    is_scrum_master: boolean;
    is_product_owner: boolean;
    preferences?: Record<string, any>;
    timezone?: string;
    subscription_tier?: string;
    teams?: Array<{
      id: number;
      name: string;
      role: string;
      is_active: boolean;
    }>;
  }
  
  export interface Team {
    id: number;
    name: string;
    description?: string;
    is_active: boolean;
    standup_time: string;
    standup_days: string[];
    sprint_length: number;
    jira_project_key?: string;
    slack_channel_id?: string;
    github_repo?: string;
    ai_enabled: boolean;
    auto_standup: boolean;
    auto_backlog_grooming: boolean;
  }
  
  export interface Sprint {
    id: number;
    name: string;
    goal?: string;
    start_date: string;
    end_date: string;
    status: 'planning' | 'active' | 'completed' | 'cancelled';
    planned_capacity?: number;
    completed_points: number;
    velocity?: number;
    ai_insights: Record<string, any>;
    risk_factors: string[];
    team_id: number;
  }
  
  export interface BacklogItem {
    id: number;
    title: string;
    description?: string;
    status: 'to_do' | 'in_progress' | 'done' | 'blocked';
    priority: 'low' | 'medium' | 'high' | 'critical';
    story_points?: number;
    jira_key?: string;
    ai_suggestions: Record<string, any>;
    clarity_score?: number;
    complexity_estimate?: number;
    similar_items: number[];
    team_id: number;
    sprint_id?: number;
    assigned_to?: number;
  }
  
  export interface StandupSummary {
    id: number;
    date: string;
    summary_text: string;
    completed_yesterday: string[];
    planned_today: string[];
    blockers: string[];
    action_items: Array<{
      description: string;
      assignee?: string;
      priority: string;
      type: string;
      due_date?: string;
    }>;
    ai_generated: boolean;
    human_approved: boolean;
    team_id: number;
    sprint_id?: number;
  }
  
  export interface ApiResponse<T> {
    data: T;
    message?: string;
    errors?: string[];
  }