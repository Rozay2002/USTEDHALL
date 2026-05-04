import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { KeyRound, ArrowLeft } from "lucide-react";

export default function ForgotPassword() {
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    let email = identifier.trim().toLowerCase();
    // If user entered an index number (no @), look up the email
    if (!email.includes("@")) {
      const { data, error: lookupError } = await (supabase.rpc as any)(
        "get_email_by_index",
        { _index_number: identifier.trim() }
      );
      if (lookupError || !data) {
        setLoading(false);
        toast.error("No account found");
        return;
      }
      email = data as string;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSent(true);
    toast.success("Reset link sent to your email");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted p-4">
      <div className="w-full max-w-md animate-fade-in">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>
        <div className="bg-card rounded-xl shadow-lg border p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <KeyRound className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl">Forgot Password</h1>
              <p className="text-sm text-muted-foreground">Enter your email to receive a reset link</p>
            </div>
          </div>
          {sent ? (
            <div className="space-y-4">
              <p className="text-sm">If an account exists, a password reset link has been sent to your email. The link expires shortly, so please check your inbox soon.</p>
              <Link to="/student/login" className="text-sm text-primary hover:underline">Back to login</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Email or Index Number</Label>
                <Input required value={identifier} onChange={e => setIdentifier(e.target.value)} placeholder="you@example.com or 10-digit index" />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
              <div className="flex justify-between text-sm">
                <Link to="/student/login" className="text-muted-foreground hover:text-foreground">Student login</Link>
                <Link to="/admin/login" className="text-muted-foreground hover:text-foreground">Admin login</Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
