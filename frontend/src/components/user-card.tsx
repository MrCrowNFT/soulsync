import { FunctionComponent } from "react";
import React, { useState, ChangeEvent } from "react";
import { Camera } from "lucide-react";
import { updateUserPayload } from "@/types/user";
import { useProfile } from "@/hooks/use-profile";

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

  const formatDate = (date: Date | undefined | null): string => {
    if (!date) return "";
    const d = new Date(date);
    return d.toISOString().split("T")[0]; // Format as YYYY-MM-DD
  };

  return (
    <div className="bg-card text-card-foreground rounded-xl shadow-sm mx-4 md:mx-6 lg:mx-10 mb-10 transition-all duration-300">
      <div className="flex flex-col md:flex-row items-center p-6">
        {/* Image Section */}
        <div className="w-full md:w-1/4 flex-shrink-0 mb-6 md:mb-0 md:mr-8">
          <div className="relative w-36 h-36 mx-auto">
            {editMode ? (
              <div className="relative w-full h-full">
                <img
                  src={previewImage || photo || "/default-avatar.png"}
                  alt="User profile"
                  className="w-full h-full rounded-full object-cover border-4 border-accent/20"
                />
                <label className="absolute bottom-0 right-0 bg-primary hover:bg-primary/90 p-2 rounded-full cursor-pointer transition-colors duration-300 shadow-md">
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
                src={photo || "/default-avatar.png"}
                alt="User profile"
                className="w-full h-full rounded-full object-cover border-4 border-accent/20"
              />
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="w-full md:w-3/4 px-2 md:px-4">
          {editMode ? (
            <form onSubmit={handleEditSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username || ""}
                    onChange={handleInputChange}
                    className="w-full border border-input rounded-lg p-2.5 bg-background text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-colors duration-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email || ""}
                    onChange={handleInputChange}
                    className="w-full border border-input rounded-lg p-2.5 bg-background text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-colors duration-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name || ""}
                    onChange={handleInputChange}
                    className="w-full border border-input rounded-lg p-2.5 bg-background text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-colors duration-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName || ""}
                    onChange={handleInputChange}
                    className="w-full border border-input rounded-lg p-2.5 bg-background text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-colors duration-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender || "prefer-not-to-say"}
                    onChange={handleInputChange}
                    className="w-full border border-input rounded-lg p-2.5 bg-background text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-colors duration-300"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="non-binary">Non-binary</option>
                    <option value="other">Other</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
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
                    className="w-full border border-input rounded-lg p-2.5 bg-background text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-colors duration-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    New Password (Optional)
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Leave blank to keep current password"
                    className="w-full border border-input rounded-lg p-2.5 bg-background text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-colors duration-300"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={handleEditMode}
                  className="bg-muted text-muted-foreground px-5 py-2.5 rounded-lg hover:bg-muted/80 transition-colors duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-primary text-primary-foreground px-5 py-2.5 rounded-lg hover:bg-primary/90 transition-colors duration-300 disabled:opacity-50"
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Username
                  </h3>
                  <p className="text-base font-semibold text-foreground mt-1">
                    {username}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Email
                  </h3>
                  <p className="text-base font-semibold text-foreground mt-1">
                    {email}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Name
                  </h3>
                  <p className="text-base font-semibold text-foreground mt-1">
                    {name} {lastName}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Gender
                  </h3>
                  <p className="text-base font-semibold text-foreground mt-1">
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
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Birth Date
                    </h3>
                    <p className="text-base font-semibold text-foreground mt-1">
                      {formatDate(birthDate)}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleEditMode}
                  className="bg-primary text-primary-foreground px-5 py-2.5 rounded-lg hover:bg-primary/90 transition-colors duration-300 shadow-sm"
                >
                  Edit Profile
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserCard;
