import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { KeyRound } from "lucide-react";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Supabase sends the recovery token in the URL hash and creates a session via detectSessionInUrl.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    // Fallback: if a session already exists (recovery token already exchanged), allow reset
    supabase.auth.getSession().then(({ data: { session } }) => {
      const hash = window.location.hash;
      if (session && (hash.includes("type=recovery") || hash.includes("access_token"))) {
        setReady(true);
      } else if (!hash || (!hash.includes("access_token") && !hash.includes("type=recovery"))) {
        // No recovery info — invalid entry
        if (!session) setInvalid(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Password reset successful");
    await supabase.auth.signOut();
    navigate("/student/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="bg-card rounded-xl shadow-lg border p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <KeyRound className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl">Reset Password</h1>
              <p className="text-sm text-muted-foreground">Choose a new password for your account</p>
            </div>
          </div>
          {invalid && !ready ? (
            <div className="space-y-4">
              <p className="text-sm text-destructive">Invalid or expired link. Please request a new password reset.</p>
              <Button className="w-full" onClick={() => navigate("/forgot-password")}>Request New Link</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>New Password</Label>
                <Input type="password" required value={password} onChange={e => setPassword(e.target.value)} minLength={6} />
              </div>
              <div>
                <Label>Confirm Password</Label>
                <Input type="password" required value={confirm} onChange={e => setConfirm(e.target.value)} minLength={6} />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Resetting..." : "Reset Password"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
