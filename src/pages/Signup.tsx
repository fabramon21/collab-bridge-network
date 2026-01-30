import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Label } from '@/components/ui/label';
import { FooterNav } from "@/components/FooterNav";

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  full_name: z.string().min(1),
  university: z.string().min(1),
  linkedin_url: z.string().url().optional(),
  termsAccepted: z.literal(true, {
    errorMap: () => ({ message: "You must accept the Terms & Conditions to create an account." }),
  }),
});

type SignupValues = z.infer<typeof signupSchema>;

const Signup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
      full_name: '',
      university: '',
      linkedin_url: '',
      termsAccepted: false,
    },
  });

  const onSubmit = async (values: SignupValues) => {
    try {
      setIsLoading(true);
      
      const { error: signUpError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            full_name: values.full_name,
            university: values.university,
            linkedin_url: values.linkedin_url,
          },
        },
      });

      if (signUpError) throw signUpError;

      toast({
        title: 'Success',
        description: 'Please check your email to verify your account.',
      });
      navigate('/login');
    } catch (error) {
      console.error('Error signing up:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to sign up',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-red-500 text-sm">{errors.password.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                type="text"
                {...register('full_name')}
              />
              {errors.full_name && (
                <p className="text-red-500 text-sm">{errors.full_name.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="university">University</Label>
              <Input
                id="university"
                type="text"
                {...register('university')}
              />
              {errors.university && (
                <p className="text-red-500 text-sm">{errors.university.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="linkedin_url">LinkedIn URL (optional)</Label>
              <Input
                id="linkedin_url"
                type="url"
                {...register('linkedin_url')}
              />
              {errors.linkedin_url && (
                <p className="text-red-500 text-sm">{errors.linkedin_url.message}</p>
              )}
            </div>
            <div className="pt-2">
              <label className="flex items-start space-x-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  className="mt-1"
                  {...register('termsAccepted')}
                />
                <span>
                  I agree that InternConnect is not responsible for scams, fraud, or any losses. I have read and accept the{" "}
                  <a href="/terms" className="text-primary underline">Terms &amp; Conditions</a> and{" "}
                  <a href="/privacy" className="text-primary underline">Privacy Policy</a>.
                </span>
              </label>
              {errors.termsAccepted && (
                <p className="text-red-500 text-sm mt-1">{errors.termsAccepted.message}</p>
              )}
            </div>
          </div>

          <div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Signing up...' : 'Sign up'}
            </Button>
          </div>
        </form>
      </div>
    </div>
    <FooterNav />
  </div>
  );
};

export default Signup;
