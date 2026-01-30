
import { useEffect, useMemo, useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Edit,
  Briefcase,
  GraduationCap,
  MapPin,
  Mail,
  Link,
  Plus,
  Trash2,
  Layers,
  BookOpen,
} from "lucide-react";
import { EditProfileDialog } from "@/components/EditProfileDialog";
import {
  ProfileEducation,
  ProfileExperience,
  ProfileProject,
} from "@/types/auth.types";

const SCHOOL_OPTIONS = [
  { value: "osu", label: "The Ohio State University", location: "Columbus, OH" },
  { value: "harvard", label: "Harvard University", location: "Cambridge, MA" },
  { value: "mit", label: "MIT", location: "Cambridge, MA" },
  { value: "stanford", label: "Stanford University", location: "Stanford, CA" },
  { value: "howard", label: "Howard University", location: "Washington, DC" },
  { value: "spelman", label: "Spelman College", location: "Atlanta, GA" },
  { value: "morehouse", label: "Morehouse College", location: "Atlanta, GA" },
  { value: "nyu", label: "New York University", location: "New York, NY" },
];

const CUSTOM_SCHOOL_VALUE = "custom";

const createId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const blankEducation = (): ProfileEducation => ({
  id: createId(),
  school: "",
  degree: "",
  field: "",
  location: "",
  graduationDate: "",
  startDate: "",
  endDate: "",
  notes: "",
});

const blankExperience = (): ProfileExperience => ({
  id: createId(),
  company: "",
  role: "",
  location: "",
  startDate: "",
  endDate: "",
  current: false,
  description: "",
});

const blankProject = (): ProfileProject => ({
  id: createId(),
  name: "",
  description: "",
  link: "",
  technologies: [],
});

const formatMonthYear = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("default", { month: "short", year: "numeric" });
};

const formatRange = (start?: string, end?: string, current?: boolean) => {
  const startLabel = formatMonthYear(start);
  const endLabel = current ? "Present" : formatMonthYear(end);
  return [startLabel, endLabel].filter(Boolean).join(" - ");
};

const normalizeUrl = (value?: string | null) => {
  if (!value) return undefined;
  if (value.startsWith("http")) return value;
  return `https://${value}`;
};

