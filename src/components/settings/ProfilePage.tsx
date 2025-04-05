import { useState, useEffect } from "react";
import { Camera, Mail, User, X } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { formatintoDDMMYYY } from "../../lib/utils/dateFormater";

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewImg, setPreviewImg] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const profilePicUrl = authUser?.user?.profilePic
    ? `${import.meta.env.VITE_API_BASE_URL}/${authUser?.user?.profilePic}`
    : selectedImg || "/images/userBlueShadow.jpeg";

  const handleFileSelect = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    setPreviewImg(URL.createObjectURL(file));
    setIsModalOpen(true);
  };

  const handleImageUpload = async () => {
    if (!previewImg) return;

    setLoading(true);
    const formData = new FormData();
    const file = document.querySelector<any>('#avatar-upload').files[0];
    formData.append("profile", file);

    try {
      await updateProfile(formData);
      setSelectedImg(previewImg);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setPreviewImg(null);
  };

  useEffect(() => {
    if (!authUser?.user?.profilePic && selectedImg) {
      setSelectedImg(null);
    }
  }, [authUser?.user?.profilePic]);

  return (
    <div className="min-h-screen pt-14">
      <div className="max-w-2xl mx-auto p-4 py-8">
        <div className="bg-base-300 rounded-xl p-6 space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold">Profile</h1>
            <p className="mt-2">Your profile information</p>
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="relative">
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
                  onChange={handleFileSelect}
                  disabled={isUpdatingProfile}
                />
              </label>
            </div>
            <p className="text-sm text-zinc-400">
              Click the camera icon to update your photo
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name
              </div>
              <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{authUser?.user?.username || authUser?.username}</p>
            </div>
            <div className="space-y-2.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </div>
              <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{authUser?.user?.email || authUser?.email}</p>
            </div>
          </div>

          <div className="mt-6 bg-base-300 rounded-xl p-6">
            <h2 className="text-lg font-medium mb-4">Account Information</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-zinc-700">
                <span>Member Since</span>
                <span>{formatintoDDMMYYY((authUser?.user?.createdAt || authUser?.createdAt)).split("T")[0]}</span>
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-base-300 rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Upload Profile Photo</h2>
              <button onClick={closeModal}>
                <X className="w-6 h-6" />
              </button>
            </div>
            {previewImg && (
              <img
                src={previewImg}
                alt="Preview"
                className="w-40 h-40 rounded-full object-cover mx-auto mb-4"
              />
            )}
            <div className="flex justify-end gap-4">
              <button
                className="btn btn-neutral"
                onClick={closeModal}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleImageUpload}
                disabled={loading}
              >
                {loading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;