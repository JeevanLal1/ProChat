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
import Cookies from "js-cookie";

const Auth = () => {
  const navigate = useNavigate();
  const { setUserInfo } = useAppStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        setIsSubmitting(true);
        const response = await apiClient.post(
          LOGIN_ROUTE,
          { email, password },
          { withCredentials: true }
        );

        const user = response.data?.user;
        const token = response.data?.token;
        if (user?.id) {
          if (token) {
            Cookies.set("access-token", token, { expires: 3 });
          }
          setUserInfo(user);
          if (user.profileSetup) navigate("/chat");
          else navigate("/profile");

          toast.success(`Welcome back, ${user.username || ""}`);
        }
      }
    } catch (error) {
      console.log(error);
      const message =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.response?.data ||
        "Something went wrong. Please try again.";

      toast.error(`Login Failed: ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignup = async () => {
    try {
      if (validateSignup()) {
        setIsSubmitting(true);
        const response = await apiClient.post(
          SIGNUP_ROUTE,
          {
            email,
            password,
          },
          { withCredentials: true }
        );

        if (response.status === 201) {
          const token = response.data?.token;
          if (token) {
            Cookies.set("access-token", token, { expires: 3 });
          }
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
          error?.response?.data?.error ||
          error?.response?.data?.message ||
          "Something went wrong. Please try again.";
        toast.error(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-[#ccd2de] via-[#112d5b] to-[#97a0bc] transition-all duration-300">
      <div className="w-full max-w-6xl bg-white/90 backdrop-blur-xl border border-white/30 shadow-2xl rounded-3xl overflow-hidden grid lg:grid-cols-2 min-h-[600px] transition-shadow duration-300 hover:shadow-blue-900/10">

        {/* Left Panel - Form */}
        <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-12 space-y-6 lg:space-y-8">
          <div className="text-center space-y-3 sm:space-y-4">
            <div className="flex items-center justify-center space-x-2 sm:space-x-3 mb-2 sm:mb-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-blue-900 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-300 hover:scale-105">
                <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8 text-white animate-pulse" />
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-800 tracking-tight">
                Welcome
              </h1>
            </div>
            <p className="text-gray-600 text-sm sm:text-base lg:text-lg max-w-md mx-auto font-medium px-4">
              Enter your details to connect with friends instantly!
            </p>
          </div>

          <div className="w-full max-w-sm mx-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="bg-gray-100/70 rounded-2xl p-1 w-full mb-6 sm:mb-8 shadow-inner border border-gray-200/50">
                <TabsTrigger
                  className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-xl py-2.5 sm:py-3 px-4 sm:px-6 text-sm font-semibold text-gray-500 data-[state=active]:text-blue-600 w-full transition-all duration-300 focus-visible:ring-2 focus-visible:ring-blue-600"
                  value="login"
                  disabled={isSubmitting}
                >
                  Login
                </TabsTrigger>
                <TabsTrigger
                  className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-xl py-2.5 sm:py-3 px-4 sm:px-6 text-sm font-semibold text-gray-500 data-[state=active]:text-blue-600 w-full transition-all duration-300 focus-visible:ring-2 focus-visible:ring-blue-600"
                  value="signup"
                  disabled={isSubmitting}
                >
                  Signup
                </TabsTrigger>
              </TabsList>

              {/* Login Form */}
              <TabsContent 
                value="login" 
                className="space-y-6 mt-4 sm:mt-6 transition-all duration-300 ease-in-out data-[state=inactive]:opacity-0 data-[state=inactive]:pointer-events-none data-[state=active]:opacity-100"
              >
                <div className="space-y-4">
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" />
                    <Input
                      placeholder="Enter your email"
                      type="email"
                      className="h-12 pl-12 pr-4 rounded-2xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" />
                    <Input
                      placeholder="Enter your password"
                      type={showPassword ? "text" : "password"}
                      className="h-12 pl-12 pr-12 rounded-2xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none transition-all"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      disabled={isSubmitting}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
                <Button 
                  className="w-full h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center gap-2 transition-all duration-300 shadow-md shadow-blue-500/10 focus-visible:ring-2 focus-visible:ring-blue-600 disabled:opacity-50 disabled:cursor-not-allowed" 
                  onClick={handleLogin}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
                <p className="text-center text-sm text-gray-600">
                  Don’t have an account?{" "}
                  <button 
                    onClick={() => setActiveTab("signup")} 
                    className="text-blue-600 hover:underline font-semibold focus-visible:ring-1 focus-visible:ring-blue-500 rounded px-1 transition-all"
                    disabled={isSubmitting}
                  >
                    Create one
                  </button>
                </p>
              </TabsContent>

              {/* Signup Form */}
              <TabsContent 
                value="signup" 
                className="space-y-6 mt-4 sm:mt-6 transition-all duration-300 ease-in-out data-[state=inactive]:opacity-0 data-[state=inactive]:pointer-events-none data-[state=active]:opacity-100"
              >
                <div className="space-y-4">
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" />
                    <Input
                      placeholder="Email"
                      type="email"
                      className="h-12 pl-12 pr-4 rounded-2xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" />
                    <Input
                      placeholder="Password"
                      type={showPassword ? "text" : "password"}
                      className="h-12 pl-12 pr-12 rounded-2xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none transition-all"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      disabled={isSubmitting}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" />
                    <Input
                      placeholder="Confirm Password"
                      type={showConfirmPassword ? "text" : "password"}
                      className="h-12 pl-12 pr-12 rounded-2xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none transition-all"
                      aria-label={showConfirmPassword ? "Hide password confirmation" : "Show password confirmation"}
                      disabled={isSubmitting}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
                <Button 
                  onClick={handleSignup} 
                  className="w-full h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center gap-2 transition-all duration-300 shadow-md shadow-blue-500/10 focus-visible:ring-2 focus-visible:ring-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Signing Up...
                    </>
                  ) : (
                    "Sign Up"
                  )}
                </Button>
                <p className="text-center text-sm text-gray-600">
                  Already have an account?{" "}
                  <button 
                    onClick={() => setActiveTab("login")} 
                    className="text-blue-600 hover:underline font-semibold focus-visible:ring-1 focus-visible:ring-blue-500 rounded px-1 transition-all"
                    disabled={isSubmitting}
                  >
                    Login
                  </button>
                </p>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Right Panel */}
        <div
          className="hidden lg:flex flex-col justify-between bg-cover bg-no-repeat text-white p-12 relative overflow-hidden"
          style={{
            backgroundImage: `url(${Background})`,
            backgroundPosition: "80% center",
            backgroundSize: "cover"
          }}
        >
          {/* Subtle contrast-enhancing gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/40 to-slate-900/60 backdrop-blur-[1px]" />
          
          <div className="flex flex-col justify-between h-full w-full z-10 relative">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-blue-400">Workspace</span>
              <h2 className="text-3xl font-extrabold mt-1 tracking-tight">Welcome to ProChat</h2>
              <p className="text-slate-300 mt-2 max-w-sm text-sm leading-relaxed font-medium">
                Collaborate, share files, and communicate with your team in one highly secured real-time hub.
              </p>
            </div>
            
            <div className="flex flex-row gap-8 items-center border-t border-white/10 pt-6">
              <div className="flex items-center gap-2 group cursor-pointer">
                <div className="p-2 rounded-xl bg-white/10 group-hover:bg-blue-500/20 transition-all duration-300">
                  <Shield className="w-5 h-5 text-blue-300 group-hover:text-blue-400 transition-colors" />
                </div>
                <span className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors duration-200">
                  Secure Chats
                </span>
              </div>
              <div className="flex items-center gap-2 group cursor-pointer">
                <div className="p-2 rounded-xl bg-white/10 group-hover:bg-blue-500/20 transition-all duration-300">
                  <Users className="w-5 h-5 text-blue-300 group-hover:text-blue-400 transition-colors" />
                </div>
                <span className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors duration-200">
                  Team Channels
                </span>
              </div>
              <div className="flex items-center gap-2 group cursor-pointer">
                <div className="p-2 rounded-xl bg-white/10 group-hover:bg-blue-500/20 transition-all duration-300">
                  <Zap className="w-5 h-5 text-blue-300 group-hover:text-blue-400 transition-colors" />
                </div>
                <span className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors duration-200">
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
