import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { ADMIN_SECRET } from "@/lib/store";
import { toast } from "sonner";
import { Shield, ArrowLeft } from "lucide-react";

export default function AdminRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", email: "", password: "", secretCode: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.secretCode !== ADMIN_SECRET) {
      toast.error("Invalid secret code");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: `${window.location.origin}/admin/dashboard`,
        data: {
          full_name: form.fullName,
          secret_code: form.secretCode,
        },
      },
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Admin registered!");
    navigate("/admin/dashboard");
  };

  const update = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }));

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted p-4">
      <div className="w-full max-w-md animate-fade-in">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>
        <div className="bg-card rounded-xl shadow-lg border p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl">Admin Registration</h1>
              <p className="text-sm text-muted-foreground">Create admin account</p>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><Label>Full Name</Label><Input required value={form.fullName} onChange={e => update("fullName", e.target.value)} /></div>
            <div><Label>Email</Label><Input type="email" required value={form.email} onChange={e => update("email", e.target.value)} /></div>
            <div><Label>Password</Label><Input type="password" required value={form.password} onChange={e => update("password", e.target.value)} minLength={6} /></div>
            <div><Label>Secret Code</Label><Input type="password" required value={form.secretCode} onChange={e => update("secretCode", e.target.value)} placeholder="Enter admin secret code" /></div>
            <Button type="submit" className="w-full" disabled={loading}>{loading ? "Registering..." : "Register"}</Button>
            <p className="text-center text-sm text-muted-foreground">Already an admin? <Link to="/admin/login" className="text-primary font-medium hover:underline">Login</Link></p>
          </form>
        </div>
      </div>
    </div>
  );
}
