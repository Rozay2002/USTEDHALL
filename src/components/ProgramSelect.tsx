import { useEffect, useMemo, useState } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";

interface Program { id: string; name: string }

interface Props {
  value: string;
  onChange: (name: string) => void;
  placeholder?: string;
}

export function ProgramSelect({ value, onChange, placeholder = "Search and select your program" }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase.from("programs").select("id,name").order("name");
      setPrograms(data ?? []);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 3) return programs.slice(0, 8);
    return programs.filter(p => p.name.toLowerCase().includes(q));
  }, [query, programs]);

  const highlight = (name: string) => {
    const q = query.trim();
    if (q.length < 3) return name;
    const i = name.toLowerCase().indexOf(q.toLowerCase());
    if (i === -1) return name;
    return (
      <>
        {name.slice(0, i)}
        <span className="bg-primary/20 font-semibold">{name.slice(i, i + q.length)}</span>
        {name.slice(i + q.length)}
      </>
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between font-normal", !value && "text-muted-foreground")}
        >
          {value || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <div className="flex items-center border-b px-3">
          <Search className="mr-2 h-4 w-4 opacity-50" />
          <Input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Type at least 3 letters..."
            className="h-10 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
          />
        </div>
        <div className="max-h-64 overflow-y-auto p-1">
          {loading && <p className="py-4 text-center text-sm text-muted-foreground">Loading...</p>}
          {!loading && filtered.length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">No program found</p>
          )}
          {!loading && query.trim().length > 0 && query.trim().length < 3 && (
            <p className="px-2 py-1 text-xs text-muted-foreground">Showing suggestions — type {3 - query.trim().length} more letter(s) to filter.</p>
          )}
          {filtered.map(p => (
            <button
              key={p.id}
              type="button"
              onClick={() => { onChange(p.name); setOpen(false); setQuery(""); }}
              className="flex w-full items-center justify-between rounded-sm px-2 py-2 text-sm text-left hover:bg-accent"
            >
              <span>{highlight(p.name)}</span>
              {value === p.name && <Check className="h-4 w-4" />}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}