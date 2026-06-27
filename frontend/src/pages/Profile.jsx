import { useState } from 'react';
import useAuthStore from '../store/authStore';
import { userAPI } from '../services/api';
import {
  User,
  Mail,
  Briefcase,
  MapPin,
  ExternalLink,
  Globe,
  Code2,
  Camera,
  Upload,
  Save,
  Loader2,
  GraduationCap,
  BookOpen,
  Target,
} from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { ProfileSkeleton } from '../components/common/Skeleton';

const Profile = () => {
  const { user, updateUser, isLoading } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    bio: user?.bio || '',
    branch: user?.branch || '',
    year: user?.year || '',
    skills: user?.skills?.join(', ') || '',
    socialLinks: {
      linkedin: user?.socialLinks?.linkedin || '',
      github: user?.socialLinks?.github || '',
      leetcode: user?.socialLinks?.leetcode || '',
    },
    targetCompanies: user?.targetCompanies?.join(', ') || '',
  });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
        targetCompanies: form.targetCompanies.split(',').map((c) => c.trim()).filter(Boolean),
      };
      const { data } = await userAPI.updateProfile(payload);
      updateUser(data.data.user);
      setEditing(false);
    } catch {} finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);
    try {
      const { data } = await userAPI.uploadAvatar(formData);
      updateUser({ ...user, avatar: data.data.avatar });
    } catch {}
  };

  if (isLoading) return <ProfileSkeleton />;

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-6">
      <div className="glass rounded-xl p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="relative group">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-white">
                  {user?.fullName?.charAt(0)?.toUpperCase()}
                </span>
              )}
            </div>
            <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
              <Camera size={20} className="text-white" />
              <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
            </label>
          </div>

          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-bold">{user?.fullName}</h1>
            <div className="flex items-center justify-center sm:justify-start gap-2 mt-1 text-text-muted">
              <Mail size={14} />
              <span className="text-sm">{user?.email}</span>
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-4 mt-3">
              {user?.branch && (
                <span className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-3 py-1 rounded-full">
                  <GraduationCap size={12} />
                  {user.branch}
                </span>
              )}
              {user?.year && (
                <span className="text-xs text-text-muted">Year {user.year}</span>
              )}
              <span className="text-xs text-text-muted capitalize">• {user?.role}</span>
            </div>
          </div>

          <Button
            onClick={() => setEditing(!editing)}
            variant={editing ? 'primary' : 'secondary'}
          >
            {editing ? 'Cancel' : 'Edit Profile'}
          </Button>
        </div>
      </div>

      {editing ? (
        <form onSubmit={handleSave} className="glass rounded-xl p-6 space-y-5">
          <h3 className="font-semibold">Edit Profile</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={form.fullName}
              onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-text-muted mb-1.5">Branch</label>
                <select
                  value={form.branch}
                  onChange={(e) => setForm((p) => ({ ...p, branch: e.target.value }))}
                  className="w-full bg-surface-lighter rounded-lg px-4 py-2.5 text-sm text-text border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">Select branch</option>
                  {['CSE', 'ECE', 'EEE', 'ME', 'CE', 'IT', 'MCA'].map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-text-muted mb-1.5">Year</label>
                <select
                  value={form.year}
                  onChange={(e) => setForm((p) => ({ ...p, year: parseInt(e.target.value) }))}
                  className="w-full bg-surface-lighter rounded-lg px-4 py-2.5 text-sm text-text border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">Select year</option>
                  {[1, 2, 3, 4].map((y) => (
                    <option key={y} value={y}>{y}rd Year</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm text-text-muted mb-1.5">Bio</label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
              className="w-full bg-surface-lighter rounded-lg px-4 py-2.5 text-sm text-text placeholder-text-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
              rows={3}
              placeholder="Tell us about yourself..."
            />
          </div>

          <Input
            label="Skills (comma-separated)"
            value={form.skills}
            onChange={(e) => setForm((p) => ({ ...p, skills: e.target.value }))}
            placeholder="React, Node.js, Python"
            icon={BookOpen}
          />

          <div className="space-y-3">
            <p className="text-sm text-text-muted">Social Links</p>
              <Input
                label="LinkedIn"
                value={form.socialLinks.linkedin}
                onChange={(e) => setForm((p) => ({ ...p, socialLinks: { ...p.socialLinks, linkedin: e.target.value } }))}
                placeholder="https://linkedin.com/in/..."
                icon={Globe}
              />
              <Input
                label="GitHub"
                value={form.socialLinks.github}
                onChange={(e) => setForm((p) => ({ ...p, socialLinks: { ...p.socialLinks, github: e.target.value } }))}
                placeholder="https://github.com/..."
                icon={ExternalLink}
              />
            <Input
              label="LeetCode"
              value={form.socialLinks.leetcode}
              onChange={(e) => setForm((p) => ({ ...p, socialLinks: { ...p.socialLinks, leetcode: e.target.value } }))}
              placeholder="https://leetcode.com/..."
              icon={Code2}
            />
          </div>

          <Input
            label="Target Companies (comma-separated)"
            value={form.targetCompanies}
            onChange={(e) => setForm((p) => ({ ...p, targetCompanies: e.target.value }))}
            placeholder="Google, Microsoft, Amazon"
            icon={Target}
          />

          <Button type="submit" variant="gradient" isLoading={saving}>
            <Save size={16} />
            Save Changes
          </Button>
        </form>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {user?.skills?.length > 0 && (
            <div className="glass rounded-xl p-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <BookOpen size={16} className="text-primary" />
                Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {user.skills.map((skill, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="glass rounded-xl p-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Target size={16} className="text-accent" />
              Target Companies
            </h3>
            {user?.targetCompanies?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {user.targetCompanies.map((company, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent"
                  >
                    {company}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-muted">No target companies set</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
