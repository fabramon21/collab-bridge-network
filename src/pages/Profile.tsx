
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Save } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
    address: profile?.address || '',
    skills: (profile?.skills || []).join(', '),
    interests: (profile?.interests || []).join(', '),
  });

  useEffect(() => {
    // Update form data when profile changes
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        university: profile.university || '',
        linkedin_url: profile.linkedin_url || '',
        bio: profile.bio || '',
        location: profile.location || '',
        address: profile.address || '',
        skills: (profile.skills || []).join(', '),
        interests: (profile.interests || []).join(', '),
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const updatedProfile = {
        ...formData,
        skills: formData.skills.split(',').map(skill => skill.trim()).filter(Boolean),
        interests: formData.interests.split(',').map(interest => interest.trim()).filter(Boolean),
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
    return <div className="container mx-auto py-8 px-4">Please log in to view your profile</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Profile</h1>
        
        <Tabs defaultValue="personal">
          <TabsList className="mb-8">
            <TabsTrigger value="personal">Personal Information</TabsTrigger>
            <TabsTrigger value="education">Education & Skills</TabsTrigger>
            <TabsTrigger value="professional">Professional</TabsTrigger>
          </TabsList>
          
          <form onSubmit={handleSubmit}>
            <TabsContent value="personal">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Update your personal details and contact information.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex justify-center mb-6">
                    <Avatar className="h-24 w-24">
                      <AvatarImage 
                        src={profile?.profile_image_url || `https://avatar.vercel.sh/${profile?.full_name}`} 
                        alt={profile?.full_name || 'Profile'} 
                      />
                      <AvatarFallback className="text-2xl">
                        {profile?.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      disabled={isLoading}
                      placeholder="City, Country"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      disabled={isLoading}
                      placeholder="Your full address"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      disabled={isLoading}
                      rows={4}
                      placeholder="Tell us a bit about yourself"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="education">
              <Card>
                <CardHeader>
                  <CardTitle>Education & Skills</CardTitle>
                  <CardDescription>
                    Update your education background and skills.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-2">
                    <Label htmlFor="university">University</Label>
                    <Input
                      id="university"
                      name="university"
                      value={formData.university}
                      onChange={handleChange}
                      disabled={isLoading}
                      placeholder="University name"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="skills">Skills (comma-separated)</Label>
                    <Input
                      id="skills"
                      name="skills"
                      value={formData.skills}
                      onChange={handleChange}
                      disabled={isLoading}
                      placeholder="React, TypeScript, Node.js, etc."
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="interests">Interests (comma-separated)</Label>
                    <Input
                      id="interests"
                      name="interests"
                      value={formData.interests}
                      onChange={handleChange}
                      disabled={isLoading}
                      placeholder="AI, Web Development, Design, etc."
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="professional">
              <Card>
                <CardHeader>
                  <CardTitle>Professional Information</CardTitle>
                  <CardDescription>
                    Update your professional details and links.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-2">
                    <Label htmlFor="linkedin_url">LinkedIn URL</Label>
                    <Input
                      id="linkedin_url"
                      name="linkedin_url"
                      type="url"
                      value={formData.linkedin_url}
                      onChange={handleChange}
                      disabled={isLoading}
                      placeholder="https://linkedin.com/in/your-profile"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <div className="mt-6">
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </Tabs>
      </div>
    </div>
  );
}
