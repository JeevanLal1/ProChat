import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@radix-ui/react-tooltip";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { FaPlus } from "react-icons/fa";
import { useState } from "react";
import { useAppStore } from "@/store";
import { SEARCH_CONTACTS_ROUTES, getAssetUrl } from "@/lib/constants";
import apiClient from "@/lib/api-client";
import { animationDefaultOptions, getColor } from "@/lib/utils";
import Lottie from "react-lottie";
import { ScrollArea } from "@/components/ui/scroll-area";

const NewDM = () => {
  const [searchedContacts, setsearchedContacts] = useState([]);
  const [openNewContactModal, setOpenNewContactModal] = useState(false);
  const { setSelectedChatType, setSelectedChatData } = useAppStore();

  const searchContacts = async (searchTerm) => {
    try {
      if (searchTerm.length > 0) {
        const response = await apiClient.post(
          SEARCH_CONTACTS_ROUTES,
          { searchTerm },
          { withCredentials: true }
        );
        if (response.status === 200 && response.data.contacts) {
          setsearchedContacts(response.data.contacts);
        }
      } else setsearchedContacts([]);
    } catch (error) {
      console.log(error);
    }
  };

  const selectNewContact = (contact) => {
    setOpenNewContactModal(false);
    setSelectedChatType("contact");
    setSelectedChatData(contact);
    setsearchedContacts([]);
  };

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <FaPlus
              className=" text-neutral-400 font-light text-opacity-90 text-sm hover:text-neutral-100 cursor-pointer transition-all duration-300"
              onClick={() => setOpenNewContactModal(true)}
            />
          </TooltipTrigger>
          <TooltipContent className="bg-[#1c1b1e] border-none mb-2 p-3">
            Select New Contact
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Dialog open={openNewContactModal} onOpenChange={setOpenNewContactModal}>
        <DialogContent className="bg-[#181920] border border-white/10 text-white w-[400px] h-[400px] flex flex-col rounded-3xl shadow-2xl">
          <DialogDescription className="hidden">
            Please select a contact
          </DialogDescription>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold tracking-tight text-white/90">Select a contact</DialogTitle>
          </DialogHeader>
          <div className="px-1">
            <Input
              placeholder="Search Contacts"
              className="rounded-xl h-11 px-4 bg-[#2c2e3b] border border-transparent focus-visible:ring-1 focus-visible:ring-blue-500 text-white transition-all"
              onChange={(e) => searchContacts(e.target.value)}
            />
          </div>

          <ScrollArea className="flex-1 mt-2 px-1">
            <div className="flex flex-col gap-3">
              {searchedContacts.map((contact) => (
                <div
                  className="flex gap-3 items-center cursor-pointer p-2 rounded-xl hover:bg-white/5 transition-all duration-200 focus-visible:outline-none focus-visible:bg-white/5"
                  key={contact._id}
                  onClick={() => {
                    selectNewContact(contact);
                  }}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") selectNewContact(contact);
                  }}
                >
                  <div className="w-10 h-10 relative">
                    <Avatar className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center">
                      {contact.image ? (
                        <AvatarImage
                          src={getAssetUrl(contact.image)}
                          alt="profile"
                          className="object-cover w-full h-full bg-black rounded-full"
                        />
                      ) : (
                        <div
                          className={`uppercase w-10 h-10 text-sm border-[1px] ${getColor(
                            contact.color
                          )} flex items-center justify-center rounded-full font-semibold`}
                        >
                          {contact.firstName
                            ? contact.firstName.split("").shift()
                            : contact.email.split("").shift()}
                        </div>
                      )}
                    </Avatar>
                  </div>
                  <div className="flex flex-col truncate">
                    <span className="text-sm font-semibold text-neutral-200">
                      {contact.firstName && contact.lastName
                        ? `${contact.firstName} ${contact.lastName}`
                        : contact.firstName || contact.email.split("@")[0]}
                    </span>
                    <span className="text-xs text-neutral-400 truncate">{contact.email}</span>
                  </div>
                </div>
              ))}
              {searchedContacts.length <= 0 && (
                <div className="flex-1 flex mt-5 flex-col justify-center items-center duration-1000 transition-all">
                  <Lottie
                    isClickToPauseDisabled={true}
                    options={animationDefaultOptions}
                    height={100}
                    width={100}
                  />
                  <div className="text-opacity-80 text-white flex flex-col gap-2 items-center mt-3 transition-all duration-1000 text-center">
                    <h3 className="poppins-medium text-sm text-neutral-400">
                      Search contacts by name or email
                    </h3>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NewDM;
