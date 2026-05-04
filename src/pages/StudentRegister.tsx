import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { GraduationCap, ArrowLeft } from "lucide-react";

export default function StudentRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "", indexNumber: "", contact: "", program: "", level: "100", email: "", password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(form.indexNumber)) {
      toast.error("Index number must be exactly 10 digits");
      return;
    }
    setLoading(true);
    // Pre-check: index number must be unique
    const { data: existingEmail } = await (supabase.rpc as any)(
      "get_email_by_index",
      { _index_number: form.indexNumber }
    );
    if (existingEmail) {
      setLoading(false);
      toast.error("This index number is already registered");
      return;
    }
    const { error } = await supabase.auth.signUp({
      email: form.email.trim().toLowerCase(),
      password: form.password,
      options: {
        emailRedirectTo: `${window.location.origin}/student/dashboard`,
        data: {
          full_name: form.fullName,
          index_number: form.indexNumber,
          contact: form.contact,
          program: form.program,
          level: form.level,
        },
      },
    });
    setLoading(false);
    if (error) {
      const msg = error.message?.toLowerCase().includes("database")
        ? "This index number or email is already registered"
        : error.message;
      toast.error(msg);
      return;
    }
    toast.success("Registration successful!");
    navigate("/student/dashboard");
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
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl">Student Registration</h1>
              <p className="text-sm text-muted-foreground">Create your account</p>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><Label>Full Name</Label><Input required value={form.fullName} onChange={e => update("fullName", e.target.value)} /></div>
            <div><Label>Index Number (10 digits)</Label><Input required value={form.indexNumber} onChange={e => update("indexNumber", e.target.value)} maxLength={10} placeholder="e.g. 1234567890" /></div>
            <div><Label>Contact</Label><Input required value={form.contact} onChange={e => update("contact", e.target.value)} /></div>
            <div><Label>Program</Label><Input required value={form.program} onChange={e => update("program", e.target.value)} placeholder="e.g. Computer Science" /></div>
            <div>
              <Label>Level</Label>
              <Select value={form.level} onValueChange={v => update("level", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[100, 200, 300, 400].map(l => <SelectItem key={l} value={String(l)}>Level {l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Email</Label><Input type="email" required value={form.email} onChange={e => update("email", e.target.value)} /></div>
            <div><Label>Password</Label><Input type="password" required value={form.password} onChange={e => update("password", e.target.value)} minLength={6} /></div>
            <Button type="submit" className="w-full" disabled={loading}>{loading ? "Registering..." : "Register"}</Button>
            <p className="text-center text-sm text-muted-foreground">Already have an account? <Link to="/student/login" className="text-primary font-medium hover:underline">Login</Link></p>
          </form>
        </div>
      </div>
    </div>
  );
}