export default function Profile() {
  const { profile, user, updateProfile } = useAuth();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [educationDialogOpen, setEducationDialogOpen] = useState(false);
  const [experienceDialogOpen, setExperienceDialogOpen] = useState(false);
  const [skillsDialogOpen, setSkillsDialogOpen] = useState(false);
  const [projectsDialogOpen, setProjectsDialogOpen] = useState(false);

  const [educationForm, setEducationForm] = useState<ProfileEducation[]>([]);
  const [experienceForm, setExperienceForm] = useState<ProfileExperience[]>([]);
  const [skillsForm, setSkillsForm] = useState<string[]>([]);
  const [projectsForm, setProjectsForm] = useState<ProfileProject[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [savingSection, setSavingSection] = useState<
    "education" | "experience" | "skills" | "projects" | null
  >(null);

  useEffect(() => {
    if (educationDialogOpen) {
      setEducationForm(
        profile?.education?.length
          ? JSON.parse(JSON.stringify(profile.education))
          : [blankEducation()]
      );
    }
  }, [educationDialogOpen, profile]);

  useEffect(() => {
    if (experienceDialogOpen) {
      setExperienceForm(
        profile?.experience?.length
          ? JSON.parse(JSON.stringify(profile.experience))
          : [blankExperience()]
      );
    }
  }, [experienceDialogOpen, profile]);

  useEffect(() => {
    if (skillsDialogOpen) {
      setSkillsForm(profile?.skills?.length ? [...profile.skills] : []);
      setSkillInput("");
    }
  }, [skillsDialogOpen, profile]);

  useEffect(() => {
    if (projectsDialogOpen) {
      setProjectsForm(
        profile?.projects?.length
          ? JSON.parse(JSON.stringify(profile.projects))
          : [blankProject()]
      );
    }
  }, [projectsDialogOpen, profile]);

  const handleEducationField = (id: string, field: keyof ProfileEducation, value: string) => {
    setEducationForm((prev) => prev.map((entry) => (entry.id === id ? { ...entry, [field]: value } : entry)));
  };

  const handleSelectSchool = (id: string, value: string) => {
    const option = SCHOOL_OPTIONS.find((item) => item.value === value);
    if (!option) return;
    setEducationForm((prev) =>
      prev.map((entry) =>
        entry.id === id
          ? {
              ...entry,
              school: option.label,
              location: option.location || entry.location,
            }
          : entry
      )
    );
  };

  const handleExperienceField = (
    id: string,
    field: keyof ProfileExperience,
    value: string | boolean
  ) => {
    setExperienceForm((prev) =>
      prev.map((entry) => (entry.id === id ? { ...entry, [field]: value } : entry))
    );
  };

  const handleProjectField = (id: string, field: keyof ProfileProject, value: string | string[]) => {
    setProjectsForm((prev) => prev.map((entry) => (entry.id === id ? { ...entry, [field]: value } : entry)));
  };

  const persistSection = async (
    section: "education" | "experience" | "skills" | "projects",
    payload: Partial<Parameters<typeof updateProfile>[0]>
  ) => {
    setSavingSection(section);
    try {
      await updateProfile(payload);
      switch (section) {
        case "education":
          setEducationDialogOpen(false);
          break;
        case "experience":
          setExperienceDialogOpen(false);
          break;
        case "skills":
          setSkillsDialogOpen(false);
          break;
        case "projects":
          setProjectsDialogOpen(false);
          break;
      }
    } finally {
      setSavingSection(null);
    }
  };

  const educationSelectValue = (entry: ProfileEducation) => {
    const option = SCHOOL_OPTIONS.find((item) => item.label === entry.school);
    if (option) return option.value;
    return entry.school ? CUSTOM_SCHOOL_VALUE : undefined;
  };

  const skillsDisplay = useMemo(
    () => skillsForm.filter((skill) => skill.trim().length > 0),
    [skillsForm]
  );

  return (
    <PageLayout
      title="Profile"
      previousPage={{ name: "Messages", path: "/messages" }}
    >
      <EditProfileDialog open={editDialogOpen} onOpenChange={setEditDialogOpen} />

      <div className="max-w-4xl mx-auto">
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex flex-col items-center">
                <Avatar className="h-32 w-32">
                  <AvatarImage
                    src={profile?.avatar_url || profile?.profile_image_url || undefined}
                    alt={profile?.full_name || "User"}
                  />
                  <AvatarFallback className="text-4xl">{profile?.full_name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => setEditDialogOpen(true)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>

              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">{profile?.full_name || "User"}</h2>
                <div className="grid gap-4 mt-4">
                  <div className="flex items-center text-muted-foreground">
                    <Mail className="h-4 w-4 mr-2" />
                    {user?.email}
                  </div>
                  {(profile?.university || profile?.school) && (
                    <div className="flex items-center text-muted-foreground">
                      <GraduationCap className="h-4 w-4 mr-2" />
                      {profile?.university || profile?.school}
                    </div>
                  )}
                  {profile?.location && (
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2" />
                      {profile.location}
                    </div>
                  )}
                  {(profile?.linkedin_url || profile?.linkedin) && (
                    <div className="flex items-center text-muted-foreground">
                      <Link className="h-4 w-4 mr-2" />
                      <a
                        href={normalizeUrl(profile?.linkedin_url || profile?.linkedin)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        LinkedIn Profile
                      </a>
                    </div>
                  )}
                  {profile?.address && (
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2" />
                      {profile.address}
                    </div>
                  )}
                  {profile?.bio && <p className="text-muted-foreground">{profile.bio}</p>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-lg flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Education
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setEducationDialogOpen(true)}>
                Edit
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile?.education?.length ? (
                profile.education.map((edu) => (
                  <div key={edu.id} className="space-y-1">
                    <p className="font-medium">{edu.school}</p>
                    {(edu.degree || edu.field) && (
                      <p className="text-sm text-muted-foreground">
                        {[edu.degree, edu.field].filter(Boolean).join(" • ")}
                      </p>
                    )}
                    {(edu.location || edu.startDate || edu.endDate || edu.graduationDate) && (
                      <p className="text-sm text-muted-foreground">
                        {[edu.location, formatRange(edu.startDate, edu.endDate || edu.graduationDate)]
                          .filter(Boolean)
                          .join(" • ")}
                      </p>
                    )}
                    {edu.notes && <p className="text-sm text-muted-foreground">{edu.notes}</p>}
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">Add your education details</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-lg flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Experience
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setExperienceDialogOpen(true)}>
                Edit
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile?.experience?.length ? (
                profile.experience.map((exp) => (
                  <div key={exp.id} className="space-y-1">
                    <p className="font-medium">{exp.role}</p>
                    <p className="text-sm text-muted-foreground">{exp.company}</p>
                    {(exp.location || exp.startDate || exp.endDate) && (
                      <p className="text-sm text-muted-foreground">
                        {[exp.location, formatRange(exp.startDate, exp.endDate, exp.current)]
                          .filter(Boolean)
                          .join(" • ")}
                      </p>
                    )}
                    {exp.description && (
                      <p className="text-sm text-muted-foreground">{exp.description}</p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">Add your work experience</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-lg flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Skills
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setSkillsDialogOpen(true)}>
                Edit
              </Button>
            </CardHeader>
            <CardContent>
              {profile?.skills?.length ? (
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Add your skills</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Projects
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setProjectsDialogOpen(true)}>
                Edit
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile?.projects?.length ? (
                profile.projects.map((project) => (
                  <div key={project.id} className="space-y-1">
                    <p className="font-medium">{project.name}</p>
                    {project.description && (
                      <p className="text-sm text-muted-foreground">{project.description}</p>
                    )}
                    {(project.link || project.technologies?.length) && (
                      <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                        {project.link && (
                          <a
                            className="text-blue-600 hover:underline"
                            target="_blank"
                            rel="noopener noreferrer"
                            href={normalizeUrl(project.link)}
                          >
                            View project
                          </a>
                        )}
                        {project.technologies?.map((tech) => (
                          <Badge key={tech} variant="outline">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">Add your projects</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Education Dialog */}
      <Dialog open={educationDialogOpen} onOpenChange={setEducationDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit education</DialogTitle>
            <DialogDescription>Update schools, degrees, and graduation details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {educationForm.map((entry, index) => (
              <div key={entry.id} className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">Education {index + 1}</p>
                  {educationForm.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setEducationForm((prev) => prev.filter((item) => item.id !== entry.id))
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>School</Label>
                  <Select
                    value={educationSelectValue(entry)}
                    onValueChange={(value) => {
                      if (value === CUSTOM_SCHOOL_VALUE) {
                        handleEducationField(entry.id, "school", "");
                        return;
                      }
                      handleSelectSchool(entry.id, value);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a school" />
                    </SelectTrigger>
                    <SelectContent>
                      {SCHOOL_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                      <SelectItem value={CUSTOM_SCHOOL_VALUE}>Other school...</SelectItem>
                    </SelectContent>
                  </Select>
                  {(!educationSelectValue(entry) || educationSelectValue(entry) === CUSTOM_SCHOOL_VALUE) && (
                    <Input
                      value={entry.school}
                      onChange={(event) => handleEducationField(entry.id, "school", event.target.value)}
                      placeholder="Enter school name"
                    />
                  )}
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Degree</Label>
                    <Input
                      value={entry.degree || ""}
                      onChange={(event) => handleEducationField(entry.id, "degree", event.target.value)}
                      placeholder="e.g. B.S. Computer Science"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Field of study</Label>
                    <Input
                      value={entry.field || ""}
                      onChange={(event) => handleEducationField(entry.id, "field", event.target.value)}
                      placeholder="Major or focus"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input
                      value={entry.location || ""}
                      onChange={(event) => handleEducationField(entry.id, "location", event.target.value)}
                      placeholder="City, State"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Graduation date</Label>
                    <Input
                      type="month"
                      value={entry.graduationDate || ""}
                      onChange={(event) => handleEducationField(entry.id, "graduationDate", event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Start date</Label>
                    <Input
                      type="month"
                      value={entry.startDate || ""}
                      onChange={(event) => handleEducationField(entry.id, "startDate", event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End date</Label>
                    <Input
                      type="month"
                      value={entry.endDate || ""}
                      onChange={(event) => handleEducationField(entry.id, "endDate", event.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={entry.notes || ""}
                    onChange={(event) => handleEducationField(entry.id, "notes", event.target.value)}
                    placeholder="Honors, key coursework, or activities"
                  />
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={() => setEducationForm((prev) => [...prev, blankEducation()])}>
              <Plus className="h-4 w-4 mr-2" />
              Add education
            </Button>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setEducationDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() =>
                  persistSection("education", {
                    education: educationForm.filter((entry) => entry.school.trim().length > 0),
                  })
                }
                disabled={savingSection === "education"}
              >
                {savingSection === "education" ? "Saving..." : "Save education"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Experience Dialog */}
      <Dialog open={experienceDialogOpen} onOpenChange={setExperienceDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit experience</DialogTitle>
            <DialogDescription>Capture internships, roles, and volunteer work.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {experienceForm.map((entry, index) => (
              <div key={entry.id} className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">Experience {index + 1}</p>
                  {experienceForm.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setExperienceForm((prev) => prev.filter((item) => item.id !== entry.id))
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Input
                      value={entry.role}
                      onChange={(event) => handleExperienceField(entry.id, "role", event.target.value)}
                      placeholder="e.g. Product Design Intern"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Company</Label>
                    <Input
                      value={entry.company}
                      onChange={(event) => handleExperienceField(entry.id, "company", event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input
                      value={entry.location || ""}
                      onChange={(event) => handleExperienceField(entry.id, "location", event.target.value)}
                      placeholder="City, State"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Start date</Label>
                    <Input
                      type="month"
                      value={entry.startDate || ""}
                      onChange={(event) => handleExperienceField(entry.id, "startDate", event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End date</Label>
                    <Input
                      type="month"
                      value={entry.endDate || ""}
                      onChange={(event) => handleExperienceField(entry.id, "endDate", event.target.value)}
                      disabled={entry.current}
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-6">
                    <Checkbox
                      id={`current-${entry.id}`}
                      checked={entry.current || false}
                      onCheckedChange={(checked) => handleExperienceField(entry.id, "current", Boolean(checked))}
                    />
                    <Label htmlFor={`current-${entry.id}`}>I currently work here</Label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={entry.description || ""}
                    onChange={(event) => handleExperienceField(entry.id, "description", event.target.value)}
                    placeholder="Share impact, responsibilities, and wins"
                  />
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={() => setExperienceForm((prev) => [...prev, blankExperience()])}>
              <Plus className="h-4 w-4 mr-2" />
              Add experience
            </Button>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setExperienceDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() =>
                  persistSection("experience", {
                    experience: experienceForm.filter(
                      (entry) => entry.role.trim().length && entry.company.trim().length
                    ),
                  })
                }
                disabled={savingSection === "experience"}
              >
                {savingSection === "experience" ? "Saving..." : "Save experience"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Skills Dialog */}
      <Dialog open={skillsDialogOpen} onOpenChange={setSkillsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit skills</DialogTitle>
            <DialogDescription>Add the languages, tools, and specialties you rely on.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={skillInput}
                onChange={(event) => setSkillInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    if (skillInput.trim().length) {
                      setSkillsForm((prev) => [...prev, skillInput.trim()]);
                      setSkillInput("");
                    }
                  }
                }}
                placeholder="Add a skill and press Enter"
              />
              <Button
                type="button"
                onClick={() => {
                  if (!skillInput.trim()) return;
                  setSkillsForm((prev) => [...prev, skillInput.trim()]);
                  setSkillInput("");
                }}
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {skillsDisplay.length ? (
                skillsDisplay.map((skill) => (
                  <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                    {skill}
                    <button
                      type="button"
                      aria-label={`Remove ${skill}`}
                      onClick={() => setSkillsForm((prev) => prev.filter((item) => item !== skill))}
                    >
                      <span aria-hidden="true">&times;</span>
                    </button>
                  </Badge>
                ))
              ) : (
                <p className="text-muted-foreground">No skills added yet.</p>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setSkillsDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() =>
                  persistSection("skills", {
                    skills: skillsDisplay,
                  })
                }
                disabled={savingSection === "skills"}
              >
                {savingSection === "skills" ? "Saving..." : "Save skills"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Projects Dialog */}
      <Dialog open={projectsDialogOpen} onOpenChange={setProjectsDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit projects</DialogTitle>
            <DialogDescription>Share work samples, capstones, and hackathon builds.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {projectsForm.map((entry, index) => (
              <div key={entry.id} className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">Project {index + 1}</p>
                  {projectsForm.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setProjectsForm((prev) => prev.filter((item) => item.id !== entry.id))}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Project name</Label>
                  <Input
                    value={entry.name}
                    onChange={(event) => handleProjectField(entry.id, "name", event.target.value)}
                    placeholder="e.g. Campus Housing Finder"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={entry.description || ""}
                    onChange={(event) => handleProjectField(entry.id, "description", event.target.value)}
                    placeholder="What did you build and why does it matter?"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Project link</Label>
                  <Input
                    value={entry.link || ""}
                    onChange={(event) => handleProjectField(entry.id, "link", event.target.value)}
                    placeholder="https://"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Technologies (comma separated)</Label>
                  <Input
                    value={entry.technologies?.join(", ") || ""}
                    onChange={(event) =>
                      handleProjectField(
                        entry.id,
                        "technologies",
                        event.target.value
                          .split(",")
                          .map((tech) => tech.trim())
                          .filter((tech) => tech.length)
                      )
                    }
                  />
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={() => setProjectsForm((prev) => [...prev, blankProject()])}>
              <Plus className="h-4 w-4 mr-2" />
              Add project
            </Button>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setProjectsDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() =>
                  persistSection("projects", {
                    projects: projectsForm.filter((entry) => entry.name.trim().length > 0),
                  })
                }
                disabled={savingSection === "projects"}
              >
                {savingSection === "projects" ? "Saving..." : "Save projects"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
