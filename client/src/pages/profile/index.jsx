import { useAppStore } from "@/store";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import apiClient from "@/lib/api-client";
import {
  ADD_PROFILE_IMAGE_ROUTE,
  HOST,
  REMOVE_PROFILE_IMAGE_ROUTE,
  UPDATE_PROFLE_ROUTE,
} from "@/lib/constants";
import { useState, useRef, useEffect } from "react";
import { FaPlus, FaTrash, FaCamera } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { IoArrowBack } from "react-icons/io5";
import { colors } from "@/lib/utils";

const Profile = () => {
  const { userInfo, setUserInfo } = useAppStore();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [image, setImage] = useState(null);
  const [hovered, setHovered] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const [selectedColor, setSelectedColor] = useState(0);

  useEffect(() => {
    if (userInfo.profileSetup) {
      setFirstName(userInfo.firstName);
      setLastName(userInfo.lastName);
      setSelectedColor(userInfo.color);
    }
    if (userInfo.image) {
      setImage(`${HOST}/${userInfo.image}`);
    }
  }, [userInfo]);

  const validateProfile = () => {
    if (!firstName) {
      toast.error("First Name is Required.");
      return false;
    }
    if (!lastName) {
      toast.error("Last Name is Required.");
      return false;
    }
    return true;
  };

  const saveChanges = async () => {
    if (validateProfile()) {
      try {
        const response = await apiClient.post(
          UPDATE_PROFLE_ROUTE,
          {
            firstName,
            lastName,
            color: selectedColor,
          },
          { withCredentials: true }
        );
        if (response.status === 200 && response.data) {
          setUserInfo({ ...response.data });
          toast.success("Profile Updated Successfully.");
          navigate("/chat");
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("profile-image", file);
      const response = await apiClient.post(ADD_PROFILE_IMAGE_ROUTE, formData, {
        withCredentials: true,
      });
      if (response.status === 200 && response.data.image) {
        setUserInfo({ ...userInfo, image: response.data.image });
        toast.success("Image updated successfully.");
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteImage = async () => {
    try {
      const response = await apiClient.delete(REMOVE_PROFILE_IMAGE_ROUTE, {
        withCredentials: true,
      });
      if (response.status === 200) {
        setUserInfo({ ...userInfo, image: null });
        toast.success("Image Removed Successfully.");
        setImage(undefined);
      }
    } catch (error) {
      console.log({ error });
    }
  };

  const handleFileInputClick = () => {
    fileInputRef.current.click();
  };

  const handleNavigate = () => {
    if (userInfo.profileSetup) {
      navigate("/chat");
    } else {
      toast.error("Please setup profile.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            onClick={handleNavigate}
            className="text-white/70 hover:text-white hover:bg-white/10 p-2"
          >
            <IoArrowBack className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-semibold text-white ml-4">Profile Setup</h1>
        </div>

        {/* Main Card */}
        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardContent className="p-8">
            
            <div className="flex flex-col lg:flex-row gap-8 items-center">
              
              {/* Profile Image Section */}
              <div className="flex flex-col items-center space-y-4">
                <div
                  className="relative"
                  onMouseEnter={() => setHovered(true)}
                  onMouseLeave={() => setHovered(false)}
                >
                  <Avatar className="h-32 w-32 border-2 border-white/20">
                    {image ? (
                      <AvatarImage
                        src={image}
                        alt="profile"
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div
                        className={`h-full w-full text-4xl bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center font-medium`}
                      >
                        {firstName
                          ? firstName.split("").shift()
                          : userInfo.email.split("").shift()}
                      </div>
                    )}
                  </Avatar>
                  
                  {/* Hover overlay */}
                  {hovered && (
                    <div
                      className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full cursor-pointer transition-all duration-200"
                      onClick={image ? handleDeleteImage : handleFileInputClick}
                    >
                      {image ? (
                        <FaTrash className="text-white text-xl" />
                      ) : (
                        <FaCamera className="text-white text-xl" />
                      )}
                    </div>
                  )}
                </div>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleImageChange}
                  accept=".png, .jpg, .jpeg, .svg, .webp"
                  name="profile-image"
                />
              </div>

              {/* Form Section */}
              <div className="flex-1 w-full space-y-5">
                
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={userInfo.email}
                    disabled
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>

                {/* Name fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      First Name
                    </label>
                    <Input
                      placeholder="First Name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="bg-white/5 border-white/20 text-white placeholder-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Last Name
                    </label>
                    <Input
                      placeholder="Last Name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="bg-white/5 border-white/20 text-white placeholder-gray-400"
                    />
                  </div>
                </div>

                {/* Color selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Theme Color
                  </label>
                  <div className="flex gap-3 flex-wrap">
                    {colors.map((color, index) => (
                      <div
                        key={index}
                        className={`${color} h-8 w-8 rounded-full cursor-pointer transition-all duration-200 ${
                          selectedColor === index
                            ? "ring-2 ring-white ring-offset-2 ring-offset-gray-800"
                            : "hover:scale-110"
                        }`}
                        onClick={() => setSelectedColor(index)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Save button */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <Button
                onClick={saveChanges}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 transition-colors"
              >
                Save Changes
              </Button>
            </div>
            
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;