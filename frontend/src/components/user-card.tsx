import { FunctionComponent } from "react";
import React, { useState, ChangeEvent } from "react";
import {
  Camera,
  User,
  Mail,
  Users,
  Calendar,
  Lock,
  Edit3,
  Save,
  X,
  LogOut,
} from "lucide-react";
import { updateUserPayload } from "@/types/user";
import { useProfile } from "@/hooks/use-profile";
import defaulAvatar from "@/assets/default-avatar.svg";

const UserCard: FunctionComponent = () => {
  // Get user data and updateProfile method from the state
  const {
    username,
    email,
    name,
    lastName,
    gender,
    birthDate,
    photo,
    updateProfile,
    isLoading,
    logout,
  } = useProfile();

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<updateUserPayload>({
    username,
    email,
    name,
    lastName,
    gender,
    birthDate: birthDate || undefined,
    photo,
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  const handleEditMode = () => {
    // Reset form data to current profile values when entering edit mode
    setFormData({
      username,
      email,
      name,
      lastName,
      gender,
      birthDate: birthDate || undefined,
      photo,
    });
    setPassword("");
    setPreviewImage(null);
    setEditMode(!editMode);
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreviewImage(result);
        setFormData((prev) => ({
          ...prev,
          photo: result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Create the payload with only changed fields
    const payload: updateUserPayload = {};

    if (formData.username !== username) payload.username = formData.username;
    if (formData.email !== email) payload.email = formData.email;
    if (formData.name !== name) payload.name = formData.name;
    if (formData.lastName !== lastName) payload.lastName = formData.lastName;
    if (formData.gender !== gender) payload.gender = formData.gender;
    if (formData.birthDate !== birthDate)
      payload.birthDate = formData.birthDate;
    if (formData.photo !== photo || previewImage)
      payload.photo = formData.photo;
    if (password) payload.password = password;

    // Only call updateProfile if there are changes
    if (Object.keys(payload).length > 0) {
      const success = await updateProfile(payload);
      if (success) {
        setEditMode(false);
        setPreviewImage(null);
        setPassword("");
      }
    } else {
      // No changes to save
      setEditMode(false);
      setPreviewImage(null);
    }
  };

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await logout();
      // Redirect to login page or home page after logout
      window.location.href = "/login"; // Or use your routing system
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setLoggingOut(false);
    }
  };

  const formatDate = (date: Date | undefined | null): string => {
    if (!date) return "";
    const d = new Date(date);
    return d.toISOString().split("T")[0]; // Format as YYYY-MM-DD
  };

  return (
    <div className="bg-card text-card-foreground rounded-xl shadow-lg mx-4 md:mx-6 lg:mx-10 mb-10 border border-border transition-all duration-300">
      <div className="flex flex-col md:flex-row p-6 md:p-8 gap-8">
        {/* Profile Header */}
        <div className="flex flex-col items-center w-full md:w-1/4">
          {/* Image Section */}
          <div className="relative w-40 h-40">
            {editMode ? (
              <div className="relative w-full h-full group">
                <img
                  src={previewImage || photo || defaulAvatar}
                  alt="user photo"
                  className="w-full h-full rounded-full object-cover border-4 border-accent shadow-md"
                />
                <div className="absolute inset-0 bg-black/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <span className="text-white text-sm">Change photo</span>
                </div>
                <label className="absolute bottom-2 right-2 bg-primary hover:bg-primary/90 p-2.5 rounded-full cursor-pointer transition-colors duration-300 shadow-md">
                  <Camera size={18} className="text-primary-foreground" />
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
            ) : (
              <img
                src={photo || defaulAvatar}
                alt="User profile"
                className="w-full h-full rounded-full object-cover border-4 border-accent shadow-md"
              />
            )}
          </div>

          {/* Name Display Below Image */}
          {!editMode && (
            <div className="mt-4 text-center">
              <h2 className="text-2xl font-bold text-foreground">
                {name} {lastName}
              </h2>
              <p className="text-sm text-muted-foreground">@{username}</p>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="mt-4 flex items-center justify-center gap-2 w-full bg-destructive text-destructive-foreground px-4 py-2 rounded-lg hover:bg-destructive/90 transition-colors duration-300 disabled:opacity-50"
              >
                <LogOut size={16} />
                {loggingOut ? "Logging out..." : "Logout"}
              </button>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="w-full md:w-3/4">
          {editMode ? (
            <div className="space-y-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
                  <Edit3 size={24} />
                  Edit Profile
                </h2>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <User size={16} className="text-primary" />
                      Username
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username || ""}
                      onChange={handleInputChange}
                      className="w-full border border-input rounded-lg p-3 bg-background text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-colors duration-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Mail size={16} className="text-primary" />
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email || ""}
                      onChange={handleInputChange}
                      className="w-full border border-input rounded-lg p-3 bg-background text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-colors duration-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <User size={16} className="text-primary" />
                      First Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name || ""}
                      onChange={handleInputChange}
                      className="w-full border border-input rounded-lg p-3 bg-background text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-colors duration-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <User size={16} className="text-primary" />
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName || ""}
                      onChange={handleInputChange}
                      className="w-full border border-input rounded-lg p-3 bg-background text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-colors duration-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Users size={16} className="text-primary" />
                      Gender
                    </label>
                    <select
                      name="gender"
                      value={formData.gender || "prefer-not-to-say"}
                      onChange={handleInputChange}
                      className="w-full border border-input rounded-lg p-3 bg-background text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-colors duration-300"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="non-binary">Non-binary</option>
                      <option value="other">Other</option>
                      <option value="prefer-not-to-say">
                        Prefer not to say
                      </option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Calendar size={16} className="text-primary" />
                      Birth Date
                    </label>
                    <input
                      type="date"
                      name="birthDate"
                      value={formatDate(formData.birthDate)}
                      onChange={(e) => {
                        const date = e.target.value
                          ? new Date(e.target.value)
                          : undefined;
                        setFormData((prev) => ({ ...prev, birthDate: date }));
                      }}
                      className="w-full border border-input rounded-lg p-3 bg-background text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-colors duration-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Lock size={16} className="text-primary" />
                      New Password (Optional)
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Leave blank to keep current password"
                      className="w-full border border-input rounded-lg p-3 bg-background text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-colors duration-300"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={handleEditMode}
                    className="flex items-center gap-2 bg-muted text-muted-foreground px-5 py-2.5 rounded-lg hover:bg-muted/80 transition-colors duration-300"
                  >
                    <X size={18} />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg hover:bg-primary/90 transition-all duration-300 disabled:opacity-50 transform hover:scale-[1.02]"
                  >
                    <Save size={18} />
                    {isLoading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-primary">
                  Profile Information
                </h2>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={handleEditMode}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg hover:bg-primary/90 transition-all duration-300 shadow-sm transform hover:scale-[1.02]"
                  >
                    <Edit3 size={18} />
                    Edit Profile
                  </button>

                  {/* Logout Button for larger screens */}
                  <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="hidden md:flex items-center gap-2 bg-destructive text-destructive-foreground px-5 py-2.5 rounded-lg hover:bg-destructive/90 transition-colors duration-300 disabled:opacity-50"
                  >
                    <LogOut size={18} />
                    {loggingOut ? "Logging out..." : "Logout"}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 bg-accent/10 p-4 rounded-lg">
                  <h3 className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <User size={16} className="text-accent" />
                    Username
                  </h3>
                  <p className="text-lg font-semibold text-foreground pl-6">
                    {username}
                  </p>
                </div>

                <div className="space-y-2 bg-accent/10 p-4 rounded-lg">
                  <h3 className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Mail size={16} className="text-accent" />
                    Email
                  </h3>
                  <p className="text-lg font-semibold text-foreground pl-6">
                    {email}
                  </p>
                </div>

                <div className="space-y-2 bg-accent/10 p-4 rounded-lg">
                  <h3 className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <User size={16} className="text-accent" />
                    Full Name
                  </h3>
                  <p className="text-lg font-semibold text-foreground pl-6">
                    {name} {lastName}
                  </p>
                </div>

                <div className="space-y-2 bg-accent/10 p-4 rounded-lg">
                  <h3 className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Users size={16} className="text-accent" />
                    Gender
                  </h3>
                  <p className="text-lg font-semibold text-foreground pl-6">
                    {gender === "prefer-not-to-say"
                      ? "Prefer not to say"
                      : gender === "non-binary"
                      ? "Non-binary"
                      : gender
                      ? gender.charAt(0).toUpperCase() + gender.slice(1)
                      : "Not specified"}
                  </p>
                </div>

                {birthDate && (
                  <div className="space-y-2 bg-accent/10 p-4 rounded-lg">
                    <h3 className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <Calendar size={16} className="text-accent" />
                      Birth Date
                    </h3>
                    <p className="text-lg font-semibold text-foreground pl-6">
                      {formatDate(birthDate)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserCard;
