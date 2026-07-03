import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@radix-ui/react-tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FaPlus } from "react-icons/fa";
import MultipleSelector from "@/components/ui/multipleselect";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import apiClient from "@/lib/api-client";
import { CREATE_CHANNEL, GET_ALL_CONTACTS } from "@/lib/constants";
import { useSocket } from "@/contexts/SocketContext";
import { useAppStore } from "@/store";
import { Input } from "@/components/ui/input";

const CreateChannel = () => {
  const [newChannelModal, setNewChannelModal] = useState(false);
  const [allContacts, setAllContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [channelName, setChannelName] = useState("");
  const socket = useSocket();
  const { addChannel } = useAppStore();

  useEffect(() => {
    const getData = async () => {
      const response = await apiClient.get(GET_ALL_CONTACTS, {
        withCredentials: true,
      });
      if (response.data.contacts) {
        const uniqueContacts = response.data.contacts.filter(
          (contact, index, self) =>
            self.findIndex(
              (c) => c.value === contact.value || c.label === contact.label
            ) === index
        );
        setAllContacts(uniqueContacts);
      }
    };
    getData();
  }, []);

  const createChannel = async () => {
    const response = await apiClient.post(
      CREATE_CHANNEL,
      {
        name: channelName,
        members: selectedContacts.map((contact) => contact.value),
      },
      { withCredentials: true }
    );
    if (response.status === 201) {
      setChannelName("");
      setSelectedContacts([]);
      setNewChannelModal(false);
      addChannel(response.data.channel);
      socket.emit("add-channel-notify", response.data.channel);
    }
  };

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <FaPlus
              className=" text-neutral-400 font-light text-opacity-90 text-sm hover:text-neutral-100 cursor-pointer transition-all duration-300"
              onClick={() => setNewChannelModal(true)}
            />
          </TooltipTrigger>
          <TooltipContent className="bg-[#1c1b1e] border-none mb-2 p-3">
            Create New Channel
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <Dialog open={newChannelModal} onOpenChange={setNewChannelModal}>
        <DialogDescription className="hidden">
          Please insert details
        </DialogDescription>
        <DialogContent className="bg-[#181920] border border-white/10 text-white w-[400px] h-max flex flex-col rounded-3xl shadow-2xl p-6 gap-5">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold tracking-tight text-white/90">Create Channel</DialogTitle>
          </DialogHeader>
          <div>
            <Input
              placeholder="Channel Name"
              className="rounded-xl h-11 px-4 bg-[#2c2e3b] border border-transparent focus-visible:ring-1 focus-visible:ring-blue-500 text-white transition-all"
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
            />
          </div>

          <div>
            <MultipleSelector
              className="rounded-xl bg-[#2c2e3b] border border-transparent text-white text-sm"
              defaultOptions={allContacts}
              placeholder="Search contacts to add..."
              value={selectedContacts}
              onChange={setSelectedContacts}
              emptyIndicator={
                <p className="text-center text-sm leading-8 text-neutral-400">
                  No results found.
                </p>
              }
            />
          </div>
          <div className="pt-2">
            <Button
              onClick={createChannel}
              className="w-full h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center gap-2 transition-all duration-300 shadow-md shadow-blue-500/10 focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              Create Channel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreateChannel;
