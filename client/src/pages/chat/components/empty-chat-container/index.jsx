import { motion } from "framer-motion";
import LottieAnimation from "@/components/common/lottie-animation";

const EmptyChatContainer = () => {
  return (
    <div className="flex-1 md:flex flex-col justify-center items-center hidden relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#1c1d25] via-[#1a1a2e] to-[#0f3460] animate-gradient" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="flex flex-col justify-center items-center z-10 p-4"
      >

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
          className="w-72 h-72 md:w-96 md:h-96"
        >
          <LottieAnimation />
        </motion.div>
        <motion.h3
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="poppins-medium text-white text-opacity-90 mt-10 lg:text-4xl text-3xl text-center leading-snug"
        >
          Hi<span className="text-blue-400">!</span> Welcome to
          <span className="text-blue-400"> ProChat </span>
          Chat App<span className="text-blue-400">.</span>
        </motion.h3>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="text-gray-400 mt-4 text-center max-w-md"
        >
          Connect with friends, join channels, and chat in real-time.
        </motion.p>
      </motion.div>
    </div>
  );
};

export default EmptyChatContainer;
