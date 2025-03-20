import { FunctionComponent, useState, ChangeEvent } from "react";
import { Camera } from "lucide-react";
import type { IUserCardProps } from "@/types/user";
import Image from "next/image";

const UserCard: FunctionComponent<IUserCardProps> = ({ user }) => {
  const [editMode, setEditMode] = useState(false);
  const [newUsername, setNewUsername] = useState(user.username);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleEditMode = () => {
    setEditMode(!editMode);
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Saving changes");
    setEditMode(false);
    setPreviewImage(null);
  };

  return (
    <div className="mb-10 ml-10 mr-10 mt-5 flex items-center rounded-lg bg-white p-4 transition-colors duration-300 dark:bg-gray-800">
      {/* Image Section */}
      <div className="ml-10 w-1/4 flex-shrink-0">
        {editMode ? (
          <div className="relative">
            <Image
              src={previewImage || user.photo || "/default-profile.png"}
              alt="User profile"
              width={100}
              height={100}
              className="rounded-full object-cover"
            />
            <label className="absolute bottom-0 right-0 cursor-pointer rounded-full bg-gray-200 p-2 dark:bg-gray-700">
              <Camera size={16} className="text-gray-800 dark:text-gray-200" />
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />
            </label>
          </div>
        ) : (
          <Image
            src={user.photo || "/default-profile.png"}
            alt="User profile"
            width={100}
            height={100}
            className="rounded-full object-cover"
          />
        )}
      </div>

      {/* Info Section */}
      <div className="mr-10">
        {editMode ? (
          <form onSubmit={handleEditSubmit}>
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="w-full rounded border border-gray-300 bg-white p-2 dark:border-gray-600 dark:bg-gray-700"
            />
            
            <button
              type="submit"
              className="rounded bg-blue-500 px-4 py-2 text-white"
            >
              Save
            </button>
          </form>
        ) : (
          <>
            <h2 className="text-xl font-bold">{user.username}</h2>
            <button
              type="button"
              onClick={handleEditMode}
              className="rounded bg-blue-500 px-4 py-2 text-white"
            >
              Edit
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default UserCard;
