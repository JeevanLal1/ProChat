import { getAssetUrl } from "@/lib/constants";
import { getColor } from "@/lib/utils";
import { useAppStore } from "@/store";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";

const ContactList = ({ contacts, isChannel = false }) => {
  const {
    selectedChatData,
    setSelectedChatType,
    setSelectedChatData,
    setSelectedChatMessages,
    onlineUsers = [],
  } = useAppStore();

  const handleClick = (contact) => {
    if (isChannel) setSelectedChatType("channel");
    else setSelectedChatType("contact");
    setSelectedChatData(contact);
    if (selectedChatData && selectedChatData._id !== contact._id) {
      setSelectedChatMessages([]);
    }
  };

  return (
    <div className="mt-2">
      {contacts.map((contact) => {
        const isOnline = !isChannel && onlineUsers.includes(contact._id);
        return (
          <div
            key={contact._id}
            className={`pl-10 py-2 transition-all duration-200 cursor-pointer border-l-2 ${
              selectedChatData && selectedChatData._id === contact._id
                ? "bg-blue-600/10 border-blue-500 text-white font-medium"
                : "border-transparent hover:bg-white/5 text-neutral-400 hover:text-neutral-200"
            }`}
            onClick={() => handleClick(contact)}
          >
            <div className="flex gap-4 items-center justify-start">
              {!isChannel && (
                <div className="relative w-9 h-9">
                  <Avatar className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center bg-transparent">
                    {contact.image && (
                      <AvatarImage
                        src={getAssetUrl(contact.image)}
                        alt="profile"
                        className="rounded-full bg-cover h-full w-full animate-fade-in"
                      />
                    )}

                    <AvatarFallback
                      className={`uppercase ${
                        selectedChatData && selectedChatData._id === contact._id
                          ? "bg-[#ffffff22] border border-white/50"
                          : getColor(contact.color)
                      } h-9 w-9 flex items-center justify-center rounded-full text-xs font-semibold`}
                    >
                      {contact.firstName
                        ? contact.firstName.split("").shift()
                        : contact.email?.split("").shift()}
                    </AvatarFallback>
                  </Avatar>
                  {isOnline && (
                    <span 
                      className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[#1b1c24] rounded-full"
                      title="Online"
                    />
                  )}
                </div>
              )}
              {isChannel && (
                <span className="text-lg text-neutral-500 font-light select-none w-5 text-center">#</span>
              )}
              <span className="truncate text-sm">
                {isChannel ? (
                  contact.name
                ) : contact.firstName ? (
                  `${contact.firstName} ${contact.lastName ?? ""}`
                ) : (
                  contact.email
                )}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ContactList;
