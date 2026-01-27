import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const supa = supabase as any;

type PriorityField =
  | "location"
  | "budget"
  | "sameGender"
  | "sameReligion"
  | "sleepSchedule"
  | "cleanliness"
  | "guests"
  | "hobbies";

interface RoommatePreferencesRow {
  id?: string;
  user_id: string;
  city: string | null;
  budget_min: number | null;
  budget_max: number | null;
  gender: string | null;
  prefers_same_gender: boolean | null;
  religion: string | null;
  prefers_same_religion: boolean | null;
  sleep_schedule: string | null;
  cleanliness: number | null; // 1–5
  guests: string | null;
  noise_level: string | null;
  hobbies: string[] | null; // text[]
  priority_fields: string[] | null; // PriorityField[]
}

interface MatchResult {
  prefs: RoommatePreferencesRow;
  score: number;
}

const PRIORITY_OPTIONS: { value: PriorityField; label: string }[] = [
  { value: "location", label: "Location" },
  { value: "budget", label: "Price / Budget" },
  { value: "sameGender", label: "Same Gender" },
  { value: "sameReligion", label: "Same Religion" },
  { value: "sleepSchedule", label: "Sleep Schedule" },
  { value: "cleanliness", label: "Cleanliness" },
  { value: "guests", label: "Guests / Visitors" },
  { value: "hobbies", label: "Hobbies / Vibe" },
];

