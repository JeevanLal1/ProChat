import { useAppStore } from "@/store";
import apiClient from "@/lib/api-client";
import { LOGOUT_ROUTE, getAssetUrl } from "@/lib/constants";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FiEdit2 } from "react-icons/fi";
import { IoPowerSharp } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { getColor } from "@/lib/utils";

const ProfileInfo = () => {
  const { userInfo, setUserInfo } = useAppStore();
  const navigate = useNavigate();
  const logout = async () => {
    try {
      const response = await apiClient.post(
        LOGOUT_ROUTE,
        {},
        { withCredentials: true }
      );
      if (response.status === 200) {
        navigate("/auth");
        setUserInfo(undefined);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="absolute bottom-0 h-16 flex items-center justify-between px-10 w-full bg-[#181920] border-t border-[#2f303b]">
      <div className="flex gap-3 items-center justify-center">
        <div className="w-10 h-10 relative">
          <Avatar className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center">
            {userInfo.image ? (
              <AvatarImage
                src={getAssetUrl(userInfo.image)}
                alt="profile"
                className="object-cover w-full h-full bg-black rounded-full"
              />
            ) : (
              <div
                className={`uppercase w-10 h-10 text-sm border-[1px] ${getColor(
                  userInfo.color
                )} flex items-center justify-center rounded-full font-semibold`}
              >
                {userInfo.firstName
                  ? userInfo.firstName.split("").shift()
                  : userInfo.email.split("").shift()}
              </div>
            )}
          </Avatar>
        </div>
        <div className="text-sm font-medium text-neutral-200 truncate max-w-[120px]">
          {userInfo.firstName && userInfo.lastName
            ? `${userInfo.firstName} ${userInfo.lastName}`
            : userInfo.firstName || userInfo.email.split("@")[0]}
        </div>
      </div>
      <div className="flex gap-1.5">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => navigate("/profile")}
                className="p-2 rounded-xl text-blue-500 hover:text-blue-400 hover:bg-blue-950/40 transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
                aria-label="Edit Profile"
              >
                <FiEdit2 className="text-lg" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="bg-[#1c1b1e] border-none mb-2 p-3 text-xs rounded-lg shadow-lg">
              <p className="text-white">Edit Profile</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={logout}
                className="p-2 rounded-xl text-red-500 hover:text-red-400 hover:bg-red-950/40 transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-500"
                aria-label="Logout"
              >
                <IoPowerSharp className="text-lg" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="bg-[#1c1b1e] border-none mb-2 p-3 text-xs rounded-lg shadow-lg">
              <p className="text-white">Logout</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default ProfileInfo;
 