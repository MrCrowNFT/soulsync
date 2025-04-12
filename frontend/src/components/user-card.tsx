import { FunctionComponent } from "react";
import React, { useState, ChangeEvent } from "react";
import { Camera } from "lucide-react";
import { updateUserPayload } from "@/types/user";
import { useProfile } from "@/hooks/use-profile";

//todo Evaluate if leaving the change password option here
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
    console.log("Entering edit mode");
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
    console.log("Saving changes");

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
    <div className="flex flex-col md:flex-row items-center mt-5 bg-white dark:bg-gray-800 rounded-lg mx-10 mb-10 p-4 transition-colors duration-300">
      {/* Image Section */}
      <div className="w-full md:w-1/4 flex-shrink-0 mb-4 md:mb-0 md:mr-6">
        <div className={`relative w-32 h-32 mx-auto ${editMode ? "" : ""}`}>
          {editMode ? (
            <div className="relative w-full h-full">
              <img
                src={previewImage || photo || "/default-avatar.png"}
                alt="User profile"
                className="w-full h-full rounded-full object-cover"
              />
              <label className="absolute bottom-0 right-0 bg-gray-200 dark:bg-gray-700 p-2 rounded-full cursor-pointer transition-colors duration-300">
                <Camera
                  size={16}
                  className="text-gray-800 dark:text-gray-200"
                />
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
              className="w-full h-full rounded-full object-cover"
            />
          )}
        </div>
      </div>

      {/* Info Section */}
      <div className="w-full md:w-3/4 px-4">
        {editMode ? (
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username || ""}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ""}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ""}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName || ""}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender || "prefer-not-to-say"}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-300"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="non-binary">Non-binary</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                  className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  New Password (Optional)
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Leave blank to keep current password"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-300"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={handleEditMode}
                className="bg-gray-300 dark:bg-gray-600 font-mono text-gray-800 dark:text-gray-200 px-4 py-2 rounded hover:bg-gray-400 dark:hover:bg-gray-700 transition-colors duration-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="bg-blue-500 dark:bg-blue-600 font-mono text-white px-4 py-2 rounded hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors duration-300 disabled:opacity-50"
              >
                {isLoading ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Username
                </h3>
                <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  {username}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Email
                </h3>
                <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  {email}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Name
                </h3>
                <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  {name} {lastName}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Gender
                </h3>
                <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
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
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Birth Date
                  </h3>
                  <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                    {formatDate(birthDate)}
                  </p>
                </div>
              )}
            </div>

            <div>
              <button
                type="button"
                onClick={handleEditMode}
                className="bg-blue-500 dark:bg-blue-600 font-mono text-white px-4 py-2 rounded hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors duration-300"
              >
                Edit Profile
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserCard;
