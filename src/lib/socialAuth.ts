import { supabase } from "@/integrations/supabase/client";

export type SocialProvider = "google" | "facebook" | "apple";

export const signInWithSocialProvider = async (provider: SocialProvider) => {
  const redirectUrl = `${window.location.origin}/`;
  
  // Map provider to Supabase provider
  const supabaseProvider = provider === "facebook" ? "facebook" : provider;
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: supabaseProvider,
    options: {
      redirectTo: redirectUrl,
    },
  });

  return { data, error };
};

// Instructions for configuring social providers:
// 
// GOOGLE:
// 1. Go to https://console.cloud.google.com/
// 2. Create a new project or select existing
// 3. Enable Google+ API
// 4. Go to Credentials > Create Credentials > OAuth client ID
// 5. Add authorized JavaScript origins: your site URL
// 6. Add authorized redirect URIs: https://[PROJECT_ID].supabase.co/auth/v1/callback
// 7. Copy Client ID and Client Secret
// 8. In Supabase Dashboard > Authentication > Providers > Google, add the credentials
//
// FACEBOOK:
// 1. Go to https://developers.facebook.com/
// 2. Create a new app or select existing
// 3. Add Facebook Login product
// 4. In Settings > Basic, copy App ID and App Secret
// 5. In Facebook Login > Settings, add OAuth redirect URI: https://[PROJECT_ID].supabase.co/auth/v1/callback
// 6. In Supabase Dashboard > Authentication > Providers > Facebook, add the credentials
//
// APPLE:
// 1. Go to https://developer.apple.com/ (requires Apple Developer account - $99/year)
// 2. Register an App ID with Sign in with Apple capability
// 3. Create a Services ID for web authentication
// 4. Configure domains and redirect URLs
// 5. Create a private key for Sign in with Apple
// 6. In Supabase Dashboard > Authentication > Providers > Apple, add the configuration
