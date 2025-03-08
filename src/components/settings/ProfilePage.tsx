import { useState, useEffect } from "react";
import { Camera, Mail, User } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { formatintoDDMMYYY } from "../../lib/utils/dateFormater";

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile }: any = useAuthStore();
  const [selectedImg, setSelectedImg] = useState<string | any>(null);

  const profilePicUrl = authUser?.user?.profilePic
    ? `${import.meta.env.VITE_API_BASE_URL}/${authUser?.user?.profilePic}`
    : selectedImg || "/images/userBlueShadow.jpeg";

  // Handle image upload and preview
  const handleImageUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profile", file);

    // Call the updateProfile function to send the image to the backend
    updateProfile(formData);

    // Update the preview of the image immediately in the UI
    const convertedImage = URL.createObjectURL(file);
    setSelectedImg(convertedImage);
  };

  // Ensure the profile picture is updated from the backend response
  useEffect(() => {
    if (!authUser?.user?.profilePic && selectedImg) {
      setSelectedImg(null);  // Reset if there's no profile picture after upload
    }
  }, [authUser?.user?.profilePic, selectedImg]);

  return (
    <div className="h-screen pt-20">
      <div className="max-w-2xl mx-auto p-4 py-8">
        <div className="bg-base-300 rounded-xl p-6 space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold">Profile</h1>
            <p className="mt-2">Your profile information</p>
          </div>

          {/* Avatar upload section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              {/* Image rendering */}
              <img
                src={profilePicUrl}
                alt="Profile"
                className="w-28 h-28 rounded-full object-cover border-4"
              />
              <label
                htmlFor="avatar-upload"
                className={`
                  absolute bottom-0 right-0 
                  bg-base-content hover:scale-105
                  p-2 rounded-full cursor-pointer 
                  transition-all duration-200
                  ${isUpdatingProfile ? "animate-pulse pointer-events-none" : ""}
                `}
              >
                <Camera className="w-5 h-5 text-base-200" />
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUpdatingProfile}
                />
              </label>
            </div>
            <p className="text-sm text-zinc-400">
              {isUpdatingProfile ? "Uploading..." : "Click the camera icon to update your photo"}
            </p>
          </div>

          {/* Profile information */}
          <div className="space-y-6">
            <div className="space-y-2.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name
              </div>
              <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{authUser?.user?.username}</p>
            </div>
            <div className="space-y-2.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </div>
              <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{authUser?.user?.email}</p>
            </div>
          </div>

          {/* Account information */}
          <div className="mt-6 bg-base-300 rounded-xl p-6">
            <h2 className="text-lg font-medium mb-4">Account Information</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-zinc-700">
                <span>Member Since</span>
                <span>{formatintoDDMMYYY((authUser?.user?.createdAt)).split("T")[0]}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>Account Status</span>
                <div className="flex items-center gap-3">
                  <span className="shadow-xl text-xl text-green-500">•</span>
                  <span className="text-green-500">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
