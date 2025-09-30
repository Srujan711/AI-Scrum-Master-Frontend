import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Users, Plus, X, ArrowRight, ArrowLeft } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import api from '../../../services/api';

interface Props {
  onNext: (data: { teamId: number; teamName: string }) => void;
  onBack: () => void;
  initialData: any;
}

interface TeamFormData {
  name: string;
  description: string;
  sprint_length: number;
}

interface TeamMember {
  email: string;
  role: 'developer' | 'scrum_master' | 'product_owner';
}

export const CreateTeamStep: React.FC<Props> = ({ onNext, onBack, initialData }) => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState<TeamMember['role']>('developer');

  const { register, handleSubmit, formState: { errors } } = useForm<TeamFormData>({
    defaultValues: {
      name: initialData?.teamName || '',
      description: '',
      sprint_length: 2,
    },
  });

  const createTeamMutation = useMutation({
    mutationFn: async (data: TeamFormData) => {
      const response = await api.post('/teams', data);
      return response.data;
    },
  });

  const addMember = () => {
    if (memberEmail && !members.find(m => m.email === memberEmail)) {
      setMembers([...members, { email: memberEmail, role: memberRole }]);
      setMemberEmail('');
      setMemberRole('developer');
    }
  };

  const removeMember = (email: string) => {
    setMembers(members.filter(m => m.email !== email));
  };

  const onSubmit = async (data: TeamFormData) => {
    try {
      const team = await createTeamMutation.mutateAsync(data);

      // Invite members (if any)
      if (members.length > 0) {
        await Promise.all(
          members.map(member =>
            api.post(`/teams/${team.id}/members`, member)
          )
        );
      }

      onNext({ teamId: team.id, teamName: data.name });
    } catch (error) {
      console.error('Failed to create team:', error);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
          <Users className="w-6 h-6 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Your Team</h2>
        <p className="text-gray-600">Set up your team information and invite members</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Team Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Team Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register('name', { required: 'Team name is required' })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Engineering Team Alpha"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description (optional)
          </label>
          <textarea
            {...register('description')}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Brief description of your team"
          />
        </div>

        {/* Sprint Length */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Default Sprint Length (weeks)
          </label>
          <select
            {...register('sprint_length')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value={1}>1 week</option>
            <option value={2}>2 weeks</option>
            <option value={3}>3 weeks</option>
            <option value={4}>4 weeks</option>
          </select>
        </div>

        {/* Add Team Members */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Team Members (optional)
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="email"
              value={memberEmail}
              onChange={(e) => setMemberEmail(e.target.value)}
              placeholder="team-member@example.com"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <select
              value={memberRole}
              onChange={(e) => setMemberRole(e.target.value as TeamMember['role'])}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="developer">Developer</option>
              <option value="scrum_master">Scrum Master</option>
              <option value="product_owner">Product Owner</option>
            </select>
            <button
              type="button"
              onClick={addMember}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {members.length > 0 && (
            <div className="space-y-2">
              {members.map((member) => (
                <div key={member.email} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{member.email}</p>
                    <p className="text-xs text-gray-500 capitalize">{member.role.replace('_', ' ')}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeMember(member.email)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
          <button
            type="submit"
            disabled={createTeamMutation.isPending}
            className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {createTeamMutation.isPending ? 'Creating...' : 'Continue'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </form>
    </div>
  );
};