export function RoommatePreferences() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [findingMatches, setFindingMatches] = useState(false);

  const [budgetRange, setBudgetRange] = useState<number[]>([500, 3000]);

  const [city, setCity] = useState("");
  const [gender, setGender] = useState("prefer_not_to_say");
  const [prefersSameGender, setPrefersSameGender] = useState(false);
  const [religion, setReligion] = useState("");
  const [prefersSameReligion, setPrefersSameReligion] = useState(false);
  const [sleepSchedule, setSleepSchedule] = useState("normal");
  const [cleanliness, setCleanliness] = useState(3);
  const [guests, setGuests] = useState("sometimes");
  const [noiseLevel, setNoiseLevel] = useState("medium");
  const [hobbiesInput, setHobbiesInput] = useState("");
  const [priorityFields, setPriorityFields] = useState<PriorityField[]>([]);

  const [matches, setMatches] = useState<MatchResult[]>([]);

  useEffect(() => {
    const loadPreferences = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supa
        .from("roommate_preferences")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error loading roommate preferences:", error);
      }

      if (data) {
        const d = data as RoommatePreferencesRow;

        setCity(d.city ?? "");
        setBudgetRange([d.budget_min ?? 500, d.budget_max ?? 3000]);
        setGender(d.gender ?? "prefer_not_to_say");
        setPrefersSameGender(Boolean(d.prefers_same_gender));
        setReligion(d.religion ?? "");
        setPrefersSameReligion(Boolean(d.prefers_same_religion));
        setSleepSchedule(d.sleep_schedule ?? "normal");
        setCleanliness(d.cleanliness ?? 3);
        setGuests(d.guests ?? "sometimes");
        setNoiseLevel(d.noise_level ?? "medium");
        setHobbiesInput((d.hobbies ?? []).join(", "));
        setPriorityFields((d.priority_fields ?? []) as PriorityField[]);
      }

      setLoading(false);
    };

    loadPreferences();
  }, [user]);

  const handleTogglePriority = (field: PriorityField) => {
    setPriorityFields((prev) => {
      const exists = prev.includes(field);
      if (exists) return prev.filter((f) => f !== field);
      if (prev.length >= 3) return prev; // max 3
      return [...prev, field];
    });
  };

  const handleSave = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save your roommate preferences.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    const hobbiesArray = hobbiesInput
      .split(",")
      .map((h) => h.trim())
      .filter((h) => h.length > 0);

    const row: RoommatePreferencesRow = {
      user_id: user.id,
      city: city || null,
      budget_min: budgetRange[0],
      budget_max: budgetRange[1],
      gender: gender === "prefer_not_to_say" ? null : gender,
      prefers_same_gender: prefersSameGender,
      religion: religion || null,
      prefers_same_religion: prefersSameReligion,
      sleep_schedule: sleepSchedule,
      cleanliness,
      guests,
      noise_level: noiseLevel,
      hobbies: hobbiesArray,
      priority_fields: priorityFields,
    };

    const { error } = await supa
      .from("roommate_preferences")
      .upsert(row, { onConflict: "user_id" });

    setSaving(false);

    if (error) {
      console.error("Error saving roommate preferences:", error);
      toast({
        title: "Error",
        description: "Could not save your preferences. Please try again.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Preferences saved",
      description: "We’ll use these to find your best roommate matches.",
    });
  };

  const scoreMatch = (
    me: RoommatePreferencesRow,
    other: RoommatePreferencesRow
  ): number => {
    if (me.user_id === other.user_id) return -1;

    const priorities = new Set(me.priority_fields ?? []);
    const mult = (field: PriorityField) => (priorities.has(field) ? 3 : 1);

    let score = 0;

    // Location
    if (
      me.city &&
      other.city &&
      me.city.toLowerCase() === other.city.toLowerCase()
    ) {
      score += 2 * mult("location");
    }

    // Budget overlap
    if (
      me.budget_min != null &&
      me.budget_max != null &&
      other.budget_min != null &&
      other.budget_max != null
    ) {
      const overlap =
        me.budget_max >= other.budget_min &&
        other.budget_max >= me.budget_min;
      if (overlap) score += 3 * mult("budget");
    }

    // Gender
    if (me.prefers_same_gender) {
      if (me.gender && other.gender && me.gender === other.gender) {
        score += 5 * mult("sameGender");
      } else {
        score -= 5;
      }
    }

    // Religion
    if (me.prefers_same_religion) {
      if (me.religion && other.religion && me.religion === other.religion) {
        score += 5 * mult("sameReligion");
      } else {
        score -= 5;
      }
    }

    // Sleep schedule
    if (
      me.sleep_schedule &&
      other.sleep_schedule &&
      me.sleep_schedule === other.sleep_schedule
    ) {
      score += 2 * mult("sleepSchedule");
    }

    // Cleanliness
    if (me.cleanliness != null && other.cleanliness != null) {
      const diff = Math.abs(me.cleanliness - other.cleanliness);
      if (diff === 0) score += 2 * mult("cleanliness");
      else if (diff === 1) score += 1 * mult("cleanliness");
    }

    // Guests
    if (me.guests && other.guests && me.guests === other.guests) {
      score += 2 * mult("guests");
    }

    // Hobbies similarity (Jaccard)
    const myH = new Set(me.hobbies ?? []);
    const otherH = new Set(other.hobbies ?? []);
    const inter = [...myH].filter((x) => otherH.has(x));
    const union = new Set([...myH, ...otherH]);
    const jaccard = union.size === 0 ? 0 : inter.length / union.size;
    score += jaccard * 4 * mult("hobbies");

    return score;
  };

  const handleFindMatches = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to see roommate matches.",
        variant: "destructive",
      });
      return;
    }

    setFindingMatches(true);

    const { data: meData, error: meError } = await supa
      .from("roommate_preferences")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (meError || !meData) {
      console.error("Error loading your preferences:", meError);
      toast({
        title: "Missing preferences",
        description: "Save your roommate preferences first.",
        variant: "destructive",
      });
      setFindingMatches(false);
      return;
    }

    const mePrefs = meData as RoommatePreferencesRow;

    const { data: allPrefs, error: allError } = await supa
      .from("roommate_preferences")
      .select("*");

    if (allError || !allPrefs) {
      console.error("Error loading roommate preferences:", allError);
      toast({
        title: "Error",
        description: "Could not load matches. Please try again.",
        variant: "destructive",
      });
      setFindingMatches(false);
      return;
    }

    const scored: MatchResult[] = (allPrefs as RoommatePreferencesRow[])
      .map((p) => ({ prefs: p, score: scoreMatch(mePrefs, p) }))
      .filter((m) => m.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    setMatches(scored);
    setFindingMatches(false);
  };

  if (!user) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Roommate Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Sign in to set your roommate preferences and see your best matches.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Roommate Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading your preferences…</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mb-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* LEFT: form */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Roommate Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* location + gender */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="mb-1 block">City / Location</Label>
              <Input
                placeholder="e.g. San Francisco, CA"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>

            <div>
              <Label className="mb-1 block">Your gender (optional)</Label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="prefer_not_to_say">
                    Prefer not to say
                  </SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="nonbinary">Non-binary</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <div className="mt-2 flex items-center gap-2 text-sm">
                <input
                  id="same-gender"
                  type="checkbox"
                  checked={prefersSameGender}
                  onChange={(e) => setPrefersSameGender(e.target.checked)}
                />
                <Label htmlFor="same-gender">Prefer same-gender roommate</Label>
              </div>
            </div>
          </div>

          {/* religion + budget */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="mb-1 block">Religion (optional)</Label>
              <Input
                placeholder="e.g. Muslim, Christian, etc."
                value={religion}
                onChange={(e) => setReligion(e.target.value)}
              />
              <div className="mt-2 flex items-center gap-2 text-sm">
                <input
                  id="same-religion"
                  type="checkbox"
                  checked={prefersSameReligion}
                  onChange={(e) => setPrefersSameReligion(e.target.checked)}
                />
                <Label htmlFor="same-religion">Prefer same religion</Label>
              </div>
            </div>

            <div>
              <Label className="mb-1 block">Budget range ($/month)</Label>
              <div className="px-1 pt-2">
                <Slider
                  value={budgetRange}
                  min={200}
                  max={5000}
                  step={50}
                  onValueChange={(value) => setBudgetRange(value as number[])}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>${budgetRange[0]}</span>
                  <span>${budgetRange[1]}</span>
                </div>
              </div>
            </div>
          </div>

          {/* sleep / cleanliness / guests */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="mb-1 block">Sleep schedule</Label>
              <Select
                value={sleepSchedule}
                onValueChange={setSleepSchedule}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="early">Early (before 11)</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="late">Night owl</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-1 block">
                Cleanliness (1 = messy, 5 = very tidy)
              </Label>
              <div className="px-1 pt-2">
                <Slider
                  value={[cleanliness]}
                  min={1}
                  max={5}
                  step={1}
                  onValueChange={(value) => setCleanliness(value[0])}
                />
                <div className="text-xs text-gray-500 mt-1">
                  Current: {cleanliness}
                </div>
              </div>
            </div>

            <div>
              <Label className="mb-1 block">Guests</Label>
              <Select value={guests} onValueChange={setGuests}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rarely">Rarely</SelectItem>
                  <SelectItem value="sometimes">Sometimes</SelectItem>
                  <SelectItem value="often">Often</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* noise + hobbies */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="mb-1 block">Noise level</Label>
              <Select value={noiseLevel} onValueChange={setNoiseLevel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quiet">Quiet</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="loud">Loud / ok with noise</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-1 block">
                Hobbies / vibe (comma separated)
              </Label>
              <Input
                placeholder="e.g. gym, cooking, gaming"
                value={hobbiesInput}
                onChange={(e) => setHobbiesInput(e.target.value)}
              />
            </div>
          </div>

          {/* priorities */}
          <div>
            <Label className="mb-1 block">
              Pick up to 3 things that matter most to you
            </Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {PRIORITY_OPTIONS.map((opt) => {
                const active = priorityFields.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    className={`px-3 py-1 rounded-full text-xs border ${
                      active
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-white text-gray-700"
                    }`}
                    onClick={() => handleTogglePriority(opt.value)}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              type="button"
              onClick={handleFindMatches}
              disabled={findingMatches}
            >
              {findingMatches ? "Finding matches..." : "Find Matches"}
            </Button>
            <Button type="button" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Preferences"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* RIGHT: matches */}
      <Card>
        <CardHeader>
          <CardTitle>Top Matches</CardTitle>
        </CardHeader>
        <CardContent>
          {matches.length === 0 ? (
            <p className="text-sm text-gray-600">
              Save your preferences and click “Find Matches” to see compatible
              roommates.
            </p>
          ) : (
            <div className="space-y-3">
              {matches.map((m) => (
                <div
                  key={m.prefs.user_id}
                  className="border rounded-md p-3 text-sm"
                >
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">
                      {m.prefs.city || "Unknown location"}
                    </span>
                    <span className="text-indigo-600 font-semibold">
                      {Math.round(m.score)}
                    </span>
                  </div>
                  {m.prefs.budget_min != null &&
                    m.prefs.budget_max != null && (
                      <div className="text-xs text-gray-500 mb-1">
                        Budget: ${m.prefs.budget_min} – ${m.prefs.budget_max}
                      </div>
                    )}
                  <div className="text-xs text-gray-500">
                    Sleep: {m.prefs.sleep_schedule || "n/a"} · Cleanliness:{" "}
                    {m.prefs.cleanliness ?? "n/a"} · Guests:{" "}
                    {m.prefs.guests || "n/a"}
                  </div>
                  {m.prefs.hobbies && m.prefs.hobbies.length > 0 && (
                    <div className="text-xs text-gray-500 mt-1">
                      Hobbies: {m.prefs.hobbies.join(", ")}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
