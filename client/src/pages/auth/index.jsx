import Background from "@/assets/auth_container_bg.jpg"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import apiClient from "@/lib/api-client";
import { LOGIN_ROUTE, SIGNUP_ROUTE } from "@/lib/constants";
import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/store";
import { MessageCircle, Shield, Users, Zap, Eye, EyeOff, Mail, Lock } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const { setUserInfo } = useAppStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("login");

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateLogin = () => {
    if (!email.length) {
      toast.error("Email is required.");
      return false;
    }
    if (!emailPattern.test(email)) {
      toast.error("Please enter a valid email.");
      return false;
    }
    if (!password.length) {
      toast.error("Password is required.");
      return false;
    }
    if (password.length < 5) {
      toast.error("Password must be at least 5 characters.");
      return false;
    }
    return true;
  };

  const validateSignup = () => {
    if (!email.length) {
      toast.error("Email is required.");
      return false;
    }
    if (!emailPattern.test(email)) {
      toast.error("Please enter a valid email.");
      return false;
    }
    if (!password.length) {
      toast.error("Password is required.");
      return false;
    }
    if (password.length < 5) {
      toast.error("Password must be at least 5 characters.");
      return false;
    }
    if (password !== confirmPassword) {
      toast.error("Password and Confirm Password should be same.");
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    try {
      if (validateLogin()) {
        const response = await apiClient.post(
          LOGIN_ROUTE,
          { email, password },
          { withCredentials: true }
        );

        const user = response.data?.user;
        if (user?.id) {
          setUserInfo(user);
          if (user.profileSetup) navigate("/chat");
          else navigate("/profile");

          toast.success(`Welcome back, ${user.username || ""}`);
        }
      }
    } catch (error) {
      console.log(error);
      const message =
        error?.response?.data?.message ||
        error?.response?.data ||
        "Something went wrong. Please try again.";

      toast.error(`Login Failed: ${message}`);
    }
  };

  const handleSignup = async () => {
  try {
    if (validateSignup()) {
      const response = await apiClient.post(
        SIGNUP_ROUTE,
        {
          email,
          password,
        },
        { withCredentials: true }
      );

      if (response.status === 201) {
        setUserInfo(response.data.user);
        navigate("/profile");

        toast.success("Signup Successful");
      }
    }
  } catch (error) {
    console.log(error);
    if (error?.response?.data?.code === 11000) {
      toast.error("Email already registered. Please login.");
    } else {
      const message =
        error?.response?.data?.message ||
        "Something went wrong. Please try again.";
      toast.error(message);
    }
  }
};

  return (
  <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-[#ccd2de] via-[#112d5b] to-[#97a0bc]">
      <div className="w-full max-w-6xl bg-white/90 backdrop-blur-xl border border-white/30 shadow-2xl rounded-3xl overflow-hidden grid lg:grid-cols-2 min-h-[600px]">

        {/* Left Panel - Form */}
        <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-12 lg:pl-0 space-y-6 lg:space-y-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-blue-900 rounded-2xl flex items-center justify-center shadow-lg">
                <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800">
                Welcome
              </h1>
            
            </div>
            <p className="text-gray-600 text-base sm:text-lg max-w-md mx-auto font-medium px-4">
             Enter your details to connect with friends instantly!
            </p>
          </div>

          <div className="w-full max-w-sm mx-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="bg-gray-100/70 rounded-2xl p-1 w-full mb-6 sm:mb-8 shadow-inner">
                <TabsTrigger
                  className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-xl py-2.5 sm:py-3 px-4 sm:px-6 text-sm font-medium data-[state=active]:text-blue-600 w-full"
                  value="login"
                >
                  Login
                </TabsTrigger>
                <TabsTrigger
                  className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-xl py-2.5 sm:py-3 px-4 sm:px-6 text-sm font-medium data-[state=active]:text-blue-600 w-full"
                  value="signup"
                >
                  Signup
                </TabsTrigger>
              </TabsList>

              {/* Login Form */}
              <TabsContent value="login" className="space-y-6 mt-8 sm:mt-10 scale-95">
                <div className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                          placeholder="Enter your email"
                          type="email"
                          className="h-12 pl-12 pr-4 rounded-2xl border border-gray-200 
                                    focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      placeholder="Enter your password"
                      type={showPassword ? "text" : "password"}
                      className="h-12 pl-12 pr-12 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5 text-gray-400" />
                      ) : (
                        <Eye className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
                <Button className="w-full h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold" onClick={handleLogin}>
                  Sign In
                </Button>
                <p className="text-center text-sm text-gray-600">
                  Don’t have an account?{" "}
                  <button onClick={() => setActiveTab("signup")} className="text-blue-600 hover:underline">
                    Create one
                  </button>
                </p>
              </TabsContent>

              {/* Signup Form */}
              <TabsContent value="signup" className="space-y-6 scale-95">
                <div className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      placeholder="Email"
                      type="email"
                      className="h-12 pl-12 pr-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      placeholder="Password"
                      type={showPassword ? "text" : "password"}
                      className="h-12 pl-12 pr-12 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5 text-gray-400" />
                      ) : (
                        <Eye className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      placeholder="Confirm Password"
                      type={showConfirmPassword ? "text" : "password"}
                      className="h-12 pl-12 pr-12 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5 text-gray-400" />
                      ) : (
                        <Eye className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
                <Button onClick={handleSignup}  className="w-full h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                  Sign Up
                </Button>
                <p className="text-center text-sm text-gray-600">
                  Already have an account?{" "}
                  <button onClick={() => setActiveTab("login")} className="text-blue-600 hover:underline">
                    Login
                  </button>
                </p>
              </TabsContent>

            </Tabs>
          </div>
        </div>

          {/* Right Panel */}
        <div
          className="hidden lg:flex flex-1 bg-cover bg-no-repeat text-white p-12"
          style={{
            backgroundImage: `url(${Background})`,
            backgroundPosition: "80% center",
            backgroundSize: "cover"
          }}
        >
          <div className="flex flex-col justify-between h-full w-full">
            <div>
              <h2 className="text-3xl font-bold">| Welcome to ProChat</h2>
            </div>
            <div className="flex flex-row gap-8 items-center">
              <div className="flex items-center gap-2 group cursor-pointer">
                <Shield className="w-6 h-6 transition-colors duration-200 group-hover:text-blue-500" />
                <span className="transition-colors duration-200 group-hover:text-blue-500">
                  Secure Chats
                </span>
              </div>
              <div className="flex items-center gap-2 group cursor-pointer">
                <Users className="w-6 h-6 transition-colors duration-200 group-hover:text-blue-500" />
                <span className="transition-colors duration-200 group-hover:text-blue-500">
                  Team Channels
                </span>
              </div>
              <div className="flex items-center gap-2 group cursor-pointer">
                <Zap className="w-6 h-6 transition-colors duration-200 group-hover:text-blue-500" />
                <span className="transition-colors duration-200 group-hover:text-blue-500">
                  Instant Sync
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Auth;
