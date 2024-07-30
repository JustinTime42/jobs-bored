// app/login/page.tsx
import { createClient } from "@/utils/supabase/server";

export default function Login() {
  const supabase = createClient();
  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: 'http://localhost:3000',
      },
    });
    if (error) {
      console.log('Error: ', error.message);
    }
  };

  return (
    <div>
      <button onClick={handleLogin}>Login with GitHub</button>
    </div>
  );
}
