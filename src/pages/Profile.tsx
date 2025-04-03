import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

export default function Profile() {
  const { user, profile, updateProfile } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    university: profile?.university || '',
    linkedin_url: profile?.linkedin_url || '',
    bio: profile?.bio || '',
    location: profile?.location || '',
    skills: (profile?.skills || []).join(', '),
    interests: (profile?.interests || []).join(', '),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const updatedProfile = {
        ...formData,
        skills: formData.skills.split(',').map(skill => skill.trim()),
        interests: formData.interests.split(',').map(interest => interest.trim()),
      };

      await updateProfile(updatedProfile);
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (!user) {
    return <div>Please log in to view your profile</div>;
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Profile Information</h3>
          <form onSubmit={handleSubmit} className="mt-5 space-y-6">
            <div>
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="university">University</Label>
              <Input
                id="university"
                name="university"
                value={formData.university}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="linkedin_url">LinkedIn URL</Label>
              <Input
                id="linkedin_url"
                name="linkedin_url"
                type="url"
                value={formData.linkedin_url}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                disabled={isLoading}
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="skills">Skills (comma-separated)</Label>
              <Input
                id="skills"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="interests">Interests (comma-separated)</Label>
              <Input
                id="interests"
                name="interests"
                value={formData.interests}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <div>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 