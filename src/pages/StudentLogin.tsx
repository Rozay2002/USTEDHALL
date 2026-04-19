import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { GraduationCap, ArrowLeft } from "lucide-react";

export default function StudentLogin() {
  const navigate = useNavigate();
  const [indexNumber, setIndexNumber] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(indexNumber)) {
      toast.error("Index number must be exactly 10 digits");
      return;
    }
    setLoading(true);

    // Look up the email associated with this index number
    const { data: emailData, error: lookupError } = await (supabase.rpc as any)(
      "get_email_by_index",
      { _index_number: indexNumber }
    );

    if (lookupError || !emailData) {
      setLoading(false);
      toast.error("No account found for that index number");
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailData as string,
      password,
    });
    if (error) { setLoading(false); toast.error(error.message); return; }

    // Verify role
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", data.user.id);
    setLoading(false);
    if (roles?.some(r => r.role === "admin")) {
      toast.error("Please use the admin login");
      await supabase.auth.signOut();
      return;
    }
    toast.success("Welcome back!");
    navigate("/student/dashboard");
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
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl">Student Login</h1>
              <p className="text-sm text-muted-foreground">Sign in to your account</p>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><Label>Index Number</Label><Input required value={indexNumber} onChange={e => setIndexNumber(e.target.value)} maxLength={10} placeholder="10-digit index number" /></div>
            <div><Label>Password</Label><Input type="password" required value={password} onChange={e => setPassword(e.target.value)} /></div>
            <Button type="submit" className="w-full" disabled={loading}>{loading ? "Signing in..." : "Sign In"}</Button>
            <p className="text-center text-sm text-muted-foreground">Don't have an account? <Link to="/student/register" className="text-primary font-medium hover:underline">Register</Link></p>
          </form>
        </div>
      </div>
    </div>
  );
}
