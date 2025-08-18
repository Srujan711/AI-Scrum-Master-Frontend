import { create } from 'zustand';
import { Team, Sprint, BacklogItem } from '../types';

interface TeamState {
  currentTeam: Team | null;
  currentSprint: Sprint | null;
  backlogItems: BacklogItem[];
  
  setCurrentTeam: (team: Team) => void;
  setCurrentSprint: (sprint: Sprint | null) => void;
  setBacklogItems: (items: BacklogItem[]) => void;
  updateBacklogItem: (itemId: number, updates: Partial<BacklogItem>) => void;
}

export const useTeamStore = create<TeamState>((set, get) => ({
  currentTeam: null,
  currentSprint: null,
  backlogItems: [],
  
  setCurrentTeam: (team: Team) => {
    set({ currentTeam: team });
  },
  
  setCurrentSprint: (sprint: Sprint | null) => {
    set({ currentSprint: sprint });
  },
  
  setBacklogItems: (items: BacklogItem[]) => {
    set({ backlogItems: items });
  },
  
  updateBacklogItem: (itemId: number, updates: Partial<BacklogItem>) => {
    const { backlogItems } = get();
    const updatedItems = backlogItems.map(item =>
      item.id === itemId ? { ...item, ...updates } : item
    );
    set({ backlogItems: updatedItems });
  },
}));